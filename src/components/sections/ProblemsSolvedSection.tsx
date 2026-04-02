"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════════════════════ */

const CARDS = [
  {
    num: "01",
    problem: {
      headline: "YOU LOOK LIKE EVERYONE ELSE",
      desc: "Generic logos, template websites, and recycled visuals make you invisible. Clients can't tell you apart — and choose whoever they remember.",
    },
    solution: {
      headline: "A BRAND THAT OWNS THE ROOM",
      desc: "A signature identity that's unmistakably yours. Clients recognise you and choose you before reading your pitch.",
    },
  },
  {
    num: "02",
    problem: {
      headline: "YOUR WEBSITE LEAKS REVENUE",
      desc: "Slow load times, confusing copy, and zero hierarchy kill conversions daily. Visitors land and leave in seconds — you never knew they were there.",
    },
    solution: {
      headline: "A SITE THAT SELLS WHILE YOU SLEEP",
      desc: "Performance-first builds with conversion architecture baked in. Every CTA engineered to turn visitors into booked calls.",
    },
  },
  {
    num: "03",
    problem: {
      headline: "MARKETING SPEND. ZERO RETURN.",
      desc: "Ad budgets burned on wrong audiences, wrong messages, wrong platforms. Paying for clicks that never become clients.",
    },
    solution: {
      headline: "EVERY POUND WORKS HARDER",
      desc: "Data-led targeting, tested creative, continuous optimisation. We scale what converts — nothing else.",
    },
  },
  {
    num: "04",
    problem: {
      headline: "YOU'RE DOING IT ALL YOURSELF",
      desc: "Writing content, chasing leads, editing reels — trapped in a one-person marketing department. Growth is stalling.",
    },
    solution: {
      headline: "A FULL CREATIVE TEAM BEHIND YOU",
      desc: "Strategy, design, content, automation — handled. Focus on growth, not production.",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export default function ProblemsSolvedSection() {
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <>
      {/* ── Lion Paw ── */}
      <img
        src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className={[
          "fixed bottom-0 right-0 z-50 w-[180px] md:w-[280px]",
          "pointer-events-none select-none",
          "transition-transform duration-700 ease-out",
          revealed
            ? "translate-x-0 translate-y-0 -rotate-6"
            : "translate-x-full translate-y-full rotate-0",
        ].join(" ")}
        style={{ filter: "drop-shadow(0 0 24px rgba(240, 201, 23, 0.55))" }}
      />

      {/* ── Section ── */}
      <section
        ref={sectionRef}
        className="bg-bg-dark relative overflow-hidden py-[80px] md:py-[180px]"
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">

          {/* Label */}
          <motion.p
            {...fadeUp(0)}
            className="text-[13px] font-semibold uppercase tracking-[0.2em] text-brand-red mb-5"
          >
            The Reality
          </motion.p>

          {/* Headline */}
          <motion.h2
            {...fadeUp(0.1)}
            className="max-w-[800px] text-[2.4rem] font-bold uppercase leading-[1.05] tracking-tight text-text-main sm:text-[3rem] md:text-[4rem] lg:text-[5rem]"
          >
            Sound Familiar?
            <br />
            Problems We{" "}
            <span className="text-brand-red">Solve</span>
          </motion.h2>

          {/* Sub-line */}
          <motion.p
            {...fadeUp(0.2)}
            className="mt-5 text-[15px] leading-[170%] text-text-muted md:text-[17px]"
          >
            Every brand we&apos;ve worked with started exactly here.
          </motion.p>

          {/* Cards */}
          <motion.div
            {...fadeUp(0.3)}
            className="mt-12 flex flex-col gap-4 md:mt-16"
          >
            {CARDS.map((card, i) => (
              <div
                key={card.num}
                className="relative overflow-hidden rounded-[20px]"
              >
                {/* ── Solution card (defines layout height) ── */}
                <div className="w-full min-h-[180px] bg-bg-off-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Green checkmark */}
                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="white"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-green-600">
                      Fixed
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold uppercase leading-tight tracking-tight text-bg-brand-black md:text-[22px]">
                    {card.solution.headline}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[165%] text-black/60 md:text-[15px]">
                    {card.solution.desc}
                  </p>
                </div>

                {/* ── Problem overlay (slides down on reveal) ── */}
                <div
                  className={[
                    "absolute inset-0 bg-[#111111] border border-white/[0.08] p-6 md:p-8",
                    "transition-transform ease-in-out duration-500",
                    revealed ? "translate-y-full" : "translate-y-0",
                  ].join(" ")}
                  style={{
                    transitionDelay: revealed
                      ? `${i * 100}ms`
                      : `${(3 - i) * 100}ms`,
                  }}
                >
                  <span className="block text-[11px] font-bold tracking-[0.25em] text-brand-red mb-4">
                    {card.num}
                  </span>
                  <h3 className="text-[18px] font-bold uppercase leading-tight tracking-tight text-text-main md:text-[22px]">
                    {card.problem.headline}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[165%] text-text-muted md:text-[15px]">
                    {card.problem.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── Gold Button ── */}
          <motion.div
            {...fadeUp(0.4)}
            className="mt-12 flex flex-col items-center md:mt-14"
          >
            <div className="relative inline-block">
              {/* Idle pulse ring */}
              {!revealed && (
                <span className="absolute inset-0 rounded-full border border-brand-gold/50 animate-ping" />
              )}
              <button
                onClick={() => setRevealed((v) => !v)}
                className="relative z-10 rounded-full border-2 border-brand-gold px-10 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-brand-gold transition-colors duration-300 hover:bg-brand-gold/10"
              >
                {revealed ? "Reset" : "Fix All Of This"}
              </button>
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-widest text-text-muted/50">
              {revealed ? "click to reset" : "click to reveal the fix"}
            </p>
          </motion.div>

        </div>
      </section>
    </>
  );
}
