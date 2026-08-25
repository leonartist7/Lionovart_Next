"use client";

/**
 * ACT 7 driver — the peak-end beat.
 *
 * SERVICE_PAGES_SPEC section 0.3: the page's biggest motion moment belongs at
 * the decision, not the hero. The same energy current that runs through the
 * middle reforms into the crown above the CTA. The last thing on screen is the
 * mark that opened the page.
 *
 * Renders nothing. It wraps ProofAndClose and drives the engine from that
 * section's own scroll position. The CTA node is resolved once; its changing
 * viewport position is measured while the convergence is active.
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
    const btn = wrap.querySelector<HTMLElement>("[data-cta-target]");

    const aimAtCta = () => {
      const exp = getLionStage();
      // The explicit marker keeps the convergence tied to the primary action.
      if (!exp || !btn) return;
      const r = btn.getBoundingClientRect();
      exp.setCtaScreenPos(
        ((r.left + r.width / 2) / window.innerWidth) * 2 - 1,
        ((r.top + r.height / 2) / window.innerHeight) * 2 - 1,
      );
    };

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const exp = getLionStage();
        if (!exp) return;
        // Re-measure every tick, not just on enter/enterBack: "top bottom"
        // fires the instant this section's top crosses the viewport's
        // bottom edge, when the CTA button (further down inside this same
        // section) is still far below the fold. A one-shot rect at that
        // moment aims the convergence at a point way under the visible
        // frustum, which reads as the crown sinking off the bottom of the
        // screen instead of reforming on the button.
        aimAtCta();
        exp.setLayout(0);
        // converge over the first half, then hold the reformed crest
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
