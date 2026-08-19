"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { NovaGradientButton } from "@/components/ai-strategist/NovaGradientButton";

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

  if (isOpen || pathname?.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="fixed bottom-6 right-6 z-[9990] md:bottom-8 md:right-8"
        >
          <NovaGradientButton onClick={() => openNova("sticky", true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
