"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { NovaGradientButton } from "@/components/ai-strategist/NovaGradientButton";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";

export function StickyCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isOpen = useNovaStore((s) => s.isOpen);
  const openNova = useNovaStore((s) => s.openNova);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // /services/ai runs its own CTA ladder (hero button, then page nav).
  // Adding the global sticky pair on top puts three floating CTA systems on
  // screen at once inside that page's first chapter.
  if (isOpen || pathname?.startsWith("/admin") || pathname === "/services/ai") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end gap-2 md:bottom-8 md:right-8"
        >
          <Link
            href="/audit"
            onClick={() => trackFunnelEvent(FUNNEL_EVENT.STICKY_AUDIT_CLICKED)}
            className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm transition-colors hover:border-white/40 hover:text-white"
          >
            Free Audit
          </Link>
          <NovaGradientButton onClick={() => openNova("sticky", true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
