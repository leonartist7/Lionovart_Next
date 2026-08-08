"use client";

import { useState, useRef, useEffect, type RefObject } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Mic,
  MicOff,
  Play,
  AlertTriangle,
  PhoneOff,
  Clock,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import type { HandoffData, SessionState, LeadFieldKey } from "@/lib/strategist-config";
import type {
  LeadData,
  ChatMessage,
  SessionNotice,
  FieldConfirmations,
} from "./useStrategistSession";
import NovaOrb from "./NovaOrb";
import HandoffCards from "./HandoffCards";
import { PrivacyGate } from "./PrivacyGate";
import { RecordingIndicator } from "./RecordingIndicator";
import { useAudioAmplitude } from "./useAudioAmplitude";
import { TextInputBar } from "./TextInputBar";
import { trackNovaEvent, NOVA_EVENT } from "@/lib/nova-events";

export interface ConversationViewProps {
  isSessionActive: boolean;
  state: SessionState;
  leadData: LeadData;
  setLeadData: (updater: (prev: LeadData) => LeadData) => void;
  fieldConfirmations: FieldConfirmations;
  confirmFieldLocal: (field: LeadFieldKey) => void;
  handoffData: HandoffData | null;
  transcript: ChatMessage[];
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

/** Field render order — matches the conversation flow (Stage 2 → 3 → 7). */
const FIELD_ORDER: LeadFieldKey[] = ["name", "business_type", "website", "phone", "email"];

export default function ConversationView({
  isSessionActive,
  state,
  leadData,
  setLeadData,
  fieldConfirmations,
  confirmFieldLocal,
  handoffData,
  transcript,
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
  const shouldReduceMotion = !!useReducedMotion();

  const inputAmplitude = useAudioAmplitude(inputAnalyser, isSessionActive && !isMicMuted);
  const outputAmplitude = useAudioAmplitude(outputAnalyser, isSessionActive && isSpeaking);

  const [textMode, setTextMode] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const [privacyAccepted, setPrivacyAccepted] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("nova_privacy_accepted") === "1";
    }
    return false;
  });

  const handlePrivacyAccept = () => {
    sessionStorage.setItem("nova_privacy_accepted", "1");
    setPrivacyAccepted(true);
  };

  useEffect(() => {
    if (showTranscript) {
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, showTranscript]);

  const handleLeadEdit = (field: LeadFieldKey, value: string) => {
    setLeadData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmField = (field: LeadFieldKey) => {
    if (!leadData[field]) return;
    confirmFieldLocal(field);
    onSendText(`Confirmed my ${FIELD_LABELS[field].toLowerCase()} on screen.`);
  };

  const fieldsWithValue = FIELD_ORDER.filter((f) => leadData[f]);
  const allFieldsConfirmed =
    fieldsWithValue.length > 0 && fieldsWithValue.every((f) => fieldConfirmations[f]);

  // Only one field is ever shown at a time — the first one with a value that
  // isn't confirmed yet. Once confirmed it fades out and the next one fades in.
  const currentField = FIELD_ORDER.find((f) => leadData[f] && !fieldConfirmations[f]);

  // Show the "all details saved" line briefly after every field is confirmed.
  // Intentionally drives a setState from an effect — the trigger is a derived
  // boolean and the auto-dismiss timer needs cleanup. Clearer than a ref dance.
  const [showAllConfirmedSummary, setShowAllConfirmedSummary] = useState(false);
  useEffect(() => {
    if (allFieldsConfirmed && fieldsWithValue.length >= 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowAllConfirmedSummary(true);
      const t = setTimeout(() => setShowAllConfirmedSummary(false), 3500);
      return () => clearTimeout(t);
    }
  }, [allFieldsConfirmed, fieldsWithValue.length]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0 mt-2">
        {/* spacer keeps Nova branding centered */}
        <div className="w-[90px]" />
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-red via-brand-red to-[#a31222] flex items-center justify-center shadow-[0_0_12px_rgba(229,25,42,0.35)]">
              <Mic size={13} className="text-white" />
            </div>
            {isSessionActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-red animate-pulse ring-2 ring-black/30" />
            )}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-white">
              Nova
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 mt-0.5">
              {isSessionActive
                ? state === "speaking"
                  ? "Speaking"
                  : state === "listening"
                  ? "Listening"
                  : state === "thinking"
                  ? "Thinking"
                  : "Live"
                : "LIONOVART"}
            </span>
          </div>
        </div>
        <div className="w-[90px] flex items-center justify-end">
          <RecordingIndicator active={isSessionActive && !isMicMuted} />
        </div>
      </div>

      {/* ── 5-min wrap-up nudge ── */}
      <AnimatePresence>
        {sessionNotice && sessionNotice.kind === "warning" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 overflow-hidden mx-4"
          >
            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-400/10 border border-amber-400/20 rounded-xl">
              <Clock size={11} className="text-amber-300 shrink-0" />
              <span className="text-[10px] font-medium text-amber-300/90 uppercase tracking-wider">
                {sessionNotice.message}
              </span>
              {sessionNotice.dismissible && (
                <button
                  type="button"
                  onClick={onDismissNotice}
                  className="ml-1 text-amber-300/60 hover:text-amber-300"
                  aria-label="Dismiss"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-3 gap-6 overflow-y-auto no-scrollbar">
        {/* Idle state — start screen */}
        {!isSessionActive && sessionNotice && sessionNotice.kind !== "warning" ? (
          <NoticeCard
            notice={sessionNotice}
            onDismiss={onDismissNotice}
            onRestart={onStartSession}
          />
        ) : !isSessionActive && !privacyAccepted ? (
          <PrivacyGate onAccept={handlePrivacyAccept} />
        ) : !isSessionActive ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6 text-center max-w-sm flex-1 justify-center"
          >
            <NovaOrb
              state="idle"
              inputAmplitude={0}
              outputAmplitude={0}
              inputAnalyser={inputAnalyser}
              outputAnalyser={outputAnalyser}
            />
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-white uppercase font-clash leading-tight">
                Meet Nova
              </h3>
              <p className="text-sm text-white/60 leading-relaxed max-w-[280px]">
                Your front-desk strategist. Tell her about your project — she&apos;ll listen, learn, and set up time with Leon.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartSession}
              className={[
                "mt-2 px-7 py-3.5 rounded-full",
                "bg-brand-red text-white font-bold uppercase tracking-widest text-xs",
                "hover:bg-brand-red/90 transition-all active:scale-95",
                "flex items-center gap-2.5",
                "shadow-[0_0_24px_rgba(229,25,42,0.28)]",
              ].join(" ")}
            >
              <Play fill="currentColor" size={11} />
              Start Conversation
            </button>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.3em]">
              Microphone Access Required
            </p>
          </motion.div>
        ) : (
          <>
            {/* Active session — visualizer */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-3"
            >
              <NovaOrb
                state={isSpeaking ? "speaking" : isListening ? "listening" : "thinking"}
                inputAmplitude={inputAmplitude}
                outputAmplitude={outputAmplitude}
                inputAnalyser={inputAnalyser}
                outputAnalyser={outputAnalyser}
              />
            </motion.div>

            {/* Progressive lead capture — one field at a time */}
            <div className="w-full max-w-sm flex flex-col gap-3">
              {fieldsWithValue.length > 0 && (
                <div className="flex items-center justify-center gap-1.5">
                  {FIELD_ORDER.map((f) => (
                    <span
                      key={f}
                      className={[
                        "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                        fieldConfirmations[f]
                          ? "bg-brand-gold/70"
                          : f === currentField
                          ? "bg-white/70"
                          : "bg-white/15",
                      ].join(" ")}
                    />
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                {currentField && (
                  <motion.div
                    key={currentField}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <FieldRow
                      field={currentField}
                      label={FIELD_LABELS[currentField]}
                      value={leadData[currentField]}
                      onChange={(v) => handleLeadEdit(currentField, v)}
                      onConfirm={() => handleConfirmField(currentField)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showAllConfirmedSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2 justify-center text-[10px] uppercase tracking-[0.25em] text-white/40 py-1"
                  >
                    <Check size={11} className="text-emerald-400/70" />
                    Your details are saved
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Handoff cards */}
            <AnimatePresence>
              {handoffData && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-sm"
                >
                  <HandoffCards
                    whatsappUrl={handoffData.whatsappUrl}
                    bookingUrl={handoffData.bookingUrl}
                    summaryMessage={handoffData.summaryMessage}
                    bookingConfirmed={handoffData.bookingConfirmed}
                    bookingTimeLabel={handoffData.bookingTimeLabel}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transcript — collapsible, white text only */}
            {transcript.length > 0 && (
              <div className="w-full max-w-sm flex flex-col items-center mt-1">
                <button
                  type="button"
                  onClick={() => setShowTranscript((v) => !v)}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-white/35 hover:text-white/60 transition-colors py-1.5"
                >
                  Transcript
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${showTranscript ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {showTranscript && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full overflow-hidden"
                    >
                      <div className="max-h-[180px] overflow-y-auto no-scrollbar rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 flex flex-col gap-3 mt-1">
                        {/* Message text streams in ~100ms token chunks — only the bubble's
                            entrance animates (mount-only, via key stability across re-renders).
                            Word-level fade-in was skipped: it would re-trigger on every token
                            append and thrash performance for no visible gain at that cadence. */}
                        <AnimatePresence initial={false}>
                          {transcript.slice(-6).map((msg, idx) => (
                            <motion.div
                              key={idx}
                              layout="position"
                              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              className="flex flex-col gap-1"
                            >
                              <span
                                className={`text-[9px] uppercase tracking-[0.25em] ${
                                  msg.role === "agent" ? "text-white/35" : "text-white/45"
                                }`}
                              >
                                {msg.role === "agent" ? "Nova" : "You"}
                              </span>
                              <span
                                className={[
                                  "text-[13px] leading-snug text-white/85 transition-opacity duration-150",
                                  msg.role === "user"
                                    ? "border-l border-white/15 pl-2.5"
                                    : "",
                                ].join(" ")}
                              >
                                {msg.text}
                              </span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div ref={transcriptEndRef} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Text input bar (text mode) ── */}
      {isSessionActive && textMode && (
        <TextInputBar onSend={onSendText} disabled={!isSessionActive} />
      )}

      {/* ── Footer controls ── */}
      {isSessionActive && (
        <div className="shrink-0 px-6 py-4 flex flex-col items-center gap-2.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm p-1.5">
            {!textMode && (
              <button
                type="button"
                onClick={onToggleMic}
                className={[
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95",
                  isMicMuted
                    ? "bg-brand-red/15 text-brand-red"
                    : "text-white/70 hover:bg-white/[0.08] hover:text-white",
                ].join(" ")}
                aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
                aria-pressed={isMicMuted}
              >
                {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
            <button
              type="button"
              onClick={onStopSession}
              className={[
                "w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center",
                "hover:bg-brand-red/90 transition-all active:scale-95",
              ].join(" ")}
              aria-label="End session"
            >
              <PhoneOff size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !textMode;
              setTextMode(next);
              if (next && !isMicMuted) onToggleMic();
              trackNovaEvent(NOVA_EVENT.TEXT_MODE_TOGGLED, { enabled: next });
            }}
            className="text-[11px] uppercase tracking-wider text-white/50 hover:text-white/85 transition-colors"
          >
            {textMode ? "Use voice" : "Type instead"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Field row — editable input + confirm button ─────────────────────── */

function FieldRow({
  field,
  label,
  value,
  onChange,
  onConfirm,
}: {
  field: LeadFieldKey;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
}) {
  // Auto-confirm after 20s of stable value with no edits — generous enough
  // to notice and correct a misheard name/email before it locks in.
  useEffect(() => {
    if (!value) return;
    const t = setTimeout(onConfirm, 20000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      className={[
        "flex items-center gap-2 rounded-2xl",
        "bg-white/[0.04] border border-white/[0.08]",
        "backdrop-blur-sm",
        "px-3 py-2",
      ].join(" ")}
    >
      <span className="text-[9px] uppercase tracking-[0.25em] text-white/35 shrink-0 w-[68px]">
        {label}
      </span>
      <input
        type={field === "email" ? "email" : field === "website" ? "url" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm();
        }}
        className={[
          "flex-1 bg-transparent border-0 outline-none",
          "text-[14px] text-white placeholder:text-white/20",
          "focus:outline-none",
        ].join(" ")}
        aria-label={label}
        placeholder={label}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={onConfirm}
        className={[
          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
          "bg-emerald-400/15 border border-emerald-400/30 text-emerald-300",
          "hover:bg-emerald-400/25 transition-colors active:scale-95",
        ].join(" ")}
        aria-label={`Confirm ${label}`}
        title={`Confirm ${label}`}
      >
        <Check size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* ─── Branded notice card (timeouts, errors, session-ended) ──────────── */

interface NoticeCardProps {
  notice: SessionNotice;
  onDismiss: () => void;
  onRestart: () => void;
}

function NoticeCard({ notice, onDismiss, onRestart }: NoticeCardProps) {
  const palette =
    notice.kind === "error"
      ? {
          icon: AlertCircle,
          iconColor: "text-brand-red",
          ring: "border-brand-red/30",
          glow: "shadow-[0_0_40px_rgba(229,25,42,0.18)]",
          dot: "bg-brand-red",
          ctaLabel: "Try again",
        }
      : notice.kind === "ended"
      ? {
          icon: CheckCircle2,
          iconColor: "text-brand-red",
          ring: "border-white/15",
          glow: "shadow-[0_0_40px_rgba(229,25,42,0.12)]",
          dot: "bg-brand-red",
          ctaLabel: "Start new conversation",
        }
      : {
          icon: AlertTriangle,
          iconColor: "text-amber-400",
          ring: "border-amber-400/30",
          glow: "shadow-[0_0_40px_rgba(251,191,36,0.12)]",
          dot: "bg-amber-400",
          ctaLabel: "Continue",
        };

  const Icon = palette.icon;

  return (
    <motion.div
      key={notice.title}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={[
        "relative w-full max-w-sm flex flex-col items-center text-center gap-5",
        "rounded-3xl border bg-white/[0.04] backdrop-blur-md p-7",
        palette.ring,
        palette.glow,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      {notice.dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors"
          aria-label="Dismiss notice"
        >
          <X size={16} />
        </button>
      )}

      <div className="relative w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${palette.dot} animate-pulse`} />
        <Icon size={26} className={palette.iconColor} strokeWidth={1.8} />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-white font-clash uppercase tracking-wide">
          {notice.title}
        </h3>
        <p className="text-sm text-white/65 leading-relaxed">{notice.message}</p>
      </div>

      {notice.canRestart && (
        <button
          type="button"
          onClick={() => {
            onDismiss();
            onRestart();
          }}
          className="mt-2 px-7 py-3.5 rounded-full bg-brand-red text-white font-bold uppercase tracking-widest text-xs hover:bg-brand-red/90 transition-all active:scale-95 flex items-center gap-2.5 shadow-[0_0_24px_rgba(229,25,42,0.28)]"
        >
          <Play fill="currentColor" size={11} />
          {palette.ctaLabel}
        </button>
      )}
    </motion.div>
  );
}
