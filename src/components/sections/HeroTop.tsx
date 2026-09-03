"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroCycling, { type Word } from "@/components/sections/HeroCycling";
import HeroSiteScore from "@/components/ui/HeroSiteScore";
import { useLanguage } from "@/contexts/LanguageContext";
import { EN_WORD_ART } from "@/lib/word-art";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const LAUREL_LEFT = "/images/hero_img/Laurel-L.avif";
const LAUREL_RIGHT = "/images/hero_img/Laurel-R.avif";

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
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, ease: EASE_OUT },
  },
};

type HeroTopProps = {
  staticText?: string;
  subtitle?: string;
  cyclingWords?: string[];
};

function LaurelFrame({ children, featured = false }: { children: ReactNode; featured?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
      <Image
        src={LAUREL_LEFT}
        alt=""
        aria-hidden
        width={80}
        height={140}
        className={`pointer-events-none h-auto shrink-0 select-none object-contain ${featured ? "w-8 sm:w-10 xl:w-11" : "w-7 sm:w-8 xl:w-9"}`}
      />
      <div className={`flex shrink-0 flex-col items-center justify-center text-center ${featured ? "min-w-[112px] sm:min-w-[136px]" : "min-w-[88px] sm:min-w-[108px]"}`}>
        {children}
      </div>
      <Image
        src={LAUREL_RIGHT}
        alt=""
        aria-hidden
        width={80}
        height={140}
        className={`pointer-events-none h-auto shrink-0 select-none object-contain ${featured ? "w-8 sm:w-10 xl:w-11" : "w-7 sm:w-8 xl:w-9"}`}
      />
    </div>
  );
}

