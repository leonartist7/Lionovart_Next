"use client";

import GoldThreads from "@/components/ui/GoldThreads";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { useLanguage } from "@/contexts/LanguageContext";

import { SovereignFoilContour } from "@/components/ui/SovereignFoilContour";
import { SHOWCASE_IMAGES } from "./showcase-images";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const PAW_IMAGE =
  "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_320/v1775085187/Untitled_design_4_muu53f.png";
const PAW_IN_DURATION = 0.35;
const PULL_DURATION = 0.9;
const PULL_EASE = [0.16, 1, 0.3, 1] as const;
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
type CardTransition = { kind: "reveal" | "return"; index: number } | null;

function PartnershipStatement() {
  return (
    <div className="w-full max-w-[min(84vw,1500px)]">
      <p className="font-mono text-[clamp(9px,0.55vw,13px)] font-bold uppercase tracking-[0.31em] text-white/80">One Partnership</p>
      <h2 className="mx-auto mt-4 max-w-[13ch] font-clash text-[clamp(2.05rem,2rem+2.6vw,8rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] sm:mt-5">
        <span className="block">Your vision.</span>
        <span className="mt-[0.1em] block">A studio around it.</span>
      </h2>
      <p className="mx-auto mt-4 max-w-[46ch] font-body text-[clamp(12.5px,0.65vw+8px,24px)] font-medium leading-[1.5] text-white/85 sm:mt-5">Artists, strategists and technologists working together on your identity, digital presence and the systems behind your business.</p>
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
  const { locale } = useLanguage();
  const headingFont = locale === "ja" || locale === "ko" ? "font-body" : "font-editorial";
  return (
    <div className={`flex items-start gap-3 ${compact ? "justify-center" : ""}`}>
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14966c] text-white md:h-6 md:w-6" aria-hidden="true">
        <svg className="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.25">
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3 className={`max-w-[1200px] ${headingFont} text-[clamp(1.25rem,1rem+0.72vw,2.8rem)] font-semibold leading-[1.14] tracking-[-0.025em] text-[#141414]`}>
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
  reduceMotion,
}: {
  item: ImagineItem;
  panelId: string;
  phase: CardPhase;
  onActivate: () => void;
  onReturn: () => void;
  isInteractionLocked: boolean;
  reduceMotion: boolean;
}) {
  const isActive = phase === "active";
  const isSummary = phase === "summary";
  const isCovered = phase === "closed" || phase === "revealing" || phase === "returning";
  const isExpanded = isActive || phase === "revealing" || phase === "returning";

  return (
    <div
      id={panelId}
      role="region"
      aria-label={item.solution.heading}
      aria-hidden={isCovered}
      className={`relative h-full w-full overflow-hidden bg-bg-surface-light text-[#171717] ${phase === "closed" ? "absolute inset-0" : ""}`}
    >
      <SovereignFoilContour />

      {isSummary ? (
        <button
          type="button"
          onClick={onActivate}
          disabled={isInteractionLocked}
          className="group relative z-10 flex min-h-[clamp(5.75rem,3vw,9rem)] w-full items-center justify-center px-5 py-5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#d6a900] sm:px-8"
        >
          <StatusHeading item={item} compact />
        </button>
      ) : isExpanded ? (
        <button
          type="button"
          onClick={onReturn}
          disabled={isInteractionLocked}
          aria-label="Return to prompt"
          className="relative z-10 block min-h-[clamp(12rem,7.5vw,18rem)] w-full touch-manipulation px-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#b98b10] disabled:cursor-default sm:px-7 sm:py-5.5 md:px-8 md:py-6 lg:px-10 2xl:px-14 2xl:py-9"
        >
          <div className="mx-auto max-w-[1200px]">
            <StatusHeading item={item} />

            <AnimatePresence initial={false}>
              {isExpanded ? (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: RETURN_EASE }}
                >
                  <p className="mt-2.5 max-w-[1100px] font-body text-[clamp(0.8125rem,0.7rem+0.22vw,1.25rem)] leading-[1.5] text-[#585858]">
                    {item.solution.body}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3.5 md:mt-5 md:gap-x-5 lg:grid-cols-3">
                    {item.solution.stats.slice(0, 3).map((stat, index) => (
                      <div key={stat.label} className={`min-w-0 flex-col text-left ${index === 2 ? "hidden lg:flex" : "flex"}`}>
                        <span className="font-clash text-[clamp(1.5rem,1.2rem+1vw,2.75rem)] font-bold leading-none tracking-[-0.045em] text-[#e5192a]">
                          {stat.value}
                        </span>
                        <span className="mt-1 max-w-[16rem] text-[clamp(0.625rem,0.48rem+0.18vw,0.875rem)] font-semibold uppercase leading-[1.25] tracking-[0.08em] text-[#676767]">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </button>
      ) : (
        <div className="relative z-10 min-h-[12rem] px-5 py-5 sm:px-7 sm:py-5.5 md:min-h-[12.5rem] md:px-8 md:py-6 lg:px-10">
          <div className="mx-auto max-w-[1200px]">
            <StatusHeading item={item} />
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
  reduceMotion,
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
  reduceMotion: boolean;
}) {
  const cardControls = useAnimation();
  const pawControls = useAnimation();
  const panelId = `imagine-result-${index}`;
  const returnCompletionReported = useRef(false);
  const returnPawExitStarted = useRef(false);
  const previousPhase = useRef<CardPhase>(phase);
  const isClosed = phase === "closed";
  const isSummary = phase === "summary";
  const isCovered = phase === "closed" || phase === "revealing" || phase === "returning";

  useEffect(() => {
    if (phase === "active" && previousPhase.current === "revealing") {
      document.querySelector<HTMLButtonElement>(`#${panelId} > button`)?.focus({ preventScroll: true });
    }
    previousPhase.current = phase;
  }, [panelId, phase]);

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
      returnCompletionReported.current = false;
      returnPawExitStarted.current = false;
      return;
    }

    cardControls.set({ y: "105%" });
    pawControls.set({ x: "-10%", y: "105%", rotate: 4, scale: 1.05 });

    if (reduceMotion) {
      cardControls.set({ y: "0%" });
      pawControls.set({ x: "-70%", y: "0%", rotate: -6, scale: 0.9 });
      returnCompletionReported.current = true;
      onReturnComplete();
      return;
    }

    // First return the cover and paw along the same path. The paw exits only
    // after the cover is back, mirroring the reveal choreography in reverse.
    void cardControls.start({ y: "0%", transition: { duration: PULL_DURATION, ease: PULL_EASE } });
    void pawControls.start({
      y: "0%",
      x: "-10%",
      rotate: 4,
      scale: 1.05,
      transition: { duration: PULL_DURATION, ease: PULL_EASE },
    });
  }, [cardControls, onReturnComplete, pawControls, phase, reduceMotion]);

  const handleCoverAnimationComplete = () => {
    if (phase !== "returning" || returnCompletionReported.current || returnPawExitStarted.current) return;

    returnPawExitStarted.current = true;
    void pawControls.start({
      x: "-70%",
      rotate: -6,
      scale: 0.9,
      transition: { duration: PAW_IN_DURATION, ease: RETURN_EASE },
    });
  };

  const handlePawAnimationComplete = () => {
    if (phase !== "returning" || !returnPawExitStarted.current || returnCompletionReported.current) return;

    returnCompletionReported.current = true;
    onReturnComplete();
  };

  return (
    <motion.article
      layout
      transition={reduceMotion ? { duration: 0 } : { duration: 0.82, ease: RETURN_EASE }}
      className={`relative overflow-hidden rounded-[1.375rem] border shadow-[0_18px_32px_-24px_rgba(0,0,0,0.8)] md:rounded-[1.5rem] ${phase !== "closed" ? "border-[#e3b72b]/80 bg-bg-surface-light shadow-[0_0_0_1px_rgba(240,201,23,0.25),0_16px_32px_-24px_rgba(181,135,0,0.8)]" : "border-white/[0.08] bg-black"}`}
    >
      <div className={`relative overflow-hidden ${phase === "closed" ? "h-[clamp(9rem,5vw,12rem)] bg-black" : isSummary ? "" : "min-h-[clamp(12rem,7.5vw,18rem)] bg-bg-surface-light"}`}>
        <SolutionSurface item={item} panelId={panelId} phase={phase} onActivate={onActivateSummary} onReturn={onReturnStart} isInteractionLocked={isInteractionLocked} reduceMotion={reduceMotion} />

        {isCovered ? <motion.button
          type="button"
          aria-expanded={phase === "revealing"}
          aria-controls={panelId}
          disabled={!isClosed || isInteractionLocked}
          onClick={() => void reveal()}
          initial={{ y: "0%" }}
          animate={cardControls}
          onAnimationComplete={handleCoverAnimationComplete}
          className="group absolute inset-0 z-20 flex w-full items-center justify-center overflow-hidden bg-black px-5 pb-10 pt-4 text-center will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#f0c917] sm:px-7 md:px-10"
        >
          <span className="pointer-events-none absolute inset-0 border border-white/[0.04]" aria-hidden="true" />
          <span className="pointer-events-none absolute left-5 top-5 hidden h-1.5 w-1.5 rounded-full bg-[#f0c917] shadow-[0_0_12px_rgba(240,201,23,0.52)] md:block" aria-hidden="true" />
          <span className="relative z-10 max-w-[1200px] font-clash text-[clamp(1.05rem,0.95rem+1.2vw,3.2rem)] font-bold uppercase leading-[1.04] tracking-[-0.012em] [word-spacing:0.07em] text-white">
            {item.problem.heading}
          </span>
        </motion.button> : null}

        {isCovered ? <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-30 h-[6rem] w-[6rem] will-change-transform sm:h-[6.5rem] sm:w-[6.5rem] md:h-[7.25rem] md:w-[7.25rem]"
          initial={{ x: "-50%", y: "0%", rotate: -6, scale: 0.9 }}
          animate={pawControls}
          onAnimationComplete={handlePawAnimationComplete}
        >
          <div className="relative h-full w-full drop-shadow-[0_0_30px_rgba(240,201,23,0.55)]">
            <Image src={PAW_IMAGE} alt="" fill sizes="(min-width: 1024px) 224px, 176px" className="object-contain object-bottom-left" />
          </div>
        </motion.div> : null}

      </div>
    </motion.article>
  );
}

export default function PawRevealStack() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [transition, setTransition] = useState<CardTransition>(null);
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  const [showWorkStream, setShowWorkStream] = useState(false);
  const [circlePhase, setCirclePhase] = useState<"copy" | "clear" | "mark">("copy");
  const [scene, setScene] = useState({ diameter: 1200, height: 900, viewport: 900 });
  const [reduceMotion, setReduceMotion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLElement>(null);
  const staticScene = reduceMotion || scene.viewport < 500;
  // The opening circle is wider than the viewport. Reserve its actual
  // overhang so the previous section cannot cut off its top edge.
  const circleOverhang = Math.max(0, (scene.diameter - scene.viewport) / 2);
  const entryPadding = Math.ceil(circleOverhang + Math.min(128, Math.max(48, scene.viewport * 0.08)));
  const exitPadding = Math.min(64, Math.max(24, scene.viewport * 0.04));
  const { t, locale } = useLanguage();
  const lenis = useLenis();
  const items: ImagineItem[] = t.problems.items;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });
  useEffect(() => {
    if (window.location.hash !== "#problems" && window.location.hash !== "#imagine") return;
    let frame = 0;
    let readyFrame = 0;
    const landOnImagine = () => {
      // The splash releases its body lock and starts Lenis in a React effect.
      // Wait until that commit has painted before restoring a deep link.
      readyFrame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          const section = chapterRef.current;
          if (!section) return;
          if (lenis) lenis.scrollTo(section, { immediate: true, force: true });
          else section.scrollIntoView({ behavior: "instant", block: "start" });
        });
      });
    };
    if (document.documentElement.dataset.splashComplete === "true") landOnImagine();
    else window.addEventListener("lionovart:splash-complete", landOnImagine, { once: true });
    return () => { cancelAnimationFrame(readyFrame); cancelAnimationFrame(frame); window.removeEventListener("lionovart:splash-complete", landOnImagine); };
  }, [lenis]);
  const circleScale = useTransform(
    scrollYProgress,
    staticScene ? [0, 1] : [0, 0.69, 0.85, 0.91, 1],
    staticScene ? [1, 1] : [1, 1, 0.22, 0.075, 0.075],
  );
  const cardOpacity = useTransform(
    scrollYProgress,
    staticScene ? [0, 1] : [0, 0.45, 0.54, 1],
    staticScene ? [1, 1] : [1, 1, 0, 0],
  );
  const cardY = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.54], [0, staticScene ? 0 : -18]);
  const statementOpacity = useTransform(
    scrollYProgress,
    staticScene ? [0, 1] : [0, 0.49, 0.55, 0.71, 0.76, 1],
    staticScene ? [0, 0] : [0, 0, 1, 1, 0, 0],
  );
  const statementY = useTransform(scrollYProgress, staticScene ? [0, 1] : [0.49, 0.76], [staticScene ? 0 : 18, staticScene ? 0 : -14]);
  // Let the partnership copy fully clear before the mark enters. Both still
  // happen during the circle shrink, but their opaque forms never overlap.
  const logoOpacity = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.78, 0.86, 1], staticScene ? [0, 0] : [0, 0.75, 1, 1]);
  const logoMarkScale = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.78, 0.88, 1], staticScene ? [0.8, 0.8] : [0.8, 0.8, 0.68, 0.68]);
  const streamOpacity = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.82, 0.89, 1], staticScene ? [0, 0] : [0, 0, 1, 1]);
  const streamScale = useTransform(scrollYProgress, staticScene ? [0, 1] : [0.82, 1], [0.975, 1]);
  const handoffCaptionOpacity = useTransform(scrollYProgress, staticScene ? [0, 1] : [0, 0.85, 0.91, 1], staticScene ? [0, 0] : [0, 0, 1, 1]);
  const handoffCaptionY = useTransform(scrollYProgress, staticScene ? [0, 1] : [0.85, 0.91], [staticScene ? 0 : 12, 0]);
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => {
      // Viewport geometry alone controls the circle. Card expansion cannot
      // resize the circle or change the scroll journey halfway through.
      const diameter = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight) * 1.08);
      const stageHeight = Math.max(window.innerHeight, content.offsetHeight + 320);
      setScene(previous => previous.diameter === diameter && previous.height === stageHeight && previous.viewport === window.innerHeight ? previous : { diameter, height: stageHeight, viewport: window.innerHeight });
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("resize", measure); };
  }, [locale]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = progress > 0.8;
    setShowWorkStream((current) => (current === next ? current : next));
    const phase = progress < 0.76 ? "copy" : progress < 0.78 ? "clear" : "mark";
    setCirclePhase((current) => (current === phase ? current : phase));
  });

  const startReveal = useCallback((index: number) => {
    if (transition) return false;

    setTransition({ kind: "reveal", index });
    return true;
  }, [transition]);

  const completeReveal = useCallback((index: number) => {
    setActiveIndex(index);
    setRevealedIndexes((previous) => (previous.includes(index) ? previous : [...previous, index]));
    setTransition((current) => current?.kind === "reveal" && current.index === index ? null : current);
  }, []);

  const startReturn = useCallback((index: number) => {
    if (transition || activeIndex !== index) return false;

    setTransition({ kind: "return", index });
    return true;
  }, [activeIndex, transition]);

  const completeReturn = useCallback((index: number) => {
    setActiveIndex((current) => current === index ? null : current);
    setRevealedIndexes((current) => current.filter((value) => value !== index));
    setTransition((current) => current?.kind === "return" && current.index === index ? null : current);
  }, []);

  const activateSummary = useCallback((index: number) => {
    if (transition) return;

    setActiveIndex(index);
  }, [transition]);

  return (
    <section
      ref={chapterRef}
      id="problems"
      aria-label="Imagine and one partnership"
      style={{ paddingTop: entryPadding, paddingBottom: exitPadding, height: scene.height + (staticScene ? 0 : scene.viewport * 4.1) + entryPadding + exitPadding }}
      className="relative z-30 isolate overflow-clip bg-bg-surface-light"
    >
      <div style={{ height: scene.height, top: Math.min(0, (scene.viewport - scene.height) / 2) }} className={staticScene ? "relative isolate overflow-visible" : "sticky isolate overflow-visible"}>
        <GoldThreads />
        {showWorkStream && !staticScene ? <motion.div
          style={{ opacity: streamOpacity, scale: streamScale }}
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
          style={{ scale: staticScene ? 1 : circleScale, width: scene.diameter }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#f51b2c] will-change-transform"
        >
          <div aria-hidden="true" className="absolute inset-0 rounded-full shadow-[0_46px_120px_-52px_rgba(245,27,44,0.58),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-34px_90px_rgba(105,0,14,0.1)]" />
          <motion.div style={{ opacity: staticScene ? 0 : statementOpacity, y: staticScene ? 0 : statementY, visibility: circlePhase === "copy" ? "visible" : "hidden" }} className="absolute inset-0 flex items-center justify-center px-[min(20vw,260px)] text-center text-white">
            <PartnershipStatement />
          </motion.div>
          <motion.img src="/images/lionovart-icon.svg" alt="" aria-hidden="true" style={{ opacity: staticScene ? 0 : logoOpacity, scale: staticScene ? 0.8 : logoMarkScale, visibility: circlePhase === "mark" ? "visible" : "hidden" }} className="absolute inset-0 h-full w-full object-contain p-[12%]" decoding="async" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ opacity: staticScene ? 0 : handoffCaptionOpacity, y: staticScene ? 0 : handoffCaptionY }}
          className="pointer-events-none absolute inset-0 z-[25] flex items-center justify-center"
        >
          <LogoHandoffWords />
        </motion.div>

        <motion.div
          style={{ opacity: staticScene ? 1 : cardOpacity, y: staticScene ? 0 : cardY, pointerEvents: transition === null ? "auto" : "none" }}
          className="absolute inset-0 z-30 flex items-center justify-center px-3.5 py-5 sm:px-6 md:py-7"
        >
          <div ref={contentRef} data-imagine-content className="w-full">
            <motion.div className="mx-auto mb-[clamp(2rem,4svh,4.5rem)] flex w-full max-w-[min(92vw,1600px)] flex-col items-center px-2 text-center" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
              <p className="mb-2 font-clash text-[0.625rem] font-semibold uppercase tracking-[0.17em] text-white sm:mb-3 sm:text-xs">{t.problems.eyebrow}</p>
              <h2 className="max-w-full font-clash text-[clamp(3rem,1.5rem+5vw,8rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em] text-balance text-white [overflow-wrap:anywhere]">
                {t.problems.heading}
              </h2>
            </motion.div>

            <div className="mx-auto flex w-full max-w-[clamp(660px,48vw,1800px)] flex-col gap-2.5 sm:gap-3">
              {items.map((item, index) => {
                const phase: CardPhase = transition?.index === index ? transition.kind === "return" ? "returning" : "revealing" : activeIndex === index ? "active" : revealedIndexes.includes(index) ? "summary" : "closed";
                return <PawRevealCard key={item.problem.heading} item={item} index={index} phase={phase} onRevealStart={() => startReveal(index)} onRevealComplete={() => completeReveal(index)} onReturnStart={() => startReturn(index)} onReturnComplete={() => completeReturn(index)} onActivateSummary={() => activateSummary(index)} isInteractionLocked={transition !== null} reduceMotion={reduceMotion} />;
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
