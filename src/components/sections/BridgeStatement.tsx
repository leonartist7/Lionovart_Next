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
      className="relative isolate flex min-h-[30svh] items-center overflow-hidden bg-[#0a0a0a] px-5 py-14 text-white sm:px-8 sm:py-16 md:min-h-[34svh] md:px-[6vw]"
    >
      <h2 id="bridge-statement-heading" className="sr-only">
        {t.bridge.line1} {t.bridge.line2} {t.bridge.accent}
      </h2>

      <motion.div
        aria-hidden="true"
        className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-3 md:gap-4"
        variants={sequence}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.45 }}
      >
        <div className="overflow-hidden pb-[0.08em]">
          <motion.p
            variants={reveal}
            className="font-clash text-[clamp(1.9rem,4.8vw,5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em] text-white"
          >
            {t.bridge.line1}
          </motion.p>
        </div>

        <div className="overflow-hidden pb-[0.08em] text-right">
          <motion.p
            variants={reveal}
            className="font-clash text-[clamp(1.9rem,4.8vw,5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em]"
          >
            <span className="text-white">{t.bridge.line2} </span>
            <span className="text-brand-red">{t.bridge.accent}</span>
          </motion.p>
        </div>

        <motion.p
          variants={reveal}
          className="max-w-[42ch] self-end pt-2 text-right font-body text-[13px] leading-[1.5] text-white/55 sm:text-[14px]"
        >
          {t.bridge.body}
        </motion.p>
      </motion.div>
    </section>
  );
}
