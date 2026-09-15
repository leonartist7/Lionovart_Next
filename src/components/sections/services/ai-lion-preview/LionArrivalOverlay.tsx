"use client";

import { useEffect, useRef, type RefObject } from "react";
import { LionCenterpiece } from "@/lib/lion/LionCenterpiece";

interface LionArrivalOverlayProps {
  /** The hero+bridge wrapper whose scroll range drives the lion and its fade-out. */
  rangeRef: RefObject<HTMLDivElement | null>;
  /** Fires on every scroll tick with the same 0-1 progress driving the overlay. */
  onProgress?: (progress: number) => void;
}

/**
 * A foreground layer over the real (untouched) AiLionStage crown canvas.
 * Plays the lion arrival for the hero+bridge range, then fades to reveal the
 * shipped crown/particle-rooms system underneath exactly where Systems
 * begins — a handoff, not a replacement. The crown keeps rendering the
 * entire time; this is purely an overlay on top of it.
 */
export default function LionArrivalOverlay({ rangeRef, onProgress }: LionArrivalOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    const range = rangeRef.current;
    if (!canvas || !layer || !range) return;

    let engine: LionCenterpiece | null = null;
    let cancelled = false;
    let paused = false;

    void (async () => {
      const instance = new LionCenterpiece(canvas);
      engine = instance;
      try {
        await instance.init();
      } catch (error) {
        if (!cancelled) console.error("Unable to load the lion arrival overlay", error);
      }
    })();

    const onScroll = () => {
      const rect = range.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0
        ? Math.min(1, Math.max(0, -rect.top / total))
        : 0;
      engine?.setScroll(progress);
      onProgress?.(progress);
      // Holds fully opaque through the reading portion, then eases out over
      // the last quarter so the crown is already visible by the time
      // Systems begins — a crossfade handoff, not a hard cut.
      const fadeStart = 0.72;
      const opacity = progress <= fadeStart
        ? 1
        : Math.max(0, 1 - (progress - fadeStart) / (1 - fadeStart));
      layer.style.opacity = String(opacity);
      layer.style.pointerEvents = opacity > 0.02 ? "auto" : "none";

      // Once fully faded, the canvas is invisible under the crown — stop
      // its render loop rather than burning GPU on hidden content. Resume
      // if the user scrolls back up into the overlay's visible range.
      if (opacity <= 0 && !paused) {
        paused = true;
        engine?.pause();
      } else if (opacity > 0 && paused) {
        paused = false;
        engine?.resume();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      engine?.setPointer(nx, ny);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    onScroll();

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      engine?.dispose();
    };
  }, [rangeRef, onProgress]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] bg-black"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
