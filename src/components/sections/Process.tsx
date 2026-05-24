"use client";

import { useRef, useEffect, useState, Fragment } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { animate, createScope } from "animejs";
import { useLanguage } from "@/contexts/LanguageContext";
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
      "We bring concepts to life — websites, video, social, and print. Everything is built to the same standard and reviewed with you at every stage.",
    tag: "Execution",
  },
  {
    title: "Launch & Growth",
    description:
      "Your brand goes live. We don't just hand over the keys. We set up the systems, track results, and stay available for what comes next.",
    tag: "Growth",
  },
];

export default function Process(props: any) {
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

  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numberRef = useRef<HTMLDivElement>(null);
  const goldFiredRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  // When reduced motion is on, treat the section as fully traversed —
  // no scroll-driven step tracking, the final number is shown.
  const displayIndex = reduce ? steps.length - 1 : activeIndex;
  const display = String(displayIndex + 1).padStart(2, "0");

  // Active step is whichever step is currently in the central viewport band.
  useEffect(() => {
    if (reduce) return;
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [steps.length, reduce]);

  // Sovereign Gold moment — fired once, when the final step takes focus.
  useEffect(() => {
    if (reduce) return;
    if (displayIndex !== steps.length - 1) return;
    if (goldFiredRef.current) return;
    goldFiredRef.current = true;
    const el = numberRef.current;
    if (!el) return;

    const scope = createScope({ root: el }).add(() => {
      animate(el, {
        color: ["#111111", "#f0c917", "#f0c917", "#111111"],
        duration: 1600,
        ease: "inOutQuad",
      });
    });
    return () => {
      scope.revert();
    };
  }, [displayIndex, steps.length, reduce]);

  return (
    <section ref={sectionRef} id="process" className="bg-bg-surface-light">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 pt-[80px] md:pt-[110px] pb-[100px] md:pb-[130px]">
        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center mb-[64px] md:mb-[90px]">
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
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#111111]"
            step={28}
            delay={100}
            from="first"
          >
            {heading} <span className="text-brand-red">{headingAccent}</span>
          </SplitTextReveal>
        </div>

        {/* ── Steps + monumental morphing number ── No rail, no circles.
            The number does the work: as the active step shifts, the digit
            replaces itself with deliberate vertical motion. Sticky on
            desktop so it stays present while the eye reads the text. */}
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] md:gap-x-16 lg:gap-x-24">
          {/* Step text column */}
          <div className="md:col-start-1">
            {steps.map((step, i) => (
              <Fragment key={step.num}>
                <motion.div
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="py-9 md:py-14 border-t border-[#dde1e7] first:border-t-0"
                  initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.65,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <h3 className="font-clash text-[1.75rem] md:text-[2.25rem] font-bold uppercase leading-[1.05] tracking-[-0.015em] text-[#111111]">
                    {step.title}
                  </h3>
                  <p className="font-body text-[15px] md:text-[16px] leading-[1.7] text-[#555555] mt-4 max-w-[48ch]">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-2 mt-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                    <span className="text-brand-red text-[11px] font-bold uppercase tracking-[0.22em]">
                      {step.tag}
                    </span>
                  </div>
                </motion.div>
              </Fragment>
            ))}
          </div>

          {/* Monumental morphing step number — desktop only.
              Sticky during the section's scroll travel. */}
          <div className="hidden md:block md:col-start-2 self-start sticky top-[24vh]">
            <div
              ref={numberRef}
              className="relative font-clash font-black tabular-nums select-none text-[#111111]"
              style={{
                fontSize: "clamp(9rem, 17vw, 17rem)",
                lineHeight: 0.82,
                letterSpacing: "-0.04em",
                width: "1.4em",
                height: "1em",
                overflow: "hidden",
              }}
              aria-hidden="true"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={display}
                  className="absolute inset-0 block"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {display}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="block w-8 h-px bg-brand-red" />
              <span className="text-brand-red text-[11px] font-bold uppercase tracking-[0.22em]">
                Step {display} of {String(steps.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
