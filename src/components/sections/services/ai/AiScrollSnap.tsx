"use client";

/**
 * Page-scoped, proximity-only snapping for the AI story.
 *
 * Lenis remains the single scroll controller. This helper only completes a
 * transition when a wheel gesture ends close to an authored reading beat; it
 * never locks the page or replaces native touch movement. Reduced-motion users
 * keep ordinary document scrolling.
 */

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import LenisSnap from "lenis/snap";

export default function AiScrollSnap() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const points = Array.from(
      document.querySelectorAll<HTMLElement>("[data-ai-snap]"),
    );
    if (!points.length) return;

    const snap = new LenisSnap(lenis, {
      type: "proximity",
      distanceThreshold: "18%",
      debounce: 180,
      duration: 0.72,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
    snap.addElements(points, { align: "start", ignoreSticky: true });

    return () => snap.destroy();
  }, [lenis]);

  return null;
}
