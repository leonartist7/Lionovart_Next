import "server-only";
import { GoogleGenAI } from "@google/genai";
import { scrapeWebsite, type ScrapeResult } from "@/lib/scrape-website";
import { auditSeo, type SeoAudit } from "@/lib/audit/seo";
import { auditPresence, type PresenceAudit, type Competitor } from "@/lib/audit/presence";
import { auditSocial, type SocialAudit } from "@/lib/audit/social";
import { probeAeo, type AeoProbe } from "@/lib/audit/aeo";

/**
 * Brand Score — the top-of-funnel diagnostic.
 *
 * Six dimensions, scored from real measurements rather than impressions. Only
 * the Brand dimension is a model judgement; SEO, AEO readiness, Google presence
 * and social are computed from the actual markup and the actual Places record,
 * and the AI-visibility probe is a live query whose result the visitor can
 * reproduce in thirty seconds.
 *
 * That distinction is the whole point. A report a stranger judges us by cannot
 * contain a finding they can disprove in one click.
 *
 * Three tiers, and the gating is deliberate:
 *   free   — every dimension score, one verdict each, the biggest leak in full
 *   email  — every finding we actually measured, plus positioning and quick wins
 *   call   — the sequencing and the strategic calls, which genuinely need a
 *            conversation. Those are NAMED, never blurred: naming a specific
 *            question about their business creates far more pull than hiding
 *            text, and it's honest about what a call is actually for.
 */

/* ── Brand sub-pillars (the model-judged dimension) ──────────────────── */

export const PILLARS = ["clarity", "distinction", "credibility", "conversion", "consistency"] as const;
export type Pillar = (typeof PILLARS)[number];

const PILLAR_WEIGHTS: Record<Pillar, number> = {
  clarity: 25,
  distinction: 25,
  credibility: 20,
  conversion: 20,
  consistency: 10,
};

export const PILLAR_LABELS: Record<Pillar, string> = {
  clarity: "Clarity",
  distinction: "Distinction",
  credibility: "Credibility",
  conversion: "Conversion",
  consistency: "Consistency",
};

export const PILLAR_QUESTIONS: Record<Pillar, string> = {
  clarity: "Can a stranger tell what you do, and for whom, in five seconds?",
  distinction: "Could a competitor swap in their logo and nothing would change?",
  credibility: "Is there proof, or just claims?",
  conversion: "Is there one obvious next step?",
  consistency: "Do the visual and verbal signals agree with each other?",
};

/* ── The six dimensions ──────────────────────────────────────────────── */

export const DIMENSIONS = ["brand", "seo", "aeo", "presence", "competition", "social"] as const;
export type DimensionId = (typeof DIMENSIONS)[number];

export const DIMENSION_META: Record<DimensionId, { label: string; question: string; weight: number }> = {
  brand: { label: "Brand & Message", question: "Does anyone understand — and remember — what you are?", weight: 28 },
  seo: { label: "Search Foundations", question: "Can Google read, index and rank what you've built?", weight: 18 },
  aeo: { label: "AI Visibility", question: "When someone asks an AI for a recommendation, do you exist?", weight: 20 },
  presence: { label: "Google Presence", question: "Is your Business Profile doing the work it could be?", weight: 14 },
  competition: { label: "Competitive Position", question: "How do you actually stack up against the businesses beside you?", weight: 12 },
  social: { label: "Social Reach", question: "Can a buyer find your work, and does it share cleanly?", weight: 8 },
};

export interface Dimension {
  id: DimensionId;
  score: number;
  /** Free tier — one sentence. */
  headline: string;
  /** Email tier — everything measured on this dimension. */
  findings: string[];
  /** Findings withheld at the free tier. */
  lockedCount: number;
}

/** A named thing the call would cover. Shown at every tier — the pull comes
 * from it being specific, not from it being hidden. */
export interface CallAgendaItem {
  title: string;
  teaser: string;
}

