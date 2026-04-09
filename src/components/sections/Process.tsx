"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// ─── Step data ─────────────────────────────────────────────────────────────────
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
    title: "Creative Concepts",
    description:
      "We develop two to three creative directions and refine with you until the visual language feels unmistakably yours. No surprises. No wasted revisions.",
    tag: "Design",
  },
  {
    num: "3",
    title: "Build & Refine",
    description:
      "We bring the concepts to life including websites, video, social and print. All built to the same standard and reviewed with you at every stage.",
    tag: "Execution",
  },
  {
    num: "4",
    title: "Launch & Scale",
    description:
      "Your brand goes live. We don't just hand over the keys. We set up the systems, track the results, and stay available for what comes next.",
    tag: "Growth",
  },
] as const;

// Taller columns to fit text comfortably, still maintaining the ascending bar-chart effect
const COL_HEIGHTS = [
  "clamp(320px, 45vh, 450px)",
  "clamp(380px, 55vh, 520px)",
  "clamp(440px, 65vh, 590px)",
  "clamp(500px, 75vh, 660px)",
] as const;

// ─── Particles — fixed data so SSR matches client render ──────────────────────
const PARTICLES = [
  { left:  "4%", sz: 4, dur: 4.8, del: 0.0, op: 0.40 },
  { left: "10%", sz: 3, dur: 6.2, del: 1.0, op: 0.28 },
  { left: "17%", sz: 5, dur: 5.5, del: 0.5, op: 0.32 },
  { left: "23%", sz: 3, dur: 4.3, del: 2.2, op: 0.40 },
  { left: "30%", sz: 6, dur: 7.1, del: 1.5, op: 0.22 },
  { left: "37%", sz: 4, dur: 5.0, del: 0.8, op: 0.35 },
  { left: "44%", sz: 3, dur: 6.8, del: 3.0, op: 0.28 },
  { left: "51%", sz: 5, dur: 4.6, del: 0.3, op: 0.32 },
  { left: "58%", sz: 4, dur: 5.9, del: 1.8, op: 0.30 },
  { left: "64%", sz: 3, dur: 4.2, del: 2.5, op: 0.40 },
  { left: "71%", sz: 5, dur: 6.5, del: 0.6, op: 0.22 },
  { left: "78%", sz: 4, dur: 5.3, del: 1.3, op: 0.30 },
  { left: "85%", sz: 3, dur: 4.9, del: 2.8, op: 0.38 },
  { left: "91%", sz: 6, dur: 7.4, del: 0.2, op: 0.20 },
  { left: "96%", sz: 4, dur: 5.7, del: 3.5, op: 0.28 },
  { left: "14%", sz: 3, dur: 4.4, del: 1.1, op: 0.32 },
  { left: "55%", sz: 5, dur: 6.0, del: 2.0, op: 0.25 },
  { left: "74%", sz: 4, dur: 5.2, del: 0.9, op: 0.35 },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Process() {
  const sectionRef  = useRef<HTMLElement>(null);
  const rowRef      = useRef<HTMLDivElement>(null);
  const [endX, setEndX] = useState(0);

  // Measure how far the row needs to translate so the last column is visible
  useEffect(() => {
    const compute = () => {
      if (!rowRef.current) return;
      const overflow = rowRef.current.scrollWidth - window.innerWidth;
      setEndX(overflow > 0 ? -overflow : 0);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Map vertical scroll progress inside the section → horizontal position
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const line1 = useTransform(scrollYProgress, [0, 0.33], [0, 1]);
  const line2 = useTransform(scrollYProgress, [0.33, 0.66], [0, 1]);
  const line3 = useTransform(scrollYProgress, [0.66, 1], [0, 1]);
  const lines = [line1, line2, line3];

  const c2Bg = useTransform(scrollYProgress, [0.3, 0.33], ["rgba(229,25,42,0)", "rgba(229,25,42,1)"]);
  const c3Bg = useTransform(scrollYProgress, [0.63, 0.66], ["rgba(229,25,42,0)", "rgba(229,25,42,1)"]);
  const c4Bg = useTransform(scrollYProgress, [0.96, 1], ["rgba(229,25,42,0)", "rgba(229,25,42,1)"]);
  
  const c2Text = useTransform(scrollYProgress, [0.3, 0.33], ["#e5192a", "#ffffff"]);
  const c3Text = useTransform(scrollYProgress, [0.63, 0.66], ["#e5192a", "#ffffff"]);
  const c4Text = useTransform(scrollYProgress, [0.96, 1], ["#e5192a", "#ffffff"]);

  const x        = useTransform(scrollYProgress, [0, 1], [0, endX]);
  
  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative bg-[#eceff3]"
      style={{ height: "420vh" }}
    >
      {/* ── Sticky viewport — stays at top while user scrolls through the section ── */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="flex-none px-6 md:px-14 pt-10 pb-5">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
            <div>
              <p
                className="text-[12px] font-bold uppercase tracking-[0.22em] mb-2"
                style={{ color: "#e5192a" }}
              >
                Our Process
              </p>
              <h2
                className="text-[2.4rem] sm:text-[3.2rem] md:text-[4rem] font-bold uppercase leading-none tracking-tight"
                style={{ color: "#111111" }}
              >
                How We <span style={{ color: "#e5192a" }}>Work</span>
              </h2>
            </div>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "#bbb" }}>
              scroll to advance →
            </p>
          </div>
        </div>

        {/* ── Columns area ── */}
        <div className="relative flex-1 overflow-hidden flex flex-col justify-end">

          {/* Floor line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px] z-10"
            style={{ background: "rgba(229,25,42,0.15)" }}
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
              {STEPS.map((step, i) => (
                <div
                  key={`tl-${step.num}`}
                  style={{ width: "clamp(240px, 32vw, 420px)" }}
                  className="flex-shrink-0 relative flex flex-col items-center"
                >
                  {/* Connecting red line */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="absolute top-[23px] left-[calc(50%+24px)] h-[2px] w-[calc(100%-48px+2rem)] md:w-[calc(100%-48px+3.5rem)] overflow-hidden"
                    >
                      <motion.div 
                        className="h-full bg-[#e5192a] origin-left" 
                        style={{ scaleX: lines[i] }} 
                      />
                    </div>
                  )}

                  {/* Number Circle */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center w-[48px] h-[48px] rounded-full border-2 border-[#e5192a] font-black text-[16px] shadow-[0_4px_12px_rgba(229,25,42,0.30)]"
                    style={{
                      backgroundColor: i === 0 ? "#e5192a" : (i === 1 ? c2Bg : (i === 2 ? c3Bg : c4Bg)),
                      color: i === 0 ? "#ffffff" : (i === 1 ? c2Text : (i === 2 ? c3Text : c4Text))
                    }}
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
              {STEPS.map((step, i) => (
                <div
                  key={`pl-${step.num}`}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    width: "clamp(240px, 32vw, 420px)",
                    height: COL_HEIGHTS[i],
                    background: "#eceff3",
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
                      fontSize: "clamp(13px, 1.4vw, 15px)",
                      lineHeight: "180%",
                      color: "#555",
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
              <div style={{ flexShrink: 0, width: "clamp(24px, 6vw, 56px)" }} aria-hidden />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
