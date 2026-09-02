import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { rateLimitOk } from "@/lib/rate-limit";

interface ScoreBody {
  website_url?: string;
}

interface ScoreResult {
  score: number;
  verdict: string;
  critique: string;
}

// Blunt SSRF guard: this endpoint fetches whatever URL a visitor types in,
// so refuse loopback/link-local/private ranges before we ever open a socket.
function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 127 || a === 10 || a === 169 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 0;
}

function normalizeUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isBlockedHostname(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

// Best-effort peek at the page — title/description/visible-text snippet.
// Never throws: a fetch failure just means the model works from the domain alone.
async function fetchSiteSignal(url: URL): Promise<string | null> {
  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LionovartAuditBot/1.0)" },
    });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 200_000);
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
    const description =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim() ?? "";
    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);
    const parts = [title && `Title: ${title}`, description && `Meta description: ${description}`, bodyText && `Visible text sample: ${bodyText}`].filter(Boolean);
    return parts.length ? parts.join("\n") : null;
  } catch {
    return null;
  }
}

function fallbackResult(): ScoreResult {
  return {
    score: 58,
    verdict: "First impression: undecided.",
    critique:
      "We couldn't generate a live read for this one just now. That's usually a sign it's worth a real look — get the full breakdown from a human instead of a bot's best guess.",
  };
}

async function generateScore(url: URL, signal: string | null): Promise<ScoreResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackResult();

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const prompt = signal
    ? `You are a blunt, expert brand-and-web strategist giving a stranger a fast, honest first-impression score of their website. Real page content follows — use it.

URL: ${url.toString()}
${signal}

Score their brand/web first impression 0-100 (design, clarity, trust signals, positioning — not technical SEO/performance, you can't measure that here). Respond with ONLY a JSON object: {"score": <integer 0-100>, "verdict": "<max 8-word punchy headline>", "critique": "<2-3 sentences, specific to what you saw, direct but constructive, no fluff>"}.`
    : `You are a blunt, expert brand-and-web strategist giving a stranger a fast first-impression read based only on their domain name (the page itself couldn't be fetched, so be honest this is a quick gut-take, not a full audit).

URL: ${url.toString()}

Give a plausible 0-100 first-impression score and a short, honest, specific-feeling take grounded in the domain/brand name and what it suggests. Respond with ONLY a JSON object: {"score": <integer 0-100>, "verdict": "<max 8-word punchy headline>", "critique": "<2-3 sentences, direct but constructive, no fluff>"}.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });
    const text = result.text ?? "";
    const parsed = JSON.parse(text) as Partial<ScoreResult>;
    if (
      typeof parsed.score !== "number" ||
      typeof parsed.verdict !== "string" ||
      typeof parsed.critique !== "string"
    ) {
      return fallbackResult();
    }
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      verdict: parsed.verdict.trim(),
      critique: parsed.critique.trim(),
    };
  } catch (err) {
    console.error("[score route] Gemini failed:", err);
    return fallbackResult();
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: ScoreBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = normalizeUrl(body.website_url ?? "");
  if (!url) {
    return NextResponse.json({ error: "Enter a valid website URL." }, { status: 400 });
  }

  const signal = await fetchSiteSignal(url);
  const result = await generateScore(url, signal);

  return NextResponse.json({ ...result, website_url: url.toString() }, { status: 200 });
}
