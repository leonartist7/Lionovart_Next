import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { generateDossier, dossierToMarkdown, saveDossier } from "@/lib/dossier";
import { sendDossierEmail } from "@/lib/email";
import { notifyOwner } from "@/lib/notify";
import { rateLimitOk } from "@/lib/rate-limit";

interface DossierRequest {
  conversation_id?: string;
  contact?: string;
}

/**
 * Fire-and-forget trigger from stopSession — generates the post-call lead
 * dossier and emails Leon. Also reachable manually via the admin route
 * (src/app/api/admin/dossier/route.ts) for the Console's "Generate" button.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ generated: false, reason: "Firebase not configured" }, { status: 200 });
  }

  let body: DossierRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { conversation_id, contact } = body;
  if (!contact) {
    return NextResponse.json({ generated: false, reason: "Missing contact" }, { status: 200 });
  }

  try {
    const snap = await adminDb.collection("leads").where("contact", "==", contact).limit(1).get();
    if (snap.empty) {
      return NextResponse.json({ generated: false, reason: "Lead not found" }, { status: 200 });
    }
    const leadDoc = snap.docs[0];
    const leadId = leadDoc.id;
    const lead = leadDoc.data();

    const dossier = await generateDossier(leadId, conversation_id ?? lead.conversation_id ?? null);
    if (!dossier) {
      return NextResponse.json({ generated: false, reason: "Generation failed" }, { status: 200 });
    }

    const markdown = dossierToMarkdown(dossier, lead, leadId);
    const dossierId = await saveDossier(leadId, dossier, markdown);

    const leadUrl = new URL(`/admin/leads/${leadId}`, req.nextUrl.origin).toString();

    void sendDossierEmail({
      leadName: lead.name || "Unnamed lead",
      qualificationScore: dossier.qualification_score,
      businessSnapshot: dossier.business_snapshot,
      painsRanked: dossier.pains_ranked,
      recommendedNextAction: dossier.recommended_next_action,
      draftFollowUp: dossier.draft_follow_up_message,
      leadUrl,
    });

    // The qualification lands on Leon's phone too — the score and what to do
    // next are the parts he acts on, and he shouldn't need his inbox for them.
    void notifyOwner({
      kind: "dossier_ready",
      leadName: lead.name || "Unnamed lead",
      score: dossier.qualification_score,
      rubric: dossier.qualification_rubric,
      topPains: dossier.pains_ranked,
      nextAction: dossier.recommended_next_action,
      leadUrl,
    });

    // Mirror the score onto the lead so the Console can sort and filter by it
    // without reading every dossier subcollection.
    void leadDoc.ref
      .update({ score: dossier.qualification_score, updated_at: new Date().toISOString() })
      .catch((err) => console.error("[dossier route] score mirror failed:", err));

    return NextResponse.json({ generated: true, dossier_id: dossierId }, { status: 200 });
  } catch (err) {
    console.error("[dossier route] failed:", err);
    return NextResponse.json({ generated: false, error: "Internal error" }, { status: 200 });
  }
}
