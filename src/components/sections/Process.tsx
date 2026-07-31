"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLandingFlow } from "@/contexts/LandingFlowContext";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

type ProcessStep = {
  num: string;
  title: string;
  description: string;
  tag: string;
};

const STEPS_STATIC = [
  {
    title: "Discovery & Strategy",
    description:
      "We learn your business, your audience, and your standards. We ask the questions most agencies skip, because the best creative work starts with clarity.",
    tag: "Foundation",
  },
  {
    title: "Creative Concepts",
    description:
      "We develop two to three creative directions and refine with you until the visual language feels undeniably yours. No surprises. No lost revisions.",
    tag: "Design",
  },
  {
    title: "Development & Refinement",
    description:
      "We bring concepts to life â€” websites, video, social, and print. Everything is built to the same standard and reviewed with you at every stage.",
    tag: "Execution",
  },
  {
    title: "Launch & Growth",
    description:
      "Your brand goes live. We don't just hand over the keys. We set up the systems, track results, and stay available for what comes next.",
    tag: "Growth",
  },
];

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(Math.max(n, lo), hi);

// Ring + lion frame share this radius so the line traces the exact circle edge.
const RING_RADIUS = 48; // viewBox 0â€“100 â†’ circle Ã˜ = 96% of the stage
const RED = "#e5192a";

// Vision copy (hardcoded for now; i18n type is `typeof en` across 5 locales).
const VISION_KICKER = "Not artificial.";
const VISION = "Artistic Intelligence";

