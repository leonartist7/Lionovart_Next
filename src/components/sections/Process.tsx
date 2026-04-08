"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// ─── Step data ─────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Discovery & Strategy",
    description:
      "We learn your business, your audience, and your standards. We ask the questions most agencies skip — because the best creative work starts with clarity, not assumptions.",
    tag: "Foundation",
  },
  {
    num: "02",
    title: "Creative Concepts",
    description:
      "We develop two to three creative directions and refine with you until the visual language feels unmistakably yours. No surprises. No wasted revisions.",
    tag: "Design",
  },
  {
    num: "03",
    title: "Build & Refine",
    description:
      "We bring the concepts to life — websites, video, social, print — all built to the same standard and reviewed with you at every stage.",
    tag: "Execution",
  },
  {
    num: "04",
    title: "Launch & Scale",
    description:
      "Your brand goes live. We don't just hand over the keys — we set up the systems, track the results, and stay available for what comes next.",
    tag: "Growth",
  },
] as const;

// Each column taller than the last — bar-chart growth effect
const COL_HEIGHTS = [
  "clamp(150px, 26vh, 230px)",
  "clamp(210px, 38vh, 320px)",
  "clamp(275px, 50vh, 420px)",
  "clamp(340px, 64vh, 530px)",
] as const;

// Top accent bar gets thicker as steps advance
const TOP_BAR_H = [3, 5, 8, 12] as const;

// Column backgrounds — subtly warmer/deeper red tint as steps grow
const COL_BGS = [
  "linear-gradient(180deg,#ffffff 0%,#fff9f9 100%)",
  "linear-gradient(180deg,#ffffff 0%,#fff3f3 100%)",
  "linear-gradient(180deg,#fff8f8 0%,#ffe8e8 100%)",
  "linear-gradient(180deg,#fff5f5 0%,#ffd8d8 100%)",
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

  const x        = useTransform(scrollYProgress, [0, 1], [0, endX]);
  const barWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative bg-white"
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

          {/* Scroll progress bar */}
          <div
            className="h-[2px] rounded-full overflow-hidden"
            style={{ background: "rgba(229,25,42,0.12)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ width: barWidth, background: "#e5192a" }}
            />
          </div>
        </div>

        {/* ── Columns area ── */}
        <div className="relative flex-1 overflow-hidden flex flex-col justify-end">

          {/* Rising particles */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden
          >
            <style>{`
              @keyframes particle-rise {
                0%   { transform: translateY(0);      opacity: var(--p-op); }
                70%  {                                 opacity: var(--p-op); }
                100% { transform: translateY(-105vh); opacity: 0; }
              }
            `}</style>
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: p.left,
                  width: p.sz,
                  height: p.sz,
                  borderRadius: "50%",
                  background: "#e5192a",
                  ["--p-op" as string]: p.op,
                  animation: `particle-rise ${p.dur}s ${p.del}s ease-out infinite`,
                }}
              />
            ))}
          </div>

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
            className="flex items-end gap-4 md:gap-6 px-6 md:px-14 will-change-transform"
          >
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                style={{
                  position: "relative",
                  flexShrink: 0,
                  width: "clamp(230px, 36vw, 460px)",
                  height: COL_HEIGHTS[i],
                  background: COL_BGS[i],
                  borderRadius: "16px 16px 0 0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "clamp(18px, 2.5vw, 28px)",
                  boxShadow:
                    "0 -6px 28px rgba(229,25,42,0.07), inset 0 0 0 1px rgba(229,25,42,0.09)",
                  overflow: "hidden",
                }}
              >
                {/* Top accent bar — grows thicker each step */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: TOP_BAR_H[i],
                    background: "#e5192a",
                    borderRadius: "16px 16px 0 0",
                  }}
                  aria-hidden
                />

                {/* Ghost number watermark */}
                <span
                  style={{
                    position: "absolute",
                    bottom: -16,
                    right: -8,
                    fontSize: "clamp(80px, 12vw, 130px)",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "rgba(229,25,42,0.05)",
                    pointerEvents: "none",
                    userSelect: "none",
                    fontFamily: "var(--font-heading, sans-serif)",
                  }}
                  aria-hidden
                >
                  {step.num}
                </span>

                {/* Top section — number + tag + title */}
                <div style={{ paddingTop: TOP_BAR_H[i] + 10 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "#e5192a",
                      boxShadow: "0 4px 12px rgba(229,25,42,0.30)",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 13,
                      marginBottom: 10,
                    }}
                  >
                    {step.num}
                  </div>

                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "100px",
                      background: "rgba(229,25,42,0.08)",
                      color: "#e5192a",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      marginBottom: 10,
                    }}
                  >
                    {step.tag}
                  </div>

                  <h3
                    style={{
                      fontSize: "clamp(16px, 2vw, 22px)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.15,
                      color: "#111111",
                      margin: 0,
                    }}
                  >
                    {step.title}
                  </h3>
                </div>

                {/* Description — only has room from column 2 onwards, col 1 is short */}
                <p
                  style={{
                    fontSize: "clamp(12px, 1.3vw, 14px)",
                    lineHeight: "170%",
                    color: "#666",
                    margin: 0,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: i === 0 ? 2 : i === 1 ? 3 : 4,
                    WebkitBoxOrient: "vertical",
                  } as React.CSSProperties}
                >
                  {step.description}
                </p>
              </div>
            ))}

            {/* Trailing spacer keeps last column away from the edge */}
            <div style={{ flexShrink: 0, width: "clamp(24px, 6vw, 56px)" }} aria-hidden />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
