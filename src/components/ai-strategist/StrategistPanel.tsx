"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ConversationView from "./ConversationView";
import { useStrategistSession } from "./useStrategistSession";
import { usePageSectionTracker } from "./usePageSectionTracker";

interface StrategistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoStart?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.95,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
};

export default function StrategistPanel({ isOpen, onClose, autoStart = false }: StrategistPanelProps) {
  const [mounted, setMounted] = useState(false);
  const session = useStrategistSession({ onClose });

  // Page-section tracking — only active while session is live
  usePageSectionTracker({
    enabled: session.isSessionActive,
    pushContextMessage: session.pushContextMessage,
  });

  // Standard portal SSR guard — portal needs to wait for client mount before rendering.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && autoStart && !session.isSessionActive) {
      const t = setTimeout(() => {
        session.startSession();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, autoStart, session.isSessionActive, session.startSession]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="nova-card"
          role="dialog"
          aria-modal="false"
          aria-label="Nova — LIONOVART AI Strategist"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={[
            "fixed z-[9999]",
            "bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8",
            "w-[calc(100vw-2rem)] max-w-[22rem]",
            "max-h-[min(30rem,calc(100vh-6rem))]",
            "flex flex-col overflow-hidden rounded-3xl",
            "bg-white/[0.035] backdrop-blur-2xl",
            "border border-white/[0.08]",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_60px_-12px_rgba(0,0,0,0.55)]",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onClose}
            className={[
              "absolute top-3 right-3 z-10 w-9 h-9 rounded-full",
              "flex items-center justify-center",
              "text-white/50 hover:text-white hover:bg-white/[0.06]",
              "transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40",
            ].join(" ")}
            aria-label="Close Nova"
          >
            <X size={18} strokeWidth={1.8} />
          </button>

          <div className="flex-1 flex flex-col min-h-0">
            <ConversationView
              isSessionActive={session.isSessionActive}
              state={session.state}
              leadData={session.leadData}
              setLeadData={session.setLeadData}
              fieldConfirmations={session.fieldConfirmations}
              confirmFieldLocal={session.confirmFieldLocal}
              handoffData={session.handoffData}
              transcript={session.transcript}
              sessionNotice={session.sessionNotice}
              onDismissNotice={session.dismissNotice}
              isMicMuted={session.isMicMuted}
              onToggleMic={session.toggleMic}
              onStartSession={session.startSession}
              onStopSession={session.stopSession}
              onSendText={session.sendTextToAgent}
              inputAnalyser={session.inputAnalyser}
              outputAnalyser={session.outputAnalyser}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
