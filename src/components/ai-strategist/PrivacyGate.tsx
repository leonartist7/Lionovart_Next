"use client";

import { motion, useReducedMotion } from "framer-motion";
import { trackNovaEvent, NOVA_EVENT } from "@/lib/nova-events";

export function PrivacyGate({ onAccept, onDismiss }: { onAccept: () => void; onDismiss: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 1 }}
      className="flex flex-col items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm max-w-[260px] text-center"
    >
      <p className="text-[11px] text-white/70 leading-relaxed">
        Nova listens through your microphone to have a real conversation. Saved so
        Leon can follow up — never sold, never shared.
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => {
            trackNovaEvent(NOVA_EVENT.PRIVACY_ACCEPTED);
            onAccept();
          }}
          className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/80 transition-colors"
        >
          I understand — start
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
