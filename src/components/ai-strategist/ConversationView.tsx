"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send } from "lucide-react";
import type { Message, HandoffData, SessionState } from "@/lib/strategist-config";
import VoiceVisualizer from "./VoiceVisualizer";
import HandoffCards from "./HandoffCards";

/* ─── Props ──────────────────────────────────────────────────── */
export interface ConversationViewProps {
  state: SessionState;
  messages: Message[];
  inputMode: "voice" | "text";
  setInputMode: (m: "voice" | "text") => void;
  detectedLanguage: string;
  handoffData: HandoffData | null;
  onSendText: (text: string) => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  hasSpeechSupport: boolean;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function ConversationView({
  state,
  messages,
  inputMode,
  setInputMode,
  detectedLanguage,
  handoffData,
  onSendText,
  onStartVoice,
  onStopVoice,
  hasSpeechSupport,
}: ConversationViewProps) {
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking";
  const isHandoff = state === "handoff";

  /* Auto-scroll on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

  /* Auto-grow textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  }, [draft]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text || state === "thinking" || state === "speaking") return;
    onSendText(text);
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [draft, state, onSendText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const toggleVoice = useCallback(() => {
    if (isListening) {
      onStopVoice();
    } else {
      onStartVoice();
    }
  }, [isListening, onStartVoice, onStopVoice]);

  const langLabel = detectedLanguage.toUpperCase().slice(0, 2) || "EN";

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: 56,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Left: icon + title */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-red/20 flex items-center justify-center shrink-0">
            <img
              src="/images/favicon.svg"
              alt=""
              className="w-4 h-4 object-contain"
              aria-hidden="true"
            />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
            LIONOVART AI
          </span>
        </div>

        {/* Right: mode toggle + language */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">{langLabel}</span>
          {hasSpeechSupport && (
            <div
              className="flex rounded-full p-0.5"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {(["voice", "text"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={[
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 capitalize",
                    inputMode === mode
                      ? "bg-brand-red text-white"
                      : "text-white/40 hover:text-white/70",
                  ].join(" ")}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Messages area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-3">
        {/* Empty state greeting */}
        {messages.length === 0 && !isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mr-auto max-w-[82%]"
          >
            <AgentBubble content="Welcome to LIONOVART. Tell me about what you're building — what's the core challenge that brought you here today?" />
          </motion.div>
        )}

        {/* Message list */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={msg.role === "user" ? "ml-auto max-w-[82%]" : "mr-auto max-w-[82%]"}
            >
              {msg.role === "user" ? (
                <UserBubble content={msg.content} timestamp={msg.timestamp} />
              ) : (
                <AgentBubble content={msg.content} timestamp={msg.timestamp} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mr-auto"
            >
              <div
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/50 animate-typing-dot"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Handoff cards */}
        <AnimatePresence>
          {isHandoff && handoffData && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <HandoffCards
                whatsappUrl={handoffData.whatsappUrl}
                bookingUrl={handoffData.bookingUrl}
                summaryMessage={handoffData.summaryMessage}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ─────────────────────────────────────────── */}
      {!isHandoff && (
        <div
          className="shrink-0 px-4 pb-4 pt-3 flex flex-col items-center gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {inputMode === "voice" ? (
            /* Voice mode */
            <>
              <VoiceVisualizer isListening={isListening} isSpeaking={isSpeaking} />
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={toggleVoice}
                disabled={isThinking || isSpeaking}
                className={[
                  "relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2",
                  isListening
                    ? "bg-brand-red shadow-[0_0_32px_rgba(229,25,42,0.5)]"
                    : "border-2 border-brand-red/60 bg-brand-red/10 hover:bg-brand-red/20",
                  (isThinking || isSpeaking) ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
                aria-label={isListening ? "Stop recording" : "Start recording"}
              >
                {isListening ? (
                  <MicOff size={22} className="text-white" strokeWidth={1.8} />
                ) : (
                  <Mic size={22} className="text-brand-red" strokeWidth={1.8} />
                )}
                {isListening && (
                  <span className="absolute inset-0 rounded-full border-2 border-brand-red animate-ping opacity-40" />
                )}
              </motion.button>
              <p className="text-[11px] text-white/30">
                {isListening ? "Tap to stop" : isSpeaking ? "Listening..." : "Tap to speak"}
              </p>
              <button
                onClick={() => setInputMode("text")}
                className="text-[11px] text-white/25 hover:text-white/50 transition-colors"
              >
                Type instead
              </button>
            </>
          ) : (
            /* Text mode */
            <>
              <div className="w-full relative flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  disabled={isThinking || isSpeaking}
                  className={[
                    "flex-1 resize-none rounded-2xl px-4 py-3 text-[14px] text-white",
                    "placeholder:text-white/25 bg-white/[0.06] border border-white/10",
                    "focus:outline-none focus:border-white/20 transition-colors",
                    "no-scrollbar leading-relaxed",
                    (isThinking || isSpeaking) ? "opacity-50" : "",
                  ].join(" ")}
                  style={{ maxHeight: 96 }}
                />
                <AnimatePresence>
                  {draft.trim().length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={handleSend}
                      className="shrink-0 w-9 h-9 rounded-full bg-brand-red flex items-center justify-center hover:bg-brand-red-secondary transition-colors"
                      aria-label="Send message"
                    >
                      <Send size={16} className="text-white" strokeWidth={2} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              {hasSpeechSupport && (
                <button
                  onClick={() => setInputMode("voice")}
                  className="text-[11px] text-white/25 hover:text-white/50 transition-colors"
                >
                  Use voice instead
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function UserBubble({ content, timestamp }: { content: string; timestamp?: number }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="bg-brand-red text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-[14px] leading-relaxed">
        {content}
      </div>
      {timestamp && (
        <span className="text-[10px] text-white/30 pr-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}

function AgentBubble({ content, timestamp }: { content: string; timestamp?: number }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className="text-white px-4 py-2.5 rounded-2xl rounded-bl-sm text-[14px] leading-relaxed"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {content}
      </div>
      {timestamp && (
        <span className="text-[10px] text-white/30 pl-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}
