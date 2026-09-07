"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import { SovereignFoilContour } from "@/components/ui/SovereignFoilContour";

const PAW_IMAGE =
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png";
const PAW_IN_DURATION = 0.35;
const PULL_DURATION = 0.7;
const PULL_EASE = [0.2, 0, 0.6, 1] as const;
const RETURN_EASE = [0.2, 1, 0.3, 1] as const;

type ImagineItem = {
  problem: { heading: string; body: string };
  solution: {
    heading: string;
    body: string;
    stats: { value: string; label: string }[];
  };
};

type CardPhase = "closed" | "revealing" | "active" | "summary";

function StatusHeading({ item, compact = false }: { item: ImagineItem; compact?: boolean }) {
  return (
    <div className={`flex items-start gap-3 ${compact ? "justify-center" : ""}`}>
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14966c] text-white md:h-6 md:w-6" aria-hidden="true">
        <svg className="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.25">
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3 className={`font-clash font-bold uppercase leading-[1.1] tracking-[-0.01em] [word-spacing:0.08em] text-[#141414] ${compact ? "max-w-[740px] text-[clamp(0.9375rem,0.84rem+0.45vw,1.25rem)]" : "max-w-[640px] text-[clamp(1rem,0.92rem+0.45vw,1.375rem)]"}`}>
        {item.solution.heading}
      </h3>
    </div>
  );
}

