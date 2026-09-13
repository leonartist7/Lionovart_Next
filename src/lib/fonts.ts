import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";

/**
 * Shared across both root layouts — `(site)` and `(app)` — so the marketing
 * site and the portal resolve the same font files and CSS variables.
 */

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// 300 is registered because /services/ai's body copy uses font-light: without
// this weight in the font-face set, font-light silently rendered at whatever
// the browser substituted rather than Clash's actual Light. Skip 200, still
// unused anywhere.
export const clashDisplay = localFont({
  src: [
    { path: "../fonts/ClashDisplay-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/ClashDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash-display",
  display: "swap",
});

/** Convenience for `<html className={...}>`. */
export const fontVariables = `${clashDisplay.variable} ${dmSans.variable}`;
