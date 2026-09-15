import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { findWorkspaceByWhatsappNumber, recordInboundWhatsapp, storeInboundMedia } from "@/lib/portal/messages";
import { getWhatsAppProvider, verifyWebhookSignature } from "@/lib/portal/providers/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookMessage = {
  from?: string;
  id?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  image?: { id?: string; mime_type?: string; caption?: string };
};
type WebhookStatus = { id?: string; recipient_id?: string; status?: string };
type WebhookValue = {
  contacts?: Array<{ profile?: { name?: string } }>;
  messages?: WebhookMessage[];
  statuses?: WebhookStatus[];
};
type WebhookPayload = { entry?: Array<{ changes?: Array<{ value?: WebhookValue }> }> };

/** One-time handshake when the webhook URL is registered in Meta's dashboard. */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * Records every inbound message in the CRM inbox and, when the number belongs
 * to a client workspace, mirrors it into that client's portal thread.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verifyWebhookSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }
  if (!adminDb) return NextResponse.json({ error: "Firestore is not configured" }, { status: 503 });

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const changes = (payload.entry ?? []).flatMap((entry) => entry.changes ?? []);

  for (const change of changes) {
    const value = change.value ?? {};

    for (const message of value.messages ?? []) {
      const waId = String(message.from ?? "");
      const messageId = String(message.id ?? "");
      if (!waId || !messageId) continue;

      const name = value.contacts?.[0]?.profile?.name || waId;
      const text = message.text?.body || message.image?.caption || `[${message.type || "message"}]`;
      const receivedAt = message.timestamp
        ? Timestamp.fromMillis(Number(message.timestamp) * 1000)
        : Timestamp.now();
      const conversationRef = adminDb.collection("conversations").doc(`wa_${waId}`);
      const leadRef = adminDb.collection("leads").doc(`wa_${waId}`);
      const eventRef = adminDb.collection("whatsapp_events").doc(messageId);
      const messageRef = conversationRef.collection("messages").doc(messageId);

      await adminDb.runTransaction(async (transaction) => {
        const [event, conversation, lead] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(conversationRef),
          transaction.get(leadRef),
        ]);
        if (event.exists) return;

        const transcript = conversation.exists ? (conversation.data()?.transcript ?? []) : [];
        transaction.create(eventRef, {
          kind: "inbound_message",
          conversation_id: conversationRef.id,
          received_at: FieldValue.serverTimestamp(),
        });
        transaction.set(messageRef, {
          external_id: messageId,
          direction: "inbound",
          type: message.type || "text",
          text,
          status: "received",
          created_at: receivedAt,
          provider_payload: message,
        });
        transaction.set(
          conversationRef,
          {
            source: "whatsapp",
            channel: "whatsapp",
            external_thread_id: waId,
            contact: { name, phone: waId },
            transcript: [...transcript, { role: "user", text }].slice(-200),
            started_at: conversation.exists ? conversation.data()?.started_at : receivedAt,
            last_inbound_at: receivedAt,
            last_message_at: receivedAt,
            updated_at: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        transaction.set(
          leadRef,
          {
            name,
            contact: waId,
            phone: waId,
            source: "whatsapp",
            status: lead.exists ? lead.data()?.status || "new" : "new",
            conversation_id: conversationRef.id,
            updated_at: FieldValue.serverTimestamp(),
            created_at: lead.exists ? lead.data()?.created_at : FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });

      const workspace = await findWorkspaceByWhatsappNumber(waId);
      if (workspace) {
        if (message.type === "image" && message.image?.id) {
          const media = await getWhatsAppProvider().fetchInboundMedia(message.image.id);
          const mediaPath = media
            ? await storeInboundMedia(workspace.id, messageId, media.bytes, media.mimeType)
            : null;
          await recordInboundWhatsapp(workspace.id, {
            body: message.image.caption ?? "",
            waMessageId: messageId,
            mediaPath,
          });
        } else {
          await recordInboundWhatsapp(workspace.id, { body: text, waMessageId: messageId });
        }
      }
    }

    for (const status of value.statuses ?? []) {
      const messageId = String(status.id ?? "");
      const waId = String(status.recipient_id ?? "");
      if (!messageId || !waId) continue;
      await adminDb
        .collection("conversations")
        .doc(`wa_${waId}`)
        .collection("messages")
        .doc(messageId)
        .set(
          {
            status: status.status,
            status_updated_at: FieldValue.serverTimestamp(),
            status_payload: status,
          },
          { merge: true },
        );
    }
  }

  return NextResponse.json({ received: true });
}
