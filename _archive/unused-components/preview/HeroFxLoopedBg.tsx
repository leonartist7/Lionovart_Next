"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

interface Props {
  src: string;
  label?: string;
}

/**
 * Pinned looping video background. Plays continuously, fades out as user
 * scrolls past the section. Smoothest of the three — the video element
 * is independent of scroll, only its opacity (and a slight scale) are
 * scroll-driven. Ideal for subtle ambient backdrops.
 */
export default function HeroFxLoopedBg({ src, label = "Pinned looping video bg" }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);

  useLenis(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return;
    const p = Math.min(1, Math.max(0, -rect.top / total));
    progress.set(p);
  });

  const opacity = useTransform(progress, [0, 0.6, 1], [1, 1, 0]);
  const scale = useTransform(progress, [0, 1], [1, 1.04]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "250vh" }}
      data-fx="looped-bg"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <motion.video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity, scale }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-white/60">Technique 2</p>
          <h2 className="font-clash text-4xl md:text-6xl font-bold tracking-tight">{label}</h2>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Video loops at native frame rate; only opacity is scroll-driven. Smoothest performance,
            lowest bandwidth shock. Best for ambient, mood-driven hero backdrops.
          </p>
          <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-white/40">Scroll ↓</p>
        </div>
      </div>
    </section>
  );
}
