import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { AUTOMATION_MODES, LEAD_STAGES, type AutomationMode, type LeadStage } from "@/lib/whatsapp-intelligence-shared";

type UpdateBody = {
  conversationId?: string;
  leadStage?: LeadStage;
  automationMode?: AutomationMode;
  followUpAt?: string | null;
  notes?: string;
};

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!adminDb) return NextResponse.json({ error: "Firestore is not configured" }, { status: 503 });

  const body = (await req.json()) as UpdateBody;
  if (!body.conversationId?.startsWith("wa_")) {
    return NextResponse.json({ error: "A valid WhatsApp conversation is required" }, { status: 400 });
  }
  if (body.leadStage && !LEAD_STAGES.includes(body.leadStage)) {
    return NextResponse.json({ error: "Invalid lead stage" }, { status: 400 });
  }
  if (body.automationMode && !AUTOMATION_MODES.includes(body.automationMode)) {
    return NextResponse.json({ error: "Invalid automation mode" }, { status: 400 });
  }
  if (typeof body.notes === "string" && body.notes.length > 4000) {
    return NextResponse.json({ error: "Notes are too long" }, { status: 400 });
  }

  let followUpAt: Timestamp | null | undefined;
  if (body.followUpAt === null) followUpAt = null;
  if (typeof body.followUpAt === "string") {
    const date = new Date(body.followUpAt);
    if (Number.isNaN(date.getTime())) return NextResponse.json({ error: "Invalid follow-up date" }, { status: 400 });
    followUpAt = Timestamp.fromDate(date);
  }

  const update: Record<string, unknown> = { updated_at: FieldValue.serverTimestamp() };
  if (body.leadStage) update.lead_stage = body.leadStage;
  if (body.automationMode) update.automation_mode = body.automationMode;
  if (followUpAt !== undefined) update.follow_up_at = followUpAt;
  if (typeof body.notes === "string") update.admin_notes = body.notes.trim();

  const ref = adminDb.collection("conversations").doc(body.conversationId);
  await Promise.all([
    ref.set(update, { merge: true }),
    ref.collection("audit_log").add({
      action: "conversation_updated",
      actor: session.email,
      fields: Object.keys(update).filter((key) => key !== "updated_at"),
      created_at: FieldValue.serverTimestamp(),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
