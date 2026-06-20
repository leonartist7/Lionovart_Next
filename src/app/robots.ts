import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Internal/utility routes that should never appear in search.
        disallow: ["/api/", "/red-demo", "/ink-preview", "/hero-fx-preview"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
