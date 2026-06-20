/* ═══════════════════════════════════════════════════════════════════
   LIONOVART — SEO / AEO single source of truth
   ───────────────────────────────────────────────────────────────────
   All canonical business facts (NAP, services, locales, socials) live
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
  /** Short, factual default description. Refine during copy pass. */
  description:
    "LIONOVART is a Calgary-based creative agency building premium brands, websites, video, and AI-powered systems for ambitious founders — brand identity, web design, content, and growth marketing under one roof.",
  url: SITE_URL,
  email: "connect@lionovart.com",
  phone: "+1-587-897-4772",
  whatsapp: "15878974772",
  // Brand colors (used by manifest + theme-color).
  themeColor: "#0a0a0a",
  accentColor: "#c1121f",
} as const;

/** Name/Address/Phone for LocalBusiness schema + GBP consistency.
 *  Street is intentionally omitted until the Google Business Profile is
 *  set up (see master plan, Phase 1). Locality-level data is valid. */
export const NAP = {
  locality: "Calgary",
  region: "AB",
  regionName: "Alberta",
  country: "CA",
  countryName: "Canada",
  // Calgary city centroid — replace with verified address geo once GBP is live.
  latitude: 51.0447,
  longitude: -114.0719,
} as const;

/** Languages the team delivers in (claim from brief). knowsLanguage in schema. */
export const KNOWS_LANGUAGES = [
  "en", "es", "fr", "it", "ko", "pt", "ar", "de", "zh",
] as const;

/** Locales the SITE itself is currently localized into (i18n bundles present). */
export const SITE_LOCALES = ["en", "es", "fr", "it", "ko"] as const;

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
  keywords: string[];    // primary intent keywords (Calgary-weighted)
};

export const SERVICES: ServiceDef[] = [
  {
    slug: "brand",
    name: "Brand Identity & Strategy",
    short:
      "Logo systems, visual identity, typography, brand voice, and guidelines for businesses that want to look like the obvious premium choice.",
    keywords: [
      "brand identity Calgary",
      "logo design Calgary",
      "brand designer Calgary",
      "rebranding agency Alberta",
    ],
  },
  {
    slug: "web",
    name: "Web & App Design & Development",
    short:
      "Custom websites, web apps, UI/UX, e-commerce, and CMS builds engineered for performance, conversion, and search visibility.",
    keywords: [
      "web design Calgary",
      "website developer Calgary",
      "small business website Calgary",
      "ecommerce website Alberta",
    ],
  },
  {
    slug: "content-studio",
    name: "Content Studio — Video & Social",
    short:
      "Brand films, social reels, motion design, and full content management — strategy, copy, and a monthly content calendar.",
    keywords: [
      "video production Calgary",
      "social media management Calgary",
      "content creation agency Calgary",
      "reels editor Alberta",
    ],
  },
];

/** Static, indexable routes for the sitemap. Service slugs are appended. */
export const STATIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/services", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.2 },
];

export function abs(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
