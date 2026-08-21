import "server-only";
import { GoogleGenAI } from "@google/genai";
import { scrapeWebsite, type ScrapeResult } from "@/lib/scrape-website";
import { executeServerTool } from "@/lib/strategist-tools";

/**
 * Brand Score — the top-of-funnel diagnostic. A visitor gives a URL (cheap to
 * give, public, not "theirs") and gets back a specific read on their brand.
 *
 * The URL is what makes the rest of the funnel autonomous: it feeds the
 * pre-call briefing Nova opens with, the WhatsApp Leon gets, and the dossier —
 * all without the visitor answering a single qualifying question.
 *
 * Never dead-ends: if Gemini is unconfigured or fails, `heuristicScore` below
 * produces a real (if blunter) result from the scrape signals alone.
 */

export const PILLARS = ["clarity", "distinction", "credibility", "conversion", "consistency"] as const;
export type Pillar = (typeof PILLARS)[number];

/** Weights sum to 100. Clarity and distinction dominate — they're what actually
 * loses the deal, and they're what LIONOVART sells. */
const WEIGHTS: Record<Pillar, number> = {
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

export interface BrandScoreResult {
  url: string;
  business_name: string;
  overall: number;
  pillars: Record<Pillar, { score: number; verdict: string }>;
  headline: string;
  /** The single highest-leverage fix — this is the hook that earns the email. */
  biggest_leak: { title: string; detail: string; cost: string };
  quick_wins: string[];
  /** Findings held back for the full report — the honest reason to hand over an email. */
  withheld_count: number;
  /** Present only in the full (claimed) report. */
  full_findings?: string[];
  positioning_statement?: string;
  /** Public Google Business Profile data, when the Places key is configured. */
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
  "biggest_leak": {
    "title": string (short, concrete, max 8 words),
    "detail": string (2-3 sentences, specific to THIS site, no generic advice),
    "cost": string (one sentence on what this is costing them in plain business terms)
  },
  "quick_wins": string[] (exactly 3, each doable in under an hour, specific to this site),
  "full_findings": string[] (5-7 further findings, deeper than the quick wins — these are held back for the emailed report),
  "positioning_statement": string (one sentence: the positioning THIS business should own, written for them)
}`;

function clamp(n: unknown): number {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 50;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function weightedOverall(pillars: Record<Pillar, { score: number }>): number {
  const total = PILLARS.reduce((sum, p) => sum + pillars[p].score * WEIGHTS[p], 0);
  return Math.round(total / 100);
}

/**
 * Deterministic fallback. Blunter than the model, but it is a real read of real
 * signals — the funnel must never show a visitor an error where a score belongs.
 */
function heuristicScore(scrape: ScrapeResult, url: string): BrandScoreResult {
  const hasTitle = Boolean(scrape.title?.trim());
  const hasDescription = Boolean(scrape.description?.trim());
  const headings = scrape.headings?.length ?? 0;
  const services = scrape.services_detected?.length ?? 0;
  const text = `${scrape.title} ${scrape.description} ${scrape.headings?.join(" ")}`.toLowerCase();

  // Generic-language detector — the words every agency site uses, which is
  // precisely why they signal nothing.
  const genericTerms = ["solutions", "innovative", "passionate", "world-class", "cutting-edge", "we deliver", "your partner", "excellence"];
  const genericHits = genericTerms.filter((t) => text.includes(t)).length;
  const hasProof = /\b(review|testimonial|client|case stud|award|rated|trusted by)\b/.test(text);
  const hasCta = /\b(book|contact|get started|call|quote|schedule|enquir|inquir)\b/.test(text);

  const pillars = {
    clarity: {
      score: clamp(35 + (hasTitle ? 15 : 0) + (hasDescription ? 20 : 0) + Math.min(headings, 4) * 4),
      verdict: hasDescription
        ? "The page states what it is, though not yet who it is for."
        : "Nothing on the page tells a first-time visitor what this business actually does.",
    },
    distinction: {
      score: clamp(60 - genericHits * 12 + (services > 2 ? 8 : 0)),
      verdict: genericHits > 0
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
      score: clamp(50 + (hasTitle && hasDescription ? 10 : 0)),
      verdict: "Assessed on page signals only.",
    },
  };

  return {
    url,
    business_name: scrape.title?.split(/[|\-–—]/)[0].trim() || new URL(url).hostname.replace(/^www\./, ""),
    overall: weightedOverall(pillars),
    pillars,
    headline: "A first read from the page signals alone — the deeper analysis needs a moment more.",
    biggest_leak: {
      title: hasProof ? "The offer is buried" : "Nothing here proves you're good",
      detail: hasProof
        ? "The page carries proof, but the thing you actually want a visitor to do isn't the loudest element on it."
        : "A visitor has no way to tell whether you're excellent or average. Without proof, quality reads as a claim, and claims get compared on price.",
      cost: "Buyers who can't tell you apart default to whoever is cheapest.",
    },
    quick_wins: [
      "Put who you serve into the first line of the homepage, not just what you make.",
      "Move one piece of real proof — a result, a named client, a review — above the fold.",
      "Cut the page to a single primary call to action and let everything else be secondary.",
    ],
    withheld_count: 5,
    degraded: true,
  };
}

/** Runs the scrape + Places enrichment + model pass. Always resolves. */
export async function computeBrandScore(rawUrl: string, city?: string): Promise<BrandScoreResult> {
  const scrape = await scrapeWebsite(rawUrl).catch(
    (): ScrapeResult => ({ url: rawUrl, title: "", description: "", headings: [], services_detected: [], summary: "", error: "scrape_failed" }),
  );

  const normalizedUrl = scrape.url || rawUrl;
  const fallbackName = scrape.title?.split(/[|\-–—]/)[0].trim() || "";

  // Public GBP data, best-effort — reuses the existing enrichment tool (and its
  // 24h cache) rather than a second Places client.
  let gbp: BrandScoreResult["gbp"];
  if (fallbackName) {
    try {
      const res = await executeServerTool("enrich_business", { name: fallbackName, city });
      const b = res.body as { found?: boolean; rating?: number | null; review_count?: number | null; category?: string | null };
      if (b.found) gbp = { rating: b.rating ?? null, review_count: b.review_count ?? null, category: b.category ?? null };
    } catch {
      // non-fatal
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ...heuristicScore(scrape, normalizedUrl), gbp };

  const prompt = `You are Leon, founder of LIONOVART, doing a fast brand diagnostic on a business's website. You are direct and specific. You never flatter, and you never give advice so generic it could apply to any other site.

Score five pillars 0-100. Be honest and use the full range — most small-business sites land between 30 and 65. A 90 means genuinely exceptional. Reserve it.

${PILLARS.map((p) => `- ${PILLAR_LABELS[p]}: ${PILLAR_QUESTIONS[p]}`).join("\n")}

Every verdict must cite something actually present in (or conspicuously absent from) the scraped content below. If the scrape is thin, say what's missing rather than inventing detail.

SITE: ${normalizedUrl}
TITLE: ${scrape.title || "(none)"}
META DESCRIPTION: ${scrape.description || "(none)"}
HEADINGS: ${JSON.stringify(scrape.headings?.slice(0, 25) ?? [])}
SERVICES DETECTED: ${JSON.stringify(scrape.services_detected ?? [])}
PAGE SUMMARY: ${scrape.summary || "(none)"}
${gbp ? `GOOGLE BUSINESS PROFILE: rating ${gbp.rating ?? "n/a"} from ${gbp.review_count ?? 0} reviews, category "${gbp.category ?? "n/a"}"` : ""}
${scrape.error ? `NOTE: the scrape was incomplete (${scrape.error}). Score what you can see and flag the rest as unknown rather than guessing.` : ""}

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
      {} as BrandScoreResult["pillars"],
    );

    const fullFindings: string[] = Array.isArray(parsed.full_findings) ? parsed.full_findings.map(String) : [];

    return {
      url: normalizedUrl,
      business_name: String(parsed.business_name ?? fallbackName).trim() || new URL(normalizedUrl).hostname.replace(/^www\./, ""),
      overall: weightedOverall(pillars),
      pillars,
      headline: String(parsed.headline ?? "").trim(),
      biggest_leak: {
        title: String(parsed.biggest_leak?.title ?? "").trim() || "The offer isn't landing",
        detail: String(parsed.biggest_leak?.detail ?? "").trim(),
        cost: String(parsed.biggest_leak?.cost ?? "").trim(),
      },
      quick_wins: (Array.isArray(parsed.quick_wins) ? parsed.quick_wins : []).slice(0, 3).map(String),
      withheld_count: fullFindings.length,
      full_findings: fullFindings,
      positioning_statement: String(parsed.positioning_statement ?? "").trim() || undefined,
      gbp,
      degraded: false,
    };
  } catch (err) {
    console.error("[brand-score] generation failed:", err);
    return { ...heuristicScore(scrape, normalizedUrl), gbp };
  }
}

/** The teaser half — everything a visitor sees before handing over an email. */
export function toTeaser(score: BrandScoreResult) {
  const { full_findings: _f, positioning_statement: _p, ...teaser } = score;
  return teaser;
}

/** Compact briefing Nova reads before she greets a scanned visitor, and the
 * same text the dossier uses as its pre-call evidence. */
export function toBriefing(score: BrandScoreResult): string {
  const pillarLine = PILLARS.map((p) => `${PILLAR_LABELS[p]} ${score.pillars[p].score}`).join(" · ");
  return [
    `Brand Score for ${score.business_name} (${score.url}): ${score.overall}/100.`,
    pillarLine,
    `Headline read: ${score.headline}`,
    `Biggest leak — ${score.biggest_leak.title}: ${score.biggest_leak.detail} Cost: ${score.biggest_leak.cost}`,
    score.gbp ? `Google profile: ${score.gbp.rating ?? "no"} stars from ${score.gbp.review_count ?? 0} reviews (${score.gbp.category ?? "uncategorised"}).` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
