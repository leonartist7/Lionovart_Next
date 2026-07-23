"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/* Chapter 5 - The Brand World System (cream)
   Image-led service panels with real mass and service links. */

const EASE = [0.16, 1, 0.3, 1] as const;

type Pillar = {
  name: string;
  outcome: string;
  capabilities: string;
  imageSrc: string;
  href: string;
  imageRight: boolean;
  fullBleed?: boolean;
};

const PILLARS: Pillar[] = [
  {
    name: "Brand Worlds",
    outcome: "A brand people recognize, trust, and remember.",
    capabilities: "Strategy, identity, naming, visual systems.",
    imageSrc: "/videos/v2/work-1.jpg",
    href: "/services/brand",
    imageRight: true,
  },
  {
    name: "Brand Films & Content Universe",
    outcome: "One story, told in every format that matters.",
    capabilities:
      "Brand films, founder stories, campaign and short-form content.",
    imageSrc: "/videos/v2/film-frame.jpg",
    href: "/services/content-studio",
    imageRight: false,
  },
  {
    name: "Brand Platforms",
    outcome: "A digital home built to move people and perform.",
    capabilities:
      "Cinematic websites, digital ecosystems, intelligent brand experiences.",
    imageSrc: "/videos/v2/platform-frame.jpg",
    href: "/services/web",
    imageRight: true,
    fullBleed: true,
  },
  {
    name: "Experience Lab",
    outcome: "Brand presence beyond the screen.",
    capabilities:
      "Smart glass, projection, audiovisual environments. Concept-led, produced with partners.",
    imageSrc: "/videos/v2/work-6.jpg",
    href: "#lab",
    imageRight: false,
  },
];

export default function ChapterSystem() {
  const reduceMotion = useReducedMotion();

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

        <div className="mt-20 flex flex-col gap-16 md:mt-28 md:gap-24">
          {PILLARS.map((pillar, i) => {
            const isExternal = pillar.href.startsWith("/");
            const media = (
              <div
                className={`v2-plate-melt-cream relative overflow-hidden rounded-2xl ${
                  pillar.fullBleed
                    ? "aspect-[16/9] w-full lg:aspect-[21/9]"
                    : "aspect-[4/3] w-full"
                }`}
              >
                <Image
                  src={pillar.imageSrc}
                  alt=""
                  fill
                  sizes={
                    pillar.fullBleed
                      ? "100vw"
                      : "(max-width: 1024px) 100vw, 50vw"
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            );

            const copy = (
              <div className="flex min-w-0 flex-col justify-center">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="block h-2 w-2 shrink-0 rounded-full bg-[#e5192a]"
                  />
                  <span className="v2-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e5192a]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="v2-display text-2xl font-semibold text-[#171412] md:text-3xl">
                  {pillar.name}
                </h3>
                <p className="v2-serif mt-3 text-lg font-normal italic leading-[1.25] text-[#171412]">
                  {pillar.outcome}
                </p>
                <p className="mt-3 max-w-[42ch] text-base leading-[1.65] text-[#171412]/65">
                  {pillar.capabilities}
                </p>
                {isExternal ? (
                  <Link
                    href={pillar.href}
                    className="v2-display mt-7 inline-flex w-fit items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#e5192a] transition-colors hover:text-[#c9101f]"
                  >
                    Explore
                    <span aria-hidden className="text-base leading-none">
                      {"->"}
                    </span>
                  </Link>
                ) : (
                  <a
                    href={pillar.href}
                    className="v2-display mt-7 inline-flex w-fit items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#e5192a] transition-colors hover:text-[#c9101f]"
                  >
                    Explore
                    <span aria-hidden className="text-base leading-none">
                      {"->"}
                    </span>
                  </a>
                )}
              </div>
            );

            return (
              <motion.article
                key={pillar.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.9,
                        delay: 0.06 + i * 0.05,
                        ease: EASE,
                      }
                }
                className="group"
              >
                {pillar.fullBleed ? (
                  <div className="flex flex-col gap-8">
                    {media}
                    <div className="max-w-[560px]">{copy}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                    <div
                      className={`lg:col-span-6 ${
                        pillar.imageRight ? "lg:order-2" : "lg:order-1"
                      }`}
                    >
                      {media}
                    </div>
                    <div
                      className={`lg:col-span-6 ${
                        pillar.imageRight ? "lg:order-1" : "lg:order-2"
                      }`}
                    >
                      {copy}
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}