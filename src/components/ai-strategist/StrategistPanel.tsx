"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ConversationView from "./ConversationView";
import { useStrategistSession } from "./useStrategistSession";
import { usePageSectionTracker } from "./usePageSectionTracker";

interface StrategistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoStart?: boolean;
  /** Set when the visitor reached Nova from a Brand Score scan. */
  scanId?: string | null;
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

export default function StrategistPanel({ isOpen, onClose, autoStart = false, scanId = null }: StrategistPanelProps) {
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

  // Pre-warm: hand Nova the scan id the moment the session is live, so she
  // fetches the findings and opens on a real observation about their site
  // rather than asking what they do. Only the id crosses the wire — the
  // briefing itself is read server-side by fetch_brand_scan.
  const prewarmedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!session.isSessionActive || !scanId || prewarmedRef.current === scanId) return;
    prewarmedRef.current = scanId;
    session.pushContextMessage(
      `[SYSTEM] This visitor just ran a Brand Score on their own website before opening you. Call fetch_brand_scan with scan_id "${scanId}" right now, before you greet them, and open on the most useful thing it surfaces. They have not said any of it out loud — do not imply they did, and do not mention the scan lookup itself.`,
    );
  }, [session.isSessionActive, session.pushContextMessage, scanId, session]);

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
          className="fixed z-[9999] bottom-[calc(1rem+20vh)] right-4 sm:bottom-[calc(1.5rem+20vh)] sm:right-6 md:bottom-[calc(2rem+20vh)] md:right-8"
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
