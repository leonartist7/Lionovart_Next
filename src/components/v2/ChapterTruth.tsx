"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/* ─── Chapter 2 — The Truth (dark) ───────────────────────────────────
   Recognition beat: strong brands stay invisible without direction.
   The three points are deliberately mis-indented so the composition
   itself reads as "scattered"; each slides in from a different side.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

const POINTS = [
  {
    title: "No clear direction",
    body: "Strong work, pointing in three directions at once.",
    indent: "md:ml-0",
    fromX: -24,
  },
  {
    title: "Scattered presence",
    body: "A brand that looks different on every platform.",
    indent: "md:ml-[10%]",
    fromX: 0,
  },
  {
    title: "Forgotten too soon",
    body: "Seen for a moment, then lost in the feed.",
    indent: "md:ml-[20%]",
    fromX: 24,
  },
];

export default function ChapterTruth() {
  const reduceMotion = useReducedMotion();

  /* Reduced motion is expressed ONLY through transition timing
     (duration 0), never by branching rendered styles on reduceMotion:
     useReducedMotion() is null during SSR but resolves instantly on the
     client, so a style-affecting branch makes server HTML and a
     reduced-motion client's first paint disagree (hydration mismatch,
     see the master plan's Progress Log). */
  const rise = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.9, ease: EASE },
    },
  };

  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] py-28 md:py-40">
      {/* Faint ember texture grounding the chapter; heavy dark overlay
          keeps copy contrast intact. */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/images/hero_img/134634.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#0d0d0d]/70 to-[#0d0d0d]" />
      </div>

      {/* Red story line entering from Chapter 1 */}
      <motion.div
        aria-hidden
        className="absolute left-6 top-0 w-px origin-top md:left-12"
        style={{
          height: "clamp(64px, 10vh, 120px)",
          background: "linear-gradient(to bottom, #e5192a, transparent)",
        }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1.1, ease: EASE }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 md:px-12">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={rise}
          className="v2-serif max-w-[16ch] text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.05] text-[#f2ede3] md:ml-[8%]"
        >
          Many strong brands stay invisible.
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={rise}
          className="mt-8 max-w-[52ch] text-base leading-[1.7] text-white/65 md:ml-[8%] md:text-lg"
        >
          They have the vision. The drive. The product. But online they look
          scattered, inconsistent, easy to forget. The problem is not effort.
          It is direction.
        </motion.p>

        <div className="mt-20 flex flex-col gap-12 md:mt-28 md:gap-14">
          {POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              className={`max-w-[420px] ${point.indent}`}
              initial={{ opacity: 0, x: point.fromX, y: 16 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.85, delay: i * 0.12, ease: EASE }
              }
            >
              <h3 className="v2-display text-lg font-semibold text-white md:text-2xl">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-[1.6] text-white/50">
                {point.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
