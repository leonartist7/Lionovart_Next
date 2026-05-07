"use client";

import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { trackNovaEvent, NOVA_EVENT } from "@/lib/nova-events";

export function PrivacyGate({ onAccept }: { onAccept: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="flex flex-col items-center gap-5 px-6 py-8 max-w-sm mx-auto flex-1 justify-center text-center"
    >
      <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
        <Mic size={20} className="text-white/70" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-clash-display text-xl font-bold uppercase tracking-wide text-white/95">
          Before we start
        </h3>
        <p className="text-sm leading-relaxed text-white/60 max-w-[280px] mx-auto">
          Nova listens through your microphone so we can have a real conversation.
          Your voice and the transcript are saved so Leonardo can follow up —
          never sold, never shared. You can ask Nova to delete it any time.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          trackNovaEvent(NOVA_EVENT.PRIVACY_ACCEPTED);
          onAccept();
        }}
        className={[
          "px-7 py-3.5 rounded-full",
          "bg-brand-red text-white font-bold uppercase tracking-widest text-xs",
          "hover:bg-brand-red/90 transition-all active:scale-95",
          "shadow-[0_0_24px_rgba(229,25,42,0.28)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40",
        ].join(" ")}
      >
        I understand — start
      </button>
      <a
        href="/privacy"
        className="text-xs text-white/35 hover:text-white/65 underline underline-offset-4 transition-colors"
      >
        Read full privacy notice
      </a>
    </motion.div>
  );
}
