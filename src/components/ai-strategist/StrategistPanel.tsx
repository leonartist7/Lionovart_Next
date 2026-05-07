"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { X, ChevronRight, Mic } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import ConversationView from "./ConversationView";
import { useStrategistSession } from "./useStrategistSession";
import { usePageSectionTracker } from "./usePageSectionTracker";

interface StrategistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoStart?: boolean;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelDesktopVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
};

const panelMobileVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: 60,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
};

export default function StrategistPanel({ isOpen, onClose, autoStart = false }: StrategistPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const session = useStrategistSession({ onClose });

  // Page-section tracking — only active while session is live
  usePageSectionTracker({
    enabled: session.isSessionActive,
    pushContextMessage: session.pushContextMessage,
  });

  // Standard portal SSR guard + responsive listener. setState in effect is
  // intentional: portal needs to wait for client mount before rendering.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(e.matches);
    handler(mq);
    mq.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
  }, []);

  useEffect(() => {
    if (isOpen && autoStart && !session.isSessionActive) {
      const t = setTimeout(() => {
        session.startSession();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, autoStart, session.isSessionActive, session.startSession]);

  // Scroll lock — only on mobile (desktop right-rail keeps page scrollable)
  useScrollLock(isOpen && !isDesktop && mobileExpanded);

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

  // Mobile drag handle — drag up expands to 90%, drag down collapses to 60%
  const dragY = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!mounted) return null;

  const renderPanel = () => {
    if (!isOpen) return null;

    /* ─────────── DESKTOP — Right-rail dock ─────────── */
    if (isDesktop) {
      return (
        <motion.aside
          key="nova-rail"
          role="dialog"
          aria-modal="false"
          aria-label="Nova — LIONOVART AI Strategist"
          variants={panelDesktopVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={[
            "fixed top-0 right-0 z-[9999] h-screen flex",
            "transition-[width] duration-300 ease-out",
            isCollapsed ? "w-[64px]" : "w-[440px]",
          ].join(" ")}
        >
          {/* Collapsed strip — click to expand */}
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className={[
                "w-full h-full flex flex-col items-center justify-center gap-3",
                "bg-white/[0.04] backdrop-blur-2xl",
                "border-l border-white/[0.08]",
                "shadow-[inset_1px_0_0_0_rgba(255,255,255,0.06)]",
                "hover:bg-white/[0.06] transition-colors",
                "text-white/70 hover:text-white",
              ].join(" ")}
              aria-label="Expand Nova"
            >
              <div className="relative">
                <Mic size={18} />
                {session.isSessionActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] writing-mode-vertical [writing-mode:vertical-rl] rotate-180">
                Nova
              </span>
              <ChevronRight size={14} className="rotate-180" />
            </button>
          ) : (
            <div
              className={[
                "relative w-full h-full flex flex-col overflow-hidden",
                "bg-white/[0.035] backdrop-blur-2xl",
                "border-l border-white/[0.08]",
                "shadow-[inset_1px_0_0_0_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04)]",
              ].join(" ")}
            >
              {/* Collapse button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className={[
                  "absolute top-3 left-3 z-10 w-9 h-9 rounded-full",
                  "flex items-center justify-center",
                  "text-white/50 hover:text-white hover:bg-white/[0.06]",
                  "transition-colors",
                ].join(" ")}
                aria-label="Minimize Nova"
                title="Minimize"
              >
                <ChevronRight size={16} />
              </button>

              {/* Close */}
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
                />
              </div>
            </div>
          )}
        </motion.aside>
      );
    }

    /* ─────────── MOBILE — Sticky bottom sheet ─────────── */
    return (
      <>
        {/* Subtle gradient cue at the bottom of the page so user knows the sheet is there */}
        <motion.div
          key="nova-mobile-glow"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.4 }}
          className="fixed left-0 right-0 bottom-0 z-[9997] pointer-events-none"
          style={{
            height: "55vh",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0) 100%)",
          }}
          aria-hidden="true"
        />

        <motion.div
          ref={sheetRef}
          key="nova-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Nova — LIONOVART AI Strategist"
          variants={panelMobileVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragEnd={(_e, info) => {
            // Drag up >40px → expand to 90vh
            // Drag down >80px from expanded → collapse back to 60vh
            // Drag down >180px from collapsed → close
            if (mobileExpanded) {
              if (info.offset.y > 80) setMobileExpanded(false);
            } else {
              if (info.offset.y < -40) setMobileExpanded(true);
              else if (info.offset.y > 180) onClose();
            }
            dragY.set(0);
          }}
          className={[
            "fixed left-0 right-0 bottom-0 z-[9999]",
            "flex flex-col overflow-hidden",
            "rounded-t-3xl",
            "bg-white/[0.045] backdrop-blur-2xl",
            "border-t border-white/[0.1]",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_-12px_40px_-8px_rgba(0,0,0,0.45)]",
            "transition-[height] duration-300 ease-out",
          ].join(" ")}
          style={{
            height: mobileExpanded ? "90vh" : "62vh",
            y: dragY,
          }}
        >
          {/* Drag handle */}
          <div
            className="shrink-0 w-full pt-2.5 pb-1.5 flex items-center justify-center cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
          >
            <div className="w-10 h-1 rounded-full bg-white/30" />
          </div>

          {/* Close button */}
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
            />
          </div>
        </motion.div>
      </>
    );
  };

  return createPortal(<AnimatePresence>{renderPanel()}</AnimatePresence>, document.body);
}
