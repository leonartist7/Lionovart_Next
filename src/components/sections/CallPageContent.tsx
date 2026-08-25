"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function CallPageContent({ bookingUrl }: { bookingUrl: string | null }) {
  const reduceMotion = useReducedMotion();
  const openNova = useNovaStore((s) => s.openNova);

  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 pt-40 pb-28 text-center text-white md:pt-48 md:pb-40">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: EASE }}
        className="mb-5 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red"
      >
        Book a Call
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.1, ease: EASE }}
        className="font-clash max-w-[16ch] text-[clamp(2.4rem,6vw,4.5rem)] font-semibold uppercase leading-[0.95] tracking-tight"
      >
        Let&rsquo;s talk about your brand.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.2, ease: EASE }}
        className="mx-auto mt-6 max-w-[46ch] text-base leading-[1.7] text-white/60 md:text-lg"
      >
        NOVA checks live availability and books the call for you — no back and
        forth.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.3, ease: EASE }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <button
          type="button"
          onClick={() => {
            trackFunnelEvent(FUNNEL_EVENT.CALL_PAGE_CTA_CLICKED, { via: "nova" });
            openNova("call", true);
          }}
          className="font-clash rounded-full bg-brand-red px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-brand-red-secondary active:scale-[0.98]"
        >
          Talk to NOVA
        </button>

        {bookingUrl ? (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackFunnelEvent(FUNNEL_EVENT.CALL_PAGE_CTA_CLICKED, { via: "link" })}
            className="text-[13px] text-white/50 underline underline-offset-4 transition-colors hover:text-white/80"
          >
            or book directly on the calendar &rarr;
          </a>
        ) : null}
      </motion.div>
    </section>
  );
}
