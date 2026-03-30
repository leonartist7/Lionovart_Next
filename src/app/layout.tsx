import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

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
  title: "LIONOVART — Premium Creative Agency",
  description:
    "We build premium brands, websites, and digital experiences that elevate your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${clashDisplay.variable} h-full antialiased`}>
      <head>
        <link rel="preload" as="image" href="https://imgur.com/8czAkK3.png" />
        <link rel="preload" as="image" href="https://imgur.com/L6zJMEm.png" />
        <link rel="preload" as="image" href="https://i.imgur.com/2PGbCnR.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
