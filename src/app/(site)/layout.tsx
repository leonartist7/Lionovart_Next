import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "../globals.css";
// Required Lenis stylesheet — missing this causes native scroll to fight Lenis every frame.
import "lenis/dist/lenis.css";
import { clashDisplay, dmSans, playfairDisplay } from "@/lib/fonts";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PostHogInit } from "@/components/PostHogInit";
import { NovaPortalMount } from "@/components/ai-strategist/NovaPortalMount";
import CustomCursor from "@/components/ui/CustomCursor";
import TubesCursor from "@/components/ui/TubesCursor";
import BottomBlur from "@/components/ui/BottomBlur";
import { IntroProvider } from "@/components/ui/IntroLifecycle";
import SplashScreen from "@/components/ui/SplashScreen";
import SiteTitleReveal from "@/components/ui/SiteTitleReveal";
import { SITE, SITE_URL, OG_IMAGE, SITE_KEYWORDS } from "@/lib/seo/config";
import { JsonLd } from "@/lib/seo/JsonLd";
import { isLocale, localeDetails } from "@/i18n/routing";
import {
  organizationSchema,
  websiteSchema,
} from "@/lib/seo/schema";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.title,
    template: "%s | LIONOVART",
  },
  description: SITE.description,
  keywords: [...SITE_KEYWORDS],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/favicon.svg",
  },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE_URL,
    siteName: SITE.name,
    locale: "en_CA",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "LIONOVART" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
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
  const [requestedLocale, messages] = await Promise.all([getLocale(), getMessages()]);
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";

  // Starts the exact SVG request in the document head, before the body streams.
  preload("/images/LOGO.svg", { as: "image", fetchPriority: "high" });

  return (
    <html lang={localeDetails[locale].htmlLang} className={`${clashDisplay.variable} ${dmSans.variable} ${playfairDisplay.variable} h-full antialiased`} style={{ backgroundColor: "#000" }} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#000" }}>
        {/* Site-wide entity graph — Organization and WebSite.
            Powers Google rich results + AEO citations (ChatGPT/Gemini/Perplexity). */}
        <JsonLd data={[organizationSchema(), websiteSchema(locale)]} />
        <PostHogInit />
        <NextIntlClientProvider locale={locale} messages={messages}>
        <LanguageProvider>
          <IntroProvider>
          <SmoothScrollProvider>
            <SplashScreen />
            <SiteTitleReveal />
            {children}
          </SmoothScrollProvider>
          <NovaPortalMount />
          <TubesCursor />
          <CustomCursor />
          <BottomBlur />
        </IntroProvider>
        </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
