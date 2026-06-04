"use client";

/**
 * Shared proof slot + CTA close (peak-end beat). Single testimonial placeholder,
 * then the page's loudest moment which opens the Nova voice agent. No form.
 */

import { useNovaStore } from "@/lib/stores/nova-store";
import { motion, useReducedMotion } from "framer-motion";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

export default function ProofAndClose({
  quote = "[ A client says, in one line, that the work changed how their market sees them. ]",
  attribution = "[ Name ], [ Role ], [ Business ]",
  closingLine,
  closingAccent,
}: {
  quote?: string;
  attribution?: string;
  closingLine: string;
  closingAccent: string;
}) {
  const reduce = useReducedMotion();
  const openNova = useNovaStore((s) => s.openNova);
  const go = () => openNova("hero", true);
  const mp = reduce ? {} : reveal;

  return (
    <>
      <section className="bg-bg-dark px-6 py-28 md:py-32">
        <motion.figure {...mp} className="mx-auto max-w-4xl text-center">
          <blockquote
            className="font-clash font-medium leading-[1.15] text-white"
            style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)" }}
          >
            &ldquo;{quote}&rdquo;
          </blockquote>
          <figcaption className="mt-8 text-[13px] uppercase tracking-[0.18em] text-white/45">
            {attribution}
          </figcaption>
        </motion.figure>
      </section>

      <section className="relative overflow-hidden bg-bg-dark px-6 py-36 md:py-48">
        <div className="mx-auto max-w-5xl text-center">
          <motion.h2
            {...mp}
            className="font-clash font-semibold uppercase leading-[0.92] tracking-tight text-white"
            style={{ fontSize: "clamp(2.8rem, 9vw, 8rem)" }}
          >
            {closingLine} <span className="text-brand-red">{closingAccent}</span>
          </motion.h2>
          <motion.div {...mp} className="mt-12 flex flex-col items-center gap-5">
            <LiquidMetalButton label="Talk to Nova" width={200} onClick={go} />
            <p className="text-[12px] uppercase tracking-[0.2em] text-white/40">
              Tell our voice agent what you need. She takes it from there.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
