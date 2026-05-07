"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import { useNovaStore } from "@/lib/stores/nova-store";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const isOpen = useNovaStore((s) => s.isOpen);
  const openNova = useNovaStore((s) => s.openNova);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isOpen) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          onClick={() => openNova("sticky", true)}
          className={[
            "fixed bottom-6 right-6 z-[9990] flex items-center gap-2",
            "px-4 py-3 rounded-full",
            "bg-brand-red text-white shadow-lg shadow-brand-red/30",
            "hover:bg-brand-red/90 transition-colors",
            "md:bottom-8 md:right-8",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40",
          ].join(" ")}
          aria-label="Talk to Nova"
        >
          <Mic size={16} />
          <span className="text-sm font-medium">Talk to Nova</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
