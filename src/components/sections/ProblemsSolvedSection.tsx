"use client";

import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

// ─── Animation timing constants ───────────────────────────────────────────────
// Phase 1 (paw slides in from left):  0s → PAW_IN_DURATION
// Phase 2 (paw + card pull down together): starts at PAW_IN_DURATION
// Total duration kept matching for smooth feel
const PAW_IN_DURATION  = 0.38; // how long the paw takes to slide in
const PULL_DURATION    = 0.72; // how long the pull-down takes
const TOTAL_DURATION   = PAW_IN_DURATION + PULL_DURATION;

const EASE_IN  = [0.4, 0, 0.6, 1]  as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const items = [
  {
    num: "01",
    problem: {
      heading: "You Look Like Everyone Else",
      body: "Generic logos, template websites, recycled visuals. You blend in and clients pick whoever they remember. It's rarely you.",
    },
    solution: {
      heading: "A Brand That Owns The Room",
      body: "A signature identity that's unmistakably yours. Clients recognise you and choose you before reading your pitch.",
    },
  },
  {
    num: "02",
    problem: {
      heading: "Your Website Leaks Revenue",
      body: "Slow, confusing, no clear direction. Visitors leave in seconds and you never even knew they came.",
    },
    solution: {
      heading: "A Site That Sells While You Sleep",
      body: "Performance-first builds with conversion architecture baked in. Every CTA engineered to turn visitors into booked calls.",
    },
  },
  {
    num: "03",
    problem: {
      heading: "Marketing Spend. Zero Return.",
      body: "Wrong audience, wrong message, wrong platform. You're paying for clicks that never turn into clients.",
    },
    solution: {
      heading: "Every Dollar Works Harder",
      body: "Data-led targeting, tested creative, continuous optimisation. We scale what converts — nothing else.",
    },
  },
  {
    num: "04",
    problem: {
      heading: "You're Doing It All Yourself",
      body: "Writing content, chasing leads, editing reels. You're a business owner stuck running a one-person marketing team.",
    },
    solution: {
      heading: "A Full Creative Team Behind You",
      body: "Strategy, design, content, automation — handled. Focus on growth, not production.",
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

  // ── REVEAL (pull down) ──
  const runReveal = async () => {
    // Immediately reset paw to starting position (hidden below-left, off-screen)
    await pawControls.set({ x: "-110%", y: "0%", rotate: -6, scale: 0.9 });

    // Phase 1: paw slides in quickly from the left bottom corner
    pawControls.start({
      x: "-10%",
      y: "0%",
      rotate: 0,
      scale: 1,
      transition: { duration: PAW_IN_DURATION, ease: EASE_OUT },
    });

    // Phase 2 (after paw grabs): both paw and card slide down together
    await new Promise(r => setTimeout(r, PAW_IN_DURATION * 1000 * 0.85));

    Promise.all([
      cardControls.start({
        y: "105%",
        transition: { duration: PULL_DURATION, ease: EASE_IN },
      }),
      pawControls.start({
        y: "105%",
        x: "-10%",
        rotate: 4,
        scale: 0.95,
        transition: { duration: PULL_DURATION, ease: EASE_IN },
      }),
    ]);
  };

  // ── RESET (push back up) ──
  const runReset = async () => {
    // Both come back up together
    await Promise.all([
      cardControls.start({
        y: "0%",
        transition: { duration: PULL_DURATION, ease: EASE_OUT },
      }),
      pawControls.start({
        y: "0%",
        x: "-10%",
        rotate: 0,
        scale: 1,
        transition: { duration: PULL_DURATION, ease: EASE_OUT },
      }),
    ]);

    // Phase: paw retracts back to the left once card is settled
    await new Promise(r => setTimeout(r, 60));
    await pawControls.start({
      x: "-110%",
      rotate: -6,
      scale: 0.9,
      transition: { duration: PAW_IN_DURATION, ease: EASE_IN },
    });

    // Snap paw fully off-screen for next cycle
    pawControls.set({ y: "0%" });
  };

  const handleClick = () => {
    onToggle();
    if (!isRevealed) {
      runReveal();
    } else {
      runReset();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-full cursor-pointer group"
      title="Reveal the fix"
    >
      <div
        className="
          relative w-full overflow-hidden
          rounded-[16px] md:rounded-[20px]
          border border-white/10 group-hover:border-brand-gold/30 transition-colors duration-300
          h-[110px] sm:h-[120px] md:h-[130px] lg:h-[140px]
        "
      >
        {/* ── BASE LAYER: SOLUTION (white card, always behind) ── */}
        <div className="absolute inset-0 bg-bg-off-white p-5 md:p-8 flex flex-col justify-center">
          <div className="flex items-start md:items-center gap-3 mb-2">
            <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
              <svg
                className="w-3 h-3 md:w-3.5 md:h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={4}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-bg-brand-black font-clash font-bold text-[15px] md:text-[20px] uppercase leading-tight m-0">
              {item.solution.heading}
            </h3>
          </div>
          <p className="text-[#4a4a4a] font-sans text-[12px] md:text-[14px] leading-[1.6]">
            {item.solution.body}
          </p>
        </div>

        {/* ── OVERLAY LAYER: PROBLEM (black card, pulled down by paw) ── */}
        <motion.div
          className="absolute inset-0 z-10 bg-bg-brand-black p-5 md:p-8 flex flex-col items-start"
          initial={{ y: "0%" }}
          animate={cardControls}
        >
          <div className="relative z-30 flex items-start gap-3">
            <span className="shrink-0 text-brand-red font-clash font-bold text-[20px] md:text-[24px] opacity-90 leading-none mt-0.5">
              {item.num}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-text-main font-clash font-bold text-[15px] md:text-[20px] uppercase leading-tight m-0">
                {item.problem.heading}
              </h3>
              <p className="text-text-muted font-sans text-[12px] md:text-[14px] leading-[1.6]">
                {item.problem.body}
              </p>
            </div>
          </div>
        </motion.div>

        {/*
          ── LION PAW ──
          z-20 → always on top of the black card (z-10)
          Positioned at bottom-left of the container.
          left: "-10%" → 10% of paw hidden behind the left edge when "in"
          Starts fully off-screen at x: "-110%" y: "0%"
          The paw container uses a % size relative to the card width so it
          scales perfectly across all breakpoints.
        */}
        <motion.div
          className="pointer-events-none absolute z-20 bottom-0"
          initial={{ x: "-110%", y: "0%", rotate: -6, scale: 0.9 }}
          animate={pawControls}
          style={{ left: 0, width: "clamp(70px, 80%, 110px)", aspectRatio: "1 / 1" }}
        >
          <div className="relative w-full h-full drop-shadow-[0_0_24px_rgba(240,201,23,0.55)]">
            <Image
              src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451/Lion_emblem2PGbCnR_-_Imgur_t6jkfg.avif"
              alt="Lion Emblem"
              aria-hidden="true"
              fill
              sizes="42vw"
              className="object-contain object-bottom-left"
            />
          </div>
        </motion.div>

        {/* ── Subtle "click to reveal" hint (bottom-right corner) ── */}
        <div className="absolute bottom-3 right-4 z-30 pointer-events-none">
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] text-white/30 font-clash">
            {isRevealed ? "RESET" : "REVEAL THE FIX →"}
          </span>
        </div>
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
    <section className="relative bg-bg-dark py-12 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 relative z-10">

        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col items-center text-center">
          <p className="text-brand-red text-[12px] md:text-[14px] font-clash uppercase tracking-[0.2em] mb-2 md:mb-3">
            Problems We Solve
          </p>
          <h2 className="text-[40px] sm:text-[56px] md:text-[76px] font-bold font-clash uppercase leading-[1.05] text-text-main max-w-4xl">
            Sound Familiar?
          </h2>
        </div>

        {/*
          Grid: 2 columns always.
          `items-stretch` ensures equal-height rows.
          Cards use aspect-ratio internally so all 4 are identical at every size.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 items-stretch">
          {items.map((item, i) => (
            <ProblemCard
              key={item.num}
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
