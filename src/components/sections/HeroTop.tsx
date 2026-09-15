"use client";
import { useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import HeroCycling, { type Word } from "./HeroCycling";
import HeroSitePeek from "@/components/ui/HeroSitePeek";
import { useLanguage } from "@/contexts/LanguageContext";
import { EN_WORD_ART } from "@/lib/word-art";
import { LionSlot, useLionJourney } from "./lion-journey/LionJourney";

export default function HeroTop() {
  const journey = useLionJourney();
  const { t, locale } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const smoothScroll = useSpring(scrollY, { damping: 26, stiffness: 180, mass: 0.24 });
  const titleOpacity = useTransform(smoothScroll, [0, 180], [0.26, 1]);
  const titleY = useTransform(smoothScroll, [0, 180], [18, 0]);
  const titleFilter = useTransform(smoothScroll, [0, 180], ["blur(3px) saturate(0.42)", "blur(0px) saturate(1)"]);
  const descriptionOpacity = useTransform(smoothScroll, [28, 220], [0.34, 1]);
  const descriptionY = useTransform(smoothScroll, [28, 220], [12, 0]);
  const descriptionColor = useTransform(smoothScroll, [28, 220], ["#78747b", "#e5e0d8"]);
  const fallbackPause = useMotionValue(false);
  const [paused, setPaused] = useState(false);
  useMotionValueEvent(journey?.paused ?? fallbackPause, "change", setPaused);
  const words: Word[] = locale === "en" ? EN_WORD_ART : [1, 2, 4].map(i => ({ content: t.hero.cyclingWords[i], type: "text", holdMs: 3200 }));
  return <section ref={journey?.hero} className="lion-hero">
    <LionSlot />
    <motion.div
      ref={journey?.copy}
      className="lion-copy"
      style={reduceMotion ? undefined : { opacity: titleOpacity, y: titleY, filter: titleFilter }}
    >
      <HeroCycling staticText={locale === "en" ? ["MAKE", "YOUR BRAND"] : t.hero.staticText}
        words={words} paused={paused} alignment="left" fontSize="var(--lion-title-size)"
        cyclingFontSize="var(--lion-word-size)" imageFontSize="var(--lion-word-size)"
        cyclingColor="#e5bd77" letterSpacing="-0.035em" />
    </motion.div>
    <motion.p
      className="lion-description"
      style={reduceMotion ? undefined : { opacity: descriptionOpacity, y: descriptionY, color: descriptionColor }}
    >
      {t.hero.subtitle}
    </motion.p>
    <div className="lion-cta"><HeroSitePeek /></div>
    <p className="lion-trust">{locale === "en" ? "Trusted by 50+ ambitious brands globally across 20+ industries." : t.hero.trustText}</p>
  </section>;
}
