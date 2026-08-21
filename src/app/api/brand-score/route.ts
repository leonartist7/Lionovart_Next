import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { computeBrandScore, toTeaser } from "@/lib/brand-score";
import { env } from "@/lib/env";
import { scanRateLimitOk } from "@/lib/rate-limit";

/**
 * Step 1 of the funnel: a URL in, a real diagnosis out — no email required.
 *
 * The scan is persisted whether or not it's ever claimed, so the Console shows
 * top-of-funnel intent (who looked, what they'd have scored) instead of only
 * the minority who hand over an address.
 */

// Scrape (4.5s cap) + a Gemini Pro pass — comfortably inside this, but the
// platform default would cut a slow model call off mid-flight.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";

  let body: { url?: string; city?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body.url ?? "").trim();
  if (!raw) return NextResponse.json({ error: "url is required" }, { status: 400 });

  // Accept what people actually type ("acme.com", "www.acme.com/about") and
  // reject only what can't be a public site. scrapeWebsite does the real SSRF
  // checks; this is just shape validation so we fail fast and politely.
  let hostname: string;
  try {
    hostname = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname;
  } catch {
    return NextResponse.json({ error: "invalid_url", message: "That doesn't look like a web address." }, { status: 400 });
  }
  if (!hostname.includes(".")) {
    return NextResponse.json({ error: "invalid_url", message: "That doesn't look like a web address." }, { status: 400 });
  }

  // Charged only once the URL is real — a typo shouldn't cost the visitor one
  // of their five scans, and nothing expensive has run before this point.
  if (!scanRateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited", message: "That's a few scans in a row — give it an hour." }, { status: 429 });
  }

  const score = await computeBrandScore(raw, body.city);

  let scanId: string | null = null;
  if (adminDb) {
    try {
      const ref = await adminDb.collection("brand_scans").add({
        ...score,
        ip,
        claimed: false,
        lead_id: null,
        created_at: FieldValue.serverTimestamp(),
        created_at_iso: new Date().toISOString(),
      });
      scanId = ref.id;
    } catch (err) {
      console.error("[brand-score] scan persist failed:", err);
    }
  }

  return NextResponse.json({ scan_id: scanId, booking_url: env.BOOKING_URL, ...toTeaser(score) }, { status: 200 });
}
