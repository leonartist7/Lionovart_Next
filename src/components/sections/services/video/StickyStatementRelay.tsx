"use client";

/**
 * Act 2 — Sticky statement relay for /services/video.
 * The page pins a centered line, holds it, fades it out, and brings the next
 * one as you scroll (PAS: name the stakes, raise the cost of inaction). The
 * scroll IS the pacing. Placeholder copy until final lines are written.
 *
 * Drives off Lenis; progress is the section's travel through the viewport.
 * Reduced-motion: beats render stacked and static (hierarchy preserved).
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";

// Placeholder beats. Keep to 3-4; each is a single thought.
const BEATS = [
  "82% of internet traffic is video.",
  "Your competitor's reel is already winning the room.",
  "You have three seconds. Then they scroll.",
];

export default function StickyStatementRelay() {
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

  const n = BEATS.length;

  if (reduce) {
    return (
      <section className="bg-bg-dark px-6 py-32">
        <div className="mx-auto max-w-4xl space-y-16 text-center">
          {BEATS.map((b, i) => (
            <p
              key={b}
              className="font-clash font-medium leading-[1.05] text-white"
              style={{ fontSize: "clamp(1.6rem, 4.5vw, 3.4rem)" }}
            >
              {i === n - 1 ? <span className="text-brand-red">{b}</span> : b}
            </p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg-dark"
      style={{ height: `${n * 80 + 40}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        <div className="relative mx-auto w-full max-w-5xl text-center">
          {BEATS.map((beat, i) => (
            <Beat key={beat} beat={beat} index={i} count={n} progress={progress} last={i === n - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Beat({
  beat,
  index,
  count,
  progress,
  last,
}: {
  beat: string;
  index: number;
  count: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress: any;
  last: boolean;
}) {
  const seg = 1 / count;
  const c = (index + 0.5) * seg;
  const opacity = useTransform(
    progress,
    [c - seg * 0.55, c - seg * 0.18, c + seg * 0.18, c + seg * 0.55],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [c - seg * 0.55, c + seg * 0.55], [44, -44]);

  return (
    <motion.p
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 font-clash font-medium leading-[1.04] text-white"
      style={{ opacity, y, fontSize: "clamp(1.8rem, 5.5vw, 4.6rem)" }}
    >
      {last ? <span className="text-brand-red">{beat}</span> : beat}
    </motion.p>
  );
}
