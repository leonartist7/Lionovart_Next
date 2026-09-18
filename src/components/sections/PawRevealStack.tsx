"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

import { SovereignFoilContour } from "@/components/ui/SovereignFoilContour";
import { SHOWCASE_IMAGES } from "./showcase-images";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const PAW_IMAGE =
  "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_320/v1775085187/Untitled_design_4_muu53f.png";
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

type CardPhase = "closed" | "revealing" | "returning" | "active" | "summary";

function PartnershipStatement() {
  return (
    <div className="w-full max-w-[720px]">
      <p className="font-mono text-[8px] font-bold uppercase tracking-[0.31em] text-white/70 sm:text-[10px]">One Partnership</p>
      <h2 className="mx-auto mt-4 max-w-[13ch] font-clash text-[clamp(2.05rem,7.5vw,4.2rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] sm:mt-5 lg:text-[clamp(2.8rem,4.1vw,4.15rem)]">
        <span className="block">Your vision.</span>
        <span className="mt-[0.1em] block">A studio around it.</span>
      </h2>
      <p className="mx-auto mt-4 max-w-[46ch] font-body text-[12.5px] font-medium leading-[1.5] text-white/82 sm:mt-5 sm:text-[16px] lg:text-[17px]">Artists, strategists and technologists working together on your identity, digital presence and the systems behind your business.</p>
    </div>
  );
}

