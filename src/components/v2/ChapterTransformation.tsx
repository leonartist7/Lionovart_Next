"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import V2Silk from "@/components/v2/V2Silk";

/* Chapter 3 - The Transformation (dark, red energy)
   Alone: misaligned media plates. Threshold: shader portal.
   Together: aligned system under the mark. */

const EASE = [0.16, 1, 0.3, 1] as const;

const FRAGMENTS = ["Identity", "Content", "Website", "Socials"] as const;

const ALONE_PLATES: {
  src: string;
  label: string;
  className: string;
}[] = [
  {
    src: "/videos/v2/work-2.jpg",
    label: "Identity",
    className: "left-0 top-0 w-[48%] aspect-[4/3] -rotate-3",
  },
  {
    src: "/videos/v2/film-frame.jpg",
    label: "Content",
    className: "right-0 top-[6%] w-[46%] aspect-[3/4] rotate-2",
  },
  {
    src: "/videos/v2/platform-frame.jpg",
    label: "Website",
    className: "left-[4%] bottom-[4%] w-[44%] aspect-[16/10] rotate-[-2deg]",
  },
  {
    src: "/videos/v2/work-4.jpg",
    label: "Socials",
    className: "right-[2%] bottom-0 w-[42%] aspect-[4/3] rotate-3",
  },
];

export default function ChapterTransformation() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] py-28 md:py-40">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle at center, rgba(229,25,42,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 md:px-12">
        <motion.div
          className="overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            variants={{
              hidden: { y: "100%" },
              visible: {
                y: "0%",
                transition: reduceMotion
                  ? { duration: 0 }
                  : { duration: 1, ease: EASE },
              },
            }}
            className="v2-serif mx-auto max-w-[18ch] text-center text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.05] text-[#f2ede3]"
          >
            Strong alone. Stronger together.
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
          className="mx-auto mt-6 max-w-[46ch] text-center text-base leading-[1.7] text-white/60 md:text-lg"
        >
          You bring the vision, the drive, the standard. We bring the direction
          that pulls it into one world.
        </motion.p>

        <div className="mt-20 grid grid-cols-1 items-center gap-14 md:mt-28 md:grid-cols-12 md:gap-8">
          <div className="relative order-1 h-72 md:col-span-4 md:h-80">
            {ALONE_PLATES.map((plate, i) => (
              <motion.div
                key={plate.label}
                className={`absolute overflow-hidden rounded-xl border border-white/10 ${plate.className}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.85, delay: i * 0.08, ease: EASE }
                }
              >
                <Image
                  src={plate.src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 45vw, 18vw"
                  className="object-cover opacity-55 grayscale-[40%]"
                />
                <div className="absolute inset-0 bg-[#0d0d0d]/35" />
                <span className="v2-display absolute bottom-2 left-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55 md:text-[11px]">
                  {plate.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="relative order-2 flex justify-center md:col-span-4">
            <motion.div
              aria-hidden
              className="absolute left-1/2 -top-16 h-16 w-px -translate-x-1/2 origin-top md:-top-24 md:h-24"
              style={{
                background: "linear-gradient(to bottom, transparent, #e5192a)",
              }}
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
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 1.1, delay: 0.25, ease: EASE }
              }
              className="relative aspect-square w-56 overflow-hidden rounded-full border border-[#e5192a]/45 md:w-72"
              style={{ boxShadow: "0 0 80px rgba(229,25,42,0.28)" }}
            >
              <V2Silk className="absolute inset-0" />
              <div className="absolute inset-0 bg-[#0d0d0d]/25" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="v2-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f2ede3]/85 md:text-xs">
                  One world
                </span>
              </div>
            </motion.div>

            <motion.div
              aria-hidden
              className="absolute left-1/2 top-full h-16 w-px -translate-x-1/2 origin-top md:h-24"
              style={{
                background: "linear-gradient(to bottom, #e5192a, transparent)",
              }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 1, delay: 0.55, ease: EASE }
              }
            />
          </div>

          <div className="relative order-3 flex flex-col items-center gap-8 md:col-span-4 md:items-start">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.85, delay: 0.7, ease: EASE }
              }
              className="relative inline-flex"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-36 w-36 -translate-x-1/2 -translate-y-1/2"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(240,201,23,0.22) 0%, transparent 70%)",
                }}
              />
              <Image
                src="/images/LOGO.svg"
                alt=""
                width={360}
                height={58}
                className="h-6 w-auto"
              />
            </motion.div>

            <ul className="flex w-full max-w-[280px] list-none flex-col gap-0 p-0">
              {FRAGMENTS.map((word, i) => (
                <motion.li
                  key={word}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.85,
                          delay: 0.85 + i * 0.09,
                          ease: EASE,
                        }
                  }
                  className="flex items-center gap-4 border-t border-white/10 py-3.5 first:border-t-0 first:pt-0"
                >
                  <span
                    aria-hidden
                    className="block h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5192a]"
                  />
                  <span className="v2-display text-lg font-semibold uppercase tracking-[0.08em] text-white md:text-xl">
                    {word}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}