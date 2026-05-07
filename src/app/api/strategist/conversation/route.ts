import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
}

interface ConversationBody {
  transcript: TranscriptEntry[];
  contact?: { name?: string; phone?: string; email?: string };
  session_started_at?: string;
  source?: string;
  lead_doc_id?: string;
  user_agent?: string;
  conversation_id?: string;
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

  const { transcript, contact, session_started_at, source, lead_doc_id, user_agent, conversation_id } = body;

  if (!Array.isArray(transcript) || transcript.length === 0) {
    return NextResponse.json({ saved: false, reason: "Empty transcript" }, { status: 200 });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const colRef = adminDb.collection("conversations");
    const docRef = conversation_id ? colRef.doc(conversation_id) : colRef.doc();

    // Compute server-side duration if the /start endpoint created the doc
    let duration_ms: number | null = null;
    const endedAt = FieldValue.serverTimestamp();
    if (conversation_id) {
      try {
        const existing = await docRef.get();
        const startedAt = existing.data()?.started_at as Timestamp | undefined;
        if (startedAt?.toMillis) {
          duration_ms = Date.now() - startedAt.toMillis();
        }
      } catch {
        // non-fatal
      }
    }

    // Fall back to client-provided started_at if server stamp unavailable
    if (duration_ms === null && session_started_at) {
      duration_ms = Date.now() - Date.parse(session_started_at);
    }

    await docRef.set(
      {
        transcript,
        contact: contact ?? null,
        session_ended_at: endedAt,
        duration_ms,
        source: source ?? "ai_strategist",
        lead_doc_id: lead_doc_id ?? null,
        user_agent: user_agent ?? "unknown",
        ip,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ saved: true, id: docRef.id, duration_ms }, { status: 200 });
  } catch (err) {
    console.error("[conversation route] Firestore write failed:", err);
    return NextResponse.json({ saved: false, error: "Write failed" }, { status: 200 });
  }
}
