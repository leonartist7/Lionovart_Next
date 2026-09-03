import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { rateLimitOk } from "@/lib/rate-limit";

interface PeekBody {
  website_url?: string;
}

interface PeekResult {
  message: string;
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
// Never throws: a fetch failure just means Nova works from the domain alone.
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

// Same line NOVA already uses in the live voice conversation when
// scrape_website comes back empty (nova-brain/prompts/en.js) — one voice,
// whether the visitor is talking to her or typing into the hero.
function fallbackResult(): PeekResult {
  return {
    message: "Couldn't quite read your site from here. Let's get you the full picture instead.",
  };
}

// Mirrors NOVA's own established reaction to a scraped site (see
// nova-brain/prompts/en.js, Stage 3): "I had a peek — I love that you lead
// with [specific]. I noticed [X] — is that the full picture?" One voice for
// the hero widget and the live conversation, not a separate "audit tool"
// persona.
async function generateMessage(url: URL, signal: string | null): Promise<PeekResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackResult();

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const voice = `You are Nova, the front-desk strategist for LIONOVART, a premium creative agency. Charming, warm, witty, present - never a robot in a suit. Contractions always ("I'm", "you're", "that's"). Short sentences, one idea each. You reflect and notice, you never score, grade, or rate anything numerically, and you never give a prescriptive verdict - noticing something specific and opening a door is the whole move. Never say "as an AI". Never use filler words like "elevate", "seamless", "unlock", "revolutionize". Never use an em dash.`;

  const prompt = signal
    ? `${voice}

A visitor just typed their website into your hero widget so you can have a peek before they book a call. Real page content follows.

URL: ${url.toString()}
${signal}

Write ONE to TWO sentences reacting to it, exactly like you would mid-conversation: one specific compliment tied to something you actually saw, plus one sharp, honest observation. End on an implicit invitation, the way you'd say "is that the full picture?" - never a hard sales line. Respond with ONLY a JSON object: {"message": "<your 1-2 sentences>"}.`
    : `${voice}

A visitor typed their website into your hero widget, but you could not load the page itself (only the domain name is available). Be honest about that the way you already are when a scrape comes back empty, but keep it warm and brief, and gesture at what you'd want to know instead. Respond with ONLY a JSON object: {"message": "<your 1-2 sentences>"}.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });
    const text = result.text ?? "";
    const parsed = JSON.parse(text) as Partial<PeekResult>;
    if (typeof parsed.message !== "string" || !parsed.message.trim()) {
      return fallbackResult();
    }
    return { message: parsed.message.trim() };
  } catch (err) {
    console.error("[peek route] Gemini failed:", err);
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

  let body: PeekBody;
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
  const result = await generateMessage(url, signal);

  return NextResponse.json({ ...result, website_url: url.toString() }, { status: 200 });
}
