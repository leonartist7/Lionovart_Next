import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { analyzeWhatsAppConversation, parseStoredIntelligence } from "@/lib/whatsapp-intelligence";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!adminDb) return NextResponse.json({ error: "Firestore is not configured" }, { status: 503 });

  const body = (await req.json()) as { conversationId?: string };
  if (!body.conversationId?.startsWith("wa_")) {
    return NextResponse.json({ error: "A valid WhatsApp conversation is required" }, { status: 400 });
  }

  const conversationRef = adminDb.collection("conversations").doc(body.conversationId);
  const snapshot = await conversationRef.get();
  if (!snapshot.exists) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const data = snapshot.data() ?? {};
  const rawTranscript = Array.isArray(data.transcript) ? data.transcript : [];
  const transcript = rawTranscript.flatMap((entry: unknown) => {
    if (!entry || typeof entry !== "object") return [];
    const message = entry as Record<string, unknown>;
    if (typeof message.text !== "string" || !message.text.trim()) return [];
    return [{ role: message.role === "user" ? "user" as const : "agent" as const, text: message.text.trim() }];
  });
  if (transcript.length === 0) return NextResponse.json({ error: "No messages to analyze" }, { status: 409 });

  const { intelligence, provider } = await analyzeWhatsAppConversation({
    contactName: data.contact?.name || data.contact?.phone || "Prospect",
    transcript,
    previous: parseStoredIntelligence(data.intelligence),
  });

  const analyzedAt = new Date().toISOString();
  await Promise.all([
    conversationRef.set(
      {
        intelligence,
        lead_stage: intelligence.stage,
        intelligence_provider: provider,
        intelligence_analyzed_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    ),
    conversationRef.collection("audit_log").add({
      action: "conversation_analyzed",
      actor: session.email,
      provider,
      qualification_score: intelligence.qualificationScore,
      created_at: FieldValue.serverTimestamp(),
    }),
  ]);

  return NextResponse.json({ intelligence, provider, analyzedAt });
}
