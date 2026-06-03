"use client";

/**
 * BottomBlur — premium frosted bottom edge.
 * ----------------------------------------
 * Fixed overlay pinned to the viewport bottom. Blur is strongest at the
 * very bottom and fades to fully transparent going up into the page via a
 * single masked backdrop-filter layer (the mask gradient makes the frosting
 * read as "strongest at the bottom"). Promoted to its own compositor layer
 * (`contain: paint` + translateZ) so Lenis scroll doesn't force a fresh
 * rasterization of three stacked blur passes every frame.
 *
 * - z-[60]: above page content, below StickyCTA (z-9990) + cursor (z-9999),
 *   so it never blurs the floating CTA/cursor. pointer-events-none.
 * - Mobile collapses to a single light layer (CSS @media); the perf
 *   kill-switch `body.no-bdblur *` zeroes it for free.
 * - Auto-hides when the red footer marquee is revealed at page end, keeping
 *   the wordmark crisp.
 */

import { useEffect, useState } from "react";

export default function BottomBlur() {
  const [hidden, setHidden] = useState(false);

  // The footer marquee is `sticky bottom-0`, so it geometrically sits at the
  // viewport bottom from first paint — an IntersectionObserver would report it
  // visible immediately. Instead, hide the blur only once the page is scrolled
  // to within the footer's height of the document bottom (i.e. it's actually
  // being revealed from under <main>).
  useEffect(() => {
    const footer = document.getElementById("footer-marquee");
    const onScroll = () => {
      const reveal = footer?.offsetHeight ?? 160;
      const dist =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight);
      setHidden(dist <= reveal * 0.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="bottom-blur pointer-events-none fixed inset-x-0 bottom-0 z-[60]"
      style={{ opacity: hidden ? 0 : 1 }}
      aria-hidden
    >
      <div className="bottom-blur__layer" />
    </div>
  );
}
