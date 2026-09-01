"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";

/**
 * Mid-scroll lead-magnet strip — sits right after Testimonials (peak trust
 * = peak conversion, per FUNNEL_PLAN.md). Deliberately not a second embedded
 * form: one line + one CTA to /audit, avoiding a duplicate of AuditCapture's
 * validation logic. Not wrapped in NovaSection/data-nova-section, matching
 * ShowcaseMarquee/MarqueeSlanted's convention of sitting outside NOVA's
 * section-tracking IntersectionObserver.
 */
export default function AuditStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-black py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-5 px-6 text-center sm:flex-row sm:text-left"
      >
        <p className="font-clash text-[1.1rem] font-semibold uppercase leading-tight text-white sm:text-[1.4rem]">
          Not ready to talk? Get a free brand audit first.
        </p>
        <Link
          href="/audit"
          onClick={() => trackFunnelEvent(FUNNEL_EVENT.AUDIT_STRIP_CLICKED)}
          className="shrink-0 rounded-full border border-white/25 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-brand-red hover:text-brand-red"
        >
          Get My Free Audit &rarr;
        </Link>
      </motion.div>
    </section>
  );
}
