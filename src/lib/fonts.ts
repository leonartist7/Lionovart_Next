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

// Only weights used in UI (medium/semibold/bold/black→700). Skip 200/300 to cut font bytes.
export const clashDisplay = localFont({
  src: [
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
