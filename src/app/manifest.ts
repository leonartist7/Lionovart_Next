import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LIONOVART — Creative & Digital Agency",
    short_name: "LIONOVART",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: SITE.themeColor,
    theme_color: SITE.themeColor,
    icons: [
      { src: "/images/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
