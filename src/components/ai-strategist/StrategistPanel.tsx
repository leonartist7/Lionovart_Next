"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ConversationView from "./ConversationView";
import { useStrategistSession } from "./useStrategistSession";
import { usePageSectionTracker } from "./usePageSectionTracker";

interface StrategistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoStart?: boolean;
}

const widgetVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: 10,
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

  // Ending the call closes the widget too — there's no separate hidden-but-live state.
  const handleEnd = useCallback(() => {
    session.stopSession();
    onClose();
  }, [session, onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") handleEnd();
    },
    [handleEnd],
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
          key="nova-widget"
          role="dialog"
          aria-modal="false"
          aria-label="Nova — LIONOVART AI Strategist"
          variants={widgetVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed z-[9999] bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8"
        >
          <ConversationView
            isSessionActive={session.isSessionActive}
            state={session.state}
            leadData={session.leadData}
            fieldConfirmations={session.fieldConfirmations}
            confirmFieldLocal={session.confirmFieldLocal}
            handoffData={session.handoffData}
            sessionNotice={session.sessionNotice}
            onDismissNotice={session.dismissNotice}
            isMicMuted={session.isMicMuted}
            onToggleMic={session.toggleMic}
            onStartSession={session.startSession}
            onStopSession={handleEnd}
            onSendText={session.sendTextToAgent}
            inputAnalyser={session.inputAnalyser}
            outputAnalyser={session.outputAnalyser}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
