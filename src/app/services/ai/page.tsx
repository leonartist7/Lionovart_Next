import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import ProofAndClose from "@/components/sections/services/_shared/ProofAndClose";
import AiLionStage from "@/components/sections/services/ai/AiLionStage";
import AiHeroCopy from "@/components/sections/services/ai/AiHeroCopy";
import AiChaosBeat from "@/components/sections/services/ai/AiChaosBeat";
import AiCloseBeat from "@/components/sections/services/ai/AiCloseBeat";
import {
  AiStakes,
  AiSystems,
  AiFlow,
  AiProcess,
  AiOffers,
} from "@/components/sections/services/ai/AiActs";

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
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ai-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Systems & Consulting",
  description:
    "Custom AI operating systems that answer customers, convert leads, automate operations, and reveal where your business can grow.",
};

/**
 * /services/ai — Tier 2, on the shared 7-act spine.
 *
 * Structure: one particle world runs continuously behind the entire page. The
 * lion opens into an immersive field, reconnects as an ecosystem, becomes an
 * energy flow and platform hub, then reforms above the CTA. The swarm, trails,
 * dust, and plexus are all coordinated inside the same renderer.
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

        {/* Open editorial chapters: typography and the shared particle world
            provide hierarchy, rather than a stack of separate glass cards. */}
        <div className="relative">
          <AiStakes />
          <AiSystems />
          <AiFlow />
          <AiProcess />
          <AiOffers />
        </div>

        {/* Acts 6 and 7. The wrapper reforms the lion onto the CTA. */}
        <AiCloseBeat>
          <ProofAndClose
            quote="Built to return at least five verified team hours every week—and keep improving from there."
            attribution="The Lionovart 5-Hour-Back Guarantee"
            closingLine="Build a business that"
            closingAccent="runs smarter."
          />
        </AiCloseBeat>

        <Footer />
      </main>
    </>
  );
}
