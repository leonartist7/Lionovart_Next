"use client";

import { useState, useEffect, useRef, useCallback, type RefObject } from "react";
import type { HandoffData, SessionState, LeadFieldKey } from "@/lib/strategist-config";
import { getSystemPrompt, STRATEGIST_TOOLS } from "@/lib/strategist-config";
import type { NovaLocale } from "@/lib/strategist-config";
import { trackNovaEvent, NOVA_EVENT } from "@/lib/nova-events";
import { useLanguage } from "@/contexts/LanguageContext";

export interface LeadData {
  name: string;
  phone: string;
  email: string;
  website: string;
  business_type: string;
}

export type FieldConfirmations = Record<LeadFieldKey, boolean>;

export interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

export type SessionNoticeKind = "info" | "warning" | "ended" | "error";

export interface SessionNotice {
  kind: SessionNoticeKind;
  title: string;
  message: string;
  canRestart?: boolean;
  dismissible?: boolean;
}

export interface UseStrategistSessionReturn {
  isSessionActive: boolean;
  state: SessionState;
  leadData: LeadData;
  setLeadData: (updater: (prev: LeadData) => LeadData) => void;
  fieldConfirmations: FieldConfirmations;
  confirmFieldLocal: (field: LeadFieldKey) => void;
  handoffData: HandoffData | null;
  transcript: ChatMessage[];
  sessionNotice: SessionNotice | null;
  dismissNotice: () => void;
  isMicMuted: boolean;
  toggleMic: () => void;
  startSession: () => Promise<void>;
  stopSession: () => void;
  sendTextToAgent: (text: string) => void;
  pushContextMessage: (note: string) => void;
  conversationId: string | null;
  inputAnalyser: RefObject<AnalyserNode | null>;
  outputAnalyser: RefObject<AnalyserNode | null>;
}

