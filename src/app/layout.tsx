import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";
import "./globals.css";
// Required Lenis stylesheet — missing this causes native scroll to fight Lenis every frame.
import "lenis/dist/lenis.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PostHogInit } from "@/components/PostHogInit";
import { NovaPortalMount } from "@/components/ai-strategist/NovaPortalMount";
import { StickyCTA } from "@/components/ai-strategist/StickyCTA";
import CustomCursor from "@/components/ui/CustomCursor";
import TubesCursor from "@/components/ui/TubesCursor";
import BottomBlur from "@/components/ui/BottomBlur";
import SplashScreen from "@/components/ui/SplashScreen";
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

// Only weights used in UI (medium/semibold/bold/black→700). Skip 200/300 to cut font bytes.
const clashDisplay = localFont({
  src: [
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
      <body className="min-h-full flex flex-col">
        {/* Site-wide entity graph — Organization, ProfessionalService, WebSite.
            Powers Google rich results + AEO citations (ChatGPT/Gemini/Perplexity). */}
        <JsonLd data={[organizationSchema(), localBusinessSchema(), websiteSchema()]} />
        <PostHogInit />
        <LanguageProvider>
          <SmoothScrollProvider>
            <SplashScreen />
            {children}
          </SmoothScrollProvider>
          <NovaPortalMount />
          <StickyCTA />
          <TubesCursor />
          <CustomCursor />
          <BottomBlur />
        </LanguageProvider>
      </body>
    </html>
  );
}
