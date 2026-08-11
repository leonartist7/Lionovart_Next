import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import ProofAndClose from "@/components/sections/services/_shared/ProofAndClose";
import AiLionStage from "@/components/sections/services/ai/AiLionStage";
import AiHeroCopy from "@/components/sections/services/ai/AiHeroCopy";
import AiChaosBeat from "@/components/sections/services/ai/AiChaosBeat";
import AiCloseBeat from "@/components/sections/services/ai/AiCloseBeat";
import { GlassAmbience } from "@/components/sections/services/ai/LiquidGlass";
import { AiStakes, AiFlow, AiProcess, AiOffers } from "@/components/sections/services/ai/AiActs";

/**
 * This page runs its own display face, not the site-wide Clash Display.
 * SERVICE_PAGES_SPEC section 6.3 asks for one typeface across the site; that is
 * deliberately overridden here so the AI page reads as machine-built. Scoped to
 * this route by CSS variable, so nothing else on the site is affected.
 *
 * To swap it: change the import and the `display` name. Orbitron and Chakra
 * Petch are the more overtly sci-fi options; Space Grotesk stays premium.
 */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ai-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Systems & AI",
  description:
    "Voice agents, automation, and workflows that answer, qualify, and book while you sleep. Your business, always on.",
};

/**
 * /services/ai — Tier 2, on the shared 7-act spine.
 *
 * Structure: the particle world runs continuously behind the ENTIRE page, not
 * just the hero. Acts 2 through 6 sit on liquid glass with no opaque backing,
 * so the panels are refracting real motion the whole way down. The lion
 * collapses into an orbiting disk at the end of the hero and stays that shape
 * as the ambient backdrop until it reforms over the CTA in Act 7.
 */
export default function AiServicePage() {
  return (
    <>
      {/*
        Sibling of <main>, not a child: inside main's stacking context an
        opaque ancestor background can bury the canvas.
      */}
      <AiLionStage />

      <main
        // The shared kit (ProofAndClose, imported below) hardcodes `bg-bg-dark`
        // on its <section> wrappers. Forcing every descendant <section>
        // transparent is what lets the particle canvas show through the whole
        // page, scoped to this route. Breaks silently if a future shared
        // component needs an opaque <section>.
        className={`${display.variable} relative z-10 min-h-screen bg-transparent [&_section]:bg-transparent`}
        style={
          {
            // page-scoped red scale, read by the act components. Reuses the
            // site's brand-red tokens (globals.css) rather than a new hex —
            // deliberately breaks SERVICE_PAGES_SPEC section 6.1's "red is
            // rationed to the next action" rule for this page, per explicit
            // request: gold particles + red chrome, not the site-wide gold/red
            // ration. Don't "fix" this back without checking with the user.
            "--ai-blue": "var(--color-brand-red)",
            "--ai-cyan": "var(--color-brand-red)",
            "--ai-deep": "var(--color-brand-red-secondary)",
          } as React.CSSProperties
        }
      >
        <Navbar />

        <AiHeroCopy />
        <AiChaosBeat />

        {/*
          The glass band, transparent so the particle world behind it stays
          visible and the panels refract real motion instead of a static field.
        */}
        <div className="relative">
          <GlassAmbience />
          <div className="relative">
            <AiStakes />
            <AiFlow />
            <AiProcess />
            <AiOffers />
          </div>
        </div>

        {/* Acts 6 and 7. The wrapper reforms the lion onto the CTA. */}
        <AiCloseBeat>
          <ProofAndClose
            quote="[ A client says, in one line, that the agent booked calls they would have missed. ]"
            closingLine="Let's make yours"
            closingAccent="answer."
          />
        </AiCloseBeat>

        <Footer />
      </main>
    </>
  );
}
