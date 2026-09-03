import type { Metadata } from "next";
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
  AiReframe,
  AiSystemProof,
  AiSystems,
  AiProcess,
  AiObjections,
  AiOffers,
} from "@/components/sections/services/ai/AiActs";

export const metadata: Metadata = {
  title: "AI Systems, Built In-House",
  description:
    "Talk to the AI we built, then decide if we should build yours. Custom AI front desk, follow-up, back office and reporting systems — designed, built and maintained in-house in Calgary, in five languages.",
};

/**
 * /services/ai — Tier 2, on the shared 7-act spine.
 *
 * Structure: one particle world runs continuously behind the entire page. The
 * crown opens into an immersive field, reconnects as an ecosystem, becomes an
 * energy flow and platform hub, then reforms above the CTA. The swarm, trails,
 * dust, and plexus are all coordinated inside the same renderer.
 *
 * Typeface: Clash Display, same as the rest of the site. An earlier build
 * forked this route to Space Grotesk; AI_SYSTEMS_PAGE_SPEC section 1.2 asks
 * for the opposite ("do not introduce a mono or techy typeface") because the
 * type staying identical is what proves this is the same studio.
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
        className="relative z-10 min-h-screen bg-transparent"
        style={
          {
            // The page's argument is "craft amplified, not automated", so the
            // colour carries it: warm is the human hand, one cold accent is the
            // machine. Gold is the dominant accent — eyebrows, numerals, list
            // marks. Cyan appears ONLY on elements that depict the system
            // itself (the OS rail, the tab indicator, node dots). Brand red
            // stays reserved for action.
            "--ai-gold": "#f0c917",
            "--ai-cyan": "#63cfe6",
            "--ai-ember": "#8a6a1f",
          } as React.CSSProperties
        }
      >
        <Navbar lightweightMenu />
        <AiScrollSnap />
        <AiPageNav />

        <AiHeroCopy />
        <AiChaosBeat />

        <div className="relative">
          <AiReframe />
          <AiSystemProof />
          <AiSystems />
          <AiRoi />
          <AiProcess />
          <AiObjections />
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
