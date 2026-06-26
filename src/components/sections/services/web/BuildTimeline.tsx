"use client";

/**
 * "How we build it" as a connected, scroll-driven timeline (replaces the flat
 * card grid on the web page). A red line fills as the section scrolls; each
 * node lights from muted to ink as the fill passes it. Horizontal on desktop,
 * vertical on mobile. Light theme. Lenis-driven progress.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";

const STEPS = [
  { n: "01", t: "Map", d: "Goals, funnel, and the one action every page drives." },
  { n: "02", t: "Design", d: "UI/UX that earns trust and removes every reason to leave." },
  { n: "03", t: "Build", d: "Fast, custom, accessible. Built to rank and convert." },
  { n: "04", t: "Launch", d: "Analytics, SEO, and a site you can actually run." },
];

export default function BuildTimeline() {
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
    progress.set(travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0);
  });

  // Fill spans the middle ~70% of scroll so nodes light with breathing room.
  const fill = useTransform(progress, [0.12, 0.9], [0, 1]);

  return (
    <section ref={sectionRef} className="relative bg-white" style={{ height: "260vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 md:px-10">
        <div className="mx-auto w-full max-w-[1400px]">
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[#999]">How we build it</p>
          <h2
            className="mb-16 font-clash font-semibold uppercase leading-[0.95] tracking-tight text-[#111] md:mb-24"
            style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
          >
            Four steps. <span className="text-brand-red">Zero guesswork.</span>
          </h2>

          {/* Desktop: horizontal rail. Mobile: vertical rail. */}
          <div className="relative">
            {/* Track + fill — horizontal (md+) */}
            <div className="absolute left-0 right-0 top-[14px] hidden h-[2px] bg-black/10 md:block">
              <motion.div
                className="h-full origin-left bg-brand-red"
                style={{ scaleX: fill }}
              />
            </div>
            {/* Track + fill — vertical (mobile) */}
            <div className="absolute left-[14px] top-0 bottom-0 w-[2px] bg-black/10 md:hidden">
              <motion.div
                className="block h-full w-full origin-top bg-brand-red"
                style={{ scaleY: fill }}
              />
            </div>

            <div className="grid gap-12 md:grid-cols-4 md:gap-8">
              {STEPS.map((step, i) => (
                <Node key={step.n} step={step} index={i} count={STEPS.length} fill={fill} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Node({
  step,
  index,
  count,
  fill,
}: {
  step: (typeof STEPS)[number];
  index: number;
  count: number;
  fill: MotionValue<number>;
}) {
  // The node lights as the fill reaches its position along the rail.
  const at = count > 1 ? index / (count - 1) : 0;
  const lit = useTransform(fill, [Math.max(0, at - 0.06), at + 0.02], [0, 1]);
  const dotColor = useTransform(lit, [0, 1], ["rgba(0,0,0,0.15)", "#e5192a"]);
  const numColor = useTransform(lit, [0, 1], ["rgba(0,0,0,0.3)", "#111111"]);
  const titleColor = useTransform(lit, [0, 1], ["rgba(0,0,0,0.35)", "#111111"]);

  return (
    <div className="relative pl-10 md:pl-0 md:pt-10">
      {/* Dot sits on the rail */}
      <motion.span
        className="absolute left-[7px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white md:left-[7px] md:top-[7px]"
        style={{ backgroundColor: dotColor }}
      />
      <motion.span
        className="font-clash text-[15px] font-semibold tracking-widest"
        style={{ color: numColor }}
      >
        {step.n}
      </motion.span>
      <motion.h3
        className="mt-3 font-clash text-2xl font-semibold md:text-3xl"
        style={{ color: titleColor }}
      >
        {step.t}
      </motion.h3>
      <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-[#666]">{step.d}</p>
    </div>
  );
}
