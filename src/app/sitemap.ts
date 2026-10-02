import type { MetadataRoute } from "next";
import { SITE_URL, STATIC_ROUTES, SERVICES } from "@/lib/seo/config";
import { LOCALES } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const serviceEntries: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const localizedStaticPaths = STATIC_ROUTES.map((route) => route.path).filter((path) => path !== "/careers");
  const canonicalPaths = [...localizedStaticPaths, ...SERVICES.map((service) => `/services/${service.slug}`)];
  const localizedEntries: MetadataRoute.Sitemap = LOCALES
    .filter((locale) => locale !== "en")
    .flatMap((locale) => canonicalPaths.map((path) => ({
      url: `${SITE_URL}${localizedPath(locale, path)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((code) => [code, `${SITE_URL}${localizedPath(code, path)}`])),
      },
    })));

  return [...staticEntries, ...serviceEntries, ...localizedEntries];
}
