"use client";

/**
 * Scenes 0–1. The H1 is the stable anchor (never parallaxes; only translates up
 * on scroll-out). Floating fragments enter on mount (fade + scale 1.3→1, expo-out,
 * staggered) and disperse outward on scroll while the giant crest is revealed
 * behind them. Entrance + scroll-out write the OUTER node; ParallaxProvider writes
 * the inner node (mouse/drift) — no conflict. Reduced-motion: all static + visible.
 *
 * Depth by vertical position: lower fragments = foreground (bigger, higher z,
 * stronger parallax); higher = background.
 */

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";
import { ParallaxLayer } from "./ParallaxLayer";
import BrandCrest from "./BrandCrest";

// Floating brand fragments. left/top in %, dispersal vector derived from center.
// kind drives the placeholder visual. // TODO: swap asset — real fragments later.
type Fragment = {
  id: string;
  left: number;
  top: number;
  depth: number;
  scale: number;
  z: number;
  kind: "swatch" | "type" | "wave" | "chip";
  label?: string;
  color?: string;
};

const FRAGMENTS: Fragment[] = [
  { id: "f1", left: 16, top: 22, depth: 0.25, scale: 0.8, z: 2, kind: "type", label: "Aa" },
  { id: "f2", left: 80, top: 18, depth: 0.3, scale: 0.85, z: 2, kind: "swatch", color: "#E5192A" },
  { id: "f3", left: 8, top: 56, depth: 0.7, scale: 1.05, z: 6, kind: "wave" },
  { id: "f4", left: 88, top: 60, depth: 0.8, scale: 1.1, z: 6, kind: "chip", label: "#E5192A" },
  { id: "f5", left: 24, top: 80, depth: 0.95, scale: 1.2, z: 8, kind: "swatch", color: "#F0C917" },
  { id: "f6", left: 74, top: 82, depth: 1, scale: 1.25, z: 8, kind: "type", label: "Rg" },
  { id: "f7", left: 50, top: 12, depth: 0.2, scale: 0.7, z: 1, kind: "chip", label: "VOICE" },
];

function FragmentVisual({ f }: { f: Fragment }) {
  if (f.kind === "swatch")
    return (
      <div
        className="h-16 w-16 rounded-2xl shadow-lg md:h-20 md:w-20"
        style={{ background: f.color }}
      />
    );
  if (f.kind === "type")
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-black/10 bg-white/70 font-clash text-3xl font-semibold text-text-dark-primary shadow-lg backdrop-blur-sm md:h-24 md:w-24 md:text-4xl">
        {f.label}
      </div>
    );
  if (f.kind === "wave")
    return (
      <svg width="96" height="48" viewBox="0 0 96 48" className="drop-shadow-lg">
        <path
          d="M2 24 Q14 2 26 24 T50 24 T74 24 T94 24"
          fill="none"
          stroke="#E5462A"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  return (
    <div className="rounded-full border border-black/10 bg-white/70 px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-text-dark-primary shadow-lg backdrop-blur-sm">
      {f.label}
    </div>
  );
}

export default function HeroScatter() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const crestRef = useRef<HTMLDivElement>(null);
  const fragRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useGSAP(
    () => {
      if (reduce || !sectionRef.current) return;

      const frags = FRAGMENTS.map((f) => fragRefs.current[f.id]).filter(Boolean) as HTMLElement[];

      // ── Entrance (on mount): fade + scale 1.3→1, expo-out, staggered ──
      const intro = gsap.timeline();
      intro.from(frags, {
        opacity: 0,
        scale: 1.3,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.1,
      });
      intro.from(
        [h1Ref.current, copyRef.current],
        { opacity: 0, y: 24, duration: 1, ease: "expo.out", stagger: 0.12 },
        0.1,
      );

      // ── Scroll-out: fragments disperse, H1 lifts, crest reveals behind ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      FRAGMENTS.forEach((f) => {
        const el = fragRefs.current[f.id];
        if (!el) return;
        const dx = (f.left - 50) * 14; // blow outward from center
        const dy = (f.top - 50) * 12;
        tl.to(el, { x: dx, y: dy, scale: f.scale * 1.25, opacity: 0, ease: "power2.in" }, 0);
      });

      tl.to(h1Ref.current, { y: -180, opacity: 0, ease: "power2.in" }, 0);
      tl.to(copyRef.current, { y: -120, opacity: 0, ease: "power2.in" }, 0);
      tl.fromTo(
        crestRef.current,
        { opacity: 0, scale: 0.7 },
        { opacity: 0.5, scale: 1, ease: "power2.out" },
        0,
      );
    },
    { scope: stickyRef, dependencies: [reduce] },
  );

  return (
    <section ref={sectionRef} className="relative z-10 h-[200vh]">
      <div ref={stickyRef} className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Giant crest behind — slow, massive, distant */}
        <div
          ref={crestRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
          style={{ opacity: reduce ? 0.18 : 0 }}
        >
          <BrandCrest className="h-[150vmin] w-auto" />
        </div>

        {/* Floating fragments */}
        {FRAGMENTS.map((f) => (
          <ParallaxLayer
            key={f.id}
            depth={f.depth}
            ref={(el) => {
              fragRefs.current[f.id] = el;
            }}
            className="absolute"
            style={{
              left: `${f.left}%`,
              top: `${f.top}%`,
              zIndex: f.z,
              transform: `scale(${f.scale})`,
            }}
          >
            <FragmentVisual f={f} />
          </ParallaxLayer>
        ))}

        {/* Stable anchor — H1 does not move in Scene 0 */}
        <div className="relative z-10 px-6 text-center">
          <p ref={copyRef} className="mb-6 text-[12px] font-semibold uppercase tracking-[0.4em] text-brand-red">
            Branding
          </p>
          <h1
            ref={h1Ref}
            className="font-clash font-semibold uppercase text-text-dark-primary"
            style={{ fontSize: "clamp(2.8rem, 9vw, 6rem)", letterSpacing: "-0.04em", lineHeight: 0.92 }}
          >
            <span className="block">Making</span>
            <span className="block">Brands</span>
            <span className="block">Roar</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[46ch] font-body text-[16px] leading-[1.6] text-text-dark-primary/70 md:text-[19px]">
            Identity, voice, and motion — crafted into one presence people remember.
          </p>
        </div>
      </div>
    </section>
  );
}
