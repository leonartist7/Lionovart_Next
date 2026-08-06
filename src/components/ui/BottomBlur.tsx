"use client";

/**
 * BottomBlur â€” premium frosted bottom edge.
 * ----------------------------------------
 * Fixed overlay pinned to the viewport bottom. A single masked
 * backdrop-filter layer: the blur radius is constant and the mask gradient
 * fades it up the strip, so the frost reads strongest at the bottom edge and
 * clears going up into the page. (Was a 3-layer radius ramp; collapsed to one
 * pass per scroll frame.) Promoted to its own compositor layer
 * (`contain: paint` + translateZ) so Lenis scroll re-uses the cached blur
 * instead of re-rasterizing every frame.
 *
 * - z-[60]: above page content, below StickyCTA (z-9990) + cursor (z-9999),
 *   so it never blurs the floating CTA/cursor. pointer-events-none.
 * - Mobile drops the blur radius (CSS @media); the perf kill-switch
 *   `body.no-bdblur *` zeroes it for free.
 * - Auto-hides when the homepage curtain footer is revealed at page end, keeping
 *   the wordmark crisp.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function BottomBlur() {
  const inverse = usePathname() === "/inverse";
  const [hidden, setHidden] = useState(false);

  // The homepage curtain footer is `sticky bottom-0`, so it geometrically sits at the
  // viewport bottom from first paint â€” an IntersectionObserver would report it
  // visible immediately. Hide the blur once the page is scrolled
  // to within the footer's height of the document bottom (i.e. it's actually
  // being revealed from under <main>).
  useEffect(() => {
    const footer =
      document.getElementById("footer-curtain") ??
      document.getElementById("footer-marquee");
    const onScroll = () => {
      const reveal = footer?.offsetHeight ?? 160;
      const dist = inverse
        ? window.scrollY
        : document.documentElement.scrollHeight -
          (window.scrollY + window.innerHeight);
      setHidden(dist <= reveal);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [inverse]);

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
