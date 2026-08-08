import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">
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
