"use client";

/**
 * The lion canvas for /services/ai.
 *
 * Always on: a continuous 3D world running behind every section, not a
 * hero/CTA bookend. It never hides and the render loop never stops (except
 * when the OS tab itself is backgrounded — see LionExperience's own
 * visibilitychange handler), so the glass panels down the page are always
 * refracting real motion, not a static field.
 *
 * Renders as a SIBLING of <main>, not a child: as a child it sits inside main's
 * stacking context, where an opaque background on any ancestor can bury it.
 *
 * `three` is code-split and only fetched after mount, so the page's copy and
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

      const instance = new Engine(canvas, reduce ? { maxParticles: 1_600 } : {});
      exp = instance;
      await instance.init();
      if (cancelled) return;

      setLionStage(instance);
      // The opening frame is an asymmetric editorial split. setLayout handles
      // the gentler mobile offset internally for coarse-pointer devices.
      instance.setLayout(0.42);

      if (reduce) {
        // A single composed frame instead of an animation. It must be redrawn
        // whenever the drawing buffer is resized, or the canvas goes black and
        // stays black for the rest of the session. renderOnce() draws without
        // ever joining the ticker, so there's nothing to start/stop here.
        instance.skipIntro();
        const paint = () => instance.renderOnce();
        paint();
        window.addEventListener("resize", paint);
        instance.onDispose(() => window.removeEventListener("resize", paint));
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
      // will-change forces its own persistent GPU compositing layer. Without
      // it, the ~5 stacked backdrop-filter glass panels down the page (heaviest
      // at Offers, the last and most blur-dense section) can make Chrome drop
      // or defer repainting this fixed layer under compositing pressure while
      // scrolling down into them — self-corrects once everything's cached
      // scrolling back up, which matches the reported scroll-direction bug.
      className="pointer-events-none fixed inset-0 z-0 h-full w-full will-change-transform"
    />
  );
}
