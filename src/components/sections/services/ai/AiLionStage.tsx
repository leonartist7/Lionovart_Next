"use client";

/**
 * The single crown-to-system particle canvas for /services/ai.
 *
 * Always on: a continuous 3D world running behind every section, not a
 * hero/CTA bookend. It never hides and the render loop never stops (except
 * when the OS tab itself is backgrounded — see the engine's own
 * visibilitychange handler), so the glass panels down the page are always
 * refracting real motion, not a static field.
 *
 * Renders as a SIBLING of <main>, not a child: as a child it sits inside main's
 * stacking context, where an opaque background on any ancestor can bury it.
 *
 * `three` is code-split and only fetched after mount, so the page copy and
 * accessible fallbacks still prerender.
 */

import { useEffect, useRef } from "react";
import type { LionExperience } from "@/lib/lion/LionExperience";
import { setLionStage } from "@/lib/lion/stage-ref";

export default function AiLionStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let exp: LionExperience | null = null;
    let cancelled = false;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = motionQuery.matches;

    void (async () => {
      const { LionExperience: Engine } = await import("@/lib/lion/LionExperience");
      if (cancelled) return;

      const instance = new Engine(
        canvas,
        reduce ? { maxParticles: 77, animate: false } : {},
      );
      exp = instance;
      try {
        await instance.init();
      } catch (error) {
        if (!cancelled) console.error("Unable to initialize the AI particle world", error);
        instance.dispose();
        return;
      }
      if (cancelled) return;

      setLionStage(instance);
      // The opening crown is an asymmetric editorial split. setLayout handles
      // the gentler mobile offset internally for coarse-pointer devices.
      instance.setLayout(0.42);

      if (reduce) {
        // A single composed frame instead of an animation. The engine redraws
        // this state after resize without ever joining the ticker.
        instance.skipIntro();
        instance.renderOnce();
        return;
      }
      instance.playIntro();
    })();

    return () => {
      cancelled = true;
      setLionStage(null);
      exp?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // WebGL canvases already receive their own compositor surface. An extra
      // will-change layer duplicates memory pressure on mobile GPUs.
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
