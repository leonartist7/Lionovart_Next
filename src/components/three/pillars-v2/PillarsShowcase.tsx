"use client";

import { useEffect, useRef, useState } from "react";
import { ShowcaseEngine } from "./ShowcaseEngine";
import PillarFallback from "../pillars/PillarFallback";
import { useQualityTier } from "../pillars/useQualityTier";
import { useReducedMotion } from "../pillars/useReducedMotion";

/**
 * PillarsShowcase — React boundary for the v2 WebGPU pillar system.
 *
 * The canvas supplies glass / depth / lighting / flares / silk / particles.
 * The DOM supplies typography (crisp, accessible, SEO-friendly — §14): the
 * pillar word marks sit over the canvas on desktop thirds, captions fall
 * below the canvas on mobile where the layout stacks vertically.
 */

const COPY: Array<{ id: string; kick: string; title: string; body: string }> = [
  {
    id: "LION",
    kick: "Lead with confidence",
    title: "LION",
    body: "Brand worlds, positioning and growth strategy with a point of view.",
  },
  {
    id: "NOVA",
    kick: "Move with innovation",
    title: "NOVA",
    body: "AI OS, voice agents and automation that give time back.",
  },
  {
    id: "ART",
    kick: "Direct the emotion",
    title: "ART",
    body: "Identity, film, content, web and apps built as one world.",
  },
];

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function PillarsShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ShowcaseEngine | null>(null);
  const tier = useQualityTier();
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState<boolean>(
    () => typeof document !== "undefined" && !webglAvailable(),
  );
  const [ready, setReady] = useState(false);
  const [backend, setBackend] = useState<"webgpu" | "webgl2">("webgpu");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || failed) return;
    let engine: ShowcaseEngine | null = null;
    let cancelled = false;
    let readyRaf = 0;

    engine = new ShowcaseEngine({
      canvas,
      tier,
      reducedMotion,
      onError: () => setFailed(true),
    });
    void engine.init().then((ok) => {
      if (cancelled) {
        engine?.dispose();
        return;
      }
      if (!ok || !engine) {
        queueMicrotask(() => {
          if (!cancelled) setFailed(true);
        });
        return;
      }
      engineRef.current = engine;
      const be = (engine as unknown as { renderer?: { backend?: { isWebGPUBackend?: boolean } } })
        .renderer?.backend?.isWebGPUBackend;
      readyRaf = requestAnimationFrame(() => {
        if (cancelled) return;
        setBackend(be ? "webgpu" : "webgl2");
        setReady(true);
      });
    });

    // Scroll progression: cards separate slightly into depth as the section
    // travels through the viewport. Restrained; never hijacks scrolling.
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el || !engineRef.current) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height + vh;
      const travelled = vh - rect.top;
      engineRef.current.setScrollProgress(travelled / total);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(readyRaf);
      window.removeEventListener("scroll", onScroll);
      engine?.dispose();
      engineRef.current = null;
    };
  }, [tier, reducedMotion, failed]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const engine = engineRef.current;
    const el = sectionRef.current;
    if (!engine || !el || reducedMotion) return;
    const rect = el.getBoundingClientRect();
    engine.setPointer(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      ((e.clientY - rect.top) / rect.height) * 2 - 1,
    );
    engine.pick(e.clientX, e.clientY);
  };

  const handlePointerLeave = () => {
    engineRef.current?.clearPointer();
  };

  if (failed) return <PillarFallback />;

  return (
    <div
      ref={sectionRef}
      className="relative w-full"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="relative h-[86vh] min-h-[600px] w-full lg:h-[560px] lg:min-h-0">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
          style={{ opacity: ready ? 1 : 0 }}
        />
        {!ready && (
          <div aria-hidden className="absolute inset-0 animate-pulse rounded-2xl bg-white/[0.02]" />
        )}

        {/* Word marks over the card slots — desktop row layout only. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden grid-cols-3 lg:grid"
        >
          {COPY.map((card) => (
            <div key={card.id} className="flex items-end justify-center pb-10">
              <span className="select-none font-clash text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold uppercase leading-none tracking-[0.08em] text-white/90 [text-shadow:0_2px_18px_rgba(0,0,0,0.8)]">
                {card.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible DOM captions — mobile (stacked layout) + screen readers. */}
      <div className="mt-2 grid grid-cols-1 gap-8 text-center lg:hidden">
        {COPY.map((card) => (
          <article key={card.id} className="mx-auto max-w-[34ch]">
            <h3 className="font-clash text-[1.35rem] font-bold uppercase leading-none tracking-tight text-white">
              <span className="sr-only">{card.title} — </span>
              {card.kick}
            </h3>
            <p className="mt-2 font-body text-[13px] leading-relaxed text-white/60">{card.body}</p>
          </article>
        ))}
      </div>
      {/* Screen-reader copy for the desktop overlay (word marks are aria-hidden). */}
      <div className="sr-only hidden lg:block">
        {COPY.map((card) => (
          <article key={card.id}>
            <h3>
              {card.title} — {card.kick}
            </h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>

      {/* Backend readout — quiet proof of the WebGPU-first architecture. */}
      {ready && (
        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.34em] text-white/30">
          {backend === "webgpu" ? "WebGPU · TSL" : "WebGL2 · TSL fallback"} · one shader, two backends
        </p>
      )}
    </div>
  );
}
