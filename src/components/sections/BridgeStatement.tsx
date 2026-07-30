"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BridgeStatement() {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion() ?? false;

  const reveal = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : "105%",
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.9,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };
  const sequence = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.14,
      },
    },
  };

  return (
    <section
      aria-labelledby="bridge-statement-heading"
      className="relative isolate flex min-h-[52svh] items-center overflow-hidden bg-[#0a0a0a] px-5 py-20 text-white sm:min-h-[60svh] sm:px-8 md:min-h-[70svh] md:px-12"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-[6vw] top-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <h2 id="bridge-statement-heading" className="sr-only">
        {t.bridge.line1} {t.bridge.line2} {t.bridge.accent}
      </h2>

      <motion.div
        aria-hidden="true"
        className="relative z-10 mx-auto w-full max-w-[1500px]"
        variants={sequence}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.45 }}
      >
        <div className="overflow-hidden pb-[0.08em]">
          <motion.p
            variants={reveal}
            className="font-clash text-[clamp(2.4rem,8.5vw,8.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.045em] text-white"
          >
            {t.bridge.line1}
          </motion.p>
        </div>

        <div className="mt-[0.16em] overflow-hidden pb-[0.08em] text-right">
          <motion.p
            variants={reveal}
            className="font-clash text-[clamp(2.4rem,8.5vw,8.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.045em]"
          >
            <span className="text-white">{t.bridge.line2} </span>
            <span className="text-brand-red">{t.bridge.accent}</span>
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