function HeroLaurels() {
  return (
    <div
      className="grid w-full max-w-[770px] grid-cols-2 items-center justify-items-center gap-x-1 gap-y-3 sm:flex sm:flex-wrap sm:justify-start sm:gap-x-3 xl:flex-nowrap xl:gap-x-4"
      aria-label="5 star client experience. Proven results. Creative excellence."
    >
      <div className="order-2 sm:order-1">
        <LaurelFrame>
          <span className="font-clash text-[15px] font-black uppercase leading-[0.9] tracking-[-0.04em] text-brand-red sm:text-[17px] xl:text-[19px]">Proven</span>
          <span className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/78 sm:text-[9px]">Results</span>
        </LaurelFrame>
      </div>

      <div className="order-1 col-span-2 sm:order-2 sm:col-span-1">
        <LaurelFrame featured>
          <div className="flex items-center justify-center gap-[2px]" aria-hidden>
            {[0, 1, 2, 3, 4].map((star) => (
              <img
                key={star}
                src="https://res.cloudinary.com/dgio9uutc/image/upload/v1787020126/Golden_Beveled_Star_Icon_wwcwek.webp"
                alt=""
                draggable={false}
                className="h-3.5 w-3.5 object-contain sm:h-4 sm:w-4"
              />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-center" aria-hidden>
            {AVATARS.map((src, index) => (
              <span
                key={src}
                className="relative h-[18px] w-[18px] overflow-hidden rounded-full border border-brand-red bg-black sm:h-5 sm:w-5"
                style={{ marginLeft: index === 0 ? 0 : -4, zIndex: AVATARS.length - index }}
              >
                <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
              </span>
            ))}
          </div>
          <span className="mt-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.13em] text-white/86 sm:text-[9px]">Client experience</span>
        </LaurelFrame>
      </div>

      <div className="order-3">
        <LaurelFrame>
          <span className="font-clash text-[14px] font-black uppercase leading-[0.9] tracking-[-0.04em] text-brand-red sm:text-[16px] xl:text-[18px]">Creative</span>
          <span className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-white/78 sm:text-[9px]">Excellence</span>
        </LaurelFrame>
      </div>
    </div>
  );
}

function LionHeroArtwork() {
  return (
    <motion.div
      variants={itemVariants}
      className="relative mx-auto flex w-full max-w-[34rem] items-center justify-center lg:mx-0 lg:max-w-[39rem]"
    >
      <div aria-hidden className="absolute left-[6%] top-[8%] h-[74%] w-[74%] rounded-full bg-brand-red/20 blur-[100px]" />
      <div aria-hidden className="absolute bottom-[5%] right-[4%] h-[48%] w-[48%] rounded-full bg-[#c7a86a]/16 blur-[90px]" />
      <div aria-hidden className="absolute inset-[6%] rounded-full border border-white/[0.08]" />
      <div aria-hidden className="absolute inset-[13%] rounded-full border border-[#d5b36a]/20" />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, rotate: -1.2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.05, delay: 0.14, ease: EASE_OUT }}
        className="relative aspect-square w-[88%] overflow-hidden rounded-full shadow-[0_42px_110px_-38px_rgba(0,0,0,0.92)]"
      >
        <Image
          src="/images/LION-CIRCLE.avif"
          alt="Lionovart lion artwork"
          fill
          priority
          sizes="(max-width: 1023px) 88vw, 46vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),transparent_32%,rgba(229,25,42,0.09)_78%,rgba(199,168,106,0.13))]" />
      </motion.div>

      <div className="absolute -left-1 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 -rotate-90 items-center gap-3 lg:flex">
        <span className="h-px w-12 bg-[#c7a86a]/45" />
        <span className="whitespace-nowrap font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-white/42">The art of innovation</span>
      </div>

      <div className="absolute bottom-[2%] right-[3%] hidden h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/25 backdrop-blur-md lg:flex">
        <span className="font-clash text-[10px] font-semibold uppercase leading-[1.05] tracking-[0.08em] text-white/74">Lead<br />Create<br />Rise</span>
      </div>
    </motion.div>
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
      : heroOutcomeWords.map((content) => ({ content, type: "text" as const, holdMs: 3200 }));

  return (
    <section
      className="relative min-h-svh overflow-hidden bg-[#090909] px-5 pb-16 pt-[clamp(7.4rem,13vh,9.4rem)] text-white sm:px-7 sm:pb-20 lg:px-10 xl:px-14"
      aria-labelledby="hero-title"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(70%_65%_at_18%_42%,rgba(229,25,42,0.12),transparent_58%),radial-gradient(58%_48%_at_83%_38%,rgba(199,168,106,0.07),transparent_64%),linear-gradient(180deg,#090909_0%,#0b0b0c_72%,#0a0a0a_100%)]" />
        <div className="absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 mx-auto grid min-h-[calc(100svh-9rem)] w-full max-w-[1540px] grid-cols-12 content-center gap-x-4 gap-y-7 sm:gap-x-6 lg:gap-x-[clamp(2rem,4vw,5rem)] lg:gap-y-5"
      >
        <motion.div
          variants={itemVariants}
          id="hero-title"
          className="order-1 col-span-12 text-left lg:order-none lg:col-start-7 lg:col-span-6 lg:row-start-1 lg:self-end"
        >
          <div className="mb-4 flex items-center gap-3 sm:mb-5">
            <span className="h-px w-8 bg-brand-red sm:w-11" />
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-white/48 sm:text-[9px]">Creative + innovation studio</span>
          </div>
          <HeroCycling
            staticText={staticText}
            words={cyclingWords}
            fontSize="clamp(2.85rem, 8.9vw, 6.35rem)"
            cyclingFontSize="clamp(3.15rem, 10.2vw, 7.25rem)"
            imageFontSize="clamp(3rem, 9.6vw, 6.8rem)"
            cyclingColor="#e5192a"
            letterSpacing="-0.045em"
            align="start"
          />
        </motion.div>

        <div className="order-2 col-span-12 lg:order-none lg:col-start-1 lg:col-span-6 lg:row-start-1 lg:row-span-3 lg:self-center">
          <LionHeroArtwork />
        </div>

        <motion.div
          variants={itemVariants}
          className="order-3 col-span-12 lg:order-none lg:col-start-7 lg:col-span-6 lg:row-start-2 lg:self-center"
        >
          <p className="max-w-[42rem] font-body text-[0.98rem] leading-[1.65] text-white/62 sm:text-[1.08rem] lg:text-[1.08rem] xl:text-[1.16rem]">
            {subtitle}
          </p>
          <div className="mt-5 max-w-[540px] sm:mt-6 [&>div]:!mx-0">
            <HeroSiteScore />
          </div>
          <Link
            href="/audit"
            className="mt-2 inline-flex min-h-10 items-center font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/36 transition-colors hover:text-white/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Skip to the full audit <span aria-hidden className="ml-2">↗</span>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="order-4 col-span-12 pt-1 lg:order-none lg:col-start-7 lg:col-span-6 lg:row-start-3 lg:self-start lg:pt-2"
        >
          <HeroLaurels />
        </motion.div>
      </motion.div>
    </section>
  );
}
