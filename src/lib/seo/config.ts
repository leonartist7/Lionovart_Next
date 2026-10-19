/* ═══════════════════════════════════════════════════════════════════
   LIONOVART — SEO / AEO single source of truth
   ───────────────────────────────────────────────────────────────────
   All canonical business facts (service areas, services, locales, socials) live
   here so metadata, structured data (JSON-LD), the sitemap, robots and
   the manifest never drift apart. Update facts in ONE place.

   NOTE: marketing COPY (titles, descriptions) is intentionally kept
   minimal/factual here. Final on-page copy is refined during the
   copywriting pass — see SEO_AEO_MASTER_PLAN.md.
   ═══════════════════════════════════════════════════════════════════ */

/** Production origin. No trailing slash. */
export const SITE_URL = "https://lionovart.com";

export const SITE = {
  name: "LIONOVART",
  legalName: "LIONOVART",
  tagline: "We build brands that roar.",
  title: "LIONOVART — Creative Agency | Brand, Web & AI Systems",
  /** Shared default for search snippets, social previews, and organization data. */
  description:
    "Brand identity, websites, apps, films, content and AI systems for ambitious businesses. LIONOVART brings strategy and creative work together.",
  url: SITE_URL,
  email: "connect@lionovart.com",
  phone: "+1-587-897-4772",
  whatsapp: "15878974772",
  // Brand colors (used by manifest + theme-color).
  themeColor: "#0a0a0a",
  accentColor: "#c1121f",
} as const;

/** Brand assets referenced by metadata + JSON-LD. These point at files that
 *  actually exist in /public so schema `logo`/`image` and OG tags never 404.
 *  TODO: replace OG_IMAGE with a dedicated 1200x630 JPG/PNG for best social
 *  previews (AVIF has limited support in social scrapers). */
export const LOGO_PATH = "/images/LOGO.svg";
export const OG_IMAGE = "/images/LION-CIRCLE.avif";

/** Current service regions; these describe client coverage, not an office address. */
export const SERVICE_AREAS = [
  { "@type": "Continent", name: "Europe" },
  { "@type": "Continent", name: "North America" },
] as const;

export const SITE_KEYWORDS = [
  "creative agency",
  "brand identity",
  "web design",
  "app development",
  "logo design",
  "video production",
  "social media management",
  "AI automation agency",
] as const;

/** Languages the team delivers in (claim from brief). knowsLanguage in schema. */
export const KNOWS_LANGUAGES = [
  "en", "es", "fr", "it", "ko", "pt", "ar", "de", "zh",
] as const;

/** Locales the SITE itself is currently localized into (i18n bundles present). */
export const SITE_LOCALES = ["en", "es", "fr", "it", "ja", "ko"] as const;

/** Social / external profiles — drives schema `sameAs` and footer.
 *  Fill the real handles as accounts go live (see master plan, Phase 2). */
export const SOCIAL_PROFILES: string[] = [
  // "https://www.instagram.com/lionovart",
  // "https://www.linkedin.com/company/lionovart",
  // "https://www.tiktok.com/@lionovart",
  // "https://www.youtube.com/@lionovart",
];

/** Service pillars — power the Service schema + sitemap + internal links. */
export type ServiceDef = {
  slug: string;          // url path under /services
  name: string;          // schema serviceType / page name
  short: string;         // factual one-liner (refine in copy pass)
  keywords: string[];    // service intent keywords
};

export const SERVICES: ServiceDef[] = [
  {
    "slug": "brand",
    "name": "Brand & Graphic Design",
    "short": "Make your image reflect the quality of your business, from your identity to every printed and digital detail.",
    "keywords": [
      "Brand Identity",
      "Graphic Design",
      "Packaging",
      "Brand Guidelines"
    ]
  },
  {
    "slug": "web",
    "name": "Digital Experiences",
    "short": "Websites, apps and customer platforms that bring your brand to life and make the next step feel natural.",
    "keywords": [
      "Websites",
      "Apps & Platforms",
      "E-Commerce",
      "UI/UX Design"
    ]
  },
  {
    "slug": "content-studio",
    "name": "Content & Campaigns",
    "short": "Seasonal, promotional and ongoing content that gives people a reason to notice you and take action.",
    "keywords": [
      "Seasonal Campaigns",
      "Promotional Content",
      "Video & Motion",
      "Content Calendars"
    ]
  },
  {
    "slug": "print",
    "name": "Spaces & Events",
    "short": "Bring your brand into the real world through events, signage, retail displays and memorable physical experiences.",
    "keywords": [
      "Event Design",
      "Signage & Displays",
      "Retail Experiences",
      "Print Artwork"
    ]
  },
  {
    "slug": "ai",
    "name": "Smart Business Systems",
    "short": "Custom AI-powered operating platforms that connect your tools, simplify daily work and give your team time back.",
    "keywords": [
      "Custom AOS",
      "Client Portals",
      "AI Workflows",
      "Dashboards"
    ]
  },
  {
    "slug": "led",
    "name": "Transparent LED Experiences",
    "short": "Turn your windows into a moving brand experience with transparent LED displays and bespoke creative content.",
    "keywords": [
      "Transparent Displays",
      "Custom Motion",
      "Window Campaigns",
      "Site Assessment"
    ]
  }
];

/** Static, indexable routes for the sitemap. Service slugs are appended. */
export const STATIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/services", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/careers", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.2 },
];

export function abs(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
