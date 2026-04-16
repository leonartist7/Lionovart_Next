"use client";

import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Animation timing constants ───────────────────────────────────────────────
const PAW_IN_DURATION = 0.35;
const PULL_DURATION   = 0.70;

const EASE_IN  = [0.2, 0, 0.6, 1]  as const;
const EASE_OUT = [0.20, 1, 0.3, 1] as const;

// ─── Single Card ──────────────────────────────────────────────────────────────
function ProblemCard({
  item,
  isRevealed,
  onToggle,
}: {
  item: { problem: { heading: string; body: string }; solution: { heading: string; body: string } };
  isRevealed: boolean;
  onToggle: () => void;
}) {
  const cardControls = useAnimation();
  const pawControls  = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  const runReveal = async () => {
    await pawControls.set({ x: "-70%", y: "0%", rotate: -6, scale: 0.9 });
    pawControls.start({
      x: "-10%", y: "0%", rotate: 0, scale: 1.15,
      transition: { duration: PAW_IN_DURATION, ease: EASE_OUT },
    });
    await new Promise(r => setTimeout(r, PAW_IN_DURATION * 1000 * 0.85));
    Promise.all([
      cardControls.start({ y: "105%", transition: { duration: PULL_DURATION, ease: EASE_IN } }),
      pawControls.start({ y: "105%", x: "-10%", rotate: 4, scale: 1.05, transition: { duration: PULL_DURATION, ease: EASE_IN } }),
    ]);
  };

  const runReset = async () => {
    await Promise.all([
      cardControls.start({ y: "0%", transition: { duration: PULL_DURATION, ease: EASE_OUT } }),
      pawControls.start({ y: "0%", x: "-10%", rotate: 0, scale: 1.15, transition: { duration: PULL_DURATION, ease: EASE_OUT } }),
    ]);
    await new Promise(r => setTimeout(r, 60));
    await pawControls.start({ x: "-50%", rotate: -6, scale: 0.9, transition: { duration: PAW_IN_DURATION, ease: EASE_IN } });
    pawControls.set({ y: "0%" });
  };

  const handleClick = () => {
    onToggle();
    if (!isRevealed) runReveal(); else runReset();
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full cursor-pointer"
    >
      <div
        className="
          relative w-full overflow-hidden
          rounded-[16px] md:rounded-[20px]
          shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.04)]
          ring-1 ring-white/[0.06]
          h-[130px] sm:h-[145px] md:h-[160px] lg:h-[175px]
        "
      >
        {/* ── BASE LAYER: SOLUTION — cards.webp stretched to fill card shape ── */}
        <div className="absolute inset-0 flex flex-col justify-center">
          <Image
            src="/images/cards.webp"
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 900px) 120vw, 60vw"
            className="object-fill"
            priority
          />
          {/* Centered content */}
          <div className="relative z-10 p-5 md:p-7 flex flex-col items-center justify-center h-full text-center gap-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 md:w-4.5 md:h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-clash font-bold text-[14px] md:text-[18px] uppercase leading-tight m-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {item.solution.heading}
              </h3>
            </div>
            <p className="text-white/90 font-sans text-[13px] md:text-[15px] leading-[1.5] drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] max-w-[90%]">
              {item.solution.body}
            </p>
          </div>
        </div>

        {/*
          ── OVERLAY LAYER: PROBLEM (black, pulled down by paw) ──
          All pain cards are #181818 black with centered text.
        */}
        <motion.div
          className="absolute inset-0 z-10 bg-[#181818] p-5 md:p-7 flex flex-col items-center justify-center text-center"
          initial={{ y: "0%" }}
          animate={cardControls}
        >
          <div className="flex flex-col items-center gap-2 max-w-[90%]">
            <h3 className="text-white font-clash font-bold text-[14px] md:text-[18px] uppercase leading-tight m-0">
              {item.problem.heading}
            </h3>
            <p className="text-white/70 font-sans text-[13px] md:text-[15px] leading-[1.5]">
              {item.problem.body}
            </p>
          </div>
        </motion.div>

      {/* ── LION PAW ── inside overflow-hidden, clipped at card left edge */}
      {/* ↓ Tune x in initial (and the matching line in runReset) to set the resting peek amount.
           -75% shows ~25% of the paw as a sliver. More negative = less visible. */}
      <motion.div
        className="pointer-events-none absolute z-20 bottom-0"
        initial={{ x: "-50%", y: "0%", rotate: -6, scale: 0.9 }}
        animate={pawControls}
        style={{ left: 0, width: "clamp(95px, 85%, 145px)", aspectRatio: "1 / 1" }}
      >
        {/* Inner wrapper — hover scale only, independent of reveal animation */}
        <motion.div
          className="relative w-full h-full"
          animate={{ scale: isHovered && !isRevealed ? 1.12 : 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
        >
          <div className="relative w-full h-full drop-shadow-[0_0_30px_rgba(240,201,23,0.55)]">
            <Image
              src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png"
              alt=""
              aria-hidden="true"
              fill
              sizes="50vw"
              className="object-contain object-bottom-left"
            />
          </div>
        </motion.div>
      </motion.div>

      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function ProblemsSolvedSection() {
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const { t } = useLanguage();

  const items = t.problems.items.map((item) => ({
    problem: item.problem,
    solution: item.solution,
  }));

  const toggleCard = (idx: number) => {
    setRevealedIds(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className="relative bg-[#e5192a] py-12 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 relative z-10">

        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col items-center text-center">
          <p className="text-white text-[12px] md:text-[14px] font-clash uppercase tracking-[0.2em] mb-2 md:mb-3">
            {t.problems.eyebrow}
          </p>
          <h2 className="text-[40px] sm:text-[56px] md:text-[76px] font-bold font-clash uppercase leading-[1.05] text-white max-w-4xl">
            {t.problems.heading}
          </h2>
        </div>

        {/* 2-column grid — equal height rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {items.map((item, i) => (
            <ProblemCard
              key={i}
              item={item}
              isRevealed={revealedIds.includes(i)}
              onToggle={() => toggleCard(i)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
