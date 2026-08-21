import "server-only";
import { fetchTextSafely } from "@/lib/scrape-website";

/**
 * Technical SEO + AEO-readiness audit.
 *
 * Every check here is deterministic and verifiable — measured off the actual
 * markup, never inferred by a model. That matters for a report a stranger will
 * judge us by: a made-up finding they can disprove in one click costs more
 * trust than a shallow one.
 */

export interface SeoSignal {
  id: string;
  label: string;
  /** true = healthy. */
  pass: boolean;
  /** What was actually measured, in the visitor's terms. */
  detail: string;
  /** Weight toward the dimension score. */
  weight: number;
  /** Which dimension this signal counts toward. */
  dimension: "seo" | "aeo";
}

export interface SeoAudit {
  signals: SeoSignal[];
  seoScore: number;
  aeoScore: number;
  /** Schema.org @type values found in JSON-LD blocks. */
  schemaTypes: string[];
  hasRobots: boolean;
  hasSitemap: boolean;
  hasLlmsTxt: boolean;
  wordCount: number;
}

function attr(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? (m[1] ?? "").trim() : null;
}

function countTags(html: string, tag: string): number {
  return (html.match(new RegExp(`<${tag}[\\s>]`, "gi")) ?? []).length;
}

/** JSON-LD @type values. Structured data is the single biggest lever on whether
 * an answer engine can describe a business confidently. */
function extractSchemaTypes(html: string): string[] {
  const types = new Set<string>();
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const walk = (node: unknown) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (node && typeof node === "object") {
          const t = (node as Record<string, unknown>)["@type"];
          if (typeof t === "string") types.add(t);
          if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x));
          Object.values(node as Record<string, unknown>).forEach(walk);
        }
      };
      walk(JSON.parse(m[1].trim()));
    } catch {
      // A malformed block is itself a finding, but not worth failing the parse over.
    }
  }
  return [...types];
}

