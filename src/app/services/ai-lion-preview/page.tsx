"use client";

import { useCallback, useRef, useState } from "react";
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
import LionArrivalOverlay from "@/components/sections/services/ai-lion-preview/LionArrivalOverlay";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ai-display",
  display: "swap",
});

/**
 * Preview-only route. Not linked from navigation, not part of the shipped
 * page. Every section below is the real, unmodified component from
 * /services/ai — AiLionStage's crown/particle-rooms engine runs exactly as
 * shipped the entire time. The only addition is LionArrivalOverlay, a
 * foreground layer that plays the lion for the hero+bridge range and then
 * fades away, handing off to the crown that was already running underneath.
 *
 * `noindex` metadata lives in layout.tsx alongside this file — this page is
 * a Client Component (it needs useRef for the scroll range), and metadata
 * exports only work from Server Components.
 */
// Mount the crown once scroll is well ahead of the overlay's fade-out
// (which starts at 0.72) so its 2.6s intro animation has time to finish
// before the overlay reveals it, rather than completing invisibly under
// an opaque canvas or appearing already fully-formed.
const CROWN_MOUNT_THRESHOLD = 0.45;

export default function AiLionPreviewPage() {
  const arrivalRangeRef = useRef<HTMLDivElement>(null);
  const [showCrown, setShowCrown] = useState(false);

  const handleProgress = useCallback((progress: number) => {
    if (progress >= CROWN_MOUNT_THRESHOLD) {
      setShowCrown(true);
    }
  }, []);

  return (
    <>
      {showCrown && <AiLionStage />}
      <LionArrivalOverlay rangeRef={arrivalRangeRef} onProgress={handleProgress} />

      <main
        className={`${display.variable} relative z-10 min-h-screen bg-transparent`}
        style={
          {
            "--ai-blue": "#6366f1",
            "--ai-cyan": "#54e5ff",
            "--ai-deep": "#8b5cf6",
          } as React.CSSProperties
        }
      >
        <Navbar lightweightMenu />
        <AiScrollSnap />
        <AiPageNav />

        <div ref={arrivalRangeRef}>
          <AiHeroCopy />
          <AiChaosBeat />
        </div>

        <div className="relative">
          <AiSystems />
          <AiFlow />
          <AiProcess />
          <AiRoi />
          <AiOffers />
        </div>

        <AiCloseBeat>
          <AiDecision />
        </AiCloseBeat>

        <Footer />
      </main>
    </>
  );
}
