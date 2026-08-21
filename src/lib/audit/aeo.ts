import "server-only";
import { GoogleGenAI } from "@google/genai";

/**
 * The live Answer Engine test.
 *
 * Rather than theorise about AI visibility, this asks a real search-grounded
 * model the question a buyer would actually type — "best <category> in <city>"
 * — and records whether the business comes back. It's the most quoted line in
 * the whole report because it isn't an opinion: it's a result the visitor can
 * reproduce themselves in thirty seconds.
 *
 * Because it IS reproducible, it has to be reported carefully: one query on one
 * engine at one moment, described as exactly that and nothing more.
 */

export interface AeoProbe {
  ran: boolean;
  query?: string;
  mentioned?: boolean;
  /** Businesses the answer engine named instead (or alongside). */
  namedInstead: string[];
  verdict: string;
}

const EMPTY: AeoProbe = { ran: false, namedInstead: [], verdict: "" };

/** Loose containment check — "Joe's Pizza Co." should match "Joe's Pizza". */
function mentions(answer: string, businessName: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const hay = normalize(answer);
  const needle = normalize(businessName);
  if (!needle) return false;
  if (hay.includes(needle)) return true;

  // Fall back to the distinctive words in the name, ignoring generic suffixes.
  const stop = new Set(["the", "and", "co", "inc", "ltd", "llc", "company", "group", "studio", "services", "solutions"]);
  const words = needle.split(" ").filter((w) => w.length > 3 && !stop.has(w));
  return words.length > 0 && words.every((w) => hay.includes(w));
}

export async function probeAeo(businessName: string, category?: string | null, city?: string): Promise<AeoProbe> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !businessName || !category) return EMPTY;

  const query = city ? `Who are the best ${category} in ${city}?` : `Who are the best ${category}?`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: `${query} Name specific businesses.` }] }],
      config: { tools: [{ googleSearch: {} }] },
    });
    const answer = res.text ?? "";
    if (!answer.trim()) return EMPTY;

    const mentioned = mentions(answer, businessName);

    // Pull the business names the engine actually returned, so the finding can
    // cite them rather than assert a gap in the abstract.
    const namedInstead = await extractNames(ai, answer, businessName);

    const verdict = mentioned
      ? `We asked a search-grounded AI "${query}" and your business came back in the answer. That's a real asset, and it's rarer than you'd think — most businesses in your category don't surface at all.`
      : namedInstead.length
        ? `We asked a search-grounded AI "${query}". You weren't in the answer. It named ${namedInstead.slice(0, 3).join(", ")} instead. As buyers increasingly ask an assistant instead of scrolling a results page, that answer is the shortlist.`
        : `We asked a search-grounded AI "${query}" and your business didn't come back in the answer.`;

    return { ran: true, query, mentioned, namedInstead, verdict };
  } catch (err) {
    console.error("[audit/aeo] probe failed:", err);
    return EMPTY;
  }
}

/** Second, cheap pass to turn prose into a clean list of business names. */
async function extractNames(ai: GoogleGenAI, answer: string, exclude: string): Promise<string[]> {
  try {
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Extract the specific business names mentioned in the text below. Return ONLY a JSON array of strings, at most 5, no commentary. Exclude "${exclude}". If none are named, return [].\n\n${answer.slice(0, 4000)}`,
            },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });
    const parsed = JSON.parse(res.text ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}
