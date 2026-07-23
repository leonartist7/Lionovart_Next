"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/* ─── Chapter 8 — Founder-Led (warm cream) ───────────────────────────
   Portrait split. Diagonal light wedge slices over Chapter 7's dark
   close. Beliefs as a litany, not bullets.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

const BELIEFS = [
  "Story before content.",
  "Feeling before format.",
  "Strategy before design.",
  "Direction before production.",
  "Legacy over trends.",
];

export default function ChapterFounder() {
  const reduceMotion = useReducedMotion();

  const lineReveal = {
    hidden: { y: "100%" },
    visible: {
      y: "0%",
      transition: reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE },
    },
  };

  return (
    <section
      className="relative -mt-[2.5vw] bg-[#f2ede3] text-[#171412] md:-mt-[4vw] [clip-path:polygon(0_2.5vw,100%_0,100%_100%,0_100%)] md:[clip-path:polygon(0_4vw,100%_0,100%_100%,0_100%)]"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 pb-28 pt-[calc(2.5vw+5rem)] md:px-12 md:pb-40 md:pt-[calc(4vw+7rem)]">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-14">
          {/* Portrait — first on mobile, right ~42% on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE }
            }
            className="relative order-1 aspect-[3/4] w-full overflow-hidden rounded-2xl md:order-2 md:col-span-5"
          >
            <Image
              src="/images/Leon-Studioshot.avif"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover object-top"
            />
            {/* Gold as light, bottom-up, never a flat fill */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#8a6d2f]/20 via-[#8a6d2f]/05 to-transparent"
            />
            {/* Soft edge melt into cream stage */}
            <div
              aria-hidden
              className="absolute inset-0 ring-1 ring-inset ring-[#171412]/10"
            />
          </motion.div>

          {/* Copy left */}
          <div className="order-2 md:order-1 md:col-span-7">
            <motion.div
              className="overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <motion.h2
                variants={lineReveal}
                className="v2-serif max-w-[16ch] text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.05] text-[#171412]"
              >
                Founder-led. Artist-minded. Strategy-obsessed.
              </motion.h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.9, delay: 0.1, ease: EASE }
              }
              className="mt-8 max-w-[52ch] text-base leading-[1.7] text-[#171412]/65 md:text-lg"
            >
              I&apos;m Leonardo, founder and creative director of LIONOVART. I
              think like an artist, compose like a musician, and build like an
              entrepreneur. That is the heart of LIONOVART: art, innovation, and
              execution working together.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.8, delay: 0.16, ease: EASE }
              }
              className="mt-6 text-sm text-[#171412]/60"
            >
              Leonardo, Founder &amp; Creative Director
            </motion.p>

            <ul className="mt-12 list-none space-y-3 p-0 md:mt-16">
              {BELIEFS.map((line, i) => (
                <motion.li
                  key={line}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.75,
                          delay: 0.08 + i * 0.08,
                          ease: EASE,
                        }
                  }
                  className="v2-display text-[13px] font-semibold uppercase tracking-[0.14em] text-[#171412]/70"
                >
                  {line}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
