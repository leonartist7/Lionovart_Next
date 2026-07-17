"use client";

import { useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import MarqueeSlanted from "@/components/sections/MarqueeSlanted";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

const FEATURED = {
  quote: "Within two months of the new website, direct reservations jumped almost 70%. It finally looks like the place we actually run.",
  author: "Camille Moreau",
  role: "Owner · Maison Verre",
  avatar: "/images/Testimonials/France/Mathilde-coffee.avif",
  flag: "https://flagcdn.com/w40/fr.png",
};

// ─── Animation timing constants (PRESERVED EXACTLY from original) ──────────────
const PAW_IN_DURATION = 0.35;
const PULL_DURATION   = 0.70;

const EASE_IN  = [0.2, 0, 0.6, 1]  as const;
const EASE_OUT = [0.20, 1, 0.3, 1] as const;

// ─── Single Card ──────────────────────────────────────────────────────────────
function ProblemCard({
  item,
  isRevealed,
  onToggle,
  index,
}: {
  item: {
    problem: { heading: string; body: string };
    solution: {
      heading: string;
      body: string;
      stats: { value: string; label: string }[];
    };
  };
  isRevealed: boolean;
  onToggle: () => void;
  index: number;
}) {
  const cardControls = useAnimation();
  const pawControls  = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  // PRESERVED EXACTLY from original
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

  // PRESERVED EXACTLY from original
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
      className="sticky z-10"
      style={{ top: `${80 + index * 72}px` }}
    >
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full cursor-pointer"
      >
        {/* Outer card — full-width, contains all layers */}
        <div
          className="
            relative w-full overflow-hidden
            rounded-[20px] md:rounded-[24px]
            shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.04)]
            ring-1 ring-white/[0.06]
            min-h-[260px] sm:min-h-[290px]
          "
        >
          {/* BASE LAYER: SOLUTION — always horizontal: image left, text right */}
          <div className="absolute inset-0 bg-white flex flex-row">

            {/* Image placeholder — hidden on mobile, shown from md up */}
            <div className="hidden md:flex w-[38%] bg-[#f0f0f0] items-center justify-center shrink-0">
              <div className="flex flex-col items-center gap-2 text-black/20 px-2">
                <svg
                  className="w-7 h-7 md:w-10 md:h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                  />
                </svg>
                <span className="hidden sm:block text-[9px] md:text-[10px] uppercase tracking-[0.15em] font-medium text-center">
                  Image Soon
                </span>
              </div>
            </div>

            {/* Text content — takes remaining 70%/62% */}
            <div className="flex-1 flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10">
              {/* Checkmark + heading */}
              <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 md:w-4 md:h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-[#111] font-clash font-bold text-[13px] sm:text-[15px] md:text-[18px] lg:text-[21px] uppercase leading-tight">
                  {item.solution.heading}
                </h3>
              </div>

              {/* Description */}
              <p className="text-[#555] font-sans text-[11px] sm:text-[13px] md:text-[14px] leading-[1.55] mb-4 md:mb-6 max-w-[520px]">
                {item.solution.body}
              </p>

              {/* Trust stats row */}
              <div className="flex flex-wrap gap-x-4 gap-y-3 sm:gap-x-6 md:gap-x-8">
                {item.solution.stats.map((stat, si) => (
                  <div key={si} className="flex flex-col">
                    <span className="text-[#e5192a] font-clash font-bold text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] leading-none">
                      {stat.value}
                    </span>
                    <span className="text-[#888] text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider font-medium mt-1 max-w-[90px] sm:max-w-[110px] leading-tight">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/*
            OVERLAY LAYER: PROBLEM — pure black, only big title, centered.
            No description. Maximum impact, minimum overwhelm.
            Pulled down by the lion paw to reveal the solution beneath.
          */}
          <motion.div
            className="absolute inset-0 z-10 bg-[#000000] flex items-center justify-center p-6 sm:p-10 md:p-14 rounded-[20px] md:rounded-[24px] overflow-hidden"
            initial={{ y: "0%" }}
            animate={cardControls}
          >
            <h3 className="text-white font-clash font-bold text-[20px] sm:text-[28px] md:text-[38px] lg:text-[46px] uppercase leading-tight text-center max-w-[640px]">
              {item.problem.heading}
            </h3>
          </motion.div>

          {/*
            ── LION PAW ── PRESERVED EXACTLY from original
            Same image URL, same controls, same positioning, same timing,
            same golden drop-shadow, same hover spring.
          */}
          <motion.div
            className="pointer-events-none absolute z-20 bottom-0 w-[clamp(95px,85%,145px)] md:w-[clamp(160px,30%,210px)] lg:w-[clamp(190px,22%,250px)]"
            initial={{ x: "-50%", y: "0%", rotate: -6, scale: 0.9 }}
            animate={pawControls}
            style={{ left: 0, aspectRatio: "1 / 1" }}
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
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function ProblemsSolvedSection() {
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

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
    <section ref={sectionRef} className="bg-bg-surface-light pt-0 pb-16 md:pb-24 lg:pb-24 xl:pb-32">
      <div className="max-w-[1300px] xl:max-w-[1500px] 2xl:max-w-[1700px] mx-auto px-4 md:px-6 xl:px-10">

        {/* ── IMAGINE card — width shared with the Process lion circle via
             --lion-circle-d, so card width === that circle Ø at every breakpoint.
             The lion circle itself lives in the Process section above and hands
             down into this card. ── */}
        <div
          className="relative mx-auto flex flex-col items-center"
          style={{ width: "var(--imagine-card-d)", maxWidth: "100%" }}
        >
          {/* Red card */}
          <div className="relative z-10 w-full bg-[#e5192a] rounded-[32px] px-5 sm:px-7 pt-12 md:pt-16 pb-12 shadow-[0_30px_60px_-15px_rgba(229,25,42,0.45)]">
            {/* Slanted marquee band near the top — card's rounded corners stay
                visible above it (sits below the pt). Clipped to the card width. */}
            <div className="-mx-5 sm:-mx-7 mb-9 md:mb-12 overflow-hidden">
              <MarqueeSlanted />
            </div>
            {/* Heading */}
            <motion.div
              className="mb-8 md:mb-10 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -25% 0px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-white text-[11px] md:text-[12px] font-clash uppercase tracking-[0.2em] mb-2">
                {t.problems.eyebrow}
              </p>
              <SplitTextReveal
                as="h2"
                className="text-[44px] sm:text-[56px] font-bold font-clash uppercase leading-[1.0] text-white"
                step={18}
                delay={120}
                from="center"
              >
                {t.problems.heading}
              </SplitTextReveal>
            </motion.div>

            {/* Cards — stacked in the narrow column */}
            <div className="flex flex-col gap-6 md:gap-8 pb-4">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                  transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProblemCard
                    item={item}
                    index={i}
                    isRevealed={revealedIds.includes(i)}
                    onToggle={() => toggleCard(i)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
