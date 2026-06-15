import type { Metadata } from "next";
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
  title: {
    default: "lionovart.com",
    template: "%s | LIONOVART"
  },
  description:
    "We build premium brands, websites, and digital experiences that elevate your business.",
  icons: {
    icon: "/images/favicon.svg",
  },
  openGraph: {
    title: "LIONOVART",
    description: "Premium Creative Agency",
    url: "https://lionovart.com",
    siteName: "lionovart.com",
    type: "website",
  },
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