const EMPTY_LEAD: LeadData = { name: "", phone: "", email: "", website: "", business_type: "" };
const EMPTY_CONFIRMATIONS: FieldConfirmations = {
  name: false,
  phone: false,
  email: false,
  website: false,
  business_type: false,
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToInt16Array(base64: string) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

/** Smooth-scroll to a [data-nova-section="<id>"] element on the page. */
function scrollToNovaSection(sectionId: string): boolean {
  if (typeof document === "undefined") return false;
  const target = document.querySelector(`[data-nova-section="${sectionId}"], #${sectionId}`);
  if (!target) return false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export function useStrategistSession({
  onClose,
}: {
  onClose: () => void;
}): UseStrategistSessionReturn {
  void onClose;
  const { locale } = useLanguage();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [state, setState] = useState<SessionState>("idle");
  const [leadData, setLeadData] = useState<LeadData>(EMPTY_LEAD);
  const [fieldConfirmations, setFieldConfirmations] = useState<FieldConfirmations>(
    EMPTY_CONFIRMATIONS,
  );
  const [handoffData, setHandoffData] = useState<HandoffData | null>(null);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [sessionNotice, setSessionNotice] = useState<SessionNotice | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const dismissNotice = useCallback(() => setSessionNotice(null), []);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);

  const nextPlaybackTimeRef = useRef(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const micEnabledRef = useRef(true);
  const agentSpeakingRef = useRef(false);
  const currentTurnIdRef = useRef(0);

  const sessionStartedAtRef = useRef<string | null>(null);
  const transcriptRef = useRef<ChatMessage[]>([]);
  const leadDataRef = useRef<LeadData>(EMPTY_LEAD);

  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fiveMinWarningFiredRef = useRef(false);

  // Analytics + audio analysis
  const conversationIdRef = useRef<string | null>(null);
  const startSessionRef = useRef<(() => Promise<void>) | null>(null);
  const distinctIdRef = useRef<string | null>(null);
  const currentStageRef = useRef<string>("greeting");
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const fieldConfirmationsRef = useRef<FieldConfirmations>(EMPTY_CONFIRMATIONS);

  // Session resume / reconnect
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumptionHandleRef = useRef<string | null>(null);
  // Voice A/B: which variant the proxy resolved for this conversationId
  // (null when no experiment is configured — uses agentConfig.voice as-is).
  const voiceVariantRef = useRef<string | null>(null);
  // When true, stopSession()/startSession() reuse the live mic stream + audio
  // graph instead of tearing down and re-calling getUserMedia (avoids a
  // permission re-prompt on reconnect).
  const preserveStreamRef = useRef(false);
  const goAwayReconnectRef = useRef(false);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);
  useEffect(() => {
    leadDataRef.current = leadData;
  }, [leadData]);
  useEffect(() => {
    fieldConfirmationsRef.current = fieldConfirmations;
  }, [fieldConfirmations]);

  // Persist session state for reconnect resume (only while active)
  useEffect(() => {
    if (!isSessionActive) return;
    try {
      sessionStorage.setItem("nova_session_state", JSON.stringify({
        conversationId: conversationIdRef.current,
        leadData,
        fieldConfirmations,
        lastStage: currentStageRef.current,
        transcript: transcript.slice(-10),
        savedAt: Date.now(),
      }));
    } catch { /* storage full or unavailable */ }
  }, [isSessionActive, leadData, fieldConfirmations, transcript]);

  const toggleMic = useCallback(() => {
    setIsMicMuted((prev) => {
      const next = !prev;
      micEnabledRef.current = !next;
      return next;
    });
  }, []);

  const confirmFieldLocal = useCallback((field: LeadFieldKey) => {
    setFieldConfirmations((prev) => ({ ...prev, [field]: true }));
  }, []);

  const stopSession = useCallback((reason = "user") => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    fiveMinWarningFiredRef.current = false;

    const startedAt = sessionStartedAtRef.current;
    const finalTranscript = transcriptRef.current;
    const confirmedCount = Object.values(fieldConfirmationsRef.current).filter(Boolean).length;
    if (startedAt) {
      const durationMs = Date.now() - Date.parse(startedAt);
      trackNovaEvent(NOVA_EVENT.SESSION_ENDED, {
        reason,
        stage_at_end: currentStageRef.current,
        duration_ms: durationMs,
        fields_confirmed_count: confirmedCount,
        conversation_id: conversationIdRef.current,
        $session_id: distinctIdRef.current,
      });
    }
    if (startedAt && finalTranscript.length > 0) {
      const endedAt = new Date().toISOString();
      const durationMs = Date.parse(endedAt) - Date.parse(startedAt);
      const lead = leadDataRef.current;
      const confirmations = fieldConfirmationsRef.current;
      const convId = conversationIdRef.current;
      try {
        fetch("/api/strategist/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            transcript: finalTranscript,
            contact: lead,
            session_started_at: startedAt,
            session_ended_at: endedAt,
            duration_ms: durationMs,
            source: "ai_strategist",
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            conversation_id: convId,
          }),
        }).catch((err) => console.error("[conversation] save failed:", err));
      } catch (err) {
        console.error("[conversation] save threw:", err);
      }

      // Send summary email if email was confirmed
      if (confirmations.email && lead.email && convId) {
        fetch("/api/strategist/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            conversation_id: convId,
            email: lead.email,
            name: lead.name || "there",
          }),
        }).catch((err) => console.error("[summary] request failed:", err));
      }

      // Fire-and-forget dossier generation — only when there's a contact to
      // key a lead record on; the route no-ops gracefully otherwise anyway.
      const contact = lead.phone || lead.email;
      if (contact) {
        fetch("/api/strategist/dossier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({ conversation_id: convId, contact }),
        }).catch((err) => console.error("[dossier] request failed:", err));
      }
    }
    sessionStartedAtRef.current = null;

    activeSourcesRef.current.forEach((src) => {
      try { src.stop(); } catch {}
    });
    activeSourcesRef.current = [];
    nextPlaybackTimeRef.current = 0;
    agentSpeakingRef.current = false;
    currentTurnIdRef.current = 0;

    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    if (!preserveStreamRef.current) {
      // Full teardown — reconnects set preserveStreamRef so the mic stream and
      // audio graph survive and getUserMedia isn't re-prompted.
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      inputAnalyserRef.current = null;
      outputAnalyserRef.current = null;
      resumptionHandleRef.current = null;
    }
    setIsSessionActive(false);
    setState("idle");
    setIsMicMuted(false);
    micEnabledRef.current = true;
  }, []);

  const sendTextToAgent = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ realtimeInput: { text } }));
      setTranscript((prev) => [...prev, { role: "user", text }]);
    }
  }, []);

  /**
   * Pushes a system-style note into the agent's context without showing it
   * in the user-visible transcript. Used by the page-section tracker.
   */
  const pushContextMessage = useCallback((note: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ realtimeInput: { text: note } }));
    }
  }, []);

  const startSession = useCallback(async () => {
    try {
      setTranscript([]);
      setSessionNotice(null);
      setIsMicMuted(false);
      setLeadData(EMPTY_LEAD);
      setFieldConfirmations(EMPTY_CONFIRMATIONS);
      setHandoffData(null);
      micEnabledRef.current = true;
      agentSpeakingRef.current = false;
      currentTurnIdRef.current = 0;
      // NOTE: reconnectAttemptsRef is intentionally NOT reset here — it must
      // survive into setup_complete (resume branch + max-3 cap). It resets to
      // 0 on successful connection.
      sessionStartedAtRef.current = new Date().toISOString();
      activeSourcesRef.current.forEach((src) => { try { src.stop(); } catch {} });
      activeSourcesRef.current = [];
      nextPlaybackTimeRef.current = 0;

      // Generate stable ids for this session
      const convId = crypto.randomUUID();
      conversationIdRef.current = convId;
      setConversationId(convId);
      try { sessionStorage.setItem("nova_conversation_id", convId); } catch { /* ignore */ }
      let distinctId = (() => { try { return sessionStorage.getItem("nova_distinct_id"); } catch { return null; } })();
      if (!distinctId) {
        distinctId = crypto.randomUUID();
        try { sessionStorage.setItem("nova_distinct_id", distinctId); } catch { /* ignore */ }
      }
      distinctIdRef.current = distinctId;
      currentStageRef.current = "greeting";

      const canReuseAudio =
        preserveStreamRef.current &&
        !!streamRef.current &&
        streamRef.current.getTracks().some((t) => t.readyState === "live") &&
        !!audioContextRef.current &&
        audioContextRef.current.state !== "closed" &&
        !!processorRef.current;
      preserveStreamRef.current = false;

      if (!canReuseAudio) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true,
          },
        });
        streamRef.current = stream;

        const Ctor =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new Ctor!({ sampleRate: 16000 });
        audioContextRef.current = audioCtx;

        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        await audioCtx.audioWorklet.addModule("/audio-processor.js");

        const micSource = audioCtx.createMediaStreamSource(stream);
        const newProcessor = new AudioWorkletNode(audioCtx, "audio-processor", {
          processorOptions: { sampleRate: audioCtx.sampleRate },
        });
        processorRef.current = newProcessor;

        // Input analyser — mic amplitude
        const inputAnalyser = audioCtx.createAnalyser();
        inputAnalyser.fftSize = 256;
        inputAnalyser.smoothingTimeConstant = 0.7;
        micSource.connect(inputAnalyser);
        inputAnalyserRef.current = inputAnalyser;

        micSource.connect(newProcessor);
        newProcessor.connect(audioCtx.destination);
      } else if (audioContextRef.current!.state === "suspended") {
        await audioContextRef.current!.resume();
      }
      const processor = processorRef.current!;

      setIsSessionActive(true);
      setState("thinking");

      const host = window.location.hostname;
      const isLocal = host === "localhost" || host === "127.0.0.1";
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = isLocal
        ? `ws://localhost:3001/api/strategist/live`
        : `${protocol}//${window.location.host}/api/strategist/live`;

      // Short-lived HMAC token authenticates the WS upgrade. token:null means
      // NOVA_WS_SECRET isn't configured — the proxy allows the connection.
      let authedWsUrl = wsUrl;
      try {
        const tokRes = await fetch("/api/strategist/session-token", { method: "POST" });
        const { token } = await tokRes.json();
        if (token) authedWsUrl = `${wsUrl}?t=${encodeURIComponent(token)}`;
      } catch {
        // Proxy decides whether unauthenticated connections are allowed.
      }

      console.log("[WS] Connecting to:", wsUrl);
      const ws = new WebSocket(authedWsUrl);
      wsRef.current = ws;

      let hasConnected = false;

      ws.onopen = () => {
        const isDraftTestCall =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("novaDraft") === "1";
        ws.send(
          JSON.stringify({
            type: "setup",
            locale,
            draft: isDraftTestCall,
            conversationId: conversationIdRef.current,
            config: {
              systemInstruction: {
                parts: [
                  {
                    text:
                      getSystemPrompt(locale as NovaLocale) +
                      "\n\nCRITICAL DIRECTIVE: Your very first action immediately upon connecting must be a brief 1-sentence verbal greeting from Stage 0. Pick one of the rotation options. Do not wait for the user to speak first.",
                  },
                ],
              },
              tools: STRATEGIST_TOOLS,
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede",
                  },
                },
              },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              // With a stored handle, Gemini restores the prior session's
              // context server-side (true resume, not a context blurb).
              sessionResumption: resumptionHandleRef.current
                ? { handle: resumptionHandleRef.current }
                : {},
              contextWindowCompression: { slidingWindow: {} },
            },
          }),
        );
      };

      ws.onmessage = async (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          console.error("[WS] Malformed frame ignored");
          return;
        }

        if (data.type === "error") {
          console.error("[WS] Backend error:", data.message);
          setSessionNotice({
            kind: "error",
            title: "Connection issue",
            message: "We couldn't reach Nova right now. Please try again in a moment.",
            canRestart: true,
            dismissible: true,
          });
          stopSession();
          return;
        }

        if (data.type === "voice_resolved") {
          voiceVariantRef.current = data.voice ?? null;
          return;
        }

        if (data.type === "setup_complete") {
          hasConnected = true;
          setIsSessionActive(true);
          setState("listening");

          // Stamp server-side session start (only on fresh sessions, not reconnects)
          if (reconnectAttemptsRef.current === 0 && conversationIdRef.current) {
            fetch("/api/strategist/conversation/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ conversation_id: conversationIdRef.current }),
            }).catch(() => {});
          }

          trackNovaEvent(NOVA_EVENT.SESSION_STARTED, {
            conversation_id: conversationIdRef.current,
            $session_id: distinctIdRef.current,
            locale,
            voice_variant: voiceVariantRef.current,
          });

          const SESSION_LIMIT_MS = 45 * 60 * 1000;
          const startTime = Date.now();
          sessionTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const timeLeftMs = SESSION_LIMIT_MS - elapsed;

            if (timeLeftMs <= 300_000 && !fiveMinWarningFiredRef.current) {
              fiveMinWarningFiredRef.current = true;
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({
                    realtimeInput: {
                      text: "SYSTEM ALERT: The conversation will automatically disconnect in exactly 5 minutes. Briefly mention to the user you only have 5 minutes left and start steering toward the handoff.",
                    },
                  }),
                );
              }
            }

            if (timeLeftMs <= 0) {
              setSessionNotice({
                kind: "ended",
                title: "Session complete",
                message:
                  "We've wrapped up this 45-minute consultation. Book a follow-up call to keep going — Leon will have full context ready.",
                canRestart: true,
                dismissible: true,
              });
              stopSession();
            }
          }, 1000);

          if (reconnectAttemptsRef.current > 0) {
            try {
              const raw = sessionStorage.getItem("nova_session_state");
              if (raw) {
                const saved = JSON.parse(raw) as {
                  savedAt: number;
                  lastStage: string;
                  leadData: Record<string, string>;
                };
                if (Date.now() - saved.savedAt < 30_000) {
                  const capturedFields = Object.entries(saved.leadData)
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(", ");
                  ws.send(
                    JSON.stringify({
                      realtimeInput: {
                        text: `[CONTEXT] Session resumed after a brief disconnect. Last stage: ${saved.lastStage}. Captured so far: ${capturedFields || "nothing yet"}. Pick up naturally — don't say "welcome back", just continue the conversation.`,
                      },
                    }),
                  );
                }
              }
            } catch {
              // ignore storage errors
            }
            reconnectAttemptsRef.current = 0;
          } else if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                realtimeInput: {
                  text: "Hello. Please greet me out loud as instructed in Stage 0.",
                },
              }),
            );
          }

          // Mic streams CONTINUOUSLY — including while the agent speaks. This
          // is what makes barge-in possible: Gemini's server VAD detects the
          // user talking over the agent and sends `interrupted`. Echo of the
          // agent's own voice is handled by echoCancellation on getUserMedia.
          processor.port.onmessage = (e) => {
            if (
              e.data.type === "audio" &&
              ws.readyState === WebSocket.OPEN &&
              micEnabledRef.current
            ) {
              const base64Audio = arrayBufferToBase64(e.data.pcm.buffer);
              ws.send(
                JSON.stringify({
                  realtimeInput: {
                    audio: {
                      mimeType: "audio/pcm;rate=16000",
                      data: base64Audio,
                    },
                  },
                }),
              );
            }
          };
          return;
        }

        if (data.sessionResumptionUpdate) {
          // Store the latest resumable handle; replayed in the setup message
          // on reconnect for a true server-side session resume.
          const update = data.sessionResumptionUpdate;
          if (update.newHandle && update.resumable !== false) {
            resumptionHandleRef.current = update.newHandle;
          }
          return;
        }

        if (data.goAway) {
          // Gemini is about to close this connection. Flag a seamless
          // reconnect (with the resumption handle) instead of ending.
          goAwayReconnectRef.current = true;
          setSessionNotice({
            kind: "info",
            title: "One moment",
            message: "Refreshing the connection — Nova remembers everything.",
            dismissible: true,
          });
        }

        if (data.serverContent?.interrupted) {
          currentTurnIdRef.current += 1;
          activeSourcesRef.current.forEach((src) => { try { src.stop(); } catch {} });
          activeSourcesRef.current = [];
          if (audioContextRef.current) {
            nextPlaybackTimeRef.current = audioContextRef.current.currentTime;
          }
          agentSpeakingRef.current = false;
        }

        if (data.serverContent?.inputTranscription?.text) {
          const text: string = data.serverContent.inputTranscription.text;
          setTranscript((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "user") {
              last.text += text;
            } else {
              next.push({ role: "user", text });
            }
            return next;
          });
        }

        if (data.serverContent?.outputTranscription?.text) {
          const text: string = data.serverContent.outputTranscription.text;
          setTranscript((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "agent") {
              last.text += text;
            } else {
              next.push({ role: "agent", text });
            }
            return next;
          });
        }

        if (data.serverContent?.modelTurn?.parts) {
          const parts = data.serverContent.modelTurn.parts;
          for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith("audio/pcm")) {
              const turnAtDecode = currentTurnIdRef.current;
              const pcm16 = base64ToInt16Array(part.inlineData.data);
              const ctx = audioContextRef.current;
              if (!ctx) continue;

              if (turnAtDecode !== currentTurnIdRef.current) continue;

              if (ctx.state === "suspended") {
                ctx.resume().catch((err) => console.error("[Audio] Failed to resume context:", err));
              }

              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768.0;
              }

              const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
              audioBuffer.getChannelData(0).set(float32);

              const bufSource = ctx.createBufferSource();
              bufSource.buffer = audioBuffer;

              // Output analyser — TTS amplitude (create once per context)
              if (!outputAnalyserRef.current && ctx) {
                const outAnalyser = ctx.createAnalyser();
                outAnalyser.fftSize = 256;
                outAnalyser.smoothingTimeConstant = 0.7;
                outputAnalyserRef.current = outAnalyser;
                outAnalyser.connect(ctx.destination);
              }
              if (outputAnalyserRef.current) {
                bufSource.connect(outputAnalyserRef.current);
              } else {
                bufSource.connect(ctx.destination);
              }

              const now = ctx.currentTime;
              if (nextPlaybackTimeRef.current < now) {
                nextPlaybackTimeRef.current = now;
              }

              if (turnAtDecode !== currentTurnIdRef.current) continue;

              bufSource.start(nextPlaybackTimeRef.current);
              nextPlaybackTimeRef.current += audioBuffer.duration;

              agentSpeakingRef.current = true;

              activeSourcesRef.current.push(bufSource);
              bufSource.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== bufSource);
              };

              setState("speaking");
            } else if (part.text) {
              setTranscript((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "agent") {
                  last.text += part.text;
                } else {
                  next.push({ role: "agent", text: part.text });
                }
                return next;
              });
            }
          }
        }

        if (data.serverContent?.turnComplete) {
          agentSpeakingRef.current = false;
          currentTurnIdRef.current += 1;
          setState("listening");
        }

        if (data.toolCall) {
          const calls = data.toolCall.functionCalls;
          const serverTools = [
            "fetch_user_memory",
            "save_lead_data",
            "generate_whatsapp_link",
            "fetch_booking_link",
            "lookup_site_info",
            "scrape_website",
            "load_skill",
            "flag_objection",
            "enrich_business",
            "check_availability",
            "book_meeting",
            "send_follow_up_email",
          ];
          const toolPromises: Promise<{
            id: string;
            name: string;
            response: unknown;
            scheduling?: "SILENT";
          }>[] = [];

          for (const call of calls) {
            if (call.name === "update_screen_info") {
              const args = call.args as Partial<LeadData>;
              setLeadData((prev) => ({
                name: args.name !== undefined ? args.name : prev.name,
                phone: args.phone !== undefined ? args.phone : prev.phone,
                email: args.email !== undefined ? args.email : prev.email,
                website: args.website !== undefined ? args.website : prev.website,
                business_type:
                  args.business_type !== undefined ? args.business_type : prev.business_type,
              }));
              // Updating a field invalidates its prior confirmation
              setFieldConfirmations((prev) => {
                const next = { ...prev };
                (Object.keys(args) as LeadFieldKey[]).forEach((k) => {
                  if (k in next) next[k] = false;
                });
                return next;
              });
              // Fire-and-forget ack so Gemini knows the tool ran
              if (call.id) {
                toolPromises.push(
                  Promise.resolve({ id: call.id, name: call.name, response: { ok: true } }),
                );
              }
            } else if (call.name === "confirm_field") {
              const field = (call.args as { field: LeadFieldKey }).field;
              if (field in EMPTY_CONFIRMATIONS) {
                setFieldConfirmations((prev) => ({ ...prev, [field]: true }));
                trackNovaEvent(NOVA_EVENT.FIELD_CONFIRMED, {
                  field,
                  conversation_id: conversationIdRef.current,
                  $session_id: distinctIdRef.current,
                });
              }
              if (call.id) {
                toolPromises.push(
                  Promise.resolve({ id: call.id, name: call.name, response: { ok: true } }),
                );
              }
            } else if (call.name === "mark_stage") {
              const stage = (call.args as { stage: string }).stage;
              currentStageRef.current = stage;
              trackNovaEvent(NOVA_EVENT.STAGE_REACHED, {
                stage,
                conversation_id: conversationIdRef.current,
                $session_id: distinctIdRef.current,
              });
              if (call.id) {
                toolPromises.push(
                  Promise.resolve({ id: call.id, name: call.name, response: { ok: true } }),
                );
              }
            } else if (call.name === "scroll_to_section") {
              const sectionId = (call.args as { section_id: string }).section_id;
              const ok = scrollToNovaSection(sectionId);
              if (call.id) {
                toolPromises.push(
                  Promise.resolve({
                    id: call.id,
                    name: call.name,
                    response: ok
                      ? { ok: true, section: sectionId }
                      : { ok: false, error: "Section not found on this page." },
                  }),
                );
              }
            } else if (call.name === "show_handoff_cards") {
              const { whatsapp_url, booking_url, summary_message, booking_confirmed, booking_time_label } =
                call.args as Record<string, string | boolean>;
              setHandoffData({
                whatsappUrl: whatsapp_url as string,
                bookingUrl: booking_url as string,
                summaryMessage: summary_message as string | undefined,
                bookingConfirmed: booking_confirmed as boolean | undefined,
                bookingTimeLabel: booking_time_label as string | undefined,
              });
              setState("handoff");
              trackNovaEvent(NOVA_EVENT.HANDOFF_OFFERED, {
                conversation_id: conversationIdRef.current,
                $session_id: distinctIdRef.current,
              });
              if (call.id) {
                toolPromises.push(
                  Promise.resolve({ id: call.id, name: call.name, response: { ok: true } }),
                );
              }
            } else if (serverTools.includes(call.name)) {
              trackNovaEvent(NOVA_EVENT.TOOL_CALLED, {
                tool: call.name,
                conversation_id: conversationIdRef.current,
                $session_id: distinctIdRef.current,
              });
              toolPromises.push(
                (async () => {
                  try {
                    const res = await fetch("/api/strategist/tool", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: call.name,
                        args: call.args,
                        conversation_id: conversationIdRef.current,
                        distinct_id: distinctIdRef.current,
                      }),
                    });
                    const result = await res.json();
                    return {
                      id: call.id,
                      name: call.name,
                      response: result,
                      ...(call.name === "save_lead_data" ? { scheduling: "SILENT" as const } : {}),
                    };
                  } catch (e: unknown) {
                    const msg = e instanceof Error ? e.message : String(e);
                    trackNovaEvent(NOVA_EVENT.TOOL_ERROR, {
                      tool: call.name,
                      error: msg,
                      conversation_id: conversationIdRef.current,
                      $session_id: distinctIdRef.current,
                    });
                    return { id: call.id, name: call.name, response: { error: msg } };
                  }
                })(),
              );
            }
          }

          if (toolPromises.length > 0) {
            const responses = await Promise.all(toolPromises);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "tool_response", responses }));
            }
          }
        }
      };

      ws.onclose = (event) => {
        console.log("[WS] Closed. Code:", event.code, "Reason:", event.reason);

        const closeReason = !hasConnected ? "error" : event.code === 1008 ? "timeout" : event.code === 1000 ? "clean" : "drop";

        // Reconnect on unexpected drops AND on goAway-initiated closes.
        // Preserve the mic stream + audio graph across the gap so
        // startSession doesn't re-prompt for permissions.
        const willReconnect =
          (closeReason === "drop" || (closeReason === "clean" && goAwayReconnectRef.current)) &&
          reconnectAttemptsRef.current < 3;
        goAwayReconnectRef.current = false;
        if (willReconnect) preserveStreamRef.current = true;

        if (!hasConnected) {
          setSessionNotice({
            kind: "error",
            title: "Couldn't reach Nova",
            message:
              "Our voice service is briefly unavailable. Please try again in a moment, or reach us on WhatsApp instead.",
            canRestart: true,
            dismissible: true,
          });
        } else if (event.code === 1008) {
          setSessionNotice({
            kind: "ended",
            title: "Conversation paused",
            message:
              "Your session reached its time limit. Everything you shared has been saved — start a new conversation to keep going.",
            canRestart: true,
            dismissible: true,
          });
        } else if (event.code !== 1000) {
          setSessionNotice({
            kind: "ended",
            title: "Conversation ended",
            message:
              "We've ended this session. Your conversation is saved — feel free to start a new one anytime.",
            canRestart: true,
            dismissible: true,
          });
        }

        // preserveStreamRef stays true through stopSession (skips audio
        // teardown) until the scheduled startSession consumes and clears it.
        stopSession(closeReason);

        // Auto-reconnect (max 3 attempts) — drop or goAway
        if (willReconnect) {
          reconnectAttemptsRef.current += 1;
          setSessionNotice({
            kind: "info" as const,
            title: "Reconnecting…",
            message: `Attempting to restore your session (${reconnectAttemptsRef.current}/3)…`,
            canRestart: false,
            dismissible: false,
          });
          reconnectTimerRef.current = setTimeout(() => {
            void startSessionRef.current?.();
          }, 2000);
        }
      };
    } catch (err) {
      console.error("[WS] Failed to start session:", err);
      const msg = err instanceof Error ? err.message : String(err);
      const isPermissionError =
        msg.toLowerCase().includes("permission") ||
        msg.toLowerCase().includes("denied") ||
        msg.toLowerCase().includes("notallowed");
      setSessionNotice(
        isPermissionError
          ? {
              kind: "error",
              title: "Microphone access needed",
              message:
                "Nova needs permission to use your microphone. Please allow access in your browser and try again.",
              canRestart: true,
              dismissible: true,
            }
          : {
              kind: "error",
              title: "Couldn't start the session",
              message:
                "Something went wrong starting your voice conversation. Please try again — if it keeps happening, reach us on WhatsApp.",
              canRestart: true,
              dismissible: true,
            },
      );
      stopSession();
    }
  }, [locale, stopSession]);

  useEffect(() => {
    startSessionRef.current = startSession;
    return () => {
      if (startSessionRef.current === startSession) {
        startSessionRef.current = null;
      }
    };
  }, [startSession]);

  useEffect(() => {
    return () => {
      // Unmount = hard stop: cancel any pending reconnect and force full
      // audio teardown so a preserved mic stream can't leak.
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      preserveStreamRef.current = false;
      stopSession();
    };
  }, [stopSession]);

  return {
    isSessionActive,
    state,
    leadData,
    setLeadData,
    fieldConfirmations,
    confirmFieldLocal,
    handoffData,
    transcript,
    sessionNotice,
    dismissNotice,
    isMicMuted,
    toggleMic,
    startSession,
    stopSession,
    sendTextToAgent,
    pushContextMessage,
    conversationId,
    inputAnalyser: inputAnalyserRef,
    outputAnalyser: outputAnalyserRef,
  };
}
