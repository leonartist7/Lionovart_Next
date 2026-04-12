"use client";

import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

// ─── Animation timing constants ───────────────────────────────────────────────
const PAW_IN_DURATION = 0.38;
const PULL_DURATION   = 0.72;

const EASE_IN  = [0.4, 0, 0.6, 1]  as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const items = [
  {
    useGoldenSolution: false,
    problem: {
      heading: "You Look Like Everyone Else",
      body: "You blend in — and clients pick whoever they remember first.",
    },
    solution: {
      heading: "A Brand That Stands Out Before You Say A Word",
      body: "Clients recognize you, remember you, and choose you before you've even pitched.",
    },
  },
  {
    useGoldenSolution: false,
    problem: {
      heading: "Your Phone Isn't Ringing Enough",
      body: "You're great at what you do — your clients love you. But new ones?",
    },
    solution: {
      heading: "Show Up First Where It Matters",
      body: "We get you found. The next person searching for what you do ends up at your door — not your competitor's.",
    },
  },
  {
    // Cards 3 & 4 — solution uses the golden card image as background
    useGoldenSolution: true,
    problem: {
      heading: "Marketing Strategy Isn't Enough",
      body: "You've spent real money trying to grow — Facebook ads, SEO agencies, generic content — yet don't know what actually worked.",
    },
    solution: {
      heading: "Strategies That Pay For Itself",
      body: "One team. Clear reports. Honest numbers. We track every dollar, cut what doesn't work, and double down on what does.",
    },
  },
  {
    useGoldenSolution: true,
    problem: {
      heading: "You're Running The Business And The Marketing And The Website And The Instagram",
      body: "It's 10pm. You're still editing a reel on your phone. You didn't start this business to become a full-time content creator — wait, did you?",
    },
    solution: {
      heading: "Your Full-Service Brand Creative Partner",
      body: "Enabling you to reclaim your time back. You focus on doing what you do best. We make it look, sound, and grow better than ever.",
    },
  },
];

// ─── Single Card ──────────────────────────────────────────────────────────────
function ProblemCard({
  item,
  isRevealed,
  onToggle,
}: {
  item: (typeof items)[0];
  isRevealed: boolean;
  onToggle: () => void;
}) {
  const cardControls = useAnimation();
  const pawControls  = useAnimation();

  const runReveal = async () => {
    await pawControls.set({ x: "-110%", y: "0%", rotate: -6, scale: 0.9 });
    pawControls.start({
      x: "-10%", y: "0%", rotate: 0, scale: 1,
      transition: { duration: PAW_IN_DURATION, ease: EASE_OUT },
    });
    await new Promise(r => setTimeout(r, PAW_IN_DURATION * 1000 * 0.85));
    Promise.all([
      cardControls.start({ y: "105%", transition: { duration: PULL_DURATION, ease: EASE_IN } }),
      pawControls.start({ y: "105%", x: "-10%", rotate: 4, scale: 0.95, transition: { duration: PULL_DURATION, ease: EASE_IN } }),
    ]);
  };

  const runReset = async () => {
    await Promise.all([
      cardControls.start({ y: "0%", transition: { duration: PULL_DURATION, ease: EASE_OUT } }),
      pawControls.start({ y: "0%", x: "-10%", rotate: 0, scale: 1, transition: { duration: PULL_DURATION, ease: EASE_OUT } }),
    ]);
    await new Promise(r => setTimeout(r, 60));
    await pawControls.start({ x: "-110%", rotate: -6, scale: 0.9, transition: { duration: PAW_IN_DURATION, ease: EASE_IN } });
    pawControls.set({ y: "0%" });
  };

  const handleClick = () => {
    onToggle();
    if (!isRevealed) runReveal(); else runReset();
  };

  return (
    <div onClick={handleClick} className="relative w-full cursor-pointer">
      <div
        className="
          relative w-full overflow-hidden
          rounded-[16px] md:rounded-[20px]
          shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.04)]
          ring-1 ring-white/[0.06]
          h-[130px] sm:h-[145px] md:h-[160px] lg:h-[175px]
        "
      >
        {/* ── BASE LAYER: SOLUTION ── */}
        {item.useGoldenSolution ? (
          /*
           * Cards 3 & 4 — golden image background.
           * object-contain keeps the entire image visible without any cropping.
           * The card background (#1a1008) fills the surrounding area so the
           * image sits cleanly inside the container with no clipping on any edge.
           */
          <div className="absolute inset-0 flex flex-col justify-center">
            <Image
              src="/images/Card golden.avif"
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-[center_65%]"
              priority
            />
            {/* Scrim for text legibility over the bright golden image */}
            <div className="absolute inset-0 bg-black/35" />
            {/* Centered content */}
            <div className="relative z-10 p-5 md:p-7 flex flex-col items-center justify-center h-full text-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
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
        ) : (
          /* Cards 1 & 2 — white/off-white solution */
          <div className="absolute inset-0 bg-bg-off-white p-5 md:p-7 flex flex-col items-center justify-center text-center gap-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-bg-brand-black font-clash font-bold text-[14px] md:text-[18px] uppercase leading-tight m-0">
                {item.solution.heading}
              </h3>
            </div>
            <p className="text-[#4a4a4a] font-sans text-[13px] md:text-[15px] leading-[1.5] max-w-[90%]">
              {item.solution.body}
            </p>
          </div>
        )}

        {/*
          ── OVERLAY LAYER: PROBLEM (black, pulled down by paw) ──
          All pain cards are #181818 black with centered text.
          No number, no hint label.
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

        {/* ── LION PAW ── z-20, bottom-left, clamped width for all breakpoints */}
        <motion.div
          className="pointer-events-none absolute z-20 bottom-0"
          initial={{ x: "-110%", y: "0%", rotate: -6, scale: 0.9 }}
          animate={pawControls}
          style={{ left: 0, width: "clamp(70px, 80%, 110px)", aspectRatio: "1 / 1" }}
        >
          <div className="relative w-full h-full drop-shadow-[0_0_24px_rgba(240,201,23,0.55)]">
            <Image
              src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png"
              alt=""
              aria-hidden="true"
              fill
              sizes="42vw"
              className="object-contain object-bottom-left"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function ProblemsSolvedSection() {
  const [revealedIds, setRevealedIds] = useState<number[]>([]);

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
          {/* Brighter label — white instead of white/70 */}
          <p className="text-white text-[12px] md:text-[14px] font-clash uppercase tracking-[0.2em] mb-2 md:mb-3">
            You Built Something Real
          </p>
          <h2 className="text-[40px] sm:text-[56px] md:text-[76px] font-bold font-clash uppercase leading-[1.05] text-white max-w-4xl">
            Sound Familiar?
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
