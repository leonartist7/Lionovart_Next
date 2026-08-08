"use client";

import { useState, useEffect, useCallback, type RefObject } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mic, MicOff, PhoneOff, Check } from "lucide-react";
import type { HandoffData, SessionState, LeadFieldKey } from "@/lib/strategist-config";
import type { LeadData, SessionNotice, FieldConfirmations } from "./useStrategistSession";
import NovaOrb from "./NovaOrb";
import HandoffCards from "./HandoffCards";
import { PrivacyGate } from "./PrivacyGate";
import { useAudioAmplitude } from "./useAudioAmplitude";

export interface ConversationViewProps {
  isSessionActive: boolean;
  state: SessionState;
  leadData: LeadData;
  fieldConfirmations: FieldConfirmations;
  confirmFieldLocal: (field: LeadFieldKey) => void;
  handoffData: HandoffData | null;
  sessionNotice?: SessionNotice | null;
  onDismissNotice: () => void;
  isMicMuted: boolean;
  onToggleMic: () => void;
  onStartSession: () => void;
  onStopSession: () => void;
  onSendText: (text: string) => void;
  inputAnalyser: RefObject<AnalyserNode | null>;
  outputAnalyser: RefObject<AnalyserNode | null>;
}

const FIELD_LABELS: Record<LeadFieldKey, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  website: "Website",
  business_type: "Business",
};

/** Field priority — matches the conversation flow (Stage 2 → 3 → 7). */
const FIELD_ORDER: LeadFieldKey[] = ["name", "business_type", "website", "phone", "email"];

export default function ConversationView({
  isSessionActive,
  state,
  leadData,
  fieldConfirmations,
  confirmFieldLocal,
  handoffData,
  sessionNotice,
  onDismissNotice,
  isMicMuted,
  onToggleMic,
  onStartSession,
  onStopSession,
  onSendText,
  inputAnalyser,
  outputAnalyser,
}: ConversationViewProps) {
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";

  const inputAmplitude = useAudioAmplitude(inputAnalyser, isSessionActive && !isMicMuted);
  const outputAmplitude = useAudioAmplitude(outputAnalyser, isSessionActive && isSpeaking);

  const [privacyAccepted, setPrivacyAccepted] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("nova_privacy_accepted") === "1";
    }
    return false;
  });
  const [showPrivacyPrompt, setShowPrivacyPrompt] = useState(false);

  const handleBlobClick = () => {
    if (isSessionActive) return;
    if (!privacyAccepted) {
      setShowPrivacyPrompt(true);
      return;
    }
    onStartSession();
  };

  const handlePrivacyAccept = () => {
    sessionStorage.setItem("nova_privacy_accepted", "1");
    setPrivacyAccepted(true);
    setShowPrivacyPrompt(false);
    onStartSession();
  };

  // Only one lead-capture field is ever shown at a time. Confirming it
  // doesn't remove it immediately — it holds for a beat, then fades.
  const currentField = FIELD_ORDER.find((f) => leadData[f] && !fieldConfirmations[f]);
  const [displayedField, setDisplayedField] = useState<LeadFieldKey | null>(null);

  useEffect(() => {
    if (!displayedField && currentField) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayedField(currentField);
    }
  }, [displayedField, currentField]);

  const handleFieldAutoConfirm = useCallback(
    (field: LeadFieldKey) => {
      confirmFieldLocal(field);
      onSendText(`Confirmed my ${FIELD_LABELS[field].toLowerCase()} on screen.`);
    },
    [confirmFieldLocal, onSendText],
  );

  // ── Ephemeral pill above the orb — priority: privacy > notice > handoff > field ──
  const pill = showPrivacyPrompt ? (
    <PrivacyGate key="privacy" onAccept={handlePrivacyAccept} onDismiss={() => setShowPrivacyPrompt(false)} />
  ) : sessionNotice ? (
    <NoticePill key="notice" notice={sessionNotice} onDismiss={onDismissNotice} onRestart={onStartSession} />
  ) : handoffData ? (
    <HandoffCards
      key="handoff"
      whatsappUrl={handoffData.whatsappUrl}
      bookingUrl={handoffData.bookingUrl}
      summaryMessage={handoffData.summaryMessage}
      bookingConfirmed={handoffData.bookingConfirmed}
      bookingTimeLabel={handoffData.bookingTimeLabel}
    />
  ) : displayedField ? (
    <FieldConfirmPill
      key={displayedField}
      label={FIELD_LABELS[displayedField]}
      value={leadData[displayedField]}
      confirmed={fieldConfirmations[displayedField]}
      onAutoConfirm={() => handleFieldAutoConfirm(displayedField)}
      onDone={() => setDisplayedField(null)}
    />
  ) : null;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 min-h-[1px] flex items-center justify-center">
        <AnimatePresence mode="wait">{pill}</AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-[3px]">
        <button
          type="button"
          onClick={handleBlobClick}
          disabled={isSessionActive}
          aria-label={isSessionActive ? "Nova is listening" : "Start conversation with Nova"}
          className={isSessionActive ? "cursor-default" : "cursor-pointer"}
        >
          <NovaOrb
            state={!isSessionActive ? "idle" : isSpeaking ? "speaking" : isListening ? "listening" : "thinking"}
            inputAmplitude={inputAmplitude}
            outputAmplitude={outputAmplitude}
            inputAnalyser={inputAnalyser}
            outputAnalyser={outputAnalyser}
          />
        </button>

        {isSessionActive && (
          <ControlPill isMicMuted={isMicMuted} onToggleMic={onToggleMic} onStopSession={onStopSession} />
        )}
      </div>
    </div>
  );
}

