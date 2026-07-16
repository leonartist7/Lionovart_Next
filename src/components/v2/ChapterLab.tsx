"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/* ─── Chapter 7 — Experience Lab (dark) ──────────────────────────────
   Full-bleed scene: brand presence beyond the screen. No CTA.
   Backdrop: still + Ken Burns until Part C drops /videos/v2/lab-loop.mp4
   (then swap to lazy in-view video with this image as poster).
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;
const POSTER = "/images/hero_img/123613.webp";

export default function ChapterLab() {
  const reduceMotion = useReducedMotion();

  const lineReveal = {
    hidden: { y: "100%" },
    visible: {
      y: "0%",
      transition: reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE },
    },
  };

  return (
    <section className="relative flex min-h-[90vh] items-end overflow-hidden bg-[#0d0d0d]">
      {/* Backdrop: gold particle field + Ken Burns (ambient exception) */}
      <div aria-hidden className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={{ scale: 1.06 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 12,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "reverse",
                }
          }
        >
          <Image
            src={POSTER}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-[#0d0d0d]/30" />
      </div>

      {/* Copy bottom-left */}
      <div className="relative z-10 w-full max-w-[620px] px-6 pb-24 md:px-12">
        <motion.div
          className="overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            variants={lineReveal}
            className="v2-serif text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.05] text-[#f2ede3]"
          >
            Beyond screens. Beyond ordinary.
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
          className="mt-6 text-base leading-[1.7] text-white/70 md:text-lg"
        >
          We explore brand presence in physical space: smart glass, transparent
          LED, projection, digital windows, immersive environments. Developed as
          creative direction and produced with specialist partners.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.9, delay: 0.18, ease: EASE }
          }
          className="mt-6 text-sm leading-[1.6] text-white/45"
        >
          Smart glass, transparent LED, projection mapping, audiovisual spaces.
        </motion.p>
      </div>
    </section>
  );
}
