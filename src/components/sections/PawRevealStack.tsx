"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimation, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
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

type CardPhase = "closed" | "revealing" | "active";
type CardTransition = { index: number } | null;

const REVEAL_HINT: Record<string, string> = {
  en: "Tap to reveal",
  es: "Toca para descubrir",
  fr: "Appuyez pour découvrir",
  it: "Tocca per scoprire",
  ja: "タップして見る",
  ko: "탭하여 확인",
};

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

function StatusHeading({ item }: { item: ImagineItem }) {
  const { locale } = useLanguage();
  const headingFont = locale === "ja" || locale === "ko" ? "font-body" : "font-clash";
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14966c] text-white md:h-6 md:w-6" aria-hidden="true">
        <svg className="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.25">
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3 className={`min-w-0 max-w-[1200px] [overflow-wrap:anywhere] ${headingFont} text-[clamp(1.25rem,1rem+0.72vw,2.8rem)] font-semibold leading-[1.14] tracking-[-0.025em] text-[#141414]`}>
        {item.solution.heading}
      </h3>
    </div>
  );
}

function SolutionSurface({
  item,
  panelId,
  phase,
}: {
  item: ImagineItem;
  panelId: string;
  phase: CardPhase;
}) {
  return (
    <div
      id={panelId}
      role="region"
      tabIndex={-1}
      aria-label={item.solution.heading}
      aria-hidden={phase !== "active"}
      className={`relative w-full overflow-hidden bg-bg-surface-light text-[#171717] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#b98b10] ${phase === "closed" ? "absolute inset-0" : ""}`}
    >
      <SovereignFoilContour />
      <div className="relative z-10 min-h-[12rem] w-full px-5 py-5 sm:px-7 md:px-8 md:py-6 lg:px-10 2xl:px-14 2xl:py-9">
        <div className="mx-auto max-w-[1200px]">
          <StatusHeading item={item} />
          <p className="mt-2.5 max-w-[1100px] font-body text-[clamp(0.875rem,0.75rem+0.22vw,1.25rem)] leading-[1.5] text-[#585858] [overflow-wrap:anywhere]">
            {item.solution.body}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3.5 md:mt-5 md:gap-x-5 lg:grid-cols-3">
            {item.solution.stats.slice(0, 3).map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-col text-left">
                <span className="font-clash text-[clamp(1.5rem,1.2rem+1vw,2.75rem)] font-bold leading-none tracking-[-0.045em] text-[#e5192a] [overflow-wrap:anywhere]">
                  {stat.value}
                </span>
                <span className="mt-1 max-w-[16rem] font-body text-[clamp(0.6875rem,0.55rem+0.18vw,0.875rem)] font-semibold uppercase leading-[1.35] tracking-[0.06em] text-[#676767] [overflow-wrap:anywhere]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PawRevealCard({
  item,
  index,
  phase,
  onRevealStart,
  onRevealComplete,
  isInteractionLocked,
  reduceMotion,
}: {
  item: ImagineItem;
  index: number;
  phase: CardPhase;
  onRevealStart: () => boolean;
  onRevealComplete: () => void;
  isInteractionLocked: boolean;
  reduceMotion: boolean;
}) {
  const { locale } = useLanguage();
  const cardControls = useAnimation();
  const pawControls = useAnimation();
  const panelId = `imagine-result-${index}`;
  const previousPhase = useRef<CardPhase>(phase);
  const isClosed = phase === "closed";
  const isCovered = phase !== "active";

  useEffect(() => {
    if (phase === "active" && previousPhase.current === "revealing") {
      document.getElementById(panelId)?.focus({ preventScroll: true });
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

  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-[1.375rem] border shadow-[0_18px_32px_-24px_rgba(0,0,0,0.8)] md:rounded-[1.5rem] ${isClosed ? "border-white/[0.08] bg-black" : "border-[#e3b72b]/80 bg-bg-surface-light shadow-[0_0_0_1px_rgba(240,201,23,0.25),0_16px_32px_-24px_rgba(181,135,0,0.8)]"}`}
    >
      <div className={`relative overflow-hidden ${isClosed ? "min-h-[clamp(9rem,5vw,12rem)] bg-black" : "bg-bg-surface-light"}`}>
        {isClosed ? <div aria-hidden="true" className="invisible flex min-h-[clamp(9rem,5vw,12rem)] flex-col items-center justify-center gap-3 px-5 pb-10 pt-4 text-center sm:px-7 md:px-10">
          <span className="max-w-[1200px] font-clash text-[clamp(1.05rem,0.95rem+1.2vw,3.2rem)] font-bold uppercase leading-[1.04] tracking-[-0.012em] [word-spacing:0.07em] [overflow-wrap:anywhere]">{item.problem.heading}</span>
          <span className="font-body text-xs font-medium leading-snug sm:text-sm">{REVEAL_HINT[locale] ?? REVEAL_HINT.en}</span>
        </div> : null}
        <SolutionSurface item={item} panelId={panelId} phase={phase} />

        {isCovered ? <motion.button
          type="button"
          aria-expanded={phase === "revealing"}
          aria-controls={panelId}
          disabled={!isClosed || isInteractionLocked}
          onClick={() => void reveal()}
          initial={{ y: "0%" }}
          animate={cardControls}
          className="group absolute inset-0 z-20 flex w-full touch-manipulation flex-col items-center justify-center gap-3 overflow-hidden bg-black px-5 pb-10 pt-4 text-center will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#f0c917] sm:px-7 md:px-10"
        >
          <span className="pointer-events-none absolute inset-0 border border-white/[0.04]" aria-hidden="true" />
          <span className="pointer-events-none absolute left-5 top-5 hidden h-1.5 w-1.5 rounded-full bg-[#f0c917] shadow-[0_0_12px_rgba(240,201,23,0.52)] md:block" aria-hidden="true" />
          <span className="relative z-10 max-w-[1200px] font-clash text-[clamp(1.05rem,0.95rem+1.2vw,3.2rem)] font-bold uppercase leading-[1.04] tracking-[-0.012em] [word-spacing:0.07em] text-white [overflow-wrap:anywhere]">
            {item.problem.heading}
          </span>
          <span className="relative z-10 font-body text-xs font-medium leading-snug text-white/70 sm:text-sm">
            {REVEAL_HINT[locale] ?? REVEAL_HINT.en}
          </span>
        </motion.button> : null}

        {isCovered ? <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-30 h-[6rem] w-[6rem] will-change-transform sm:h-[6.5rem] sm:w-[6.5rem] md:h-[7.25rem] md:w-[7.25rem]"
          initial={{ x: "-50%", y: "0%", rotate: -6, scale: 0.9 }}
          animate={pawControls}
        >
          <div className="relative h-full w-full drop-shadow-[0_0_30px_rgba(240,201,23,0.55)]">
            <Image src={PAW_IMAGE} alt="" fill sizes="(min-width: 768px) 116px, (min-width: 640px) 104px, 96px" className="object-contain object-bottom-left" />
          </div>
        </motion.div> : null}
      </div>
    </article>
  );
}

export default function PawRevealStack() {
  const [transition, setTransition] = useState<CardTransition>(null);
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  const [showWorkStream, setShowWorkStream] = useState(false);
  const [circlePhase, setCirclePhase] = useState<"copy" | "clear" | "mark">("copy");
  const [scene, setScene] = useState({ diameter: 1200, height: 900, viewport: 900 });
  const [reduceMotion, setReduceMotion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLElement>(null);
  const staticScene = reduceMotion || scene.viewport < 500 || scene.height > scene.viewport * 1.2;
  // The opening circle is wider than the viewport. Reserve its actual
  // overhang so the previous section cannot cut off its top edge.
  const circleOverhang = staticScene ? 0 : Math.max(0, (scene.diameter - scene.viewport) / 2);
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
      // Keep every revealed card within the stage, including after wrapping,
      // font loading and resize. Tall stacks use normal document scrolling.
      const stageHeight = Math.max(window.innerHeight, content.offsetHeight + 160);
      const diameter = Math.ceil(Math.hypot(window.innerWidth, stageHeight) * 1.08);
      setScene(previous => previous.diameter === diameter && previous.height === stageHeight && previous.viewport === window.innerHeight ? previous : { diameter, height: stageHeight, viewport: window.innerHeight });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [locale]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = progress > 0.8;
    setShowWorkStream((current) => (current === next ? current : next));
    const phase = progress < 0.76 ? "copy" : progress < 0.78 ? "clear" : "mark";
    setCirclePhase((current) => (current === phase ? current : phase));
  });

  const revealLock = useRef(false);
  const startReveal = useCallback((index: number) => {
    if (revealLock.current) return false;
    revealLock.current = true;
    setTransition({ index });
    return true;
  }, []);

  const completeReveal = useCallback((index: number) => {
    setRevealedIndexes((previous) => (previous.includes(index) ? previous : [...previous, index]));
    setTransition((current) => current?.index === index ? null : current);
    revealLock.current = false;
  }, []);

  return (
    <section
      ref={chapterRef}
      id="problems"
      aria-label="Imagine and one partnership"
      style={{ paddingTop: entryPadding, paddingBottom: exitPadding, height: scene.height + (staticScene ? 0 : scene.viewport * 4.1) + entryPadding + exitPadding }}
      className="relative z-30 isolate overflow-clip bg-bg-surface-light"
    >
      <div style={{ height: scene.height, top: staticScene ? 0 : Math.min(0, (scene.viewport - scene.height) / 2) }} className={staticScene ? "relative overflow-visible" : "sticky overflow-visible"}>
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
          className={`${staticScene ? "relative min-h-full" : "absolute inset-0"} z-30 flex items-center justify-center px-3.5 py-5 sm:px-6 md:py-7`}
        >
          <div ref={contentRef} data-imagine-content className="w-full">
            <motion.div className="mx-auto mb-[clamp(2rem,4svh,4.5rem)] flex w-full max-w-[min(92vw,1600px)] flex-col items-center px-2 text-center" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
              <p className="mb-2 font-clash text-[0.625rem] font-semibold uppercase tracking-[0.17em] text-white sm:mb-3 sm:text-xs">{t.problems.eyebrow}</p>
              <h2 className="max-w-full font-clash text-[clamp(3rem,1.5rem+5vw,8rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em] text-balance text-white [overflow-wrap:anywhere]">
                {t.problems.heading}
              </h2>
            </motion.div>

            <div className="mx-auto flex w-full max-w-[clamp(660px,48vw,1800px)] min-w-0 flex-col gap-2.5 sm:gap-3">
              {items.map((item, index) => {
                const phase: CardPhase = transition?.index === index ? "revealing" : revealedIndexes.includes(index) ? "active" : "closed";
                return <PawRevealCard key={item.problem.heading} item={item} index={index} phase={phase} onRevealStart={() => startReveal(index)} onRevealComplete={() => completeReveal(index)} isInteractionLocked={transition !== null} reduceMotion={reduceMotion} />;
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