export interface BrandScoreResult {
  url: string;
  business_name: string;
  overall: number;
  /** Brand sub-pillars, kept for the Brand dimension's breakdown. */
  pillars: Record<Pillar, { score: number; verdict: string }>;
  dimensions: Dimension[];
  headline: string;
  biggest_leak: { title: string; detail: string; cost: string };
  quick_wins: string[];
  /** Total findings held back at the free tier, across all dimensions. */
  withheld_count: number;
  full_findings?: string[];
  positioning_statement?: string;
  call_agenda: CallAgendaItem[];
  /** Live AI-visibility probe result. */
  aeo?: AeoProbe;
  competitors?: Competitor[];
  gbp?: { rating: number | null; review_count: number | null; category: string | null };
  degraded: boolean;
}

const SCHEMA_HINT = `{
  "business_name": string (the brand's own name as it presents itself),
  "headline": string (one sentence, direct, naming the central problem — not a compliment),
  "pillars": {
    "clarity":      { "score": number 0-100, "verdict": string (one specific sentence citing something actually on the page) },
    "distinction":  { "score": number 0-100, "verdict": string },
    "credibility":  { "score": number 0-100, "verdict": string },
    "conversion":   { "score": number 0-100, "verdict": string },
    "consistency":  { "score": number 0-100, "verdict": string }
  },
  "brand_headline": string (one sentence summarising the brand dimension overall),
  "biggest_leak": {
    "title": string (short, concrete, max 8 words),
    "detail": string (2-3 sentences, specific to THIS business, no generic advice),
    "cost": string (one sentence on what this is costing them in plain business terms)
  },
  "quick_wins": string[] (exactly 3, each doable in under an hour, specific to this business),
  "brand_findings": string[] (3-5 further brand/message observations, deeper than the quick wins),
  "positioning_statement": string (one sentence: the positioning THIS business should own, written for them),
  "call_agenda": [ { "title": string (max 10 words, phrased as the actual decision or question), "teaser": string (one sentence on why it needs a conversation rather than a checklist) } ] (exactly 4)
}`;