function SolutionSurface({
  item,
  panelId,
  phase,
  onActivate,
  isInteractionLocked,
}: {
  item: ImagineItem;
  panelId: string;
  phase: CardPhase;
  onActivate: () => void;
  isInteractionLocked: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isActive = phase === "active";
  const isSummary = phase === "summary";
  const isCovered = phase === "closed" || phase === "revealing";
  const hasFullDetails = !isSummary;

  return (
    <div
      id={panelId}
      role="region"
      aria-label={item.solution.heading}
      aria-hidden={isCovered}
      className={`relative h-full w-full overflow-hidden bg-[#faf9f6] text-[#171717] ${isCovered ? "absolute inset-0" : ""}`}
    >
      {isActive ? <SovereignFoilContour active /> : null}

      {isSummary ? (
        <button
          type="button"
          onClick={onActivate}
          disabled={isInteractionLocked}
          className="group relative z-10 flex min-h-[5.75rem] w-full items-center justify-center px-5 py-5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#d6a900] sm:px-8 md:min-h-[6.25rem]"
        >
          <StatusHeading item={item} compact />
        </button>
      ) : (
        <div className="relative z-10 min-h-[15.5rem] px-5 py-6 sm:px-8 sm:py-7 md:min-h-[16.5rem] md:px-10 md:py-8 lg:px-12">
          <div className="mx-auto max-w-[700px]">
            <StatusHeading item={item} />

            <AnimatePresence initial={false}>
              {hasFullDetails ? (
                <motion.div
                  initial={isActive ? { opacity: 0, y: reduceMotion ? 0 : 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
                  transition={isActive ? (reduceMotion ? { duration: 0.01 } : { duration: 0.36, delay: 0.1, ease: RETURN_EASE }) : { duration: 0 }}
                >
                  <p className="mt-3 max-w-[680px] font-sans text-[0.875rem] leading-[1.55] text-[#585858] sm:text-[0.9375rem]">
                    {item.solution.body}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 min-[430px]:grid-cols-3 md:mt-7 md:gap-x-6">
                    {item.solution.stats.map((stat, index) => (
                      <div
                        key={stat.label}
                        className={`flex min-w-0 flex-col text-left ${index === 2 ? "col-span-2 min-[430px]:col-span-1" : ""}`}
                      >
                        <span className="font-clash text-[clamp(1.5rem,1.2rem+1vw,2.25rem)] font-bold leading-none tracking-[-0.045em] text-[#e5192a]">
                          {stat.value}
                        </span>
                        <span className="mt-1.5 max-w-[11rem] text-[0.6875rem] font-semibold uppercase leading-[1.25] tracking-[0.08em] text-[#747474] md:text-xs">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function PawRevealCard({
  item,
  index,
  phase,
  onRevealStart,
  onRevealComplete,
  onActivateSummary,
  isInteractionLocked,
}: {
  item: ImagineItem;
  index: number;
  phase: CardPhase;
  onRevealStart: () => boolean;
  onRevealComplete: () => void;
  onActivateSummary: () => void;
  isInteractionLocked: boolean;
}) {
  const cardControls = useAnimation();
  const pawControls = useAnimation();
  const reduceMotion = useReducedMotion();
  const panelId = `imagine-result-${index}`;
  const isClosed = phase === "closed";
  const isSummary = phase === "summary";
  const isCovered = phase === "closed" || phase === "revealing";

  const reveal = async () => {
    if (!onRevealStart()) return;

    if (reduceMotion) {
      cardControls.set({ y: "105%" });
      pawControls.set({ y: "105%", x: "-10%", rotate: 4, scale: 1.05 });
      onRevealComplete();
      return;
    }

    await pawControls.set({ x: "-70%", y: "0%", rotate: -6, scale: 0.9 });
    await pawControls.start({
      x: "-10%",
      y: "0%",
      rotate: 0,
      scale: 1.15,
      transition: { duration: PAW_IN_DURATION, ease: RETURN_EASE },
    });
    await new Promise((resolve) => window.setTimeout(resolve, PAW_IN_DURATION * 850));
    await Promise.all([
      cardControls.start({ y: "105%", transition: { duration: PULL_DURATION, ease: PULL_EASE } }),
      pawControls.start({
        y: "105%",
        x: "-10%",
        rotate: 4,
        scale: 1.05,
        transition: { duration: PULL_DURATION, ease: PULL_EASE },
      }),
    ]);
    onRevealComplete();
  };

  return (
    <motion.article
      layout
      transition={reduceMotion ? { duration: 0.01 } : { duration: 0.46, ease: RETURN_EASE }}
      className={`relative overflow-hidden rounded-[1.375rem] border shadow-[0_18px_32px_-24px_rgba(0,0,0,0.8)] md:rounded-[1.5rem] ${isSummary ? "border-[#e3b72b]/80 bg-[#faf9f6] shadow-[0_0_0_1px_rgba(240,201,23,0.25),0_16px_32px_-24px_rgba(181,135,0,0.8)]" : "border-white/[0.08] bg-black"}`}
    >
      <div className={`relative overflow-hidden ${isSummary ? "" : "min-h-[15.5rem] bg-black md:min-h-[16.5rem]"}`}>
        <SolutionSurface item={item} panelId={panelId} phase={phase} onActivate={onActivateSummary} isInteractionLocked={isInteractionLocked} />

        {isCovered ? <motion.button
          type="button"
          aria-expanded={phase === "revealing"}
          aria-controls={panelId}
          disabled={!isClosed || isInteractionLocked}
          onClick={() => void reveal()}
          initial={{ y: "0%" }}
          animate={cardControls}
          className="group absolute inset-0 z-20 flex w-full items-center justify-center overflow-hidden bg-black px-5 py-5 text-center will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#f0c917] sm:px-8 md:px-12"
        >
          <span className="pointer-events-none absolute inset-0 border border-white/[0.04]" aria-hidden="true" />
          <span className="pointer-events-none absolute left-5 top-5 hidden h-1.5 w-1.5 rounded-full bg-[#f0c917] shadow-[0_0_12px_rgba(240,201,23,0.52)] md:block" aria-hidden="true" />
          <span className="relative z-10 max-w-[760px] font-clash text-[clamp(1.4375rem,1.2rem+1.5vw,2.625rem)] font-bold uppercase leading-[1.04] tracking-[-0.012em] [word-spacing:0.08em] text-white">
            {item.problem.heading}
          </span>
        </motion.button> : null}

        {isCovered ? <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-30 h-[10rem] w-[10rem] will-change-transform sm:h-[11rem] sm:w-[11rem] md:h-[12.5rem] md:w-[12.5rem] lg:h-[14rem] lg:w-[14rem]"
          initial={{ x: "-50%", y: "0%", rotate: -6, scale: 0.9 }}
          animate={pawControls}
        >
          <div className="relative h-full w-full drop-shadow-[0_0_30px_rgba(240,201,23,0.55)]">
            <Image src={PAW_IMAGE} alt="" fill sizes="(min-width: 1024px) 224px, 176px" className="object-contain object-bottom-left" />
          </div>
        </motion.div> : null}

        {isClosed ? (
          <span className="pointer-events-none absolute bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-[#f0c917]/35 bg-black/30 px-3 py-1.5 font-clash text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-[#f8d95e] sm:bottom-5 sm:right-5 sm:px-4 sm:text-xs" aria-hidden="true">
            Reveal
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </span>
        ) : null}
      </div>
    </motion.article>
  );
}

export default function PawRevealStack() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [revealingIndex, setRevealingIndex] = useState<number | null>(null);
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  const interactionLock = useRef(false);
  const { t } = useLanguage();
  const items: ImagineItem[] = t.problems.items;

  const startReveal = (index: number) => {
    if (interactionLock.current) return false;

    interactionLock.current = true;
    setRevealingIndex(index);
    return true;
  };

  const completeReveal = (index: number) => {
    setActiveIndex(index);
    setRevealedIndexes((previous) => (previous.includes(index) ? previous : [...previous, index]));
    setRevealingIndex(null);
    interactionLock.current = false;
  };

  const activateSummary = (index: number) => {
    if (interactionLock.current) return;

    setActiveIndex(index);
  };

  return (
    <section className="bg-bg-surface-light pb-0 pt-12 sm:pt-16 md:pt-20 lg:pt-24 xl:pt-28">
      <div className="mx-auto w-full max-w-[1120px] px-3.5 sm:px-6">
        <div className="rounded-[1.75rem] bg-[#e5192a] px-3.5 py-10 shadow-[0_24px_48px_-26px_rgba(229,25,42,0.52)] sm:px-6 sm:py-12 md:rounded-[2rem] md:px-8 md:py-14 lg:px-10 lg:py-16">
          <motion.div
            className="mb-8 flex flex-col items-center text-center md:mb-10"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -20% 0px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-2 font-clash text-xs font-semibold uppercase tracking-[0.17em] text-white sm:text-[0.8125rem]">
              {t.problems.eyebrow}
            </p>
            <SplitTextReveal
              as="h2"
              className="font-clash text-[clamp(2.75rem,2rem+3vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-[-0.045em] text-white"
              step={18}
              delay={120}
              from="center"
            >
              {t.problems.heading}
            </SplitTextReveal>
          </motion.div>

          <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-3 sm:gap-4 md:gap-[1.125rem]">
            {items.map((item, index) => {
              const phase: CardPhase = revealingIndex === index
                ? "revealing"
                : activeIndex === index
                  ? "active"
                  : revealedIndexes.includes(index)
                    ? "summary"
                    : "closed";

              return (
                <PawRevealCard
                  key={item.problem.heading}
                  item={item}
                  index={index}
                  phase={phase}
                  onRevealStart={() => startReveal(index)}
                  onRevealComplete={() => completeReveal(index)}
                  onActivateSummary={() => activateSummary(index)}
                  isInteractionLocked={revealingIndex !== null}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
