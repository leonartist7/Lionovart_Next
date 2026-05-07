import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
}

interface ConversationBody {
  transcript: TranscriptEntry[];
  contact?: { name?: string; phone?: string; email?: string };
  session_started_at?: string;
  session_ended_at?: string;
  duration_ms?: number;
  source?: string;
  lead_doc_id?: string;
  user_agent?: string;
}

export async function POST(req: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ saved: false, reason: "Firebase not configured" }, { status: 200 });
  }

  let body: ConversationBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { transcript, contact, session_started_at, session_ended_at, duration_ms, source, lead_doc_id, user_agent } = body;

  if (!Array.isArray(transcript) || transcript.length === 0) {
    return NextResponse.json({ saved: false, reason: "Empty transcript" }, { status: 200 });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const docRef = await adminDb.collection("conversations").add({
      transcript,
      contact: contact ?? null,
      session_started_at: session_started_at ?? null,
      session_ended_at: session_ended_at ?? null,
      duration_ms: duration_ms ?? null,
      source: source ?? "ai_strategist",
      lead_doc_id: lead_doc_id ?? null,
      user_agent: user_agent ?? "unknown",
      ip,
      created_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ saved: true, id: docRef.id }, { status: 200 });
  } catch (err) {
    console.error("[conversation route] Firestore write failed:", err);
    return NextResponse.json({ saved: false, error: "Write failed" }, { status: 200 });
  }
}
