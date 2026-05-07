/**
 * Lightweight website scraper used by NOVA's `scrape_website` tool.
 *
 * Fetches the page HTML and extracts a small summary the agent can weave
 * into the conversation. Strict 4s timeout, 200 KB response cap, no JS rendering —
 * if the site is fully client-rendered the result will be sparse and Nova
 * is prompted to fall back gracefully.
 */

export interface ScrapeResult {
  url: string;
  title: string;
  description: string;
  headings: string[];
  services_detected: string[];
  summary: string;
  error?: string;
}

const TIMEOUT_MS = 4500;
const MAX_BYTES = 200_000;

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function firstMatch(html: string, regex: RegExp): string {
  const m = html.match(regex);
  return m ? stripTags(m[1] || "") : "";
}

function allMatches(html: string, regex: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    const text = stripTags(m[1] || "");
    if (text) out.push(text);
  }
  return out;
}

/**
 * Tries to extract a few words that look like services from headings + nav.
 * Heuristic, not exhaustive — meant as nudges Nova can mirror back.
 */
function detectServices(headings: string[]): string[] {
  const SERVICE_KEYWORDS = [
    "branding",
    "brand",
    "design",
    "web",
    "website",
    "development",
    "marketing",
    "seo",
    "ads",
    "social",
    "content",
    "video",
    "photography",
    "consulting",
    "strategy",
    "ecommerce",
    "shop",
    "menu",
    "booking",
    "appointments",
    "services",
    "pricing",
  ];
  const seen = new Set<string>();
  for (const h of headings) {
    const lower = h.toLowerCase();
    for (const kw of SERVICE_KEYWORDS) {
      if (lower.includes(kw)) seen.add(kw);
    }
  }
  return [...seen].slice(0, 6);
}

export async function scrapeWebsite(rawUrl: string): Promise<ScrapeResult> {
  const url = normalizeUrl(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Identify ourselves so site owners can see the source if logged
        "User-Agent": "LIONOVART-NovaBot/1.0 (+https://lionovart.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      return {
        url,
        title: "",
        description: "",
        headings: [],
        services_detected: [],
        summary: `Site returned ${res.status} — I'd rather you tell me about it in your own words.`,
        error: `HTTP ${res.status}`,
      };
    }

    // Cap how much HTML we read
    const reader = res.body?.getReader();
    let received = 0;
    let html = "";
    if (reader) {
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (received >= MAX_BYTES) {
          try { await reader.cancel(); } catch (_) {}
          break;
        }
      }
    } else {
      html = await res.text();
    }

    const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description =
      firstMatch(
        html,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      firstMatch(
        html,
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      );

    const h1s = allMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    const h2s = allMatches(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).slice(0, 8);
    const h3s = allMatches(html, /<h3[^>]*>([\s\S]*?)<\/h3>/gi).slice(0, 6);
    const headings = [...h1s, ...h2s, ...h3s].map((h) => h.slice(0, 120));
    const services_detected = detectServices(headings);

    const summaryParts: string[] = [];
    if (title) summaryParts.push(`Title: ${title}`);
    if (description) summaryParts.push(`Tagline: ${description}`);
    if (h1s[0]) summaryParts.push(`Hero: ${h1s[0]}`);
    if (h2s.length) summaryParts.push(`Sections: ${h2s.slice(0, 4).join(" · ")}`);
    if (services_detected.length)
      summaryParts.push(`Services detected: ${services_detected.join(", ")}`);

    const summary = summaryParts.length
      ? summaryParts.join(" | ")
      : "Site loaded but no obvious copy detected — likely client-rendered. Ask the user to describe it.";

    return {
      url,
      title,
      description,
      headings,
      services_detected,
      summary,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      url,
      title: "",
      description: "",
      headings: [],
      services_detected: [],
      summary: `Couldn't reach the site (${message}). Ask the user to describe it instead.`,
      error: message,
    };
  } finally {
    clearTimeout(timer);
  }
}
