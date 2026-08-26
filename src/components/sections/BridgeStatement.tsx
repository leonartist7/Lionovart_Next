"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * The couplet that frames the Strong-alone turn.
 * `recognition` runs before it on black; `vow` runs after it on the cream the
 * bloom created, which is also what keeps the handoff into the IMAGINE section
 * free of a light-space break.
 */
type BridgeVariant = "recognition" | "vow";

export default function BridgeStatement({
  variant = "recognition",
}: {
  variant?: BridgeVariant;
}) {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion() ?? false;

  const copy = variant === "vow" ? t.vow : t.bridge;
  const isVow = variant === "vow";
  const headingId = `${variant}-statement-heading`;

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
      aria-labelledby={headingId}
      className={`relative isolate flex min-h-[30svh] items-center overflow-hidden px-5 py-14 sm:px-8 sm:py-16 md:min-h-[34svh] md:px-[6vw] ${
        isVow ? "bg-[#f7f4ef] text-[#171412]" : "bg-bg-dark text-white"
      }`}
    >
      <h2 id={headingId} className="sr-only">
        {copy.line1} {copy.line2} {copy.accent}
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
            className={`font-clash text-[clamp(1.9rem,4.8vw,5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em] text-balance ${
              isVow ? "text-[#171412]" : "text-white"
            }`}
          >
            {copy.line1}
          </motion.p>
        </div>

        <div className="overflow-hidden pb-[0.08em] text-right">
          <motion.p
            variants={reveal}
            className="font-clash text-[clamp(1.9rem,4.8vw,5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em]"
          >
            <span className={isVow ? "text-[#171412]" : "text-white"}>{copy.line2} </span>
            <span className="text-brand-red">{copy.accent}</span>
          </motion.p>
        </div>

        <motion.p
          variants={reveal}
          className={`max-w-[42ch] self-end pt-2 text-right font-body text-[13px] leading-[1.5] sm:text-[14px] ${
            isVow ? "text-[#171412]/70" : "text-white/55"
          }`}
        >
          {copy.body}
        </motion.p>
      </motion.div>
    </section>
  );
}
