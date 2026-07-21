import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";
import "./globals.css";
// Required Lenis stylesheet — sets html/body height:auto, neutralizes native
// scroll-behavior, disables iframe pointer capture during smooth scroll, and
// handles [data-lenis-prevent] overscroll. Missing this causes the browser's
// native scroll to fight Lenis every frame (a primary scroll-lag source).
import "lenis/dist/lenis.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PostHogInit } from "@/components/PostHogInit";
import { NovaPortalMount } from "@/components/ai-strategist/NovaPortalMount";
import { StickyCTA } from "@/components/ai-strategist/StickyCTA";
// BackgroundTexture removed by request — kept on disk for later if needed.
// import BackgroundTexture from "@/components/ui/BackgroundTexture";
import CustomCursor from "@/components/ui/CustomCursor";
import BottomBlur from "@/components/ui/BottomBlur";
import SplashScreen from "@/components/ui/SplashScreen";
import PerfHud from "@/components/dev/PerfHud";
import { SITE, SITE_URL, OG_IMAGE } from "@/lib/seo/config";
import { JsonLd } from "@/lib/seo/JsonLd";
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
} from "@/lib/seo/schema";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const clashDisplay = localFont({
  src: [
    { path: "../fonts/ClashDisplay-200.woff2", weight: "200", style: "normal" },
    { path: "../fonts/ClashDisplay-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/ClashDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // v1 SEO default — refine wording during the copywriting pass.
    default: "LIONOVART — Calgary Creative Agency | Brand, Web & AI Systems",
    template: "%s | LIONOVART",
  },
  description: SITE.description,
  keywords: [
    "creative agency Calgary",
    "brand identity Calgary",
    "web design Calgary",
    "logo design Calgary",
    "video production Calgary",
    "social media management Calgary",
    "AI automation agency",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/favicon.svg",
  },
  openGraph: {
    title: "LIONOVART — Creative & Digital Agency in Calgary",
    description: SITE.description,
    url: SITE_URL,
    siteName: SITE.name,
    locale: "en_CA",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "LIONOVART" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIONOVART — Creative & Digital Agency in Calgary",
    description: SITE.description,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${dmSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="https://imgur.com/8czAkK3.png" />
        <link rel="preload" as="image" href="https://imgur.com/L6zJMEm.png" />
        <link rel="preload" as="image" href="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451/Lion_emblem2PGbCnR_-_Imgur_t6jkfg.avif" />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Site-wide entity graph — Organization, ProfessionalService, WebSite.
            Powers Google rich results + AEO citations (ChatGPT/Gemini/Perplexity). */}
        <JsonLd data={[organizationSchema(), localBusinessSchema(), websiteSchema()]} />
        <PostHogInit />
        {/* <BackgroundTexture /> removed by request */}
        <LanguageProvider>
          <SmoothScrollProvider>
            {/* First-load only; useLenis hook needs to live inside the provider */}
            <SplashScreen />
            {children}
          </SmoothScrollProvider>
          <NovaPortalMount />
          <StickyCTA />
          {/* Premium cursor — fixed, z:9999, hidden on touch + reduced-motion friendly */}
          <CustomCursor />
          {/* Frosted bottom edge — z:60, auto-hides over the footer marquee */}
          <BottomBlur />
        </LanguageProvider>
        {/* Dev-only perf HUD — dead-code-eliminated in production */}
        <PerfHud />
      </body>
    </html>
  );
}
