"use client";

import GoldThreads from "@/components/ui/GoldThreads";

import { motion, useReducedMotion } from "framer-motion";
import { useLionJourney } from "./lion-journey/LionJourney";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * The couplet that frames the Strong-alone turn.
 * `recognition` (default variant) runs centered over the hero artwork; `vow` runs after
 * it on the cream the bloom created, which is also what keeps the handoff
 * into the IMAGINE section free of a light-space break.
 */
type BridgeVariant = "recognition" | "vow";

export default function BridgeStatement({
  variant = "recognition",
}: {
  variant?: BridgeVariant;
}) {
  const journey = useLionJourney();
  const { t, locale } = useLanguage();
  const editorial = locale !== "ja" && locale !== "ko";
  const prefersReducedMotion = useReducedMotion() ?? false;

  const copy = variant === "vow" ? t.vow : t.bridge;
  const isVow = variant === "vow";
  const headingId = `${variant}-statement-heading`;

  const reveal = {
    hidden: {
      opacity: 1,
    },
    visible: {
      opacity: 1,
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

  // The vow sits directly under the pinned red marquee of the stronger-together
  // scene. It must read as already present there — no slide-up reveal — the
  // same treatment the marquee itself got. Only the recognition variant
  // (above the scene) animates.
  const containerAnim = isVow
    ? {}
    : {
        variants: sequence,
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.45 },
      };
  const itemAnim = isVow ? {} : { variants: reveal };

  return (
    <section
      ref={variant === "recognition" ? journey?.bridge : undefined}
      data-gold-bridge={variant === "recognition" ? "" : undefined}
      aria-labelledby={headingId}
      className={`relative isolate flex items-center overflow-hidden px-5 py-14 sm:px-8 sm:py-16 md:px-[6vw] ${
        isVow ? "min-h-[30svh] md:min-h-[34svh] bg-bg-surface-light text-[#171412]" : "min-h-[100svh] bg-transparent text-white text-center"
      }`}
    >
      {isVow && <GoldThreads single />}
      <h2 id={headingId} className="sr-only">
        {copy.line1} {copy.line2} {copy.accent}
      </h2>

      <motion.div
        aria-hidden="true"
        className={`relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-3 md:gap-4 ${isVow ? "" : "items-center"}`}
        {...containerAnim}
      >
        <div className="overflow-hidden pb-[0.08em]">
          <motion.p
            {...itemAnim}
            data-site-title-reveal
            className={`font-clash text-[clamp(1.9rem,4.8vw,5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em] text-balance ${
              isVow ? "text-[#171412]" : "text-white"
            }`}
            style={{ wordSpacing: "0.18em" }}
          >
            {copy.line1}
          </motion.p>
        </div>

        <div className={`overflow-hidden ${isVow ? "text-right" : "text-center"} ${editorial ? "px-[0.12em] pb-[0.2em] pt-[0.12em]" : "pb-[0.08em]"}`}>
          <motion.p
            {...itemAnim}
            data-site-title-reveal
            className="font-clash text-[clamp(1.9rem,4.8vw,5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em]"
            style={{ wordSpacing: "0.18em" }}
          >
            <span className={isVow ? "text-[#171412]" : "text-white"}>{copy.line2} </span>
            <span className={`text-brand-red${editorial ? " editorial-accent editorial-bridge" : ""}`}>{copy.accent}</span>
          </motion.p>
        </div>

        <motion.p
          {...itemAnim}
          className={`max-w-[42ch] pt-2 font-body text-[13px] leading-[1.5] sm:text-[14px] ${isVow ? "self-end text-right" : "self-center text-center"} ${
            isVow ? "text-[#171412]/70" : "text-white/55"
          }`}
        >
          {copy.body}
        </motion.p>
      </motion.div>
    </section>
  );
}
