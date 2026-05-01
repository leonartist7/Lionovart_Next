"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProcessStep = {
  num: string;
  title: string;
  description: string;
  tag: string;
};

// ─── Step data (3 pillars) ────────────────────────────────────────────────────
const STEPS = [
  {
    num: "1",
    title: "Discovery & Strategy",
    description:
      "We learn your business, your audience, and your standards. We ask the questions most agencies skip because the best creative work starts with clarity.",
    tag: "Foundation",
  },
  {
    num: "2",
    title: "Build & Refine",
    description:
      "We bring the concepts to life including websites, video, social and print. All built to the same standard and reviewed with you at every stage.",
    tag: "Execution",
  },
  {
    num: "3",
    title: "Rule & Scale",
    description:
      "Your brand goes live. We don't just hand over the keys. We set up the systems, track the results, and stay available for what comes next.",
    tag: "Launch",
  },
] as const;

// Ascending bar-chart heights for 3 pillars
const COL_HEIGHTS = [
  "clamp(300px, 40vh, 440px)",
  "clamp(420px, 50vh, 560px)",
  "clamp(520px, 60vh, 650px)",
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Process(props: any) {
  const sectionRef  = useRef<HTMLElement>(null);
  const rowRef      = useRef<HTMLDivElement>(null);
  const pillarRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const [snapPoints, setSnapPoints] = useState<number[]>([0, 0, 0]);
  const { t } = useLanguage();

  const eyebrow     = props.eyebrow     || t.process.eyebrow;
  const heading     = props.heading     || t.process.heading;
  const headingAccent = props.headingAccent || t.process.headingAccent;
  const scrollHint  = props.scrollHint  || t.process.scrollHint;
  const steps: ProcessStep[] = props.steps && props.steps.length > 0
    ? props.steps
    : (t.process.steps.map((step, idx) => ({ ...step, num: String(idx + 1) })) as unknown as ProcessStep[]);

  // Discrete active step — drives progress lines and circle colors exactly on snap
  const [activeStep, setActiveStep] = useState(0);

  // Measure how far the row needs to translate and calculate exact snap points
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const compute = () => {
      if (!rowRef.current || pillarRefs.current.length < 3) return;
      const iw = window.innerWidth;

      const getCenter = (el: HTMLElement) => {
        let offset = 0;
        let current: HTMLElement | null = el;
        while (current && current !== rowRef.current) {
          offset += current.offsetLeft;
          current = current.offsetParent as HTMLElement;
        }
        return offset + el.offsetWidth / 2;
      };

      // Point 1: Aligned left (x = 0)
      const pos1 = 0;

      // Point 2: Center pillar 2
      const p2 = pillarRefs.current[1];
      let pos2 = p2 ? (iw / 2) - getCenter(p2) : 0;

      // Point 3: Aligned right (max scroll)
      const overflow = rowRef.current.scrollWidth - iw;
      const pos3 = overflow > 0 ? -overflow : 0;

      // Clamp so we don't overscroll past bounds
      pos2 = Math.min(0, Math.max(pos2, pos3));

      setSnapPoints([pos1, pos2, pos3]);
    };

    compute();
    window.addEventListener("resize", compute);

    // Setup GSAP Snapping Physics
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        snap: {
          snapTo: [0, 0.5, 1],
          duration: { min: 0.1, max: 0.4 },
          delay: 0,
          ease: "power3.out",
        }
      });
    });

    return () => {
      window.removeEventListener("resize", compute);
      ctx.revert();
    };
  }, []);

  // Map vertical scroll progress inside the section → horizontal position
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Discrete step — rounds to nearest snap point so lines always land exactly on circles
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const step = Math.min(2, Math.round(latest * 2));
    setActiveStep(step);
  });

  const x = useTransform(scrollYProgress, [0, 0.5, 1], snapPoints);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative bg-bg-surface-light h-[320vh]"
    >
      {/* ── Sticky viewport — stays at top while user scrolls through the section ── */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="flex-none px-6 md:px-14 pt-10 pb-5">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
            <div>
              <p
                className="text-[12px] font-bold uppercase tracking-[0.22em] mb-2 text-[#e5192a]"
              >
                {eyebrow}
              </p>
              <h2
                className="text-[2.4rem] sm:text-[3.2rem] md:text-[4rem] font-bold uppercase leading-none tracking-tight text-[#111111]"
              >
                {heading} <span className="text-[#e5192a]">{headingAccent}</span>
              </h2>
            </div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#bbb]">
              {scrollHint}
            </p>
          </div>
        </div>

        {/* ── Columns area ── */}
        <div className="relative flex-1 overflow-hidden flex flex-col justify-end">

          {/* Floor line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px] z-10 bg-[rgba(229,25,42,0.15)]"
            aria-hidden
          />

          {/* Horizontally-translating row of columns */}
          <motion.div
            ref={rowRef}
            style={{ x }}
            className="flex flex-col justify-between h-full pt-8 md:pt-16 pb-0 will-change-transform w-max"
          >
            {/* Timeline Header Row */}
            <div className="flex items-start gap-8 md:gap-14 px-6 md:px-14 relative z-20">
              {steps.map((step, i) => (
                <div
                  key={`tl-${step.num}`}
                  style={{ width: "clamp(240px, 32vw, 420px)" }}
                  className="flex-shrink-0 relative flex flex-col items-center"
                >
                  {/* Connecting red line — fills completely when next step becomes active */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="absolute top-[23px] left-[calc(50%+24px)] h-[2px] w-[calc(100%-48px+2rem)] md:w-[calc(100%-48px+3.5rem)] overflow-hidden"
                    >
                      <motion.div
                        className="h-full bg-[#e5192a] origin-left"
                        animate={{ scaleX: activeStep >= i + 1 ? 1 : 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      />
                    </div>
                  )}

                  {/* Number Circle */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center w-[48px] h-[48px] rounded-full border-2 border-[#e5192a] font-black text-[16px] shadow-[0_4px_12px_rgba(229,25,42,0.30)]"
                    animate={{
                      backgroundColor: activeStep >= i ? "#e5192a" : "transparent",
                      color: activeStep >= i ? "#ffffff" : "#e5192a",
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {step.num}
                  </motion.div>

                  {/* Tag Only */}
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="text-[#e5192a] text-[12px] font-bold uppercase tracking-[0.18em]">
                      {step.tag}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pillars Row */}
            <div className="flex items-end gap-8 md:gap-14 px-6 md:px-14 mt-auto relative z-10">
              {steps.map((step, i) => (
                <div
                  key={`pl-${step.num}`}
                  ref={(el) => {
                    pillarRefs.current[i] = el;
                  }}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    width: "clamp(240px, 32vw, 420px)",
                    height: COL_HEIGHTS[i],
                    background: "var(--color-bg-surface-light)",
                    borderRadius: "24px 24px 0 0",
                    boxShadow: "-8px 8px 24px rgba(0,0,0,0.15), 8px -8px 24px rgba(255,255,255,1)",
                    padding: "clamp(24px, 3vw, 40px)",
                    overflow: "hidden",
                  }}
                >
                  {/* Title & Description */}
                  <div className="flex flex-col gap-5 relative z-10">
                    <h3 className="text-[#111] text-[clamp(20px,2.8vw,32px)] font-bold uppercase tracking-[-0.01em] leading-[1.1] m-0 pr-4">
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "clamp(15px, 1.4vw, 15px)",
                        lineHeight: "140%",
                        color: "#3c3c3cff",
                        margin: 0,
                        maxWidth: "90%",
                      }}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Ghost number watermark */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: -16,
                      right: -8,
                      fontSize: "clamp(80px, 12vw, 130px)",
                      fontWeight: 900,
                      lineHeight: 1,
                      color: "rgba(229,25,42,0.06)",
                      pointerEvents: "none",
                      userSelect: "none",
                      fontFamily: "var(--font-heading, sans-serif)",
                    }}
                    aria-hidden
                  >
                    {step.num}
                  </span>
                </div>
              ))}

              {/* Trailing spacer keeps last column away from the edge */}
              <div className="shrink-0 w-[clamp(80px,15vw,200px)]" aria-hidden />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
