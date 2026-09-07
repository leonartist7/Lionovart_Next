"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { PaneCardEngine } from "./PaneCardEngine";
import type { PillarId } from "../pillars/config/pillars";
import { useQualityTier } from "../pillars/useQualityTier";
import { useReducedMotion } from "../pillars/useReducedMotion";

/**
 * PaneCardView — one live v2 pillar card filling its parent box inside a
 * SplitShowcase pane. Reveal is driven by the pane's scroll-scrubbed flip
 * progress, so scrolling back darkens the glass continuously. Renders
 * nothing on failure — the DOM glass layers underneath remain.
 */
export default function PaneCardView({
  pillar,
  reveal,
}: {
  pillar: PillarId;
  reveal: MotionValue<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tier = useQualityTier();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let engine: PaneCardEngine | null = null;
    let cancelled = false;
    const cleanupRef = { current: () => {} };

    engine = new PaneCardEngine({ canvas, pillar, tier, reducedMotion });
    void engine.init().then((ok) => {
      if (cancelled || !ok || !engine) {
        engine?.dispose();
        return;
      }
      engine.setReveal(reveal.get());
      const active = engine;
      const unsub = reveal.on("change", (v) => active.setReveal(v));
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const rect = canvas.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;
        active.setSweep(((e.clientX - rect.left) / rect.width) * 2 - 1);
      };
      if (!reducedMotion) window.addEventListener("pointermove", onMove, { passive: true });
      cleanupRef.current = () => {
        unsub?.();
        window.removeEventListener("pointermove", onMove);
      };
    });

    return () => {
      cancelled = true;
      cleanupRef.current();
      engine?.dispose();
    };
  }, [pillar, tier, reducedMotion, reveal]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
