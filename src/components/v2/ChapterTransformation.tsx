"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/* ─── Chapter 3 — The Transformation (dark, red energy) ──────────────
   Triptych: scattered brand fragments (before) cross the threshold
   portal and settle into a clean, aligned stack (after). Elegant and
   mature, one continuous read, no arrows.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

const FRAGMENTS = ["Identity", "Content", "Website", "Socials"];

const BEFORE_OFFSETS: { left: string; top: string; rotate: number }[] = [
  { left: "-6%", top: "0%", rotate: -3 },
  { left: "4%", top: "16%", rotate: 2 },
  { left: "-10%", top: "34%", rotate: -1 },
  { left: "2%", top: "52%", rotate: 4 },
];

export default function ChapterTransformation() {
  const reduceMotion = useReducedMotion();
  /* Reduced motion is expressed ONLY through transition timing (duration
     0), never by branching rendered styles/animate on reduceMotion, which
     is null during SSR but resolves instantly on the client and caused a
     hydration mismatch (see the master plan's Progress Log). With
     duration 0 the drift keyframes end where they start (0), so the
     ambient loop collapses to static for reduced-motion users. */

  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] py-28 md:py-40">
      {/* Center red energy, this chapter's atmosphere */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(circle at center, rgba(229,25,42,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 md:px-12">
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE }}
            className="v2-serif mx-auto max-w-[18ch] text-center text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.05] text-[#f2ede3]"
          >
            Strong alone. Stronger together.
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.1, ease: EASE }}
          className="mx-auto mt-6 max-w-[46ch] text-center text-base leading-[1.7] text-white/60 md:text-lg"
        >
          You bring the vision, the drive, the standard. We bring the direction that pulls it into
          one world.
        </motion.p>

        {/* Triptych: before -> threshold -> after */}
        <div className="mt-20 grid grid-cols-1 items-center gap-16 md:mt-28 md:grid-cols-12 md:gap-8">
          {/* Before — scattered fragments, deliberately misaligned */}
          <div className="relative order-1 h-56 md:col-span-4 md:h-72">
            {FRAGMENTS.map((word, i) => (
              <motion.span
                key={word}
                className="absolute"
                style={{ left: BEFORE_OFFSETS[i].left, top: BEFORE_OFFSETS[i].top }}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 0.8, delay: i * 0.1, ease: EASE }
                }
              >
                <motion.span
                  className="v2-display block text-lg font-semibold uppercase tracking-[0.08em] text-white/35 md:text-xl"
                  style={{ rotate: `${BEFORE_OFFSETS[i].rotate}deg` }}
                  animate={{ x: [0, 4, -3, 0], y: [0, -4, 3, 0] }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 6 + i, repeat: Infinity, ease: "easeInOut" }
                  }
                >
                  {word}
                </motion.span>
              </motion.span>
            ))}
          </div>

          {/* Threshold — the portal fragments cross through */}
          <div className="relative order-2 flex justify-center md:col-span-4">
            <motion.div
              aria-hidden
              className="absolute left-1/2 -top-16 h-16 w-px -translate-x-1/2 origin-top md:-top-24 md:h-24"
              style={{ background: "linear-gradient(to bottom, transparent, #e5192a)" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 1.1, delay: 0.3, ease: EASE }
              }
              className="relative aspect-square w-56 overflow-hidden rounded-full border border-[#e5192a]/40 md:w-72"
              style={{ boxShadow: "0 0 80px rgba(229,25,42,0.25)" }}
            >
              <Image
                src="/images/hero_img/1231234.webp"
                alt=""
                fill
                sizes="(max-width: 768px) 224px, 288px"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              aria-hidden
              className="absolute left-1/2 top-full h-16 w-px -translate-x-1/2 origin-top md:h-24"
              style={{ background: "linear-gradient(to bottom, #e5192a, transparent)" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 1, delay: 0.6, ease: EASE }
              }
            />
          </div>

          {/* After — the same fragments, realigned under the mark */}
          <div className="relative order-3 flex flex-col items-center gap-6 md:col-span-4 md:items-start">
            <div className="relative inline-flex">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(240,201,23,0.22) 0%, transparent 70%)",
                }}
              />
              <Image src="/images/LOGO.svg" alt="" width={360} height={58} className="h-6 w-auto" />
            </div>

            <div className="flex flex-col items-center gap-2 md:items-start">
              {FRAGMENTS.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.85, delay: 0.9 + i * 0.1, ease: EASE }
                  }
                  className="v2-display text-lg font-semibold uppercase tracking-[0.08em] text-white md:text-xl"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
