"use client";

import { useRef, useEffect, useState, Fragment } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const gridRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Progress 0→1 as the section travels through the viewport.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.55"],
  });
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  // Each circle's vertical center as a fraction of the rail height, so a circle
  // lights exactly when the red fill reaches it (independent of text length).
  const [thresholds, setThresholds] = useState<number[]>([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const compute = () => {
      const grid = gridRef.current;
      if (!grid) return;
      const h = grid.offsetHeight;
      if (h <= 0) return;
      setThresholds(
        circleRefs.current.map((c) =>
          c ? (c.offsetTop + c.offsetHeight / 2) / h : 1
        )
      );
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [steps.length]);

  useMotionValueEvent(lineProgress, "change", (p) => {
    setActiveCount(thresholds.filter((th) => p >= th - 0.0001).length);
  });

  return (
    <section
      ref={sectionRef}
      id="process"
      className="bg-bg-surface-light"
    >
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
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#111111]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {heading} <span className="text-brand-red">{headingAccent}</span>
          </motion.h2>
        </div>

        {/* ── Steps + rail ── */}
        <div
          ref={gridRef}
          className="relative grid grid-cols-1 md:grid-cols-[1fr_72px] md:gap-x-14"
        >
          {/* Rail overlay — desktop only, centered in the 72px right column */}
          <div
            aria-hidden
            className="hidden md:block absolute top-0 bottom-0 right-[35px] w-[2px]"
          >
            <div className="absolute inset-0 bg-[#d3d8df] rounded-full" />
            <motion.div
              style={{ scaleY: reduce ? 1 : lineProgress }}
              className="absolute inset-0 origin-top rounded-full bg-brand-red"
            />
          </div>

          {steps.map((step, i) => {
            const active = reduce ? true : i < activeCount;
            return (
              <Fragment key={step.num}>
                {/* Text cell */}
                <motion.div
                  className="md:col-start-1 py-9 md:py-12 border-t border-[#dde1e7] first:border-t-0 md:border-t-0"
                  initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div className="flex items-baseline gap-4 md:gap-5">
                    <span className="font-clash text-[1.75rem] md:text-[2.25rem] font-bold leading-none text-brand-red tabular-nums shrink-0">
                      {step.num.padStart(2, "0")}
                    </span>
                    <h3 className="font-clash text-[1.5rem] md:text-[2rem] font-bold uppercase leading-[1.05] tracking-[-0.01em] text-[#111111]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="font-body text-[15px] md:text-[16px] leading-[1.7] text-[#555555] mt-4 max-w-[46ch]">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-2 mt-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                    <span className="text-brand-red text-[11px] font-bold uppercase tracking-[0.2em]">
                      {step.tag}
                    </span>
                  </div>
                </motion.div>

                {/* Rail circle cell — desktop only, shares the row so it aligns with the step */}
                <div
                  aria-hidden
                  className="hidden md:flex md:col-start-2 items-center justify-center"
                >
                  <div
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                    className="relative z-10"
                  >
                    <motion.span
                      className="block w-[20px] h-[20px] rounded-full border-2"
                      animate={{
                        backgroundColor: active ? "#e5192a" : "#eceff3",
                        borderColor: active ? "#e5192a" : "#c5cad2",
                        scale: active ? 1.12 : 1,
                        boxShadow: active
                          ? "0 0 0 5px rgba(229,25,42,0.12)"
                          : "0 0 0 0px rgba(229,25,42,0)",
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
