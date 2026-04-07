"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ─── Outcome cards data ────────────────────────────────────────── */
const OUTCOMES = [
  {
    category: "Branding",
    statement: "A brand identity they're proud to show clients, investors, and partners.",
  },
  {
    category: "Web Design",
    statement: "A website that converts visitors — not just impresses them.",
  },
  {
    category: "A/V Production",
    statement: "Campaign content that stops the scroll and actually gets watched.",
  },
  {
    category: "Social & Content",
    statement: "A consistent presence that builds authority without draining their time.",
  },
  {
    category: "AI & Automation",
    statement: "Lead pipelines that run while they sleep — no manual follow-up.",
  },
  {
    category: "Full Scope",
    statement: "One team handling everything — no briefing six different vendors.",
  },
  {
    category: "Brand Strategy",
    statement: "Clarity on exactly who they're talking to — and why those people should care.",
  },
  {
    category: "Rebranding",
    statement: "A complete visual overhaul that positions them as the premium option in the room.",
  },
];

/* ─── Single outcome card ───────────────────────────────────────── */
function OutcomeCard({
  item,
  index,
}: {
  item: (typeof OUTCOMES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: (index % 4) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col gap-4 rounded-[20px] border border-white/8 bg-[#111111] p-6 md:p-7"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-red">
        {item.category}
      </span>
      <p className="text-[15px] sm:text-[16px] leading-[160%] text-white/80 font-medium flex-1">
        {item.statement}
      </p>
    </motion.div>
  );
}

/* ─── Main section ──────────────────────────────────────────────── */
export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      id="testimonials"
      className="bg-bg-dark py-[80px] md:py-[140px] overflow-hidden"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">

        {/* Heading */}
        <div className="mb-14 md:mb-20 text-center">
          <motion.p
            className="text-brand-red text-[13px] font-semibold uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            Why They Choose Us
          </motion.p>
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] font-bold uppercase leading-none tracking-tight text-text-main"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            What Clients{" "}
            <span className="text-brand-red">Come To Us For</span>
          </motion.h2>
          <motion.p
            className="mt-5 text-[15px] text-white/45 max-w-[520px] mx-auto leading-[160%]"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            The outcomes clients prioritize — drawn from conversations across
            50+ projects in 9 languages.
          </motion.p>
        </div>

        {/* 8-card grid: 1 col → 2 col → 4 col */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((item, i) => (
            <OutcomeCard key={item.category} item={item} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
