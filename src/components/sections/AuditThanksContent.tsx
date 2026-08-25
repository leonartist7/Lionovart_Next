"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function AuditThanksContent() {
  const reduceMotion = useReducedMotion();
  const openNova = useNovaStore((s) => s.openNova);

  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 pt-40 pb-28 text-center text-[#171412] md:pt-48 md:pb-40">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: EASE }}
        className="font-clash text-[clamp(2.2rem,5vw,3.5rem)] font-semibold uppercase leading-[0.95] tracking-tight"
      >
        Request received.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.1, ease: EASE }}
        className="mx-auto mt-5 max-w-[42ch] text-base leading-[1.7] text-[#171412]/65 md:text-lg"
      >
        Leonardo will review your brand personally and reply within 48 hours with
        clear next steps.
      </motion.p>

      <motion.button
        type="button"
        onClick={() => openNova("audit", true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.2, ease: EASE }}
        className="font-clash mt-10 rounded-full border border-[#171412]/25 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#171412] transition-colors duration-300 hover:border-[#171412]/60"
      >
        Want it faster? Talk to NOVA now &rarr;
      </motion.button>
    </section>
  );
}
