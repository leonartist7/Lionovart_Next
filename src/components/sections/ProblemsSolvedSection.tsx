"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const items = [
  {
    num: "01",
    problem: {
      heading: "You Look Like Everyone Else",
      body: "Generic logos, template websites, and recycled visuals make you invisible. Clients can't tell you apart — and choose whoever they remember.",
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
      body: "Slow load times, confusing copy, and zero hierarchy kill conversions daily. Visitors land and leave in seconds — you never knew they were there.",
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
      body: "Ad budgets burned on wrong audiences, wrong messages, wrong platforms. Paying for clicks that never become clients.",
    },
    solution: {
      heading: "Every Pound Works Harder",
      body: "Data-led targeting, tested creative, continuous optimisation. We scale what converts — nothing else.",
    },
  },
  {
    num: "04",
    problem: {
      heading: "You're Doing It All Yourself",
      body: "Writing content, chasing leads, editing reels — trapped in a one-person marketing department. Growth is stalling.",
    },
    solution: {
      heading: "A Full Creative Team Behind You",
      body: "Strategy, design, content, automation — handled. Focus on growth, not production.",
    },
  },
];

export default function ProblemsSolvedSection() {
  const [revealedIds, setRevealedIds] = useState<number[]>([]);

  const toggleCard = (idx: number) => {
    if (revealedIds.includes(idx)) {
      setRevealedIds(revealedIds.filter(i => i !== idx));
    } else {
      setRevealedIds([...revealedIds, idx]);
    }
  };

  return (
    <section className="relative bg-bg-dark py-12 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 relative z-10">

        {/* Header */}
        <div className="mb-8 md:mb-10 flex flex-col items-center text-center">
          <p className="text-brand-red text-[12px] md:text-[14px] font-clash uppercase tracking-[0.2em] mb-2 md:mb-3">
            Problems We Solve
          </p>
          <h2 className="text-[40px] sm:text-[56px] md:text-[76px] font-bold font-clash uppercase leading-[1.05] text-text-main max-w-4xl">
            Sound Familiar?
          </h2>
        </div>

        {/* Dynamic 1-to-2 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
          {items.map((item, i) => {
            const isCardRevealed = revealedIds.includes(i);

            return (
              <div
                key={item.num}
                onClick={() => toggleCard(i)}
                className="relative w-full cursor-pointer group"
                title="Click to reveal solution"
              >
                {/* --- MASKED AREA (Contains the cards) --- */}
                <div className="relative w-full h-full overflow-hidden rounded-[16px] md:rounded-[20px] border border-white/10 group-hover:border-brand-gold/30 transition-colors">

                  {/* BASE LAYER: SOLUTION */}
                  <div className="bg-bg-off-white w-full h-full p-5 md:p-8 flex flex-col justify-center">
                    <div className="flex items-start md:items-center gap-3 mb-2">
                      <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
                        <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-bg-brand-black font-clash font-bold text-[17px] md:text-[22px] uppercase leading-tight m-0">
                        {item.solution.heading}
                      </h3>
                    </div>
                    <p className="text-[#4a4a4a] font-sans text-[13px] md:text-[15px] leading-[1.6]">
                      {item.solution.body}
                    </p>
                  </div>

                  {/* OVERLAY LAYER: PROBLEM */}
                  <motion.div
                    className="absolute inset-0 z-10 w-full h-full bg-bg-brand-black p-5 md:p-8 flex flex-col items-start"
                    initial={false}
                    animate={{ y: isCardRevealed ? "105%" : "0%" }}
                    transition={{
                      duration: 1.4,
                      delay: isCardRevealed ? 0.5 : 0,
                      ease: [0.25, 1, 0.5, 1],
                    }}
                  >
                    <div className="relative w-full">
                      {/* --- LION PAW — slides right from left edge, clipped by overflow-hidden --- */}
                      <motion.div
                        className="pointer-events-none absolute z-20 -top-2 left-1"
                        style={{ transformOrigin: "50% 50%" }}
                        initial={false}
                        animate={
                          isCardRevealed
                            ? {
                                x: ["-70%", "0%", "3%", "0%"],
                                y: ["0px", "0px", "3px", "0px"],
                                rotate: [0, 0, 20, 40],
                                scale: [0.7, 1, 1, 0.9],
                              }
                            : {
                                x: ["0%", "0%", "-70%"],
                                y: ["0px", "0px", "0px"],
                                rotate: [40, 0, 0],
                                scale: [0.9, 1, 0.7],
                              }
                        }
                        transition={{
                          duration: 0.8,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <div className="relative w-[180px] h-[180px] md:w-[220px] md:h-[220px] drop-shadow-[0_0_20px_rgba(240,201,23,0.5)]">
                          <Image
                            src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png"
                            alt="Lion Paw swipe"
                            aria-hidden="true"
                            fill
                            sizes="(max-width: 768px) 180px, 220px"
                            className="object-contain"
                          />
                        </div>
                      </motion.div>

                      {/* Problem text — below the paw */}
                      <div className="flex items-start md:items-center gap-3 mb-2 pt-[70px]">
                        <span className="text-brand-red font-clash font-bold text-[20px] md:text-[24px] opacity-90 leading-none mt-0.5 md:mt-0">
                          {item.num}
                        </span>
                        <h3 className="text-text-main font-clash font-bold text-[17px] md:text-[22px] uppercase leading-tight m-0">
                          {item.problem.heading}
                        </h3>
                      </div>
                      <p className="text-text-muted font-sans text-[13px] md:text-[15px] leading-[1.6]">
                        {item.problem.body}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
