"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

interface Props {
  src: string;
  label?: string;
}

/**
 * Parallax + zoom. Looping video gets a slow scale-up and upward parallax
 * tied to scroll progress. Creates a sense of depth without scrubbing
 * cost. Looks premium when paired with text that moves at a different
 * rate.
 */
export default function HeroFxParallaxZoom({ src, label = "Parallax + zoom" }: Props) {
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

  const scale = useTransform(progress, [0, 1], [1, 1.2]);
  const y = useTransform(progress, [0, 1], ["0%", "-18%"]);
  const textY = useTransform(progress, [0, 1], ["0%", "30%"]);
  const overlayOpacity = useTransform(progress, [0, 1], [0.3, 0.75]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "300vh" }}
      data-fx="parallax-zoom"
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
          style={{ scale, y }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black"
          style={{ opacity: overlayOpacity }}
        />
        <motion.div
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white"
          style={{ y: textY }}
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-white/60">Technique 3</p>
          <h2 className="font-clash text-4xl md:text-6xl font-bold tracking-tight">{label}</h2>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Video loops while scale + translate are scroll-driven. Adds depth and momentum without
            the bandwidth cost of frame-scrubbing. Most cinematic for landing pages.
          </p>
          <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-white/40">Scroll ↓</p>
        </motion.div>
      </div>
    </section>
  );
}
