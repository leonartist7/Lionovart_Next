/**
 * Lightweight website scraper used by NOVA's `scrape_website` tool.
 *
 * Fetches the page HTML and extracts a small summary the agent can weave
 * into the conversation. Strict 4s timeout, 200 KB response cap, no JS rendering —
 * if the site is fully client-rendered the result will be sparse and Nova
 * is prompted to fall back gracefully.
 *
 * The URL is visitor-supplied, so every hop (initial request AND each
 * redirect) is checked against loopback/private/link-local ranges before
 * fetching — otherwise this becomes an SSRF probe into internal services,
 * with the response read back to the visitor as "site content". A DNS
 * rebind between the check and the connect is a known residual of this
 * approach; not defended against here as it requires pinning the socket to
 * the resolved address, out of scope for this tool-layer guard.
 */
import dns from "node:dns/promises";
import net from "node:net";

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
const MAX_REDIRECTS = 3;
const BLOCKED_HOSTNAMES = new Set(["metadata.google.internal", "metadata"]);

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true; // 192.168/16
  return false;
}

function isBlockedAddress(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) {
    const lower = ip.toLowerCase();
    const mapped = lower.match(/(?:^::ffff:|^::)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (mapped) return isPrivateIPv4(mapped[1]);
    if (lower === "::1" || lower === "::") return true; // loopback / unspecified
    if (/^fe[89ab][0-9a-f]:/.test(lower)) return true; // fe80::/10 link-local
    if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true; // fc00::/7 unique local
    return false;
  }
  return true; // not a parseable IP — block rather than risk it
}

async function isHostnameBlocked(hostname: string): Promise<boolean> {
  const lower = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(lower)) return true;
  if (net.isIP(hostname)) return isBlockedAddress(hostname);
  try {
    const results = await dns.lookup(hostname, { all: true });
    return results.some((r) => isBlockedAddress(r.address));
  } catch {
    return true; // couldn't resolve — block rather than let fetch try its own resolution
  }
}

/**
 * Fetches `startUrl`, following redirects manually (never `redirect:
 * "follow"`) so each hop can be re-validated against internal addresses
 * before the client connects to it.
 */
class BlockedUrlError extends Error {}

async function safeFetch(startUrl: string, signal: AbortSignal): Promise<Response> {
  let currentUrl = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const parsed = new URL(currentUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new BlockedUrlError("Blocked scheme");
    }
    if (await isHostnameBlocked(parsed.hostname)) {
      throw new BlockedUrlError("Blocked address");
    }

    const res = await fetch(currentUrl, {
      signal,
      redirect: "manual",
      headers: {
        // Identify ourselves so site owners can see the source if logged
        "User-Agent": "LIONOVART-NovaBot/1.0 (+https://lionovart.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }
    return res;
  }
  throw new BlockedUrlError("Too many redirects");
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
    const res = await safeFetch(url, controller.signal);

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
    // Blocked-URL reasons stay out of the model-facing summary — same
    // generic fallback as any other unreachable site, no hint that a
    // security check fired.
    if (err instanceof BlockedUrlError) {
      return {
        url,
        title: "",
        description: "",
        headings: [],
        services_detected: [],
        summary: `Couldn't read the site clearly from here — tell me about it in your own words.`,
        error: "blocked",
      };
    }
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
