"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroCycling, { type Word } from "@/components/sections/HeroCycling";
import HeroSiteScore from "@/components/ui/HeroSiteScore";
import { useLanguage } from "@/contexts/LanguageContext";
import { EN_WORD_ART } from "@/lib/word-art";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: EASE_OUT },
  },
};

type HeroTopProps = {
  staticText?: string;
  subtitle?: string;
  cyclingWords?: string[];
};

/**
 * Signature arrival: one clear promise, one useful conversion action, one
 * restrained credibility line. Expensive legacy counters/laurels were removed
 * from this critical path so the first viewport stays fast and honest.
 */
export default function HeroTop(props: HeroTopProps) {
  const { t, locale } = useLanguage();
  const staticText = props.staticText ?? t.hero.staticText;
  const subtitle = props.subtitle ?? t.hero.subtitle;
  const cyclingWordsRaw = props.cyclingWords ?? t.hero.cyclingWords;
  const heroOutcomeWords = [cyclingWordsRaw[1], cyclingWordsRaw[2], cyclingWordsRaw[4]].filter(Boolean) as string[];

  const cyclingWords: Word[] =
    locale === "en"
      ? EN_WORD_ART
      : heroOutcomeWords.map((content) => ({
          content,
          type: "text" as const,
          holdMs: 3200,
        }));

  return (
    <section
      className="relative flex min-h-[min(900px,100svh)] flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-[clamp(7.25rem,13vh,9.5rem)] text-center sm:px-6 sm:pb-20 sm:pt-[clamp(7.75rem,14vh,10rem)] lg:pt-[clamp(8.25rem,15vh,11rem)]"
      aria-labelledby="hero-title"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,9,0.42)_0%,rgba(7,7,9,0.34)_44%,rgba(7,7,9,0.78)_82%,#0a0a0a_100%)]" />
        <div className="absolute left-1/2 top-[20%] h-[26rem] w-[min(72vw,54rem)] -translate-x-1/2 rounded-full bg-brand-red/[0.07] blur-[90px] md:bg-brand-red/[0.06]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-40 flex w-full max-w-[64rem] flex-col items-center gap-6 sm:gap-7 md:gap-8"
      >
        <motion.div variants={itemVariants} className="w-full" id="hero-title">
          <HeroCycling
            staticText={staticText}
            words={cyclingWords}
            fontSize="clamp(2.45rem, 9.2vw, 6.9rem)"
            cyclingFontSize="clamp(2.95rem, 11.8vw, 8.8rem)"
            imageFontSize="clamp(2.7rem, 10.1vw, 7.6rem)"
            cyclingColor="#e5192a"
            letterSpacing="-0.035em"
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="max-w-[44rem] font-body text-[0.98rem] leading-[1.65] text-white/64 sm:text-[1.05rem] md:text-[1.15rem]"
        >
          {subtitle}
        </motion.p>

        <motion.div variants={itemVariants} className="mt-1 w-full sm:mt-2">
          <HeroSiteScore />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link
            href="/audit"
            className="inline-flex min-h-11 items-center text-[12px] font-medium tracking-[0.02em] text-white/48 underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:text-white/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0a]"
          >
            or skip to a full audit <span aria-hidden className="ml-1">→</span>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-1 flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/58 sm:gap-x-4 sm:text-[10px] md:text-[11px]"
          aria-label="5 star client experience. Proven results. Creative excellence."
        >
          <span className="text-brand-gold">5★ client experience</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-brand-red" />
          <span>Proven results</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-brand-red" />
          <span>Creative excellence</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
