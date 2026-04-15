"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage } from "@/lib/gemini-client";
import type { Message, HandoffData, SessionState } from "@/lib/strategist-config";

/* ─── Types ──────────────────────────────────────────────────── */
interface UseStrategistSessionOptions {
  onClose: () => void;
}

export interface UseStrategistSessionReturn {
  state: SessionState;
  messages: Message[];
  inputMode: "voice" | "text";
  setInputMode: (mode: "voice" | "text") => void;
  detectedLanguage: string;
  handoffData: HandoffData | null;
  hasSpeechSupport: boolean;
  sendText: (text: string) => void;
  startVoice: () => void;
  stopVoice: () => void;
}

/* ─── Unique ID helper ───────────────────────────────────────── */
let _idCounter = 0;
function uid() {
  return `msg_${Date.now()}_${++_idCounter}`;
}

/* ─── Hook ───────────────────────────────────────────────────── */
export function useStrategistSession({
  onClose,
}: UseStrategistSessionOptions): UseStrategistSessionReturn {
  const [state, setState] = useState<SessionState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [detectedLanguage, setDetectedLanguage] = useState("en");
  const [handoffData, setHandoffData] = useState<HandoffData | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  /* ── Detect SpeechRecognition support on mount ── */
  useEffect(() => {
    const SR: SpeechRecognitionConstructor | undefined =
      typeof window !== "undefined"
        ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
        : undefined;
    const supported = SR != null;
    setHasSpeechSupport(supported);
    if (!supported) setInputMode("text");
  }, []);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopRecognition();
      window.speechSynthesis?.cancel();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Speak agent message aloud (voice mode only) ── */
  const speakText = useCallback(
    (text: string) => {
      if (inputMode !== "voice" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = detectedLanguage.length === 2 ? `${detectedLanguage}-${detectedLanguage.toUpperCase()}` : detectedLanguage;
      utterance.rate = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith(detectedLanguage) && (v.name.includes("Natural") || v.name.includes("Premium"))
      );
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setState("speaking");
      utterance.onend = () => setState("idle");
      utterance.onerror = () => setState("idle");
      window.speechSynthesis.speak(utterance);
    },
    [inputMode, detectedLanguage]
  );

  /* ── Core send function ── */
  const sendText = useCallback(
    (text: string) => {
      if (state === "thinking" || state === "speaking") return;

      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Append user message
      const userMsg: Message = { id: uid(), role: "user", content: text, timestamp: Date.now() };
      setMessages((prev) => {
        const updated = [...prev, userMsg];
        startStreaming(text, updated, controller.signal);
        return updated;
      });
    },
    [state] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* ── Stream agent response ── */
  function startStreaming(
    text: string,
    history: Message[],
    signal: AbortSignal
  ) {
    setState("thinking");

    // Exclude the last user message from history sent (it's sent as `message`)
    const historyForApi = history.slice(0, -1);

    const agentMsgId = uid();
    let agentContent = "";
    let firstChunk = true;

    (async () => {
      try {
        for await (const event of sendMessage(text, historyForApi, signal)) {
          if (signal.aborted) break;

          switch (event.type) {
            case "text": {
              if (!event.content) break;
              if (firstChunk) {
                firstChunk = false;
                setState("speaking");
                // Add empty agent message to stream into
                setMessages((prev) => [
                  ...prev,
                  { id: agentMsgId, role: "agent", content: "", timestamp: Date.now() },
                ]);
              }
              agentContent += event.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === agentMsgId ? { ...m, content: agentContent } : m
                )
              );
              break;
            }

            case "function_result": {
              // language_detected comes back in function results
              const result = event.result as Record<string, unknown> | null;
              if (result && typeof result.language_detected === "string") {
                setDetectedLanguage(result.language_detected);
              }
              break;
            }

            case "handoff": {
              if (event.whatsapp_url && event.booking_url) {
                setHandoffData({
                  whatsappUrl: event.whatsapp_url,
                  bookingUrl: event.booking_url,
                  summaryMessage: event.summary_message,
                });
                setState("handoff");
              }
              break;
            }

            case "done": {
              if (agentContent && inputMode === "voice") {
                speakText(agentContent);
              } else {
                setState("idle");
              }
              break;
            }

            case "error": {
              const errMsg: Message = {
                id: uid(),
                role: "agent",
                content: event.message ?? "Something went wrong. Please try again.",
                timestamp: Date.now(),
              };
              setMessages((prev) => [...prev.filter((m) => m.id !== agentMsgId), errMsg]);
              setState("idle");
              break;
            }
          }
        }
      } catch {
        if (!signal.aborted) {
          setState("idle");
        }
      }
    })();
  }

  /* ── Voice input ── */
  function stopRecognition() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }

  const startVoice = useCallback(() => {
    const SR: SpeechRecognitionConstructor | undefined =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    stopRecognition();

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = detectedLanguage.length === 2 ? `${detectedLanguage}-${detectedLanguage.toUpperCase()}` : detectedLanguage;

    recognition.onstart = () => setState("listening");
    recognition.onend = () => {
      recognitionRef.current = null;
      if (state === "listening") setState("idle");
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setState("idle");
    };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join("")
        .trim();
      if (transcript) sendText(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [detectedLanguage, state, sendText]);

  const stopVoice = useCallback(() => {
    stopRecognition();
    setState("idle");
  }, []);

  return {
    state,
    messages,
    inputMode,
    setInputMode,
    detectedLanguage,
    handoffData,
    hasSpeechSupport,
    sendText,
    startVoice,
    stopVoice,
  };
}
