"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getWhatsAppUrl } from "@/lib/contact";
import MagneticCTA from "@/components/v2/MagneticCTA";

/* Chapter 1 - Hero (dark, cinematic)
   Full-bleed lion stage: media owns the viewport, copy sits in a left
   scrim, red story line exits into Chapter 2. */

const EASE = [0.16, 1, 0.3, 1] as const;
const POSTER = "/images/hero_img/34513451.webp";
const HERO_VIDEO = "/videos/v2/hero-lion.mp4";

export default function ChapterHero() {
  const reduceMotion = useReducedMotion();
  const [playHeroVideo, setPlayHeroVideo] = useState(false);
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => setPlayHeroVideo(true), 600);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  const container = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.14, delayChildren: 0.3 },
    },
  };

  const rise = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.9, ease: EASE },
    },
  };

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden lg:justify-center">
      <div aria-hidden className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 2.2, ease: EASE }}
        >
          <Image
            src={POSTER}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_22%] lg:object-[center_30%]"
          />
          {playHeroVideo ? (
            <video
              className="absolute inset-0 h-full w-full object-cover object-[center_22%] lg:object-[center_30%]"
              src={HERO_VIDEO}
              poster={POSTER}
              muted
              loop
              playsInline
              autoPlay
              preload="none"
            />
          ) : null}
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/75 to-[#0d0d0d]/25 lg:via-[#0d0d0d]/55 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0d0d0d]/70 to-transparent" />

        <div
          className="absolute -left-[15%] bottom-[-25%] h-[70vh] w-[70vw]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(229,25,42,0.14) 0%, rgba(74,13,20,0.08) 40%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-16 pt-28 md:px-12 lg:pb-24 lg:pt-24"
      >
        <div className="max-w-[720px]">
          <motion.p
            variants={rise}
            className="mb-6 text-[11px] font-medium uppercase tracking-[0.32em] text-[#e5192a] md:text-xs"
          >
            Not content. A world.
          </motion.p>

          <motion.h1
            variants={rise}
            className="v2-serif text-[clamp(2.8rem,8.5vw,7.25rem)] font-medium uppercase leading-[0.98] tracking-[-0.01em]"
          >
            <span className="block text-[#f2ede3]">The Art of</span>
            <span className="block text-[#e5192a]">Innovation</span>
          </motion.h1>

          <motion.p
            variants={rise}
            className="mt-7 max-w-[46ch] text-base leading-[1.65] text-white/70 md:text-lg"
          >
            We craft cinematic brand worlds through strategy, identity, films,
            content, platforms, and innovation that move people and build
            unforgettable brands.
          </motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticCTA className="w-full sm:w-auto">
              <a
                href={getWhatsAppUrl("Hello Leon, I'd like to start a project with LIONOVART.")}
                target="_blank"
                rel="noopener noreferrer"
                className="v2-display block w-full rounded-full bg-[#e5192a] px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#c9101f] active:scale-[0.98] sm:w-auto"
              >
                Start Your Project
              </a>
            </MagneticCTA>
            <MagneticCTA className="w-full sm:w-auto">
              <a
                href="#work"
                className="v2-display block w-full rounded-full border border-white/25 px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:border-white/70 active:scale-[0.98] sm:w-auto"
              >
                View Our Work
              </a>
            </MagneticCTA>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute bottom-0 left-6 z-10 w-px origin-top md:left-12"
        style={{
          height: "clamp(64px, 10vh, 120px)",
          background: "linear-gradient(to bottom, transparent, #e5192a)",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1.1, delay: 1.6, ease: EASE }}
      />
    </section>
  );
}