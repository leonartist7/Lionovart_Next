import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { generateDossier, dossierToMarkdown, saveDossier } from "@/lib/dossier";

/** Manual "Generate dossier" trigger from the Console lead detail page. */
export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  if (!adminDb) {
    return NextResponse.json({ error: "Firestore not configured" }, { status: 503 });
  }

  let body: { lead_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const leadId = body.lead_id;
  if (!leadId) return NextResponse.json({ error: "Missing lead_id" }, { status: 400 });

  const leadDoc = await adminDb.collection("leads").doc(leadId).get();
  if (!leadDoc.exists) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  const lead = leadDoc.data()!;

  const dossier = await generateDossier(leadId, lead.conversation_id ?? null);
  if (!dossier) {
    return NextResponse.json({ error: "Dossier generation failed — check GEMINI_API_KEY and lead data" }, { status: 500 });
  }

  const markdown = dossierToMarkdown(dossier, lead, leadId);
  const dossierId = await saveDossier(leadId, dossier, markdown);

  return NextResponse.json({ ok: true, dossier_id: dossierId, dossier, markdown });
}
