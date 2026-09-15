import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { sendWhatsApp, serviceWindowIsOpen } from "@/lib/whatsapp-cloud";

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!adminDb) return NextResponse.json({ error: "Firestore is not configured" }, { status: 503 });
  const body = await req.json() as { to?: string; text?: string; template?: { name: string; language?: string } };
  if (!body.to || (!body.text && !body.template)) return NextResponse.json({ error: "Recipient and text or template are required" }, { status: 400 });
  const conversationRef = adminDb.collection("conversations").doc(`wa_${body.to}`);
  const conversation = await conversationRef.get();
  const lastInbound = conversation.data()?.last_inbound_at?.toDate?.() as Date | undefined;
  if (!body.template && !serviceWindowIsOpen(lastInbound)) return NextResponse.json({ error: "An approved template is required outside the 24-hour customer service window" }, { status: 409 });
  const result = await sendWhatsApp(body.template ? { to: body.to, type: "template", template: { name: body.template.name, language: { code: body.template.language || "en_US" } } } : { to: body.to, type: "text", text: { body: body.text } });
  const messageId = result.messages?.[0]?.id || `local_${Date.now()}`;
  await conversationRef.collection("messages").doc(messageId).set({ external_id: messageId, direction: "outbound", type: body.template ? "template" : "text", text: body.text || `[template:${body.template?.name}]`, status: "accepted", sent_by: session.email, created_at: FieldValue.serverTimestamp() });
  await conversationRef.set({ last_message_at: FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp(), transcript: FieldValue.arrayUnion({ role: "agent", text: body.text || `[template:${body.template?.name}]` }) }, { merge: true });
  return NextResponse.json({ messageId });
}
