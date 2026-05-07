"use client";

import { motion } from "framer-motion";

export function RecordingIndicator({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span>Recording</span>
    </div>
  );
}
