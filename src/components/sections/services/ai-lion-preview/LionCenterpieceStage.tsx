"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LionCenterpiece } from "@/lib/lion/LionCenterpiece";

/**
 * Preview-only pinned hero: canvas and overlay copy share one sticky frame
 * so the copy stays in place while 220svh of scroll drives the camera arc,
 * matching the shipped AiHeroCopy's own pinned-hero structure.
 */
export default function LionCenterpieceStage({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let engine: LionCenterpiece | null = null;
    let cancelled = false;

    void (async () => {
      const instance = new LionCenterpiece(canvas);
      engine = instance;
      try {
        await instance.init();
      } catch (error) {
        if (!cancelled) console.error("Unable to load the lion centerpiece", error);
      }
    })();

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? -rect.top / total : 0;
      engine?.setScroll(progress);
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
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[220svh]">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    </div>
  );
}