export default function Process(props: any) {
  const flow = useLandingFlow();
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.process.eyebrow;
  const heading = props.heading || t.process.heading;
  const headingAccent = props.headingAccent || t.process.headingAccent;

  const steps: ProcessStep[] =
    props.steps && props.steps.length > 0
      ? props.steps.map((s: any, i: number) => ({ ...s, num: String(i + 1) }))
      : (t.process.steps?.length ? t.process.steps : STEPS_STATIC).map(
          (s: any, i: number) => ({ ...s, num: String(i + 1) })
        );

  const prefersReduced = useReducedMotion() ?? false;
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const reduce = hasMounted && prefersReduced;

  const sectionRef = useRef<HTMLElement>(null);

  // frames = one per step + a final beat where the lion fills the circle.
  const frames = steps.length + 1;
  const ringEnd = steps.length / frames; // line full when the lion reveal starts

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const logicalProgress = useTransform(
    scrollYProgress,
    [0, 1],
    flow === "inverse" ? [1, 0] : [0, 1],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  useMotionValueEvent(logicalProgress, "change", (v) => {
    const raw = clamp(Math.floor(v * frames), 0, frames - 1);
    const nextReveal = raw >= steps.length;
    const nextIdx = Math.min(raw, steps.length - 1);
    setActiveIndex((p) => (p === nextIdx ? p : nextIdx));
    setReveal((p) => (p === nextReveal ? p : nextReveal));
  });

  const active = steps[activeIndex] ?? steps[0];

  // Line fills across the step beats; full when the lion reveal begins.
  const lineProgress = useTransform(logicalProgress, [0, ringEnd], [0, 1], {
    clamp: true,
  });
  const runnerRotate = useTransform(lineProgress, [0, 1], [0, 360]);
  // Fade ticks/runner/step-text out as the lion takes the circle.
  const auxFade = useTransform(
    logicalProgress,
    [ringEnd, ringEnd + (1 - ringEnd) * 0.5],
    [1, 0],
    { clamp: true }
  );

  // Step-boundary tick positions on the ring (start of each step).
  const tickPos = (i: number) => {
    const angle = (-90 + i * (360 / steps.length)) * (Math.PI / 180);
    return {
      left: `${50 + RING_RADIUS * Math.cos(angle)}%`,
      top: `${50 + RING_RADIUS * Math.sin(angle)}%`,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative bg-bg-surface-light text-[#141414]"
      style={{ height: `${frames * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        {/* â”€â”€ Header â€” crossfades from "How We Work" to the vision â”€â”€ */}
        <div className="relative z-10 flex flex-col items-center text-center mb-8 md:mb-10 min-h-[6.5rem]">
          <AnimatePresence mode="wait">
            {reveal ? (
              <motion.div
                key="vision"
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                transition={{ duration: reduce ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-3">
                  {VISION_KICKER}
                </p>
                <h2 className="font-clash text-[2rem] sm:text-[2.8rem] md:text-[3.75rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#141414]">
                  Artistic{" "}
                  <span className="text-brand-red">Intelligence</span>
                </h2>
              </motion.div>
            ) : (
              <motion.div
                key="steps-header"
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                transition={{ duration: reduce ? 0.15 : 0.4 }}
              >
                <motion.p
                  className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  {eyebrow}
                </motion.p>
                <SplitTextReveal
                  as="h2"
                  className="text-[2rem] sm:text-[2.8rem] md:text-[3.75rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#141414]"
                  step={28}
                  delay={100}
                  from="first"
                >
                  {heading} <span className="text-brand-red">{headingAccent}</span>
                </SplitTextReveal>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* â”€â”€ The big circle = the dot of a giant "i" â”€â”€ */}
        <div
          className="relative z-10 shrink-0"
          style={{
            width: "var(--lion-circle-d)",
            height: "var(--lion-circle-d)",
          }}
        >
          {/* Lion â€” fills exactly inside the ring; only on reveal */}
          <motion.div
            className="absolute inset-[2%] rounded-full overflow-hidden z-0"
            initial={false}
            animate={{ opacity: reveal ? 1 : 0, scale: reveal ? 1 : 1.03 }}
            transition={{ duration: reduce ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/LION-CIRCLE.avif"
              alt="LIONOVART"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>

          {/* Progress ring â€” stays as the circle frame (track + filling arc) */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full -rotate-90 z-10"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(20,20,20,0.12)"
              strokeWidth="1.6"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              stroke={RED}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: lineProgress }}
            />
          </svg>

          {/* Aux: ticks + runner + step text â€” fade/clear on reveal */}
          <motion.div
            className="absolute inset-0 z-20"
            style={{ opacity: reduce ? 1 : auxFade }}
          >
            {!reveal &&
              steps.map((step, i) => {
                const passed = i <= activeIndex;
                return (
                  <div
                    key={step.num}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={tickPos(i)}
                  >
                    <motion.span
                      className="block rounded-full"
                      animate={{
                        backgroundColor: passed ? RED : "rgba(20,20,20,0.2)",
                        scale: passed ? 1 : 0.8,
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        width: "clamp(8px, 1.4vmin, 12px)",
                        height: "clamp(8px, 1.4vmin, 12px)",
                      }}
                    />
                  </div>
                );
              })}

            {/* Runner dot */}
            {!reveal && (
              <motion.div
                className="absolute inset-0"
                style={{ rotate: reduce ? 0 : runnerRotate }}
              >
                <span
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    top: `${50 - RING_RADIUS}%`,
                    width: "clamp(14px, 2.6vmin, 20px)",
                    height: "clamp(14px, 2.6vmin, 20px)",
                    backgroundColor: RED,
                    boxShadow: "0 0 0 5px rgba(229,25,42,0.14)",
                  }}
                />
              </motion.div>
            )}

            {/* Step text â€” centered, removed entirely once revealing */}
            <div className="absolute inset-0 flex items-center justify-center text-center px-[16%]">
              <AnimatePresence mode="wait">
                {!reveal && (
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                    transition={{ duration: reduce ? 0.15 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span
                      className="block font-clash font-black tabular-nums leading-none mb-2"
                      style={{ color: RED, fontSize: "clamp(1.8rem, 5vmin, 2.8rem)" }}
                    >
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="block text-brand-red text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.26em] mb-2">
                      {active.tag}
                    </span>
                    <h3 className="font-clash text-[1.5rem] sm:text-[2rem] md:text-[2.4rem] font-bold uppercase leading-[1.05] tracking-[-0.015em] text-[#141414]">
                      {active.title}
                    </h3>
                    <p className="hidden md:block font-body text-[14px] md:text-[15px] leading-[1.55] text-[#5a5550] mt-3 max-w-[36ch] mx-auto">
                      {active.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* The "i" stem â€” red bar below the dot; descends toward IMAGINE */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-full -translate-x-1/2 rounded-full"
            initial={false}
            animate={{ opacity: reveal ? 1 : 0, scaleY: reveal ? 1 : 0 }}
            transition={{ duration: reduce ? 0.2 : 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transformOrigin: "top center",
              marginTop: "clamp(10px, 2vmin, 22px)",
              width: "clamp(16px, 3.2vmin, 30px)",
              height: "clamp(60px, 16vmin, 150px)",
              backgroundColor: RED,
            }}
          />
        </div>

        {/* Description â€” mobile only, beneath the circle (cleared on reveal) */}
        <motion.div
          className="md:hidden relative z-10 mt-8 px-4 max-w-[40ch] text-center min-h-[6rem]"
          style={{ opacity: reduce ? 1 : auxFade }}
        >
          <AnimatePresence mode="wait">
            {!reveal && (
              <motion.p
                key={activeIndex}
                className="font-body text-[14px] leading-[1.6] text-[#5a5550]"
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -10 }}
                transition={{ duration: reduce ? 0.15 : 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {active.description}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
