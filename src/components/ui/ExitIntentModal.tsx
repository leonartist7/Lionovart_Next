"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";

const SESSION_KEY = "lionovart:exit-intent-shown";

export default function ExitIntentModal() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isNovaOpen = useNovaStore((s) => s.isOpen);

  useEffect(() => {
    // Desktop-only heuristic (mouseout with a real pointer) — touch devices
    // have no reliable "leaving the viewport" cursor signal.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (pathname?.startsWith("/admin")) return;

    let armed = true;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) armed = false;
    } catch {
      // sessionStorage unavailable — fail open, worst case it can show more than once
    }
    if (!armed) return;

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      setVisible(true);
      trackFunnelEvent(FUNNEL_EVENT.EXIT_INTENT_SHOWN);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // best-effort only
      }
      document.removeEventListener("mouseout", onMouseOut);
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, [pathname]);

  // NOVA always wins if both would show.
  useEffect(() => {
    if (isNovaOpen) setVisible(false);
  }, [isNovaOpen]);

  const dismiss = () => {
    setVisible(false);
    trackFunnelEvent(FUNNEL_EVENT.EXIT_INTENT_DISMISSED);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9970] flex items-center justify-center bg-black/70 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={dismiss}
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-intent-heading"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-[#0d0d0d] p-8 text-center text-white shadow-2xl"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white"
            >
              &times;
            </button>

            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red">
              Before you go
            </p>
            <h2
              id="exit-intent-heading"
              className="font-clash text-[1.75rem] font-semibold uppercase leading-[0.95] tracking-tight"
            >
              Get a free brand audit
            </h2>
            <p className="mx-auto mt-4 max-w-[36ch] text-[14px] leading-[1.6] text-white/60">
              A personalized review of your brand, website, and first impression —
              no sales pitch, just clarity.
            </p>

            <Link
              href="/audit"
              onClick={() => trackFunnelEvent(FUNNEL_EVENT.EXIT_INTENT_CLICKED)}
              className="font-clash mt-7 inline-block rounded-full bg-brand-red px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-brand-red-secondary active:scale-[0.98]"
            >
              Get My Free Audit &rarr;
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
