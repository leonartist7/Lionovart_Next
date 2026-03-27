"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const cards = [
  {
    num: "01",
    problem: {
      heading: "You Look Like Everyone Else",
      body: "Generic logos, template websites, and recycled visuals make you invisible. Clients can't remember you — and they choose whoever they can.",
    },
    solution: {
      heading: "A Brand That Owns the Room",
      body: "We craft a signature identity that's unmistakably yours. Clients recognise you, remember you, and choose you before even reading your pitch.",
    },
  },
  {
    num: "02",
    problem: {
      heading: "Your Website Leaks Revenue",
      body: "Slow load times, confusing copy, and zero hierarchy kill conversions daily. Visitors land and leave within seconds — you never even know they were there.",
    },
    solution: {
      heading: "A Site That Sells While You Sleep",
      body: "Performance-first builds with conversion architecture baked in. Every scroll, headline, and CTA is engineered to turn visitors into booked calls.",
    },
  },
  {
    num: "03",
    problem: {
      heading: "Marketing Spend With No Returns",
      body: "Ad budgets burned on the wrong audiences, wrong messages, and wrong platforms. You're paying for clicks that never become clients.",
    },
    solution: {
      heading: "Every Pound Works Harder",
      body: "Data-led targeting, tested creative, and continuous optimisation. We track what actually converts and scale what works — nothing else.",
    },
  },
  {
    num: "04",
    problem: {
      heading: "You're Stuck Doing It All Yourself",
      body: "Writing content, chasing leads, editing reels — you're a business owner trapped in a marketing department of one. Growth is stalling while you're in the weeds.",
    },
    solution: {
      heading: "A Full Creative Team Behind You",
      body: "Strategy, design, content, and automation — handled. We plug in as your dedicated agency so you focus on delivery and growth, not production.",
    },
  },
];

interface FlipCardProps {
  card: (typeof cards)[number];
  index: number;
}

function FlipCard({ card, index }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="relative h-[340px] md:h-[380px] cursor-pointer"
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        type: "spring",
        stiffness: 280,
        damping: 22,
      }}
      onHoverStart={() => setFlipped(true)}
      onHoverEnd={() => setFlipped(false)}
      onClick={() => setFlipped((f) => !f)}
    >
      {/* Card inner — the thing that flips */}
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* ── FRONT — Problem ── */}
        <div
          className="absolute inset-0 rounded-[20px] p-7 flex flex-col justify-between overflow-hidden border border-white/5"
          style={{
            backfaceVisibility: "hidden",
            background:
              "linear-gradient(145deg, #1a0505 0%, #2d0a0a 60%, #1a0505 100%)",
          }}
        >
          {/* Ghost number */}
          <span
            className="absolute top-4 right-5 text-[96px] font-bold font-clash leading-none select-none pointer-events-none"
            style={{ color: "rgba(229,25,42,0.08)" }}
          >
            {card.num}
          </span>

          {/* Pulsing dot + label */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-60" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red" />
            </span>
            <span className="text-brand-red text-[13px] font-clash uppercase tracking-widest">
              The Problem
            </span>
          </div>

          <div>
            <h3 className="text-text-main font-clash font-bold text-[22px] md:text-[26px] uppercase leading-tight mb-3">
              {card.problem.heading}
            </h3>
            <p className="text-text-muted text-[15px] leading-relaxed">
              {card.problem.body}
            </p>
          </div>

          {/* Hover hint */}
          <p className="text-white/25 text-[12px] font-clash uppercase tracking-wider">
            Hover to see the fix →
          </p>
        </div>

        {/* ── BACK — Solution ── */}
        <div
          className="absolute inset-0 rounded-[20px] p-7 flex flex-col justify-between overflow-hidden border border-brand-gold/15"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background:
              "linear-gradient(145deg, #1a1400 0%, #2d2200 60%, #1a1400 100%)",
          }}
        >
          {/* Ghost number */}
          <span
            className="absolute top-4 right-5 text-[96px] font-bold font-clash leading-none select-none pointer-events-none"
            style={{ color: "rgba(240,201,23,0.08)" }}
          >
            {card.num}
          </span>

          {/* Gold accent line + label */}
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-6 bg-brand-gold rounded-full" />
            <span className="text-brand-gold text-[13px] font-clash uppercase tracking-widest">
              The Solution
            </span>
          </div>

          <div>
            {/* Checkmark */}
            <div className="w-9 h-9 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center mb-4">
              <svg
                className="w-4 h-4 text-brand-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-text-main font-clash font-bold text-[22px] md:text-[26px] uppercase leading-tight mb-3">
              {card.solution.heading}
            </h3>
            <p className="text-text-muted text-[15px] leading-relaxed">
              {card.solution.body}
            </p>
          </div>

          <div className="h-[2px] w-full bg-gradient-to-r from-brand-gold/40 via-brand-gold/10 to-transparent rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Reality() {
  return (
    <section className="bg-bg-dark py-[90px] lg:py-[180px]">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <motion.p
            className="text-brand-red text-[16px] font-clash uppercase tracking-widest mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            The Reality
          </motion.p>
          <motion.h2
            className="text-[56px] md:text-[78px] font-bold font-clash uppercase leading-none text-text-main max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Problems We{" "}
            <span className="text-brand-red">Solve</span>
          </motion.h2>
          <motion.p
            className="mt-6 text-[18px] text-text-muted font-clash max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Hover each card to see exactly how we fix it.
          </motion.p>
        </div>

        {/* 2×2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {cards.map((card, i) => (
            <FlipCard key={card.num} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
