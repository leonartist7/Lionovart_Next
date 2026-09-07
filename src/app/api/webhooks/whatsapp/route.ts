import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppProvider, verifyWebhookSignature } from "@/lib/portal/providers/whatsapp";
import { findWorkspaceByWhatsappNumber, recordInboundWhatsapp, storeInboundMedia } from "@/lib/portal/messages";

/**
 * Meta's WhatsApp Cloud API webhook. Unguarded by session — the caller is
 * Meta, not a portal user — so everything here rests on `verifyWebhookSignature`.
 */

/** One-time handshake when the webhook URL is registered in Meta's dashboard. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

interface WebhookMessage {
  from: string;
  id: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
}

interface WebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: { messages?: WebhookMessage[] };
    }>;
  }>;
}

/**
 * Inbound message delivery. Must read the **raw** body for signature
 * verification before any JSON parsing — see `verifyWebhookSignature`.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verifyWebhookSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = payload.entry?.flatMap((e) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []) ?? [];

  for (const msg of messages) {
    const workspace = await findWorkspaceByWhatsappNumber(msg.from);
    if (!workspace) continue; // an unrecognized number — no workspace to attribute it to

    if (msg.type === "text" && msg.text) {
      await recordInboundWhatsapp(workspace.id, { body: msg.text.body, waMessageId: msg.id });
    } else if (msg.type === "image" && msg.image) {
      const media = await getWhatsAppProvider().fetchInboundMedia(msg.image.id);
      const mediaPath = media ? await storeInboundMedia(workspace.id, msg.id, media.bytes, media.mimeType) : null;
      await recordInboundWhatsapp(workspace.id, {
        body: msg.image.caption ?? "",
        waMessageId: msg.id,
        mediaPath,
      });
    }
  }

  // Meta redelivers on anything but a fast 200 — always acknowledge once
  // processed, even for message types we don't yet handle.
  return NextResponse.json({ ok: true });
}
