"use client";

/**
 * Brand signature scene: a geometric mark constructs itself stroke-by-stroke
 * as you scroll (the page performs "we build identities"). Uses motion.path
 * pathLength driven by Lenis scroll progress. Reduced-motion: mark shown whole.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";

// Each stroke draws within its own progress window, so the mark assembles in order.
const STROKES: { d: string; from: number; to: number; accent?: boolean }[] = [
  { d: "M100 24 L168 100", from: 0.0, to: 0.18 },
  { d: "M168 100 L100 176", from: 0.15, to: 0.33 },
  { d: "M100 176 L32 100", from: 0.3, to: 0.48 },
  { d: "M32 100 L100 24", from: 0.45, to: 0.63 },
  { d: "M100 24 L100 176", from: 0.6, to: 0.8, accent: true },
  { d: "M32 100 L168 100", from: 0.72, to: 0.92, accent: true },
];

export default function MonogramDrawScene() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(reduce ? 1 : 0);
  const [vh, setVh] = useState(900);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useLenis(() => {
    if (reduce) return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = el.offsetHeight - vh;
    progress.set(travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0);
  });

  const captionOpacity = useTransform(progress, [0.82, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg-dark"
      style={{ height: reduce ? "auto" : "260vh" }}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-10 overflow-hidden px-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Identity, engineered</p>
        <svg
          viewBox="0 0 200 200"
          className="h-[44vmin] w-[44vmin]"
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {STROKES.map((s, i) => (
            <Stroke key={i} stroke={s} progress={progress} reduce={!!reduce} />
          ))}
        </svg>
        <motion.p
          style={{ opacity: reduce ? 1 : captionOpacity }}
          className="max-w-xl text-center font-clash text-white/80"
        >
          Every line is a decision. Nothing arbitrary.
        </motion.p>
      </div>
    </section>
  );
}

function Stroke({
  stroke,
  progress,
  reduce,
}: {
  stroke: { d: string; from: number; to: number; accent?: boolean };
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const pathLength = useTransform(progress, [stroke.from, stroke.to], [0, 1]);
  return (
    <motion.path
      d={stroke.d}
      className={stroke.accent ? "text-brand-red" : "text-white"}
      style={{ pathLength: reduce ? 1 : pathLength }}
    />
  );
}
