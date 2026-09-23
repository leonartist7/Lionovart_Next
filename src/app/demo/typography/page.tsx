import type { Metadata } from "next";
import { playfairDisplay } from "@/lib/fonts";
import TypographyShowcase from "./TypographyShowcase";

export const metadata: Metadata = {
  title: "Clash × Playfair — LIONOVART typography study",
  description: "Three typographic directions and a practical identity system for LIONOVART.",
  robots: { index: false, follow: false },
};

export default function TypographyPage() {
  return <div className={playfairDisplay.variable}><TypographyShowcase /></div>;
}
