import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import AiLionStage from "@/components/sections/services/ai/AiLionStage";
import AiHeroCopy from "@/components/sections/services/ai/AiHeroCopy";
import AiChaosBeat from "@/components/sections/services/ai/AiChaosBeat";
import AiCloseBeat from "@/components/sections/services/ai/AiCloseBeat";
import AiScrollSnap from "@/components/sections/services/ai/AiScrollSnap";
import AiPageNav from "@/components/sections/services/ai/AiPageNav";
import AiRoi from "@/components/sections/services/ai/AiRoi";
import AiDecision from "@/components/sections/services/ai/AiDecision";
import {
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
    "Regent is a complete operating system for your business. It answers the phone, follows up, schedules, invoices and reports, and you run it by talking to it. Starts with a systems audit.",
};

/**
 * /services/ai — Tier 2, on the shared 7-act spine.
 *
 * Structure: one particle world runs continuously behind the entire page. The
 * crown opens into an immersive field, reconnects as an ecosystem, becomes an
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
        // The fixed stage owns the black base. Most chapters stay transparent
        // so the particles remain continuous, while intentional opaque relief
        // sections (the ROI chapter) can still establish a light reading beat.
        className={`${display.variable} relative z-10 min-h-screen bg-transparent`}
        style={
          {
            // The page moves from electric intelligence back into the brand's
            // gold crown. These accents stay scoped to this route; the primary
            // CTA still carries the site-wide brand red.
            "--ai-blue": "#6366f1",
            "--ai-cyan": "#54e5ff",
            "--ai-deep": "#8b5cf6",
          } as React.CSSProperties
        }
      >
        <Navbar lightweightMenu />
        <AiScrollSnap />
        <AiPageNav />

        <AiHeroCopy />
        <AiChaosBeat />

        <div className="relative">
          <AiSystems />
          <AiFlow />
          <AiProcess />
          <AiRoi />
          <AiOffers />
        </div>

        {/* The same particles reform into the crown above the decision. */}
        <AiCloseBeat>
          <AiDecision />
        </AiCloseBeat>

        <Footer />
      </main>
    </>
  );
}
