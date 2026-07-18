import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { AGENT_CONFIG_DEFAULTS, validateAgentConfig } from "@/lib/agent-config-schema";

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  if (!adminDb) {
    return NextResponse.json({ config: AGENT_CONFIG_DEFAULTS, versions: [] });
  }

  const liveDoc = await adminDb.collection("agent_config").doc("live").get();
  const config = liveDoc.exists ? { ...AGENT_CONFIG_DEFAULTS, ...liveDoc.data() } : AGENT_CONFIG_DEFAULTS;

  const versionsSnap = await adminDb
    .collection("agent_config")
    .doc("live")
    .collection("versions")
    .orderBy("saved_at", "desc")
    .limit(10)
    .get();
  const versions = versionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({ config, versions });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  if (!adminDb) {
    return NextResponse.json({ error: "Firestore not configured" }, { status: 503 });
  }

  let body: { config?: unknown; draft?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validated = validateAgentConfig(body.config);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (body.draft) {
    // Draft: no version snapshot, separate doc, used only by ?novaDraft=1 sessions.
    await adminDb.collection("agent_config").doc("draft").set({ ...validated.config, updated_at: now });
    return NextResponse.json({ ok: true, draft: true });
  }

  const liveRef = adminDb.collection("agent_config").doc("live");
  const currentSnap = await liveRef.get();
  if (currentSnap.exists) {
    await liveRef.collection("versions").add({
      ...currentSnap.data(),
      saved_at: now,
      saved_by: session.email,
    });
  }

  await liveRef.set({ ...validated.config, updated_at: now });
  return NextResponse.json({ ok: true });
}
