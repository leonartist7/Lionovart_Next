"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getWhatsAppUrl } from "@/lib/contact";
import MagneticCTA from "@/components/v2/MagneticCTA";

/* ─── Chapter 1 — Hero (dark, cinematic) ─────────────────────────────
   Asymmetric stage: copy anchored left, lion presence dissolving in
   from the right, red story line exiting the chapter at the bottom.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ChapterHero() {
  const reduceMotion = useReducedMotion();

  /* Reduced motion is expressed ONLY through transition timing
     (duration 0), never by branching rendered styles on reduceMotion:
     useReducedMotion() is null during SSR but resolves instantly on the
     client, so any style-affecting branch on it makes the server HTML
     and a reduced-motion client's first paint disagree — a hydration
     mismatch (see the master plan's Progress Log). Transitions never
     appear in SSR output, so gating them is hydration-safe. */
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
      {/* ── Cinematic backdrop ─────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0">
        {/* Lion presence — dissolves into the stage on entry.
            Placeholder-structured: swap the src for the final hero
            asset without touching layout. */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[48vh] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[64%]"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 2.2, ease: EASE }}
        >
          <Image
            src="/images/hero_img/34513451.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 64vw"
            className="object-cover object-[center_18%] lg:object-[center_30%]"
          />
          {/* Melt the plate into the stage — no hard photo edges */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/35 to-[#0d0d0d]/60 lg:bg-gradient-to-r lg:from-[#0d0d0d] lg:via-[#0d0d0d]/25 lg:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
        </motion.div>

        {/* Low red ember glow grounding the copy side */}
        <div
          className="absolute -left-[15%] bottom-[-25%] h-[70vh] w-[70vw]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(229,25,42,0.14) 0%, rgba(74,13,20,0.08) 40%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Copy — anchored left, generous negative space right ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-14 pt-[40vh] md:px-12 lg:py-0 lg:pt-24"
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
            className="mt-7 max-w-[46ch] text-base leading-[1.65] text-white/65 md:text-lg"
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

      {/* ── Red story line — the signature motif begins here and will
             thread every chapter together. Draws down after the copy
             settles, pointing into Chapter 2. ── */}
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