function visibleWordCount(html: string): number {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

export async function auditSeo(url: string, html: string): Promise<SeoAudit> {
  const origin = (() => {
    try {
      return new URL(url).origin;
    } catch {
      return null;
    }
  })();

  // Three small files, fetched together. Absent and unreachable are treated the
  // same — we only ever report what we could positively confirm.
  const [robotsTxt, sitemapXml, llmsTxt] = origin
    ? await Promise.all([
        fetchTextSafely(`${origin}/robots.txt`),
        fetchTextSafely(`${origin}/sitemap.xml`),
        fetchTextSafely(`${origin}/llms.txt`),
      ])
    : [null, null, null];

  const hasRobots = Boolean(robotsTxt && /user-agent/i.test(robotsTxt));
  const hasSitemap =
    Boolean(sitemapXml && /<(urlset|sitemapindex)/i.test(sitemapXml)) ||
    Boolean(robotsTxt && /sitemap:/i.test(robotsTxt));
  const hasLlmsTxt = Boolean(llmsTxt && llmsTxt.trim().length > 20);

  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? "";
  const metaDesc =
    attr(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ?? "";
  const h1Count = countTags(html, "h1");
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const imgsWithAlt = imgTags.filter((t) => /\balt=["'][^"']+["']/i.test(t)).length;
  const altCoverage = imgTags.length ? Math.round((imgsWithAlt / imgTags.length) * 100) : 100;
  const schemaTypes = extractSchemaTypes(html);
  const wordCount = visibleWordCount(html);

  const hasLocalBusiness = schemaTypes.some((t) => /LocalBusiness|Organization|Store|Restaurant|ProfessionalService/i.test(t));
  const hasFaqSchema = schemaTypes.some((t) => /FAQPage|Question/i.test(t));
  const isHttps = url.startsWith("https://");

  const signals: SeoSignal[] = [
    {
      id: "title",
      label: "Page title",
      pass: title.length >= 25 && title.length <= 65,
      detail: title
        ? `Your title is ${title.length} characters. Search engines show roughly 60 — under 25 wastes the slot, over 65 gets cut off.`
        : "There's no title tag at all, so search results fall back to guessing a name for you.",
      weight: 2,
      dimension: "seo",
    },
    {
      id: "meta_description",
      label: "Meta description",
      pass: metaDesc.length >= 70 && metaDesc.length <= 165,
      detail: metaDesc
        ? `Your description is ${metaDesc.length} characters. The useful window is about 70–165.`
        : "No meta description, so Google writes its own snippet for you from whatever text it finds first.",
      weight: 2,
      dimension: "seo",
    },
    {
      id: "h1",
      label: "Headline structure",
      pass: h1Count === 1,
      detail:
        h1Count === 0
          ? "The page has no H1 — nothing declares what it's primarily about."
          : h1Count === 1
            ? "Exactly one H1, which is what you want."
            : `${h1Count} H1 tags compete to be the page's main subject. There should be one.`,
      weight: 1.5,
      dimension: "seo",
    },
    {
      id: "alt_text",
      label: "Image alt text",
      pass: altCoverage >= 80,
      detail: imgTags.length
        ? `${imgsWithAlt} of ${imgTags.length} images have alt text (${altCoverage}%). Images without it are invisible to search and to screen readers.`
        : "No images detected on the page.",
      weight: 1,
      dimension: "seo",
    },
    {
      id: "canonical",
      label: "Canonical URL",
      pass: /<link[^>]+rel=["']canonical["']/i.test(html),
      detail: /<link[^>]+rel=["']canonical["']/i.test(html)
        ? "A canonical URL is declared."
        : "No canonical tag, so duplicate versions of this page can split their own ranking signals.",
      weight: 1,
      dimension: "seo",
    },
    {
      id: "viewport",
      label: "Mobile viewport",
      pass: /<meta[^>]+name=["']viewport["']/i.test(html),
      detail: /<meta[^>]+name=["']viewport["']/i.test(html)
        ? "A mobile viewport is set."
        : "No viewport tag — mobile browsers will render this as a shrunken desktop page.",
      weight: 2,
      dimension: "seo",
    },
    {
      id: "https",
      label: "HTTPS",
      pass: isHttps,
      detail: isHttps ? "The site is served over HTTPS." : "The site isn't on HTTPS — browsers flag it as not secure.",
      weight: 2,
      dimension: "seo",
    },
    {
      id: "og",
      label: "Social share preview",
      pass: /<meta[^>]+property=["']og:image["']/i.test(html),
      detail: /<meta[^>]+property=["']og:image["']/i.test(html)
        ? "An Open Graph image is set, so shared links render with a preview."
        : "No Open Graph image — every time someone shares your link it appears as a bare grey box.",
      weight: 1.5,
      dimension: "seo",
    },
    {
      id: "sitemap",
      label: "Sitemap",
      pass: hasSitemap,
      detail: hasSitemap ? "A sitemap is published." : "No sitemap found, so crawlers discover your pages only by following links.",
      weight: 1,
      dimension: "seo",
    },
    {
      id: "thin_content",
      label: "Content depth",
      pass: wordCount >= 300,
      detail: `The page carries roughly ${wordCount} words. Under 300 usually reads as thin to a search engine, and gives an AI almost nothing to quote.`,
      weight: 1.5,
      dimension: "seo",
    },

    /* ── AEO: can an answer engine describe you confidently? ─────────── */
    {
      id: "schema_business",
      label: "Business structured data",
      pass: hasLocalBusiness,
      detail: hasLocalBusiness
        ? `Structured data identifies the business (${schemaTypes.filter((t) => /LocalBusiness|Organization|Store|Restaurant|ProfessionalService/i.test(t)).join(", ")}).`
        : "No business schema markup. An AI reading this page has to infer who you are, what you sell and where you operate from prose — so it often just doesn't.",
      weight: 3,
      dimension: "aeo",
    },
    {
      id: "schema_faq",
      label: "Question-answer markup",
      pass: hasFaqSchema,
      detail: hasFaqSchema
        ? "FAQ markup is present, which is the format answer engines quote from most readily."
        : "No FAQ or Q&A markup. This is the single most quotable format for AI answers, and it's missing.",
      weight: 2.5,
      dimension: "aeo",
    },
    {
      id: "schema_any",
      label: "Structured data coverage",
      pass: schemaTypes.length >= 3,
      detail: schemaTypes.length
        ? `${schemaTypes.length} structured-data type${schemaTypes.length === 1 ? "" : "s"} found: ${schemaTypes.slice(0, 6).join(", ")}.`
        : "No structured data of any kind on the page.",
      weight: 1.5,
      dimension: "aeo",
    },
    {
      id: "nap",
      label: "Contact details in the markup",
      pass: /tel:|mailto:/i.test(html),
      detail: /tel:|mailto:/i.test(html)
        ? "A phone or email link is present in the markup."
        : "No machine-readable phone or email link, so an assistant can't hand a caller your contact details.",
      weight: 1.5,
      dimension: "aeo",
    },
    {
      id: "robots",
      label: "Crawler access",
      pass: hasRobots && !/noindex/i.test(html),
      detail: /noindex/i.test(html)
        ? "This page carries a noindex directive — it is actively asking to be left out of search."
        : hasRobots
          ? "A robots.txt is published and this page is indexable."
          : "No robots.txt found. Not fatal, but it's the file crawlers and AI agents check first.",
      weight: 1,
      dimension: "aeo",
    },
    {
      id: "llms_txt",
      label: "llms.txt",
      pass: hasLlmsTxt,
      detail: hasLlmsTxt
        ? "An llms.txt is published — you're ahead of nearly everyone on this."
        : "No llms.txt. It's the emerging convention for telling AI assistants what your business is and what to say about it. Almost nobody has one yet, which is exactly why it's worth having.",
      weight: 1.5,
      dimension: "aeo",
    },
  ];

  const scoreFor = (dimension: "seo" | "aeo") => {
    const subset = signals.filter((s) => s.dimension === dimension);
    const total = subset.reduce((sum, s) => sum + s.weight, 0);
    if (!total) return 50;
    const earned = subset.reduce((sum, s) => sum + (s.pass ? s.weight : 0), 0);
    return Math.round((earned / total) * 100);
  };

  return {
    signals,
    seoScore: scoreFor("seo"),
    aeoScore: scoreFor("aeo"),
    schemaTypes,
    hasRobots,
    hasSitemap,
    hasLlmsTxt,
    wordCount,
  };
}
