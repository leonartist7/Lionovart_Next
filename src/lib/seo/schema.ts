/* ═══════════════════════════════════════════════════════════════════
   LIONOVART — JSON-LD structured data builders (schema.org)
   ───────────────────────────────────────────────────────────────────
   These power both classic rich results (Google) and AEO — the entity
   graph that ChatGPT, Gemini, Perplexity and Google AI Overviews read
   to understand and quote the business. Facts only; no marketing prose.
   ═══════════════════════════════════════════════════════════════════ */
import {
  SITE,
  SITE_URL,
  SERVICE_AREAS,
  KNOWS_LANGUAGES,
  SOCIAL_PROFILES,
  SERVICES,
  LOGO_PATH,
  OG_IMAGE,
  abs,
} from "./config";
import { locales, type Locale } from "@/lib/i18n";

// Stable @id anchors so nodes can reference each other across the graph.
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE_URL,
    email: SITE.email,
    telephone: SITE.phone,
    slogan: SITE.tagline,
    description: SITE.description,
    logo: {
      "@type": "ImageObject",
      url: abs(LOGO_PATH),
    },
    image: abs(OG_IMAGE),
    knowsLanguage: [...KNOWS_LANGUAGES],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      email: SITE.email,
      contactType: "sales",
      areaServed: SERVICE_AREAS.map((area) => ({ ...area })),
      availableLanguage: [...KNOWS_LANGUAGES],
    },
    areaServed: SERVICE_AREAS.map((area) => ({ ...area })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Creative & Digital Services",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          url: abs(`/services/${s.slug}`),
        },
      })),
    },
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

export function websiteSchema(locale: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE.name,
    description: locales[locale].hero.subtitle,
    publisher: { "@id": ORG_ID },
    inLanguage: locale,
  };
}

/** Per-service page schema. */
export function serviceSchema(slug: string) {
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.short,
    serviceType: s.name,
    url: abs(`/services/${s.slug}`),
    provider: { "@id": ORG_ID },
    areaServed: SERVICE_AREAS.map((area) => ({ ...area })),
  };
}

type FaqItem = { question: string; answer: string };

/** FAQPage — the single highest-leverage AEO win. Feeds AI answer engines
 *  verbatim Q&A pairs they can cite. Pass the live FAQ copy in. */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}
