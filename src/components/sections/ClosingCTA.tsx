"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { SHOWCASE_IMAGES } from "./showcase-images";
import styles from "./ClosingCTA.module.css";
import HeroCycling, { type Word } from "@/components/sections/HeroCycling";
import VideoBackdrop from "@/components/ui/VideoBackdrop";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { useNovaStore } from "@/lib/stores/nova-store";
import { useLanguage } from "@/contexts/LanguageContext";
import BrandCrest from "@/components/sections/services/brand/branding/BrandCrest";
import TrailAttractionTarget from "@/components/ui/TrailAttractionTarget";
import { EN_WORD_ART } from "@/lib/word-art";

// Capped at 1080p (master is 4K) and q_auto:eco — this sits under a bg-black/70
// scrim, so the extra quality was never visible.
const FOOTER_CLIP =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto:eco/v1779845599/Footage_02_chsoa3.mp4";

const showcaseImages = SHOWCASE_IMAGES.map(src => ({ src }));
const subscribeVisibility = (callback: () => void) => {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
};
const getHidden = () => document.hidden;
const getServerHidden = () => true;

function CompactClosing({ words, onStart }: { words: Word[]; onStart: () => void }) {
  const tr = usePublicCopy();
  const { t, locale } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);
  const reducedMotion = useHydratedReducedMotion();
  const hidden = useSyncExternalStore(subscribeVisibility, getHidden, getServerHidden);
  const [stageWidth, setStageWidth] = useState(390);
  const paused = reducedMotion || hidden || !inView;
  const mobile = stageWidth < 640;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => setStageWidth(Math.max(1, entry.contentRect.width)));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const path = useMemo(() => ({
    cardWidth: 17.5,
    cardHeight: 23.5,
    birthHeight: 3.4,
    exitHeight: (stageWidth < 640 ? 125 : stageWidth < 1024 ? 180 : 230) / stageWidth * 100,
    railBirth: -5.5,
    railExit: stageWidth < 640 ? 58 : 85,
    fan: 2.7,
    turnBirth: 5,
    turnExit: 23,
    stops: 18,
  }), [stageWidth]);

  return (
    <section id="closing-cta" ref={sectionRef} className={styles.section} data-art-directed="light" data-scroll-title-skip>
      <div className={styles.copy}>
        <p className={`${styles.accent} ${locale === "ja" || locale === "ko" ? "font-body" : "editorial-accent"}`}>{tr("Your next chapter, together")}</p>
        <HeroCycling variant="closing" staticText={t.hero.staticText} words={words} staticColor="#171412" cyclingColor="#171412" paused={paused} />
        <p className={styles.description}>{tr("Bring your ambition. We will shape the identity, experiences and systems to carry it forward.")}</p>
      </div>
      <div ref={stageRef} className={styles.stage} data-closing-stage>
        <div className={styles.media} aria-hidden="true">
          <ImageStreamHero images={showcaseImages} cards={6} speed={30} axis={mobile ? 65 : 58} path={path} paused={paused} className={styles.stream} />
        </div>
        <div className={styles.action}>
          <TrailAttractionTarget>
            <LiquidMetalButton label={tr("Start\nyour brand")} stackedLabel width={172} height={172} paused={paused} onClick={onStart} />
          </TrailAttractionTarget>
        </div>
      </div>
    </section>
  );
}

/**
 * ClosingCTA — the single, canonical page close. Cinematic video backdrop +
 * the kinetic cycling-words headline + one liquid-metal button that opens Nova.
 * Used once per page (the footer is now navigation/legal only), so pages never
 * double-close. `crest` adds the brand crest beside the button (branding page).
 */
export default function ClosingCTA({ crest = false, workShowcase = false }: { crest?: boolean; workShowcase?: boolean }) {
  const tr = usePublicCopy();
  const { t, locale } = useLanguage();
  const openNova = useNovaStore((s) => s.openNova);

  // Keep the page close emotional and decisive while the hero owns the more
  // concrete outcome language. Index positions stay aligned across locales.
  // English renders the same word-art AVIFs as the hero (shared EN_WORD_ART);
  // other locales keep the emotional translated cadence as live text.
  const closingWordStrings = [
    t.hero.cyclingWords?.[0],
    t.hero.cyclingWords?.[3],
    t.hero.cyclingWords?.[5],
  ].filter(Boolean) as string[];
  const words: Word[] =
    locale === "en"
      ? EN_WORD_ART
      : closingWordStrings.map((content) => ({
          content,
          type: "text" as const,
        }));

  if (workShowcase) return <CompactClosing words={words} onStart={() => openNova("offer", true)} />;

  return (
    <section
      id="closing-cta"
      className={`relative overflow-hidden px-6 pb-16 pt-20 text-center md:pb-20 md:pt-28 ${workShowcase ? "bg-bg-surface-light text-[#171412]" : "bg-bg-dark text-white"}`}
    >
      {!workShowcase ? <VideoBackdrop src={FOOTER_CLIP} className="absolute inset-0 z-0" overlayClassName="bg-black/70" /> : null}

      <div className="relative z-40 mx-auto flex max-w-[1280px] flex-col items-center gap-8 md:gap-10">
        <p className={locale === "ja" || locale === "ko" ? "text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red md:text-[13px]" : "editorial-accent editorial-closing text-brand-red"}>{tr("Your next chapter, together")}</p>

        <div className="w-full">
          <HeroCycling
            staticText={t.hero.staticText}
            staticColor={workShowcase ? "#171412" : "#ffffff"}
            cyclingColor={workShowcase ? "#171412" : "#ffffff"}
            words={words}
            fontSize="clamp(2.6rem, 9.5vw, 7rem)"
            cyclingFontSize="clamp(3.2rem, 12.5vw, 9.5rem)"
            imageFontSize="clamp(2.86rem, 10.45vw, 7.7rem)"

          />
        </div>

        <p className={`max-w-[46ch] font-body text-[15px] leading-[1.6] md:text-[18px] ${workShowcase ? "text-black/65" : "text-white/70"}`}>{tr("Bring your ambition. We will shape the identity, experiences and systems to carry it forward.")}</p>

        <div className="mt-2 flex items-center gap-5">
          {crest && <BrandCrest className="h-12 w-auto md:h-14" />}
          <TrailAttractionTarget>
            <LiquidMetalButton label={tr("Start your brand")} width={220} onClick={() => openNova("offer", true)} />
          </TrailAttractionTarget>
        </div>
      </div>
    </section>
  );
}