function LogoHandoffWords() {
  return (
    <div className="flex flex-col items-center gap-[clamp(8rem,22svh,13rem)] px-5 text-center">
      <p className="font-clash text-[clamp(1.3rem,1rem+1.2vw,2rem)] font-bold uppercase leading-none tracking-[-0.045em] text-[#171717]">
        Lead
      </p>
      <p className="font-clash text-[clamp(1.3rem,1rem+1.2vw,2rem)] font-bold uppercase leading-none tracking-[-0.045em] text-[#171717]">
        Forward
      </p>
    </div>
  );
}

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
  onReturn,
  isInteractionLocked,
}: {
  item: ImagineItem;
  panelId: string;
  phase: CardPhase;
  onActivate: () => void;
  onReturn: () => void;
  isInteractionLocked: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isActive = phase === "active";
  const isSummary = phase === "summary";
  const isCovered = phase === "closed" || phase === "revealing" || phase === "returning";
  const hasFullDetails = isActive;

  return (
    <div
      id={panelId}
      role="region"
      aria-label={item.solution.heading}
      aria-hidden={isCovered}
      className={`relative h-full w-full overflow-hidden bg-[#faf9f6] text-[#171717] ${isCovered ? "absolute inset-0" : ""}`}
    >
      {!isCovered ? <SovereignFoilContour /> : null}

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
        <div className="relative z-10 min-h-[12rem] px-5 py-5 sm:px-7 sm:py-5.5 md:min-h-[12.5rem] md:px-8 md:py-6 lg:px-10">
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
                  <p className="mt-2.5 max-w-[680px] font-sans text-[0.8125rem] leading-[1.5] text-[#585858] sm:text-[0.875rem]">
                    {item.solution.body}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3.5 min-[430px]:grid-cols-3 md:mt-5 md:gap-x-5">
                    {item.solution.stats.map((stat, index) => (
                      <div
                        key={stat.label}
                        className={`flex min-w-0 flex-col text-left ${index === 2 ? "col-span-2 min-[430px]:col-span-1" : ""}`}
                      >
                        <span className="font-clash text-[clamp(1.5rem,1.2rem+1vw,2.25rem)] font-bold leading-none tracking-[-0.045em] text-[#e5192a]">
                          {stat.value}
                        </span>
                        <span className="mt-1 max-w-[11rem] text-[0.625rem] font-semibold uppercase leading-[1.25] tracking-[0.08em] text-[#747474] md:text-[0.6875rem]">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={onReturn}
                    disabled={isInteractionLocked}
                    className="mt-5 inline-flex min-h-9 items-center rounded-full border border-[#b98b10]/45 px-3.5 font-clash text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[#71510a] transition-colors hover:border-[#b98b10] hover:bg-[#f3e5b9]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b98b10] disabled:opacity-50"
                  >
                    Return to prompt
                  </button>
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
  onReturnStart,
  onReturnComplete,
  onActivateSummary,
  isInteractionLocked,
}: {
  item: ImagineItem;
  index: number;
  phase: CardPhase;
  onRevealStart: () => boolean;
  onRevealComplete: () => void;
  onReturnStart: () => boolean;
  onReturnComplete: () => void;
  onActivateSummary: () => void;
  isInteractionLocked: boolean;
}) {
  const cardControls = useAnimation();
  const pawControls = useAnimation();
  const reduceMotion = useReducedMotion();
  const panelId = `imagine-result-${index}`;
  const returnStarted = useRef(false);
  const isClosed = phase === "closed";
  const isSummary = phase === "summary";
  const isActive = phase === "active";
  const isCovered = phase === "closed" || phase === "revealing" || phase === "returning";

  const reveal = async () => {
    if (!onRevealStart()) return;

    if (reduceMotion) {
      cardControls.set({ y: "105%" });
      pawControls.set({ y: "105%", x: "-10%", rotate: 4, scale: 1.05 });
      onRevealComplete();
      return;
    }

    pawControls.set({ x: "-70%", y: "0%", rotate: -6, scale: 0.9 });
    // The cover waits on the actual paw animation instead of a timer, so a
    // rerender or slower device can never make the pull start mid-sweep.
    await pawControls.start({
      x: "-10%",
      y: "0%",
      rotate: 0,
      scale: 1.15,
      transition: { duration: PAW_IN_DURATION, ease: RETURN_EASE },
    });
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

  useEffect(() => {
    if (phase !== "returning") {
      returnStarted.current = false;
      return;
    }
    if (returnStarted.current) return;
    returnStarted.current = true;

    const returnToPrompt = async () => {
      if (reduceMotion) {
        cardControls.set({ y: "0%" });
        pawControls.set({ x: "-70%", y: "0%", rotate: -6, scale: 0.9 });
        onReturnComplete();
        return;
      }

      cardControls.set({ y: "105%" });
      pawControls.set({ x: "-10%", y: "105%", rotate: 4, scale: 1.05 });
      await Promise.all([
        cardControls.start({ y: "0%", transition: { duration: PULL_DURATION, ease: PULL_EASE } }),
        pawControls.start({ y: "0%", transition: { duration: PULL_DURATION, ease: PULL_EASE } }),
      ]);
      await pawControls.start({
        x: "-70%",
        rotate: -6,
        scale: 0.9,
        transition: { duration: PAW_IN_DURATION, ease: RETURN_EASE },
      });
      onReturnComplete();
    };

    void returnToPrompt();
  }, [cardControls, onReturnComplete, pawControls, phase, reduceMotion]);

  return (
    <motion.article
      layout
      transition={reduceMotion ? { duration: 0.01 } : { duration: 0.46, ease: RETURN_EASE }}
      className={`relative overflow-hidden rounded-[1.375rem] border shadow-[0_18px_32px_-24px_rgba(0,0,0,0.8)] md:rounded-[1.5rem] ${isSummary || isActive ? "border-[#e3b72b]/80 bg-[#faf9f6] shadow-[0_0_0_1px_rgba(240,201,23,0.25),0_16px_32px_-24px_rgba(181,135,0,0.8)]" : "border-white/[0.08] bg-black"}`}
    >
      <div className={`relative overflow-hidden ${isSummary ? "" : isCovered ? "h-[9rem] bg-black md:h-[8rem]" : "min-h-[12rem] bg-black md:min-h-[12.5rem]"}`}>
        <SolutionSurface item={item} panelId={panelId} phase={phase} onActivate={onActivateSummary} onReturn={onReturnStart} isInteractionLocked={isInteractionLocked} />

        {isCovered ? <motion.button
          type="button"
          aria-expanded={phase === "revealing"}
          aria-controls={panelId}
          disabled={!isClosed || isInteractionLocked}
          onClick={() => void reveal()}
          initial={{ y: "0%" }}
          animate={cardControls}
          className="group absolute inset-0 z-20 flex w-full items-center justify-center overflow-hidden bg-black px-5 pb-10 pt-4 text-center will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#f0c917] sm:px-7 md:px-10"
        >
          <span className="pointer-events-none absolute inset-0 border border-white/[0.04]" aria-hidden="true" />
          <span className="pointer-events-none absolute left-5 top-5 hidden h-1.5 w-1.5 rounded-full bg-[#f0c917] shadow-[0_0_12px_rgba(240,201,23,0.52)] md:block" aria-hidden="true" />
          <span className="relative z-10 max-w-[720px] font-clash text-[clamp(1.05rem,0.95rem+1.2vw,2rem)] font-bold uppercase leading-[1.04] tracking-[-0.012em] [word-spacing:0.07em] text-white">
            {item.problem.heading}
          </span>
        </motion.button> : null}

        {isCovered ? <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-30 h-[6rem] w-[6rem] will-change-transform sm:h-[6.5rem] sm:w-[6.5rem] md:h-[7.25rem] md:w-[7.25rem]"
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
  const [returningIndex, setReturningIndex] = useState<number | null>(null);
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  const [showWorkStream, setShowWorkStream] = useState(false);
  const [scene, setScene] = useState({ diameter: 1200, height: 900, viewport: 900 });
  const contentRef = useRef<HTMLDivElement>(null);
  const interactionLock = useRef(false);
  const chapterRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const staticScene = reduceMotion;
  const circlePadding = Math.max(0, (scene.diameter - scene.height) / 2) + 64;
  const centerShift = (scene.height - scene.viewport) / 2;
  const { t } = useLanguage();
  const items: ImagineItem[] = t.problems.items;
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });
  const circleScale = useTransform(
    scrollYProgress,
    staticScene ? [0, 1] : [0, 0.52, 0.76, 0.84, 1],
    staticScene ? [1, 1] : [1, 1, 0.2, 0.075, 0.075],
  );
  const cardOpacity = useTransform(
    scrollYProgress,
    staticScene ? [0, 1] : [0, 0.46, 0.57, 1],
    staticScene ? [1, 1] : [1, 1, 0, 0],
  );
  const cardY = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.57], [0, staticScene ? 0 : -18]);
  const statementOpacity = useTransform(
    scrollYProgress,
    staticScene ? [0, 1] : [0, 0.54, 0.62, 0.72, 1],
    staticScene ? [0, 0] : [0, 0, 1, 0, 0],
  );
  const statementY = useTransform(scrollYProgress, staticScene ? [0, 1] : [0.54, 0.72], [staticScene ? 0 : 18, staticScene ? 0 : -14]);
  const logoOpacity = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.74, 0.84, 1], staticScene ? [0, 0] : [0, 0, 1, 1]);
  const logoMarkScale = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.76, 0.84, 1], staticScene ? [0.8, 0.8] : [0.8, 0.8, 0.68, 0.68]);
  const streamOpacity = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.82, 0.89, 1], staticScene ? [0, 0] : [0, 0, 1, 1]);
  const streamScale = useTransform(scrollYProgress, staticScene ? [0, 1] : [0.82, 1], [0.975, 1.012]);
  const handoffCaptionOpacity = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.84, 0.9, 1], staticScene ? [0, 0] : [0, 0, 1, 1]);
  const handoffCaptionY = useTransform(scrollYProgress, staticScene ? [0, 1] : [0.84, 0.9], [staticScene ? 0 : 12, 0]);
  const circleY = useTransform(scrollYProgress, [0, 0.46, 0.72, 1], [0, 0, centerShift, centerShift]);
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => {
      const width = content.offsetWidth;
      const height = content.offsetHeight;
      // The diagonal encloses all four corners, with breathing room for the title and cards.
      const diameter = Math.ceil(Math.max(Math.hypot(width + 160, height + 280), Math.min(window.innerWidth, window.innerHeight) * 1.75));
      const stageHeight = Math.max(window.innerHeight, height + 240);
      setScene(previous => previous.diameter === diameter && previous.height === stageHeight && previous.viewport === window.innerHeight ? previous : { diameter, height: stageHeight, viewport: window.innerHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [reduceMotion]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = progress > 0.78;
    setShowWorkStream((current) => (current === next ? current : next));
  });

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

  const startReturn = (index: number) => {
    if (interactionLock.current || activeIndex !== index) return false;

    interactionLock.current = true;
    setReturningIndex(index);
    return true;
  };

  const completeReturn = (index: number) => {
    setActiveIndex((current) => current === index ? null : current);
    setRevealedIndexes((current) => current.filter((value) => value !== index));
    setReturningIndex(null);
    interactionLock.current = false;
  };

  const activateSummary = (index: number) => {
    if (interactionLock.current) return;

    setActiveIndex(index);
  };

  return (
    <section
      ref={chapterRef}
      aria-label="Imagine and one partnership"
      style={{ paddingTop: circlePadding, paddingBottom: circlePadding, height: (staticScene ? scene.height : scene.height + scene.viewport * 1.45) + circlePadding * 2 }}
      className="relative z-30 isolate overflow-visible bg-bg-surface-light"
    >
      <div style={{ height: scene.height, top: Math.min(0, scene.viewport - scene.height) }} className={staticScene ? "relative overflow-visible" : "sticky overflow-visible"}>
        {showWorkStream && !staticScene ? <motion.div
          style={{ opacity: streamOpacity, scale: streamScale, top: `calc(50% + ${centerShift}px)` }}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-screen -translate-x-1/2 -translate-y-1/2 transform-gpu"
        >
          <ImageStreamHero
            images={SHOWCASE_IMAGES.map((src, index) => ({ src, alt: t.services.items[index]?.title ?? "Lionovart selected work" }))}
            cards={7}
            speed={30}
            axis={50}
            path={{ cardWidth: 17.5, cardHeight: 23.5, birthHeight: 3.4, exitHeight: 40, railBirth: -5.5, railExit: 32, fan: 2.7, turnBirth: 5, turnExit: 23, stops: 18 }}
            className="h-[19rem] w-full overflow-visible sm:h-[27rem] lg:h-[32rem]"
          />
        </motion.div> : null}

        <motion.div
          data-imagine-circle
          style={{ scale: circleScale, y: circleY, width: scene.diameter }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#f51b2c] will-change-transform"
        >
          <div aria-hidden="true" className="absolute inset-0 rounded-full shadow-[0_46px_120px_-52px_rgba(245,27,44,0.58),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-34px_90px_rgba(105,0,14,0.1)]" />
          <motion.div style={{ opacity: statementOpacity, y: statementY }} className="absolute inset-0 flex items-center justify-center px-[20vw] text-center text-white sm:px-[14vmin] lg:px-[13vmin]">
            <PartnershipStatement />
          </motion.div>
          <motion.img src="/images/lionovart-icon.svg" alt="" aria-hidden="true" style={{ opacity: logoOpacity, scale: logoMarkScale }} className="absolute inset-0 h-full w-full object-contain p-[12%]" decoding="async" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ opacity: handoffCaptionOpacity, y: handoffCaptionY, top: centerShift * 2 }}
          className="pointer-events-none absolute inset-0 z-[25] flex items-center justify-center"
        >
          <LogoHandoffWords />
        </motion.div>

        <motion.div
          style={{ opacity: cardOpacity, y: cardY, pointerEvents: revealingIndex === null && returningIndex === null ? "auto" : "none" }}
          className="absolute inset-0 z-30 flex items-center justify-center px-3.5 py-5 sm:px-6 md:py-7"
        >
          <div ref={contentRef} data-imagine-content className="w-full max-w-[660px]">
            <motion.div className="mb-4 flex flex-col items-center text-center sm:mb-5" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
              <p className="mb-1.5 font-clash text-[0.625rem] font-semibold uppercase tracking-[0.17em] text-white sm:text-xs">{t.problems.eyebrow}</p>
              <h2 className="font-clash text-[clamp(2.15rem,1.65rem+2.15vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-[-0.045em] text-white">
                {t.problems.heading}
              </h2>
            </motion.div>

            <div className="mx-auto flex w-full flex-col gap-2.5 sm:gap-3">
              {items.map((item, index) => {
                const phase: CardPhase = returningIndex === index ? "returning" : revealingIndex === index ? "revealing" : activeIndex === index ? "active" : revealedIndexes.includes(index) ? "summary" : "closed";
                return <PawRevealCard key={item.problem.heading} item={item} index={index} phase={phase} onRevealStart={() => startReveal(index)} onRevealComplete={() => completeReveal(index)} onReturnStart={() => startReturn(index)} onReturnComplete={() => completeReturn(index)} onActivateSummary={() => activateSummary(index)} isInteractionLocked={revealingIndex !== null || returningIndex !== null} />;
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
