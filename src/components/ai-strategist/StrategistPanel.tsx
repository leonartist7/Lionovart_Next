"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import ConversationView from "./ConversationView";
import { useStrategistSession } from "./useStrategistSession";

/* ─── Types ─────────────────────────────────────────────────── */
interface StrategistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoStart?: boolean;
}

/* ─── Animation config ──────────────────────────────────────── */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

/* ─── Component ─────────────────────────────────────────────── */
export default function StrategistPanel({ isOpen, onClose, autoStart = false }: StrategistPanelProps) {
  const [mounted, setMounted] = useState(false);
  const session = useStrategistSession({ onClose });

  /* ── Client-side mount guard (required for createPortal) ── */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Auto-start handler ── */
  useEffect(() => {
    if (isOpen && autoStart && !session.isSessionActive) {
      // Small timeout ensures the modal is fully rendered before requesting mic permissions
      const t = setTimeout(() => {
        session.startSession();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, autoStart, session.isSessionActive, session.startSession]);

  /* ── Scroll lock (Lenis + native) ── */
  useScrollLock(isOpen);

  /* ── ESC key close ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  /* ── Don't render on server ── */
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop overlay ── */}
          <motion.div
            key="strategist-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[9998]"
              style={{
                background: "rgba(0, 0, 0, 0.9)",
              }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Glass panel ── */}
          <motion.div
            key="strategist-panel"
            role="dialog"
            aria-modal="true"
            aria-label="AI Brand Strategist"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={[
              "fixed z-[9999] glass-panel flex flex-col overflow-hidden",
              /* Desktop: centered card */
              "md:w-[560px] md:h-[680px] md:max-h-[90vh] md:rounded-3xl",
              "md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
              /* Mobile: full screen */
              "inset-0 md:inset-auto rounded-none",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Close button ── */}
            <button
              onClick={onClose}
              className={[
                "absolute top-3 right-3 z-10",
                "flex items-center justify-center w-10 h-10 rounded-full",
                "text-white/60 hover:text-white hover:bg-white/[0.08]",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
              ].join(" ")}
              aria-label="Close AI strategist"
            >
              <X size={20} strokeWidth={1.8} />
            </button>

            {/* ── Live conversation view ── */}
            <div className="flex flex-1 flex-col min-h-0">
                <ConversationView
                  isSessionActive={session.isSessionActive}
                  state={session.state}
                  leadData={session.leadData}
                  setLeadData={session.setLeadData}
                  handoffData={session.handoffData}
                  transcript={session.transcript}
                  sessionWarning={session.sessionWarning}
                  onStartSession={session.startSession}
                  onStopSession={session.stopSession}
                  onSendText={session.sendTextToAgent}
                />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
