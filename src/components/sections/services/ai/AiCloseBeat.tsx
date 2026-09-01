"use client";

/**
 * ACT 7 driver — the peak-end beat.
 *
 * SERVICE_PAGES_SPEC section 0.3: the page's biggest motion moment belongs at
 * the decision, not the hero. The same energy current that runs through the
 * middle reforms into the crown above the CTA. The last thing on screen is the
 * mark that opened the page.
 *
 * Renders nothing. It owns the closing range after the offer chapter releases
 * the particle stage, then eases the same population into one stable crown.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLionStage } from "@/lib/lion/stage-ref";

gsap.registerPlugin(ScrollTrigger);

export default function AiCloseBeat({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;

    const positionCrest = () => {
      const exp = getLionStage();
      if (!exp) return;
      // A stable screen-space target prevents the crown from chasing a CTA
      // that is itself moving during scroll. It sits above the decision panel
      // on phones and desktops without a layout read in the hot path.
      exp.setCrestScreenPos(0, window.innerWidth < 768 ? -0.34 : -0.42);
    };

    const prepareClose = () => {
      const exp = getLionStage();
      if (!exp) return;
      exp.setMorph(1);
      exp.setLayout(0);
      positionCrest();
    };

    const st = ScrollTrigger.create({
      trigger: wrap,
      // AiOffers releases at `bottom 92%`, so there is exactly one owner of
      // layout state at any scroll position.
      start: "top 92%",
      end: "bottom bottom",
      scrub: true,
      onEnter: prepareClose,
      onEnterBack: prepareClose,
      onRefresh: positionCrest,
      onLeaveBack: () => getLionStage()?.setBloom(0),
      onUpdate: (self) => {
        const exp = getLionStage();
        if (!exp) return;
        // The engine eases this target independently of scroll event cadence.
        exp.setBloom(Math.min(self.progress / 0.6, 1));
      },
    });

    // This trigger's start/end depend on the cumulative rendered height of
    // everything above it (the hero + the complete service story). page.tsx loads
    // Space Grotesk with display:'swap' — if the font swaps in after GSAP has
    // already cached this trigger's pixel range, every heading upstream can
    // reflow, and the range goes stale until something else refreshes it.
    // Refresh after the font settles, scoped to the one trigger at risk here.
    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };
    document.fonts?.ready?.then(() => requestAnimationFrame(refresh));
    window.addEventListener("load", refresh, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
      st.kill();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      data-ai-snap
      data-lion-zone
    >
      {children}
    </div>
  );
}
