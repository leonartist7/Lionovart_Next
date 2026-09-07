"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { SingleCardEngine } from "./SingleCardEngine";
import type { PillarId } from "./config/pillars";
import { useQualityTier } from "./useQualityTier";
import { useReducedMotion } from "./useReducedMotion";

/**
 * PillarCardView — one live 3D pillar card filling its parent box.
 * Reveal is driven by an external scroll-scrubbed MotionValue (the pane's
 * flip progress), so scrolling back reverses the card lighting continuously.
 * Renders nothing on WebGL failure — the DOM glass layers underneath remain.
 */
export default function PillarCardView({
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
    let engine: SingleCardEngine | null = null;
    try {
      engine = new SingleCardEngine({ canvas, pillar, tier, reducedMotion });
      if (!engine.init()) return;
      engine.setReveal(reveal.get());
    } catch {
      return;
    }
    const active = engine;
    const unsub = reveal.on("change", (v) => active.setReveal(v));
    // Reflection sweep: cursor position (relative to this pane) orbits the
    // sweep light, so highlights travel across the bevel. Passive listener,
    // values only — the engine damps them. Off for reduced motion.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      active.setSweep(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ((e.clientY - rect.top) / rect.height) * 2 - 1,
      );
    };
    if (!reducedMotion) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      unsub?.();
      window.removeEventListener("pointermove", onMove);
      active.dispose();
    };
  }, [pillar, tier, reducedMotion, reveal]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
