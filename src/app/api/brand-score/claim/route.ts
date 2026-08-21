import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { env } from "@/lib/env";
import { rateLimitOk } from "@/lib/rate-limit";
import { notifyOwner } from "@/lib/notify";
import { sendBrandReportEmail } from "@/lib/email";
import { PILLARS, PILLAR_LABELS, toBriefing, type BrandScoreResult } from "@/lib/brand-score";

/**
 * Step 2: the email is exchanged for the full report, not for nothing.
 *
 * Everything downstream fans out from here — the report email, the WhatsApp
 * briefing on Leon's phone, and the dossier that qualifies the lead without
 * anyone having spoken yet.
 */
export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!rateLimitOk(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: { scan_id?: string; email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const scanId = (body.scan_id ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (!scanId) return NextResponse.json({ error: "scan_id is required" }, { status: 400 });

  // Checked after validation so a malformed request gets the reason it was
  // actually rejected, not a config message.
  if (!adminDb) {
    return NextResponse.json({ claimed: false, reason: "Firebase not configured" }, { status: 200 });
  }

  const scanRef = adminDb.collection("brand_scans").doc(scanId);
  const scanSnap = await scanRef.get();
  if (!scanSnap.exists) return NextResponse.json({ error: "scan_not_found" }, { status: 404 });
  const scan = scanSnap.data() as BrandScoreResult;

  const briefing = toBriefing(scan);
  const now = new Date().toISOString();

  // Upsert on contact, matching how Nova's save_lead_data keys leads — a
  // visitor who scans and later talks to Nova must land on one record, not two.
  const leadFields = {
    name: name || scan.business_name || email,
    contact: email,
    contact_type: "email" as const,
    email,
    website: scan.url,
    business_type: scan.gbp?.category ?? "",
    source: "brand_score",
    brand_score: scan.overall,
    brand_scan_id: scanId,
    brand_briefing: briefing,
    project_summary: `Ran a Brand Score on ${scan.url} and scored ${scan.overall}/100. Biggest leak: ${scan.biggest_leak.title}.`,
    updated_at: now,
  };

  let leadId: string;
  try {
    const existing = await adminDb.collection("leads").where("contact", "==", email).limit(1).get();
    if (existing.empty) {
      const ref = await adminDb.collection("leads").add({ ...leadFields, status: "new", created_at: now });
      leadId = ref.id;
    } else {
      leadId = existing.docs[0].id;
      await existing.docs[0].ref.update(leadFields);
    }
    await scanRef.update({ claimed: true, lead_id: leadId, email, claimed_at: FieldValue.serverTimestamp() });
  } catch (err) {
    console.error("[brand-score/claim] persist failed:", err);
    return NextResponse.json({ claimed: false, error: "Write failed" }, { status: 200 });
  }

  const origin = req.nextUrl.origin;
  const portalUrl = `${origin}/portal/${scanId}`;
  const leadUrl = `${origin}/admin/leads/${leadId}`;

  void sendBrandReportEmail({
    toEmail: email,
    toName: name,
    businessName: scan.business_name,
    siteUrl: scan.url,
    overall: scan.overall,
    pillars: PILLARS.map((p) => ({ label: PILLAR_LABELS[p], score: scan.pillars[p].score, verdict: scan.pillars[p].verdict })),
    headline: scan.headline,
    biggestLeak: scan.biggest_leak,
    positioning: scan.positioning_statement,
    quickWins: scan.quick_wins ?? [],
    fullFindings: scan.full_findings ?? [],
    portalUrl,
    bookingUrl: env.BOOKING_URL,
  });

  void notifyOwner({
    kind: "scan_claimed",
    businessName: scan.business_name,
    url: scan.url,
    overall: scan.overall,
    biggestLeak: scan.biggest_leak.title,
    email,
    name: name || undefined,
    leadUrl,
  });

  // Qualify off the scan alone — no call needed. Runs on the persistent server
  // process, so an un-awaited trigger completes rather than being torn down.
  void fetch(`${origin}/api/strategist/dossier`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact: email }),
  }).catch((err) => console.error("[brand-score/claim] dossier trigger failed:", err));

  return NextResponse.json({ claimed: true, lead_id: leadId, portal_url: portalUrl }, { status: 200 });
}
