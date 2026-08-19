"use client";

import { useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import MarqueeSlanted from "@/components/sections/MarqueeSlanted";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import { SovereignFoilContour } from "@/components/ui/SovereignFoilContour";

const FEATURED = {
  quote: "Within two months of the new website, direct reservations jumped almost 70%. It finally looks like the place we actually run.",
  author: "Camille Moreau",
  role: "Owner Ã‚Â· Maison Verre",
  avatar: "/images/Testimonials/France/Mathilde-coffee.avif",
  flag: "https://flagcdn.com/w40/fr.png",
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Animation timing constants (PRESERVED EXACTLY from original) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const PAW_IN_DURATION = 0.35;
const PULL_DURATION   = 0.70;

const EASE_IN  = [0.2, 0, 0.6, 1]  as const;
const EASE_OUT = [0.20, 1, 0.3, 1] as const;

function ClickToRevealHint() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-5 z-30 h-20 sm:bottom-6 sm:h-20 md:bottom-8 md:h-24"
      aria-hidden="true"
    >
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-3 sm:gap-4">
        <span className="whitespace-nowrap text-center font-clash text-[12px] font-bold uppercase leading-[1.05] tracking-[0.14em] text-white sm:text-[13px] sm:tracking-[0.16em] md:text-[14px] lg:text-[15px]">
          <span className="block">Click</span>
          <span className="block">to reveal</span>
        </span>

        <span
          className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-[#f0c917] shadow-[0_0_14px_rgba(240,201,23,0.8)] motion-reduce:animate-none sm:h-3.5 sm:w-3.5 md:h-4 md:w-4"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// Single Card
// Single Card
// Single Card
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
        {/* Outer card Ã¢â‚¬â€ full-width, contains all layers */}
        <div
          className="
            relative w-full overflow-hidden
            rounded-[20px] md:rounded-[24px]
            shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.04)]
            ring-1 ring-white/[0.06]
            min-h-[260px] sm:min-h-[290px]
          "
        >
          {/* BASE LAYER: SOLUTION */}
          <div className="absolute inset-0 bg-white">
            <SovereignFoilContour active={isRevealed} />

            {/* Centered solution content */}
            <div className="relative z-[3] flex h-full w-full flex-col items-center justify-center px-5 py-5 text-center sm:px-8 sm:py-6 md:px-12 md:py-8 lg:px-16">
              {/* Checkmark + heading */}
              <div className="mb-2 flex max-w-[680px] items-start justify-center gap-2 md:mb-3 md:gap-3">
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
                <h3 className="text-center text-[#111] font-clash font-bold text-[13px] sm:text-[15px] md:text-[18px] lg:text-[21px] uppercase leading-tight">
                  {item.solution.heading}
                </h3>
              </div>

              {/* Description */}
              <p className="mb-4 max-w-[620px] text-center text-[#555] font-sans text-[11px] leading-[1.55] sm:text-[13px] md:mb-6 md:text-[14px]">
                {item.solution.body}
              </p>

              {/* Trust stats row */}
              <div className="grid w-full max-w-[620px] grid-cols-3 gap-x-2 sm:gap-x-4 md:gap-x-7">
                {item.solution.stats.map((stat, si) => (
                  <div key={si} className="flex min-w-0 flex-col items-center text-center">
                    <span className="text-[#e5192a] font-clash font-bold text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] leading-none">
                      {stat.value}
                    </span>
                    <span className="mt-1 max-w-[120px] text-center text-[#888] text-[7.5px] sm:text-[9px] md:text-[10px] uppercase tracking-wider font-medium leading-tight">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/*
            OVERLAY LAYER: PROBLEM Ã¢â‚¬â€ pure black, only big title, centered.
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
            {index === 0 && <ClickToRevealHint />}
          </motion.div>

          {/*
            Ã¢â€â‚¬Ã¢â€â‚¬ LION PAW Ã¢â€â‚¬Ã¢â€â‚¬ PRESERVED EXACTLY from original
            Same image URL, same controls, same positioning, same timing,
            same golden drop-shadow, same hover spring.
          */}
          <motion.div
            className="pointer-events-none absolute z-20 bottom-0 w-[clamp(95px,85%,145px)] md:w-[clamp(160px,30%,210px)] lg:w-[clamp(190px,22%,250px)]"
            initial={{ x: "-50%", y: "0%", rotate: -6, scale: 0.9 }}
            animate={pawControls}
            style={{ left: 0, aspectRatio: "1 / 1" }}
          >
            {/* Inner wrapper Ã¢â‚¬â€ hover scale only, independent of reveal animation */}
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Section Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ IMAGINE card Ã¢â‚¬â€ width shared with the Process lion circle via
             --lion-circle-d, so card width === that circle ÃƒËœ at every breakpoint.
             The lion circle itself lives in the Process section above and hands
             down into this card. Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div
          className="relative mx-auto flex flex-col items-center"
          style={{ width: "var(--imagine-card-d)", maxWidth: "100%" }}
        >
          {/* Red card */}
          <div className="relative z-10 w-full bg-[#e5192a] rounded-[32px] px-5 sm:px-7 pt-12 md:pt-16 pb-12 shadow-[0_30px_60px_-15px_rgba(229,25,42,0.45)]">
            {/* The marquee overlaps the card's top edge to make the handoff from
                Stronger Together continuous, without a light-space break. */}
            <div className="relative z-20 -mt-[clamp(4rem,12vw,6rem)] mb-9 md:-mt-[clamp(4rem,8vw,6rem)] md:mb-12">
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
            <div className="relative">
              <div className="flex flex-col gap-6 pb-4 md:gap-8">
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
      </div>
    </section>
  );
}

