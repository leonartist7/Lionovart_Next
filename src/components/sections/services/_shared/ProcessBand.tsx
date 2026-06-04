"use client";

/** Shared process band. Numbered steps, scroll-reveal. Reduced-motion safe. */

import { motion, useReducedMotion } from "framer-motion";

export interface ProcessStep {
  n: string;
  t: string;
  d: string;
}

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

export default function ProcessBand({ heading, steps }: { heading: string; steps: ProcessStep[] }) {
  const reduce = useReducedMotion();
  const mp = reduce ? {} : reveal;
  const cols = steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4";

  return (
    <section className="bg-bg-dark px-6 py-28 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <motion.h2
          {...mp}
          className="mb-16 font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
          style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
        >
          {heading}
        </motion.h2>
        <div className={`grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 ${cols}`}>
          {steps.map((step) => (
            <motion.div key={step.n} {...mp} className="bg-bg-dark p-7 md:p-8">
              <span className="font-clash text-brand-red" style={{ fontSize: "clamp(1.4rem,3vw,2rem)" }}>
                {step.n}
              </span>
              <h3 className="mt-5 font-clash text-2xl font-semibold text-white">{step.t}</h3>
              <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-white/55">{step.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
