import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  if (!adminDb) {
    return NextResponse.json({ error: "Firestore not configured" }, { status: 503 });
  }

  let body: { versionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.versionId) {
    return NextResponse.json({ error: "Missing versionId" }, { status: 400 });
  }

  const liveRef = adminDb.collection("agent_config").doc("live");
  const versionRef = liveRef.collection("versions").doc(body.versionId);
  const versionSnap = await versionRef.get();
  if (!versionSnap.exists) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const currentSnap = await liveRef.get();
  if (currentSnap.exists) {
    await liveRef.collection("versions").add({
      ...currentSnap.data(),
      saved_at: now,
      saved_by: session.email,
    });
  }

  const { saved_at, saved_by, ...restoredConfig } = versionSnap.data() as Record<string, unknown>;
  void saved_at;
  void saved_by;
  await liveRef.set({ ...restoredConfig, updated_at: now });

  return NextResponse.json({ ok: true });
}
