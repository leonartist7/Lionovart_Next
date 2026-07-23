"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/* Chapter 2 - The Truth (dark)
   Recognition beat. Asymmetric split: manifesto left, solid problem plates right. */

const EASE = [0.16, 1, 0.3, 1] as const;

const POINTS = [
  {
    title: "No clear direction",
    body: "Strong work, pointing in three directions at once.",
    src: "/videos/v2/work-1.jpg",
  },
  {
    title: "Scattered presence",
    body: "A brand that looks different on every platform.",
    src: "/videos/v2/work-3.jpg",
  },
  {
    title: "Forgotten too soon",
    body: "Seen for a moment, then lost in the feed.",
    src: "/videos/v2/work-5.jpg",
  },
];

export default function ChapterTruth() {
  const reduceMotion = useReducedMotion();

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
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/images/hero_img/134634.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#0d0d0d]/80 to-[#0d0d0d]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/70 to-[#0d0d0d]/40" />
      </div>

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
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={rise}
              className="v2-serif max-w-[14ch] text-[clamp(2.4rem,5vw,4.25rem)] font-medium leading-[1.05] text-[#f2ede3]"
            >
              Many strong brands stay invisible.
            </motion.h2>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={rise}
              className="mt-8 max-w-[42ch] text-base leading-[1.7] text-white/65 md:text-lg"
            >
              They have the vision. The drive. The product. But online they look
              scattered, inconsistent, easy to forget. The problem is not effort.
              It is direction.
            </motion.p>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-7">
            {POINTS.map((point, i) => (
              <motion.article
                key={point.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.85, delay: i * 0.1, ease: EASE }
                }
                className={`group relative flex overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] ${
                  i === 1 ? "lg:ml-8" : i === 2 ? "lg:ml-16" : ""
                }`}
              >
                <div className="v2-plate-melt relative hidden w-[38%] shrink-0 sm:block">
                  <Image
                    src={point.src}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 30vw, 240px"
                    className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d0d0d]/40" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-7 md:px-8 md:py-9">
                  <div className="mb-3 flex items-center gap-3">
                    <span aria-hidden className="block h-px w-8 bg-[#e5192a]" />
                    <span className="v2-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e5192a]/90">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="v2-display text-xl font-semibold text-white md:text-2xl">
                    {point.title}
                  </h3>
                  <p className="mt-2 max-w-[36ch] text-sm leading-[1.65] text-white/50 md:text-base">
                    {point.body}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}