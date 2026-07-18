import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";

const VALID_STATUSES = ["new", "contacted", "booked", "won", "lost"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  if (!adminDb) {
    return NextResponse.json({ error: "Firestore not configured" }, { status: 503 });
  }

  const { id } = await params;
  let body: { status?: string; score?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (body.score !== undefined) {
    if (typeof body.score !== "number" || body.score < 0 || body.score > 100) {
      return NextResponse.json({ error: "Score must be 0-100" }, { status: 400 });
    }
    update.score = body.score;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  update.updated_at = new Date().toISOString();

  try {
    await adminDb.collection("leads").doc(id).update(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 },
    );
  }
}
