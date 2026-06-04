"use client";

/**
 * Act 4 — Social/feed scene for /services/content-studio (the "Content Engine"
 * half of the merge). A big centered line sits behind floating content tiles;
 * on scroll the tiles disperse outward and fade, clearing the noise to reveal
 * the message. The page argues "we cut through the feed" by performing it.
 *
 * Lenis-driven progress. Reduced-motion / no-JS: headline + a static tile grid.
 * Tiles use picsum placeholders (per repo convention) until real posts land.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";

// Resting position (x: vw, y: vh from center) + dispersal vector (dx, dy) + size.
const TILES = [
  { seed: "lion-reel-a", x: -32, y: -22, dx: -30, dy: -20, w: 168, rot: -6 },
  { seed: "lion-reel-b", x: 31, y: -26, dx: 32, dy: -22, w: 150, rot: 5 },
  { seed: "lion-reel-c", x: -38, y: 14, dx: -36, dy: 18, w: 160, rot: 4 },
  { seed: "lion-reel-d", x: 34, y: 16, dx: 36, dy: 20, w: 176, rot: -5 },
  { seed: "lion-reel-e", x: -7, y: 31, dx: -8, dy: 34, w: 140, rot: 3 },
  { seed: "lion-reel-f", x: 9, y: -34, dx: 10, dy: -34, w: 132, rot: -4 },
];

const tileSrc = (seed: string) => `https://picsum.photos/seed/${seed}/320/400`;

export default function SocialScene() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [vh, setVh] = useState(900);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useLenis(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = el.offsetHeight - vh;
    const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    progress.set(p);
  });

  if (reduce) {
    return (
      <section className="bg-bg-dark px-6 py-28">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/50">Always on</p>
          <h2
            className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
            style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
          >
            We don&rsquo;t just make it. We <span className="text-brand-red">run it</span>.
          </h2>
          <div className="mt-12 grid grid-cols-3 gap-3">
            {TILES.map((t) => (
              <div key={t.seed} className="overflow-hidden rounded-xl">
                <img src={tileSrc(t.seed)} alt="" className="aspect-[4/5] w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-bg-dark" style={{ height: "260vh" }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Floating tiles */}
        {TILES.map((t) => (
          <Tile key={t.seed} t={t} progress={progress} />
        ))}

        {/* Headline behind the tiles, revealed as they disperse */}
        <HeadlineReveal progress={progress} />
      </div>
    </section>
  );
}

function HeadlineReveal({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.55, 1], [0.25, 1, 1]);
  const scale = useTransform(progress, [0, 1], [0.92, 1]);
  return (
    <motion.div
      style={{ opacity, scale }}
      className="relative z-10 mx-auto max-w-4xl px-6 text-center"
    >
      <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/50">Always on</p>
      <h2
        className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
        style={{ fontSize: "clamp(2.2rem, 7vw, 6rem)" }}
      >
        We don&rsquo;t just make it.
        <br />
        We <span className="text-brand-red">run it</span>.
      </h2>
    </motion.div>
  );
}

function Tile({
  t,
  progress,
}: {
  t: (typeof TILES)[number];
  progress: MotionValue<number>;
}) {
  const x = useTransform(progress, [0, 1], [`${t.x}vw`, `${t.x + t.dx}vw`]);
  const y = useTransform(progress, [0, 1], [`${t.y}vh`, `${t.y + t.dy}vh`]);
  const opacity = useTransform(progress, [0, 0.7], [0.95, 0]);

  return (
    <motion.div
      aria-hidden
      className="absolute left-1/2 top-1/2 z-20 overflow-hidden rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
      style={{
        x,
        y,
        opacity,
        width: t.w,
        marginLeft: -t.w / 2,
        marginTop: (-t.w * 1.25) / 2,
        rotate: t.rot,
      }}
    >
      <img src={tileSrc(t.seed)} alt="" className="aspect-[4/5] w-full object-cover" />
    </motion.div>
  );
}
