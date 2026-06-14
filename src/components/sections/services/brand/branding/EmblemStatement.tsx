"use client";

/**
 * Scene 2 — the crest scales/fades into center; two short statements flank it,
 * left slides from the left, right from the right (expo-out, slight stagger).
 * Reduced-motion: static, in place.
 */

import { motion, useReducedMotion } from "framer-motion";
import BrandCrest from "./BrandCrest";

const EXPO = [0.16, 1, 0.3, 1] as const;

export default function EmblemStatement() {
  const reduce = useReducedMotion();

  const slide = (from: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, x: from },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, amount: 0.5 },
          transition: { duration: 0.9, ease: EXPO },
        };

  const pop = reduce
    ? {}
    : {
        initial: { opacity: 0, scale: 0.7 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true, amount: 0.5 },
        transition: { duration: 1, ease: EXPO, delay: 0.1 },
      };

  return (
    <section className="relative z-10 flex min-h-[80vh] items-center justify-center px-6 py-[12vh]">
      <div className="flex w-full max-w-[1100px] items-center justify-center gap-6 md:gap-12">
        <motion.p
          {...slide(-60)}
          className="flex-1 text-right font-clash text-xl font-medium uppercase leading-tight tracking-tight text-text-dark-primary md:text-3xl"
        >
          More than
          <br />a logo
        </motion.p>

        <motion.div {...pop} className="shrink-0">
          <BrandCrest className="h-40 w-auto md:h-56" />
        </motion.div>

        <motion.p
          {...slide(60)}
          className="flex-1 text-left font-clash text-xl font-medium uppercase leading-tight tracking-tight text-text-dark-primary md:text-3xl"
        >
          A brand
          <br />they feel
        </motion.p>
      </div>
    </section>
  );
}
