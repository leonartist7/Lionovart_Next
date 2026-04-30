import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VisualEditorProvider } from "@/lib/visual-editor-context";
import { VisualEditorOverlay } from "@/components/VisualEditorOverlay";
import { VisualEditorHotkey } from "@/components/VisualEditorHotkey";
import { VisualEditorShell } from "@/components/visual-editor/VisualEditorShell";
import { SanityLive } from '@/sanity/lib/live'
import { VisualEditing } from 'next-sanity/visual-editing'
import { draftMode } from 'next/headers'

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
    <html lang="en" className={`${clashDisplay.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="https://imgur.com/8czAkK3.png" />
        <link rel="preload" as="image" href="https://imgur.com/L6zJMEm.png" />
        <link rel="preload" as="image" href="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451/Lion_emblem2PGbCnR_-_Imgur_t6jkfg.avif" />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <VisualEditorProvider>
            <VisualEditorHotkey />
            <VisualEditorOverlay />
            <div data-visual-editor="true">
              <VisualEditorShell />
            </div>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
            <SanityLive />
            {(await draftMode()).isEnabled && <VisualEditing />}
          </VisualEditorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
