"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getWhatsAppUrl } from "@/lib/contact";
import MagneticCTA from "@/components/v2/MagneticCTA";

/* ─── Chapter 6 — Selected Work (cream -> dark) ──────────────────────
   Asymmetric editorial grid. Cinematic teasers, honest labels. id=work.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

type WorkItem = {
  label: string;
  title: string;
  src: string;
  col: string;
  aspect: string;
};

/* Drop-in replaceable. Labels only from the approved list.
   Part C kit stills at /videos/v2/work-{1..6}.jpg */
const WORK_TOP: WorkItem[] = [
  {
    label: "Website Build",
    title: "Lionovart.com",
    src: "/videos/v2/work-1.jpg",
    col: "md:col-span-7",
    aspect: "aspect-[4/3]",
  },
  {
    label: "Brand Identity",
    title: "Identity system in progress",
    src: "/videos/v2/work-2.jpg",
    col: "md:col-span-5",
    aspect: "aspect-[3/4]",
  },
  {
    label: "Creative Study",
    title: "Cinematic still exploration",
    src: "/videos/v2/work-3.jpg",
    col: "md:col-span-5",
    aspect: "aspect-[3/4]",
  },
  {
    label: "Concept Direction",
    title: "Immersive space concept",
    src: "/videos/v2/work-4.jpg",
    col: "md:col-span-7",
    aspect: "aspect-[16/10]",
  },
];

const WORK_BOTTOM: WorkItem[] = [
  {
    label: "Content System",
    title: "Short-form story system",
    src: "/videos/v2/work-5.jpg",
    col: "md:col-span-8",
    aspect: "aspect-[16/10]",
  },
  {
    label: "Campaign Direction",
    title: "Launch campaign direction",
    src: "/videos/v2/work-6.jpg",
    col: "md:col-span-4",
    aspect: "aspect-[3/4]",
  },
];

function WorkTile({
  item,
  index,
  light,
  reduceMotion,
}: {
  item: WorkItem;
  index: number;
  light: boolean;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.9, delay: index * 0.06, ease: EASE }
      }
      className={`col-span-1 ${item.col}`}
    >
      <div
        className={`group relative overflow-hidden rounded-2xl ${item.aspect} ${
          light ? "v2-plate-melt" : "v2-plate-melt-cream"
        }`}
      >
        <Image
          src={item.src}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#e5192a] md:mt-4">
        {item.label}
      </p>
      <p
        className={`mt-1 text-base font-medium leading-snug md:text-lg ${
          light ? "text-white/95" : "text-[#171412]"
        }`}
      >
        {item.title}
      </p>
    </motion.article>
  );
}

export default function ChapterWork() {
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
      id="work"
      className="relative overflow-hidden bg-[#f2ede3] pt-28 md:pt-36"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 md:px-12">
        <div className="max-w-[720px]">
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
              Selected work and creative directions.
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
            Built work, creative studies, and directions in progress. Labeled
            honestly.
          </motion.p>
        </div>

        {/* Rows 1-2 on cream: 7+5 / 5+7 — tighter rhythm than first cut */}
        <div className="mt-14 grid grid-cols-1 gap-7 md:mt-20 md:grid-cols-12 md:gap-x-5 md:gap-y-8">
          {WORK_TOP.map((item, i) => (
            <WorkTile
              key={item.title}
              item={item}
              index={i}
              light={false}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>

      {/* Final band: cream -> dark, last row 8+4 with light captions */}
      <div className="relative mt-6 min-h-[28vh] md:mt-8">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#f2ede3] via-[#1a1210] to-[#0d0d0d]"
        />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-24 pt-4 md:px-12 md:pb-32">
          <div className="grid grid-cols-1 gap-7 md:grid-cols-12 md:gap-x-5 md:gap-y-8">
            {WORK_BOTTOM.map((item, i) => (
              <WorkTile
                key={item.title}
                item={item}
                index={i + 4}
                light
                reduceMotion={reduceMotion}
              />
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.9, ease: EASE }
            }
            className="mt-14 max-w-[46ch] text-base leading-[1.7] text-white/60 md:mt-16 md:text-lg"
          >
            The full stories are told on a call.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.9, delay: 0.08, ease: EASE }
            }
            className="mt-7"
          >
            <MagneticCTA className="w-full sm:w-auto">
              <a
                href={getWhatsAppUrl(
                  "Hello Leon, I'd like to start a project with LIONOVART.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="v2-display block w-full rounded-full bg-[#e5192a] px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#c9101f] active:scale-[0.98] sm:w-auto"
              >
                Start Your Project
              </a>
            </MagneticCTA>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
