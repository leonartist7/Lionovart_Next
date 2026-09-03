"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroCycling, { type Word } from "@/components/sections/HeroCycling";
import HeroSiteScore from "@/components/ui/HeroSiteScore";
import { useLanguage } from "@/contexts/LanguageContext";
import { EN_WORD_ART } from "@/lib/word-art";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const LAUREL_LEFT = "https://res.cloudinary.com/dgio9uutc/image/upload/v1787020265/Laurel-L_vxtg55.webp";
const LAUREL_RIGHT = "https://res.cloudinary.com/dgio9uutc/image/upload/v1787020265/Laurel-R_kj7isz.webp";

const AVATARS = [
  "/images/Testimonials/UK/Jess-Beautysalon-W.avif",
  "/images/Testimonials/Northlinemotors/Marc-Cardealer-M.jpg",
  "/images/Testimonials/Italy/Lumura/Team2025.avif",
  "/images/Testimonials/Spain/Pablo-hotel-M.avif",
  "/images/Testimonials/Canada/Maya-Flowerstore-W.avif",
];

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

function LaurelFrame({ children, featured = false }: { children: ReactNode; featured?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
      <img
        src={LAUREL_LEFT}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`pointer-events-none h-auto shrink-0 select-none object-contain ${
          featured ? "w-[38px] sm:w-[45px] md:w-[52px]" : "w-[31px] sm:w-[38px] md:w-[44px]"
        }`}
      />
      <div
        className={`flex shrink-0 flex-col items-center justify-center text-center ${
          featured ? "min-w-[118px] sm:min-w-[138px] md:min-w-[160px]" : "min-w-[92px] sm:min-w-[112px] md:min-w-[130px]"
        }`}
      >
        {children}
      </div>
      <img
        src={LAUREL_RIGHT}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`pointer-events-none h-auto shrink-0 select-none object-contain ${
          featured ? "w-[38px] sm:w-[45px] md:w-[52px]" : "w-[31px] sm:w-[38px] md:w-[44px]"
        }`}
      />
    </div>
  );
}

function HeroLaurels() {
  return (
    <div
      className="mx-auto grid w-full max-w-[900px] grid-cols-2 items-center justify-items-center gap-x-1 gap-y-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-3 md:gap-x-5"
      aria-label="5 star client experience. Proven results. Creative excellence."
    >
      <motion.div
        className="order-2 sm:order-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.42, ease: EASE_OUT }}
      >
        <LaurelFrame>
          <span className="font-clash text-[16px] font-black uppercase leading-[0.9] tracking-[-0.03em] text-brand-red sm:text-[18px] md:text-[21px]">
            Proven
          </span>
          <span className="mt-1 font-clash text-[9px] font-bold uppercase tracking-[0.16em] text-white sm:text-[10px] md:text-[11px]">
            Results
          </span>
        </LaurelFrame>
      </motion.div>

      <motion.div
        className="order-1 col-span-2 sm:order-2 sm:col-span-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: EASE_OUT }}
      >
        <LaurelFrame featured>
          <div className="flex items-center justify-center gap-[2px] sm:gap-[3px]" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((star) => (
              <img
                key={star}
                src="https://res.cloudinary.com/dgio9uutc/image/upload/v1787020126/Golden_Beveled_Star_Icon_wwcwek.webp"
                alt=""
                draggable={false}
                className="h-3.5 w-3.5 object-contain sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]"
              />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-center" aria-hidden="true">
            {AVATARS.map((src, index) => (
              <span
                key={src}
                className="relative h-[18px] w-[18px] overflow-hidden rounded-full border border-brand-red bg-black sm:h-5 sm:w-5 md:h-[22px] md:w-[22px]"
                style={{ marginLeft: index === 0 ? 0 : -4, zIndex: AVATARS.length - index }}
              >
                <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
              </span>
            ))}
          </div>
          <span className="mt-1.5 font-clash text-[9px] font-bold uppercase leading-[1.05] tracking-[0.12em] text-white sm:text-[10px] md:text-[11px]">
            Client experience
          </span>
        </LaurelFrame>
      </motion.div>

      <motion.div
        className="order-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.58, ease: EASE_OUT }}
      >
        <LaurelFrame>
          <span className="font-clash text-[15px] font-black uppercase leading-[0.9] tracking-[-0.03em] text-brand-red sm:text-[17px] md:text-[19px]">
            Creative
          </span>
          <span className="mt-1 font-clash text-[9px] font-bold uppercase tracking-[0.12em] text-white sm:text-[10px] md:text-[11px]">
            Excellence
          </span>
        </LaurelFrame>
      </motion.div>
    </div>
  );
}

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
      className="relative flex min-h-[min(900px,100svh)] flex-col items-center justify-center overflow-hidden px-4 pb-14 pt-[clamp(7.25rem,13vh,9.5rem)] text-center sm:px-6 sm:pb-16 sm:pt-[clamp(7.75rem,14vh,10rem)] lg:pt-[clamp(8.25rem,15vh,11rem)]"
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

        <motion.div variants={itemVariants} className="mt-1 w-full sm:mt-2">
          <HeroLaurels />
        </motion.div>
      </motion.div>
    </section>
  );
}