function clamp(n: unknown): number {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 50;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function weightedPillars(pillars: Record<Pillar, { score: number }>): number {
  return Math.round(PILLARS.reduce((sum, p) => sum + pillars[p].score * PILLAR_WEIGHTS[p], 0) / 100);
}

/** Competitive position, derived from the real Places comparison set. */
function competitionScore(presence: PresenceAudit): { score: number; findings: string[]; headline: string; measured: boolean } {
  if (!presence.found || !presence.competitors.length) {
    return {
      measured: false,
      score: 0,
      headline: "",
      findings: [],
    };
  }

  const mine = presence.reviewCount ?? 0;
  const myRating = presence.rating ?? 0;
  const counts = presence.competitors.map((c) => c.reviewCount ?? 0);
  const best = Math.max(...counts, 0);
  const ratings = presence.competitors.map((c) => c.rating ?? 0).filter(Boolean);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const findings: string[] = [];
  findings.push(
    `Your closest comparable businesses: ${presence.competitors
      .map((c) => `${c.name} (${c.rating ?? "no"}★, ${c.reviewCount ?? 0} reviews)`)
      .join("; ")}.`,
  );

  if (best > 0) {
    findings.push(
      mine >= best
        ? `You lead this set on review volume with ${mine}. That's a credibility asset, and it isn't visible anywhere on your website.`
        : `The strongest profile in your set carries ${best} reviews against your ${mine}. Review volume is the proof buyers check first and the one you can most directly influence.`,
    );
  }
  if (avgRating > 0 && myRating > 0) {
    findings.push(
      myRating >= avgRating
        ? `Your ${myRating}★ is at or above the ${avgRating.toFixed(1)}★ average around you — you're winning on quality and losing on volume.`
        : `Your ${myRating}★ sits below the ${avgRating.toFixed(1)}★ average in your area.`,
    );
  }

  // Volume relative to the best in set, then a rating adjustment.
  let score = best > 0 ? Math.min(70, Math.round((mine / best) * 70)) : 35;
  if (myRating && avgRating) score += myRating >= avgRating ? 30 : 10;

  const headline =
    mine >= best && best > 0
      ? "You're the strongest profile in your immediate market — and your website doesn't say so anywhere."
      : `You're visibly behind the businesses beside you on the proof buyers check first.`;

  return { measured: true, score: Math.max(0, Math.min(100, score)), findings, headline };
}

/** Heuristic brand read — used when Gemini is unavailable, so the funnel still
 * returns something real rather than an error. */
function heuristicBrand(scrape: ScrapeResult) {
  const hasDescription = Boolean(scrape.description?.trim());
  const headings = scrape.headings?.length ?? 0;
  const text = `${scrape.title} ${scrape.description} ${scrape.headings?.join(" ")}`.toLowerCase();
  const genericTerms = ["solutions", "innovative", "passionate", "world-class", "cutting-edge", "we deliver", "your partner", "excellence"];
  const genericHits = genericTerms.filter((t) => text.includes(t)).length;
  const hasProof = /\b(review|testimonial|client|case stud|award|rated|trusted by)\b/.test(text);
  const hasCta = /\b(book|contact|get started|call|quote|schedule|enquir|inquir)\b/.test(text);

  return {
    clarity: {
      score: clamp(35 + (scrape.title ? 15 : 0) + (hasDescription ? 20 : 0) + Math.min(headings, 4) * 4),
      verdict: hasDescription
        ? "The page states what it is, though not yet who it is for."
        : "Nothing on the page tells a first-time visitor what this business actually does.",
    },
    distinction: {
      score: clamp(60 - genericHits * 12),
      verdict:
        genericHits > 0
          ? `The copy leans on ${genericHits} phrase${genericHits > 1 ? "s" : ""} any competitor could use verbatim.`
          : "The language is at least specific to this business.",
    },
    credibility: {
      score: clamp(hasProof ? 68 : 34),
      verdict: hasProof ? "There are proof signals present." : "No visible proof — claims are unsupported.",
    },
    conversion: {
      score: clamp(hasCta ? 65 : 30),
      verdict: hasCta ? "There is a call to action, but not obviously a single primary one." : "No clear next step for a ready buyer.",
    },
    consistency: {
      score: clamp(50 + (scrape.title && hasDescription ? 10 : 0)),
      verdict: "Assessed on page signals only.",
    },
  };
}

/** Fallback agenda — still specific enough to be worth a call, built from the
 * measurements rather than the model. */
function fallbackAgenda(seo: SeoAudit, presence: PresenceAudit, aeo: AeoProbe): CallAgendaItem[] {
  const items: CallAgendaItem[] = [
    {
      title: "Which of these findings to fix first",
      teaser: "The order matters more than the list — fixing them in the wrong sequence wastes most of the effort.",
    },
  ];
  if (aeo.ran && !aeo.mentioned) {
    items.push({
      title: "How to get named when buyers ask an AI",
      teaser: "There's a specific route in for your category, and it depends on where your proof already lives.",
    });
  }
  if (presence.found && presence.reviewGap && presence.reviewGap.behindBy > 0) {
    items.push({
      title: "Whether to compete on reviews or route around them",
      teaser: "Closing a review gap takes months. Sometimes the better play is to not fight on that ground at all.",
    });
  }
  if (!seo.hasLlmsTxt) {
    items.push({
      title: "What your business should tell AI assistants about itself",
      teaser: "Writing this well requires deciding what you want to be known for — which is a positioning question, not a technical one.",
    });
  }
  items.push({
    title: "What this is worth fixing, in revenue",
    teaser: "Worth sizing against your actual margins before you spend anything.",
  });
  return items.slice(0, 4);
}

/* ── Orchestrator ────────────────────────────────────────────────────── */

export async function computeBrandScore(rawUrl: string, city?: string): Promise<BrandScoreResult> {
  const scrape = await scrapeWebsite(rawUrl).catch(
    (): ScrapeResult => ({ url: rawUrl, title: "", description: "", headings: [], services_detected: [], summary: "", error: "scrape_failed" }),
  );

  const normalizedUrl = scrape.url || rawUrl;
  const html = scrape.html ?? "";
  const fallbackName = scrape.title?.split(/[|\-–—]/)[0].trim() || "";
  const hostName = (() => {
    try {
      return new URL(normalizedUrl).hostname.replace(/^www\./, "");
    } catch {
      return normalizedUrl;
    }
  })();
  const businessName = fallbackName || hostName;

  // Independent measurements, run together.
  const [seo, presence] = await Promise.all([auditSeo(normalizedUrl, html), auditPresence(businessName, city)]);
  const social = auditSocial(html);
  const competition = competitionScore(presence);

  const apiKey = process.env.GEMINI_API_KEY;

  // The live probe and the brand synthesis are both slow and independent.
  const [aeoProbe, brandModel] = await Promise.all([
    probeAeo(presence.name ?? businessName, presence.category, city),
    apiKey ? synthesizeBrand(apiKey, scrape, normalizedUrl, seo, presence, social) : Promise.resolve(null),
  ]);

  const pillars = brandModel?.pillars ?? heuristicBrand(scrape);
  const brandScore = weightedPillars(pillars);
  const degraded = !brandModel;

  // The probe outranks the readiness signals: actually being absent from the
  // answer is worse news than lacking the markup that would have helped.
  const aeoScore = aeoProbe.ran
    ? Math.round(seo.aeoScore * 0.5 + (aeoProbe.mentioned ? 100 : 15) * 0.5)
    : seo.aeoScore;

  const seoFindings = seo.signals.filter((s) => s.dimension === "seo").map((s) => s.detail);
  const aeoFindings = [
    ...(aeoProbe.ran ? [aeoProbe.verdict] : []),
    ...seo.signals.filter((s) => s.dimension === "aeo").map((s) => s.detail),
  ];

  const dimensionData: Array<{ id: DimensionId; score: number; headline: string; findings: string[]; measured: boolean }> = [
    {
      id: "brand",
      measured: true,
      score: brandScore,
      headline: brandModel?.brand_headline || pillars.clarity.verdict,
      findings: [...PILLARS.map((p) => `${PILLAR_LABELS[p]} — ${pillars[p].verdict}`), ...(brandModel?.brand_findings ?? [])],
    },
    {
      id: "seo",
      measured: true,
      score: seo.seoScore,
      headline:
        seo.seoScore >= 75
          ? "The technical foundations are broadly sound."
          : `${seo.signals.filter((s) => s.dimension === "seo" && !s.pass).length} of the fundamentals search engines check are failing on your homepage.`,
      findings: seoFindings,
    },
    {
      id: "aeo",
      measured: true,
      score: aeoScore,
      headline: aeoProbe.ran
        ? aeoProbe.mentioned
          ? "A search-grounded AI already names you for your category."
          : "A search-grounded AI didn't name you when we asked for your category."
        : "Your site gives an answer engine little structured information to work from.",
      findings: aeoFindings,
    },
    {
      id: "presence",
      // Only scored when Places actually answered. Without the key we say
      // nothing rather than publish a midpoint that looks measured.
      measured: presence.available,
      score: presence.found ? presence.score : 20,
      headline: presence.found
        ? `Your Google profile is roughly ${presence.score}% built out.`
        : "We couldn't find a Google Business Profile for you.",
      findings: presence.findings,
    },
    {
      id: "competition",
      measured: competition.measured,
      score: competition.score,
      headline: competition.headline,
      findings: competition.findings,
    },
    {
      id: "social",
      measured: true,
      score: social.score,
      headline: social.linked.length
        ? `Your site links to ${social.linked.length} platform${social.linked.length === 1 ? "" : "s"}${social.hasOgImage ? " and shares with a preview" : ", but shared links render without a preview"}.`
        : "Your site doesn't link to any social profile.",
      findings: social.findings,
    },
  ];

  // Free tier shows the first finding per dimension; the rest is the trade.
  const FREE_FINDINGS_PER_DIMENSION = 1;
  const dimensions: Dimension[] = dimensionData
    .filter((d) => d.measured)
    .map((d) => ({
      id: d.id,
      score: clamp(d.score),
      headline: d.headline,
      findings: d.findings,
      lockedCount: Math.max(0, d.findings.length - FREE_FINDINGS_PER_DIMENSION),
    }));

  // Re-weighted across only what was measured, so a missing integration lowers
  // the report's breadth rather than silently dragging the score to the middle.
  const weightTotal = dimensions.reduce((sum, d) => sum + DIMENSION_META[d.id].weight, 0) || 1;
  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * DIMENSION_META[d.id].weight, 0) / weightTotal,
  );

  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];

  return {
    url: normalizedUrl,
    business_name: brandModel?.business_name || presence.name || businessName,
    overall,
    pillars,
    dimensions,
    headline:
      brandModel?.headline ||
      `Your weakest dimension is ${DIMENSION_META[weakest.id].label.toLowerCase()}, at ${weakest.score} out of 100.`,
    biggest_leak: brandModel?.biggest_leak ?? {
      title: `${DIMENSION_META[weakest.id].label} is your weakest link`,
      detail: weakest.headline,
      cost: "Every dimension below the others caps what the strong ones can earn you.",
    },
    quick_wins: brandModel?.quick_wins ?? [
      "Put who you serve into the first line of the homepage, not just what you make.",
      "Move one piece of real proof — a result, a named client, a review — above the fold.",
      "Add business schema markup so search and AI can state plainly what you are.",
    ],
    withheld_count: dimensions.reduce((sum, d) => sum + d.lockedCount, 0),
    full_findings: dimensions.flatMap((d) => d.findings.slice(FREE_FINDINGS_PER_DIMENSION)),
    positioning_statement: brandModel?.positioning_statement,
    call_agenda: brandModel?.call_agenda?.length ? brandModel.call_agenda : fallbackAgenda(seo, presence, aeoProbe),
    aeo: aeoProbe.ran ? aeoProbe : undefined,
    competitors: presence.competitors.length ? presence.competitors : undefined,
    gbp: presence.found ? { rating: presence.rating ?? null, review_count: presence.reviewCount ?? null, category: presence.category ?? null } : undefined,
    degraded,
  };
}

