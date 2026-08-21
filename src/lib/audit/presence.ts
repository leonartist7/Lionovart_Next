import "server-only";
import { enrichmentCache } from "@/lib/cache";

/**
 * Google Business Profile completeness + a real competitor benchmark.
 *
 * The competitor set is the most persuasive thing in the whole report, because
 * it isn't an opinion: these are the actual businesses in their category and
 * city, with their actual ratings and review counts. Nobody argues with it, and
 * almost nobody has looked it up themselves.
 *
 * No-ops cleanly without GOOGLE_PLACES_API_KEY, same as every other optional
 * integration in this repo.
 */

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

export interface Competitor {
  name: string;
  rating: number | null;
  reviewCount: number | null;
}

export interface PresenceAudit {
  available: boolean;
  found: boolean;
  name?: string;
  rating?: number | null;
  reviewCount?: number | null;
  category?: string | null;
  address?: string | null;
  hasHours?: boolean;
  hasWebsite?: boolean;
  hasPhone?: boolean;
  photoCount?: number;
  /** Real businesses in the same category and area, excluding this one. */
  competitors: Competitor[];
  /** How this business's review count compares to the competitor median. */
  reviewGap?: { median: number; behindBy: number } | null;
  score: number;
  findings: string[];
}

const EMPTY: PresenceAudit = { available: false, found: false, competitors: [], score: 50, findings: [] };

async function placesSearch(textQuery: string, fieldMask: string, maxResultCount: number) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;
  const res = await fetch(PLACES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify({ textQuery, maxResultCount }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function auditPresence(businessName: string, city?: string): Promise<PresenceAudit> {
  if (!process.env.GOOGLE_PLACES_API_KEY || !businessName) return EMPTY;

  const cacheKey = `presence|${businessName.toLowerCase()}|${(city ?? "").toLowerCase()}`;
  const cached = enrichmentCache.get(cacheKey);
  if (cached) return cached as unknown as PresenceAudit;

  try {
    const data = await placesSearch(
      city ? `${businessName}, ${city}` : businessName,
      "places.displayName,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.formattedAddress,places.currentOpeningHours.openNow,places.regularOpeningHours.weekdayDescriptions,places.websiteUri,places.nationalPhoneNumber,places.photos",
      1,
    );
    const place = data?.places?.[0];
    if (!place) {
      const miss: PresenceAudit = {
        available: true,
        found: false,
        competitors: [],
        score: 20,
        findings: [
          "We couldn't find a Google Business Profile for you. For a local business that's the single largest source of ready-to-buy traffic, and it's free.",
        ],
      };
      enrichmentCache.set(cacheKey, miss as unknown as Record<string, unknown>);
      return miss;
    }

    const name = place.displayName?.text ?? businessName;
    const rating: number | null = place.rating ?? null;
    const reviewCount: number | null = place.userRatingCount ?? null;
    const category: string | null = place.primaryTypeDisplayName?.text ?? null;
    const hasHours = Boolean(place.regularOpeningHours?.weekdayDescriptions?.length);
    const hasWebsite = Boolean(place.websiteUri);
    const hasPhone = Boolean(place.nationalPhoneNumber);
    const photoCount: number = place.photos?.length ?? 0;

    // Competitors: same category, same area. Excludes the business itself.
    let competitors: Competitor[] = [];
    if (category) {
      const compData = await placesSearch(
        city ? `${category} in ${city}` : `${category} near ${place.formattedAddress ?? ""}`,
        "places.displayName,places.rating,places.userRatingCount",
        6,
      );
      competitors = (compData?.places ?? [])
        .map((p: Record<string, unknown>) => ({
          name: (p.displayName as { text?: string })?.text ?? "",
          rating: (p.rating as number) ?? null,
          reviewCount: (p.userRatingCount as number) ?? null,
        }))
        .filter((c: Competitor) => c.name && c.name.toLowerCase() !== name.toLowerCase())
        .slice(0, 4);
    }

    const compCounts = competitors.map((c) => c.reviewCount ?? 0).filter((n) => n > 0).sort((a, b) => a - b);
    const median = compCounts.length ? compCounts[Math.floor(compCounts.length / 2)] : 0;
    const reviewGap = median > 0 ? { median, behindBy: Math.max(0, median - (reviewCount ?? 0)) } : null;

    const findings: string[] = [];
    if (rating !== null && reviewCount !== null) {
      findings.push(`Your Google profile shows ${rating} stars from ${reviewCount} review${reviewCount === 1 ? "" : "s"}.`);
    }
    if (reviewGap && reviewGap.behindBy > 0) {
      findings.push(
        `The typical ${category ?? "business"} near you carries about ${reviewGap.median} reviews — you're roughly ${reviewGap.behindBy} behind the middle of your own market.`,
      );
    } else if (reviewGap) {
      findings.push(`You're at or above the review count of the ${category ?? "businesses"} around you. That's an asset you're not using on your website.`);
    }
    if (!hasHours) findings.push("Your profile has no opening hours set, which suppresses it in 'open now' searches.");
    if (!hasWebsite) findings.push("Your Google profile doesn't link to your website — that's free, high-intent traffic being dropped.");
    if (!hasPhone) findings.push("No phone number on the profile, so the one-tap call button doesn't appear.");
    if (photoCount < 5) findings.push(`Only ${photoCount} photo${photoCount === 1 ? "" : "s"} on the profile. Listings with ten or more get materially more engagement.`);

    // Completeness, weighted toward the fields that actually gate discovery.
    let score = 0;
    score += hasHours ? 20 : 0;
    score += hasWebsite ? 20 : 0;
    score += hasPhone ? 15 : 0;
    score += Math.min(photoCount, 10) * 2; // up to 20
    score += rating !== null && rating >= 4.5 ? 15 : rating !== null && rating >= 4 ? 10 : 0;
    score += reviewGap && reviewGap.behindBy === 0 ? 10 : reviewCount && reviewCount >= 10 ? 5 : 0;

    const result: PresenceAudit = {
      available: true,
      found: true,
      name,
      rating,
      reviewCount,
      category,
      address: place.formattedAddress ?? null,
      hasHours,
      hasWebsite,
      hasPhone,
      photoCount,
      competitors,
      reviewGap,
      score: Math.min(100, score),
      findings,
    };
    enrichmentCache.set(cacheKey, result as unknown as Record<string, unknown>);
    return result;
  } catch (err) {
    console.error("[audit/presence] failed:", err);
    return EMPTY;
  }
}
