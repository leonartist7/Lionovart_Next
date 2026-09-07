"use client";

import { useEffect, useRef, useState } from "react";
import { PillarEngine } from "./PillarEngine";
import PillarFallback from "./PillarFallback";
import { useQualityTier } from "./useQualityTier";
import { useReducedMotion } from "./useReducedMotion";

/**
 * PillarScene — React boundary for the 3D pillar system.
 *
 * WebGL canvas supplies glass / depth / lighting / flares / motion.
 * DOM supplies typography (crisp, accessible, SEO-friendly — directive §14).
 * The two are aligned: each overlay column tracks its card's screen slot
 * (left / centre / right on desktop, stacked on mobile).
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

export default function PillarScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PillarEngine | null>(null);
  const tier = useQualityTier();
  const reducedMotion = useReducedMotion();
  // Lazy check — runs during render (client-only via ssr:false wrapper), so
  // the effect below never calls setState synchronously in its body.
  const [failed, setFailed] = useState<boolean>(
    () => typeof document !== "undefined" && !webglAvailable(),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || failed) return;
    let engine: PillarEngine | null = null;
    let cancelled = false;
    let readyRaf = 0;
    try {
      engine = new PillarEngine({
        canvas,
        tier,
        reducedMotion,
        onError: () => setFailed(true),
      });
      const ok = engine.init();
      if (!ok) {
        queueMicrotask(() => {
          if (!cancelled) setFailed(true);
        });
        return;
      }
      engineRef.current = engine;
      // Signal reveal via rAF callback — never setState in the effect body.
      readyRaf = requestAnimationFrame(() => {
        if (!cancelled) setReady(true);
      });
    } catch {
      // Async failure path only (init errors also route via onError above).
      queueMicrotask(() => {
        if (!cancelled) setFailed(true);
      });
      return;
    }

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
      <div className="relative h-[560px] w-full md:h-[480px] lg:h-[520px]">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
          style={{ opacity: ready ? 1 : 0 }}
        />
        {!ready && (
          <div aria-hidden className="absolute inset-0 animate-pulse rounded-2xl bg-white/[0.02]" />
        )}
      </div>

      {/* Accessible DOM content — the 3D model never contains typography. */}
      <div className="mt-2 grid grid-cols-1 gap-8 text-center lg:grid-cols-3">
        {COPY.map((card) => (
          <article key={card.id} className="mx-auto max-w-[34ch]">
            <h3 className="font-clash text-[1.35rem] font-bold uppercase leading-none tracking-tight text-white md:text-[1.7rem]">
              <span className="sr-only">{card.title} — </span>
              {card.kick}
            </h3>
            <p className="mt-2 font-body text-[13px] leading-relaxed text-white/60 md:text-sm">{card.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
