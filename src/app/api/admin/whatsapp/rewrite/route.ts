import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { parseStoredIntelligence, rewriteWhatsAppMessage } from "@/lib/whatsapp-intelligence";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!adminDb) return NextResponse.json({ error: "Firestore is not configured" }, { status: 503 });

  const body = (await req.json()) as { conversationId?: string; roughIdea?: string };
  const roughIdea = body.roughIdea?.trim() || "";
  if (!body.conversationId?.startsWith("wa_") || !roughIdea) {
    return NextResponse.json({ error: "Conversation and rough idea are required" }, { status: 400 });
  }
  if (roughIdea.length > 2000) return NextResponse.json({ error: "Keep the rough idea under 2,000 characters" }, { status: 400 });

  const ref = adminDb.collection("conversations").doc(body.conversationId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  const data = snapshot.data() ?? {};
  const transcript = (Array.isArray(data.transcript) ? data.transcript : []).flatMap((entry: unknown) => {
    if (!entry || typeof entry !== "object") return [];
    const message = entry as Record<string, unknown>;
    if (typeof message.text !== "string" || !message.text.trim()) return [];
    return [{ role: message.role === "user" ? "user" as const : "agent" as const, text: message.text.trim() }];
  });

  const result = await rewriteWhatsAppMessage({
    roughIdea,
    contactName: data.contact?.name || data.contact?.phone || "Prospect",
    transcript,
    intelligence: parseStoredIntelligence(data.intelligence),
  });
  await ref.collection("audit_log").add({
    action: "message_rewritten",
    actor: session.email,
    provider: result.provider,
    created_at: FieldValue.serverTimestamp(),
  });
  return NextResponse.json(result);
}
