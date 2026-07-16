"use client";

import { motion, useReducedMotion } from "framer-motion";

/* ─── Chapter 5 — The Brand World System (cream) ─────────────────────
   Connected vertical rail: four pillars hang off a continuous red
   story line. Eyebrow 2 of 3 page-wide. No cards, no borders.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

/* Prefer Part C kit stills when present; picsum seeds are the shipped
   fallback so this chapter never blocks on asset generation. Plain <img>
   (not next/image) because picsum is outside next.config remotePatterns
   and next.config is out of scope for v2 chapter work. */
const FILM_FRAME =
  "https://picsum.photos/seed/lionovart-film-frame/640/480";
const PLATFORM_FRAME =
  "https://picsum.photos/seed/lionovart-platform/640/480";

type Pillar = {
  name: string;
  outcome: string;
  capabilities: string;
  /** Rows 2 and 4 offset on desktop */
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
    imageSrc: FILM_FRAME,
  },
  {
    name: "Brand Platforms",
    outcome: "A digital home built to move people and perform.",
    capabilities:
      "Cinematic websites, digital ecosystems, intelligent brand experiences.",
    offset: false,
    imageSrc: PLATFORM_FRAME,
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
     (duration 0), never by branching rendered styles on reduceMotion:
     useReducedMotion() is null during SSR but resolves instantly on the
     client (see the master plan's Progress Log). */

  return (
    <section className="relative overflow-hidden bg-[#f2ede3] py-28 text-[#171412] md:py-40">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 md:px-12">
        {/* Header */}
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

          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE }
              }
              className="v2-serif text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.05] text-[#171412]"
            >
              One story. Four forces. Endless momentum.
            </motion.h2>
          </div>

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

        {/* Connected vertical rail + pillar rows */}
        <ul className="mt-20 flex list-none flex-col gap-16 p-0 md:mt-28 md:gap-20">
          {PILLARS.map((pillar, i) => (
            <li
              key={pillar.name}
              className={`relative ${pillar.offset ? "md:ml-[6%]" : ""}`}
            >
              <div className="flex gap-6 md:gap-10">
                {/* Rail column: segment + node, centered on the 8px track */}
                <div className="relative w-2 shrink-0 self-stretch">
                  <motion.div
                    aria-hidden
                    className="absolute left-1/2 top-0 w-px -translate-x-1/2 origin-top bg-[#e5192a]"
                    style={{
                      /* Segment reaches into the gap toward the previous node
                         so the rail reads continuous; first segment starts
                         at the node. */
                      top: i === 0 ? "0.5rem" : "calc(-5rem)",
                      height: i === 0 ? "0.5rem" : "calc(100% + 5rem)",
                    }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 1.1, delay: i * 0.08, ease: EASE }
                    }
                  />
                  <motion.span
                    aria-hidden
                    className="absolute left-1/2 top-2 z-10 block h-2 w-2 -translate-x-1/2 rounded-full bg-[#e5192a]"
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
                  className={`min-w-0 flex-1 ${
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
                    <div className="w-full shrink-0 overflow-hidden rounded-2xl md:ml-auto md:w-56">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pillar.imageSrc}
                        alt=""
                        width={640}
                        height={480}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>
                  ) : null}
                </motion.div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
