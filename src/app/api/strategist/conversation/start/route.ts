import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ ok: false, reason: "Firebase not configured" });
  }

  let body: { conversation_id?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  try {
    const colRef = adminDb.collection("conversations");
    const docRef = body.conversation_id ? colRef.doc(body.conversation_id) : colRef.doc();
    await docRef.set({ started_at: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ ok: true, id: docRef.id });
  } catch (err) {
    console.error("[conversation/start] Firestore write failed:", err);
    return NextResponse.json({ ok: false });
  }
}