/* ─── Control pill — mic toggle + end call, flat brand-red CTA style ────── */

function ControlPill({
  isMicMuted,
  onToggleMic,
  onStopSession,
}: {
  isMicMuted: boolean;
  onToggleMic: () => void;
  onStopSession: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-brand-red p-1.5 shadow-lg shadow-brand-red/30">
      <button
        type="button"
        onClick={onToggleMic}
        className={[
          "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95",
          isMicMuted ? "bg-white text-brand-red" : "bg-white/15 text-white hover:bg-white/25",
        ].join(" ")}
        aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
        aria-pressed={isMicMuted}
      >
        {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
      <button
        type="button"
        onClick={onStopSession}
        className="w-10 h-10 rounded-full bg-white text-brand-red flex items-center justify-center hover:bg-white/90 transition-all active:scale-95"
        aria-label="End session"
      >
        <PhoneOff size={16} />
      </button>
    </div>
  );
}

/* ─── Field confirm pill — appears, holds 2s once confirmed, fades ─────── */

function FieldConfirmPill({
  label,
  value,
  confirmed,
  onAutoConfirm,
  onDone,
}: {
  label: string;
  value: string;
  confirmed: boolean;
  onAutoConfirm: () => void;
  onDone: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  // Safety-net auto-confirm if the agent never explicitly calls confirm_field.
  useEffect(() => {
    if (confirmed) return;
    const t = setTimeout(onAutoConfirm, 20000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, value]);

  // Once confirmed, hold for 2s before signaling the parent to remove it
  // (which triggers the 1s fade-out below via AnimatePresence).
  useEffect(() => {
    if (!confirmed) return;
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [confirmed, onDone]);

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 1 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm text-[12px] text-white/85"
    >
      {confirmed && <Check size={11} className="text-brand-gold shrink-0" strokeWidth={3} />}
      <span className="text-white/40 uppercase tracking-[0.15em] text-[9px]">{label}</span>
      <span className="truncate max-w-[160px]">{value}</span>
    </motion.div>
  );
}

/* ─── Notice pill — errors, warnings, session-ended ────────────────────── */

function NoticePill({
  notice,
  onDismiss,
  onRestart,
}: {
  notice: SessionNotice;
  onDismiss: () => void;
  onRestart: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const color =
    notice.kind === "error" ? "text-brand-red" : notice.kind === "warning" ? "text-amber-300" : "text-white/80";

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 1 }}
      className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm max-w-[240px] text-center"
      role="status"
      aria-live="polite"
    >
      <span className={`text-[11px] font-medium ${color}`}>{notice.message}</span>
      <div className="flex items-center gap-3">
        {notice.canRestart && (
          <button
            type="button"
            onClick={() => {
              onDismiss();
              onRestart();
            }}
            className="text-[10px] uppercase tracking-wider text-brand-gold hover:text-brand-gold/80 transition-colors"
          >
            {notice.kind === "error" ? "Try again" : "Restart"}
          </button>
        )}
        {notice.dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </motion.div>
  );
}
