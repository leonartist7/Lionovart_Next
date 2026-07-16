"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/* ─── Chapter 5 — The Brand World System (cream) ─────────────────────
   Connected vertical rail: four pillars hang off a continuous red
   story line. Eyebrow 2 of 3 page-wide. No cards, no borders.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

/* Local studio stills until Part C kit frames land at
   /videos/v2/film-frame.jpg and platform-frame.jpg. */
type Pillar = {
  name: string;
  outcome: string;
  capabilities: string;
  /** Offset CONTENT only (not the rail) on desktop rows 2 and 4 */
  offset: boolean;
  imageSrc?: string;
};

const PILLARS: Pillar[] = [
  {
    name: "Brand Worlds",
    outcome: "A brand people recognize, trust, and remember.",
    capabilities: "Strategy, identity, naming, visual systems.",
    offset: false,
  },
  {
    name: "Brand Films & Content Universe",
    outcome: "One story, told in every format that matters.",
    capabilities: "Brand films, founder stories, campaign and short-form content.",
    offset: true,
    imageSrc: "/images/hero_img/1235.webp",
  },
  {
    name: "Brand Platforms",
    outcome: "A digital home built to move people and perform.",
    capabilities:
      "Cinematic websites, digital ecosystems, intelligent brand experiences.",
    offset: false,
    imageSrc: "/images/hero_img/123613.webp",
  },
  {
    name: "Experience Lab",
    outcome: "Brand presence beyond the screen.",
    capabilities:
      "Smart glass, projection, audiovisual environments. Concept-led, produced with partners.",
    offset: true,
  },
];

export default function ChapterSystem() {
  const reduceMotion = useReducedMotion();

  /* Reduced motion is expressed ONLY through transition timing
     (duration 0), never by branching rendered styles on reduceMotion. */

  const lineReveal = {
    hidden: { y: "100%" },
    visible: {
      y: "0%",
      transition: reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE },
    },
  };

  return (
    <section className="relative overflow-hidden bg-[#f2ede3] py-28 text-[#171412] md:py-40">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 md:px-12">
        <div className="max-w-[720px]">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.8, ease: EASE }
            }
            className="mb-6 text-[11px] font-medium uppercase tracking-[0.32em] text-[#e5192a] md:text-xs"
          >
            The Brand World System
          </motion.p>

          {/* Masked reveal: viewport props on the overflow wrapper, not the
              clipped child (IO measures after clipping; see Progress Log). */}
          <motion.div
            className="overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.h2
              variants={lineReveal}
              className="v2-serif text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.05] text-[#171412]"
            >
              One story. Four forces. Endless momentum.
            </motion.h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.9, delay: 0.1, ease: EASE }
            }
            className="mt-6 max-w-[52ch] text-base leading-[1.7] text-[#171412]/65 md:text-lg"
          >
            Everything your brand needs, connected into one world.
          </motion.p>
        </div>

        {/* Continuous rail: constant x. Offset content blocks only. */}
        <ul className="mt-20 flex list-none flex-col gap-16 p-0 md:mt-28 md:gap-20">
          {PILLARS.map((pillar, i) => {
            const isLast = i === PILLARS.length - 1;
            return (
              <li key={pillar.name} className="relative flex gap-6 md:gap-10">
                <div className="relative w-2 shrink-0 self-stretch">
                  {/* Segment runs DOWN from this node through the list gap to
                      the next node. Last row ends at its node (no segment).
                      gap-16 = 4rem; md:gap-20 = 5rem. */}
                  {!isLast ? (
                    <motion.div
                      aria-hidden
                      className="absolute left-1/2 top-2 h-[calc(100%+4rem)] w-px origin-top -translate-x-1/2 bg-[#e5192a] md:top-2.5 md:h-[calc(100%+5rem)]"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 1.1, delay: i * 0.08, ease: EASE }
                      }
                    />
                  ) : null}
                  <motion.span
                    aria-hidden
                    className="absolute left-1/2 top-2 z-10 block h-2 w-2 -translate-x-1/2 rounded-full bg-[#e5192a] md:top-2.5"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.6,
                            delay: 0.1 + i * 0.08,
                            ease: EASE,
                          }
                    }
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.9,
                          delay: 0.12 + i * 0.08,
                          ease: EASE,
                        }
                  }
                  className={`min-w-0 flex-1 ${pillar.offset ? "md:ml-[6%]" : ""} ${
                    pillar.imageSrc
                      ? "flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12"
                      : "max-w-[560px]"
                  }`}
                >
                  <div className="min-w-0 max-w-[560px] flex-1">
                    <h3 className="v2-display text-2xl font-semibold text-[#171412] md:text-3xl">
                      {pillar.name}
                    </h3>
                    <p className="v2-serif mt-3 pb-1 text-lg font-normal italic leading-[1.2] text-[#171412]">
                      {pillar.outcome}
                    </p>
                    <p className="mt-3 text-base leading-[1.65] text-[#171412]/65">
                      {pillar.capabilities}
                    </p>
                  </div>

                  {pillar.imageSrc ? (
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl md:ml-auto md:w-56">
                      <Image
                        src={pillar.imageSrc}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 224px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
