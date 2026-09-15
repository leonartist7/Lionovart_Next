"use client";
import { useState } from "react";
import { useMotionValue, useMotionValueEvent } from "framer-motion";
import HeroCycling, { type Word } from "./HeroCycling";
import HeroSitePeek from "@/components/ui/HeroSitePeek";
import { useLanguage } from "@/contexts/LanguageContext";
import { EN_WORD_ART } from "@/lib/word-art";
import { LionSlot, useLionJourney } from "./lion-journey/LionJourney";

export default function HeroTop() {
  const journey = useLionJourney();
  const { t, locale } = useLanguage();
  const fallbackPause = useMotionValue(false);
  const [paused, setPaused] = useState(false);
  useMotionValueEvent(journey?.paused ?? fallbackPause, "change", setPaused);
  const words: Word[] = locale === "en" ? EN_WORD_ART : [1, 2, 4].map(i => ({ content: t.hero.cyclingWords[i], type: "text", holdMs: 3200 }));
  return <section ref={journey?.hero} className="lion-hero">
    <LionSlot />
    <div ref={journey?.copy} className="lion-copy">
      <HeroCycling staticText={locale === "en" ? ["MAKE", "YOUR BRAND"] : t.hero.staticText}
        words={words} paused={paused} alignment="left" fontSize="var(--lion-title-size)"
        cyclingFontSize="var(--lion-word-size)" imageFontSize="var(--lion-word-size)"
        cyclingColor="#e5bd77" letterSpacing="-0.035em" />
    </div>
    <p className="lion-description">{t.hero.subtitle}</p>
    <div className="lion-cta"><HeroSitePeek /></div>
    <p className="lion-trust">{locale === "en" ? "Trusted by 50+ ambitious brands globally across 20+ industries." : t.hero.trustText}</p>
  </section>;
}