interface BrandModelOutput {
  business_name?: string;
  headline?: string;
  brand_headline?: string;
  pillars: Record<Pillar, { score: number; verdict: string }>;
  biggest_leak?: { title: string; detail: string; cost: string };
  quick_wins?: string[];
  brand_findings?: string[];
  positioning_statement?: string;
  call_agenda?: CallAgendaItem[];
}

/** The one model-judged part. Given every hard measurement as context so its
 * biggest_leak reflects the whole picture, not just the copy. */
async function synthesizeBrand(
  apiKey: string,
  scrape: ScrapeResult,
  url: string,
  seo: SeoAudit,
  presence: PresenceAudit,
  social: SocialAudit,
): Promise<BrandModelOutput | null> {
  const failing = seo.signals.filter((s) => !s.pass).map((s) => `${s.label}: ${s.detail}`);

  const prompt = `You are Leon, founder of LIONOVART, doing a brand diagnostic on a business's website. You are direct and specific. You never flatter, and you never give advice so generic it could apply to any other business.

Score five brand pillars 0-100. Use the full range — most small-business sites land between 30 and 65. A 90 means genuinely exceptional. Reserve it.

${PILLARS.map((p) => `- ${PILLAR_LABELS[p]}: ${PILLAR_QUESTIONS[p]}`).join("\n")}

Every verdict must cite something actually present in (or conspicuously absent from) the evidence below. If the scrape is thin, say what's missing rather than inventing detail. Never invent a fact that isn't in this evidence — the reader can check.

SITE: ${url}
TITLE: ${scrape.title || "(none)"}
META DESCRIPTION: ${scrape.description || "(none)"}
HEADINGS: ${JSON.stringify(scrape.headings?.slice(0, 25) ?? [])}
SERVICES DETECTED: ${JSON.stringify(scrape.services_detected ?? [])}
PAGE SUMMARY: ${scrape.summary || "(none)"}
APPROX WORD COUNT: ${seo.wordCount}

TECHNICAL CHECKS THAT FAILED:
${failing.length ? failing.join("\n") : "(none — the technical foundations are sound)"}

STRUCTURED DATA PRESENT: ${seo.schemaTypes.length ? seo.schemaTypes.join(", ") : "none"}
SOCIAL PROFILES LINKED FROM THE SITE: ${social.linked.length ? social.linked.join(", ") : "none"}
${
  presence.found
    ? `GOOGLE BUSINESS PROFILE: ${presence.rating ?? "no"} stars from ${presence.reviewCount ?? 0} reviews, category "${presence.category ?? "n/a"}"${presence.reviewGap ? `. Comparable businesses nearby carry a median of ${presence.reviewGap.median} reviews.` : ""}
NEARBY COMPARABLE BUSINESSES: ${presence.competitors.map((c) => `${c.name} (${c.rating ?? "?"}★, ${c.reviewCount ?? 0} reviews)`).join("; ") || "none found"}`
    : "GOOGLE BUSINESS PROFILE: not found."
}
${scrape.error ? `NOTE: the scrape was incomplete (${scrape.error}). Score what you can see and flag the rest as unknown rather than guessing.` : ""}

For "call_agenda", write the four things a 20-minute call with Leon would actually decide — the judgement calls, sequencing questions and trade-offs that a written report genuinely cannot settle. Reference this business's real situation (their category, their competitors by name where relevant, their specific gap). Do NOT make these teasers for withheld data; they must be real strategic questions that only a conversation resolves.

Return ONLY valid JSON matching exactly this shape:
${SCHEMA_HINT}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_DOSSIER_MODEL || "gemini-3.1-pro",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });
    const parsed = JSON.parse(result.text ?? "");

    const pillars = PILLARS.reduce(
      (acc, p) => {
        acc[p] = {
          score: clamp(parsed.pillars?.[p]?.score),
          verdict: String(parsed.pillars?.[p]?.verdict ?? "").trim() || PILLAR_QUESTIONS[p],
        };
        return acc;
      },
      {} as Record<Pillar, { score: number; verdict: string }>,
    );

    const agenda: CallAgendaItem[] = (Array.isArray(parsed.call_agenda) ? parsed.call_agenda : [])
      .map((a: { title?: unknown; teaser?: unknown }) => ({
        title: String(a?.title ?? "").trim(),
        teaser: String(a?.teaser ?? "").trim(),
      }))
      .filter((a: CallAgendaItem) => a.title)
      .slice(0, 4);

    return {
      business_name: String(parsed.business_name ?? "").trim() || undefined,
      headline: String(parsed.headline ?? "").trim() || undefined,
      brand_headline: String(parsed.brand_headline ?? "").trim() || undefined,
      pillars,
      biggest_leak: parsed.biggest_leak
        ? {
            title: String(parsed.biggest_leak.title ?? "").trim() || "The offer isn't landing",
            detail: String(parsed.biggest_leak.detail ?? "").trim(),
            cost: String(parsed.biggest_leak.cost ?? "").trim(),
          }
        : undefined,
      quick_wins: (Array.isArray(parsed.quick_wins) ? parsed.quick_wins : []).slice(0, 3).map(String),
      brand_findings: (Array.isArray(parsed.brand_findings) ? parsed.brand_findings : []).map(String),
      positioning_statement: String(parsed.positioning_statement ?? "").trim() || undefined,
      call_agenda: agenda,
    };
  } catch (err) {
    console.error("[brand-score] synthesis failed:", err);
    return null;
  }
}

/** The teaser half — everything a visitor sees before handing over an email.
 * Dimension findings are trimmed to the free allowance; the call agenda stays
 * fully visible on purpose. */
export function toTeaser(score: BrandScoreResult) {
  const { full_findings: _f, positioning_statement: _p, ...rest } = score;
  return {
    ...rest,
    dimensions: rest.dimensions.map((d) => ({ ...d, findings: d.findings.slice(0, 1) })),
  };
}

/** Compact briefing Nova reads before greeting a scanned visitor, and the same
 * evidence the dossier qualifies from. */
export function toBriefing(score: BrandScoreResult): string {
  const dims = (score.dimensions ?? [])
    .map((d) => `${DIMENSION_META[d.id]?.label ?? d.id} ${d.score}`)
    .join(" · ");
  return [
    `Brand Score for ${score.business_name} (${score.url}): ${score.overall}/100.`,
    dims,
    `Headline read: ${score.headline}`,
    `Biggest leak — ${score.biggest_leak.title}: ${score.biggest_leak.detail} Cost: ${score.biggest_leak.cost}`,
    score.aeo?.ran
      ? `AI visibility probe: asked "${score.aeo.query}" — ${score.aeo.mentioned ? "they were named" : `they were NOT named; the engine named ${score.aeo.namedInstead.slice(0, 3).join(", ") || "others"}`}.`
      : "",
    score.gbp ? `Google profile: ${score.gbp.rating ?? "no"} stars from ${score.gbp.review_count ?? 0} reviews (${score.gbp.category ?? "uncategorised"}).` : "",
    score.competitors?.length
      ? `Nearby comparables: ${score.competitors.map((c) => `${c.name} (${c.rating ?? "?"}★, ${c.reviewCount ?? 0})`).join("; ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
