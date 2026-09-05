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
import { getConductor } from "@/lib/lion/conductor";

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

    // The closing beat's morph/layout/bloom curve is the `close` entry in the
    // ledger. This section only owns the crest's screen-space anchor, which is
    // a viewport measurement rather than a story value.
    const conductor = getConductor();
    conductor.setCrestHandler(positionCrest);
    positionCrest();

    // Chapter ranges are measured from the cumulative rendered height of
    // everything above them. page.tsx loads its display face with
    // display:'swap', so a late font swap reflows every heading upstream and
    // leaves those measurements stale. Refresh once the font settles; the
    // conductor re-measures on the same refresh.
    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };
    document.fonts?.ready?.then(() => requestAnimationFrame(refresh));
    window.addEventListener("load", refresh, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
      conductor.setCrestHandler(null);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      data-ai-chapter="close"
      data-ai-snap
      data-lion-zone
    >
      {children}
    </div>
  );
}
