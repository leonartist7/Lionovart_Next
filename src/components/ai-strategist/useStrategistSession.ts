"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { HandoffData, SessionState } from "@/lib/strategist-config";
import { STRATEGIST_SYSTEM_PROMPT, STRATEGIST_TOOLS } from "@/lib/strategist-config";

export interface LeadData {
  name: string;
  phone: string;
  email: string;
}

export interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

export interface UseStrategistSessionReturn {
  isSessionActive: boolean;
  state: SessionState;
  leadData: LeadData;
  setLeadData: (updater: (prev: LeadData) => LeadData) => void;
  handoffData: HandoffData | null;
  transcript: ChatMessage[];
  sessionWarning: string | null;
  startSession: () => Promise<void>;
  stopSession: () => void;
  sendTextToAgent: (text: string) => void;
}

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

export function useStrategistSession({ onClose }: { onClose: () => void }): UseStrategistSessionReturn {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [state, setState] = useState<SessionState>("idle");
  const [leadData, setLeadData] = useState<LeadData>({ name: "", phone: "", email: "" });
  const [handoffData, setHandoffData] = useState<HandoffData | null>(null);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [sessionWarning, setSessionWarning] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);

  const nextPlaybackTimeRef = useRef(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fiveMinWarningFiredRef = useRef(false);

  const stopSession = useCallback(() => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    fiveMinWarningFiredRef.current = false;

    activeSourcesRef.current.forEach((src) => {
      try { src.stop(); } catch (_) {}
    });
    activeSourcesRef.current = [];
    nextPlaybackTimeRef.current = 0;

    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
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
    setIsSessionActive(false);
    setState("idle");
    setSessionWarning(null);
  }, []);

  // Use sendRealtimeInput text format — recommended by Gemini 3.1 migration guide
  const sendTextToAgent = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ realtimeInput: { text } }));
      setTranscript((prev) => [...prev, { role: "user", text }]);
    }
  }, []);

  const startSession = useCallback(async () => {
    try {
      setTranscript([]);
      setSessionWarning(null);
      activeSourcesRef.current.forEach((src) => { try { src.stop(); } catch (_) {} });
      activeSourcesRef.current = [];
      nextPlaybackTimeRef.current = 0;

      // 1. Request mic (must be first on iOS Safari for immediate user-gesture binding)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // 2. AudioContext at 16kHz — matches Gemini's required input rate
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      await audioCtx.audioWorklet.addModule("/audio-processor.js");

      const micSource = audioCtx.createMediaStreamSource(stream);
      const processor = new AudioWorkletNode(audioCtx, "audio-processor", {
        processorOptions: { sampleRate: audioCtx.sampleRate },
      });
      processorRef.current = processor;
      micSource.connect(processor);
      processor.connect(audioCtx.destination);

      setIsSessionActive(true);
      setState("thinking");

      // 3. Connect WebSocket to the local dev proxy or production server
      const host = window.location.hostname;
      const isLocal = host === "localhost" || host === "127.0.0.1";
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = isLocal
        ? `ws://localhost:3001/api/strategist/live`
        : `${protocol}//${window.location.host}/api/strategist/live`;

      console.log("[WS] Connecting to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      let hasConnected = false;

      ws.onopen = () => {
        // Setup payload — transcriptions enabled so the conversation UI shows text
        ws.send(
          JSON.stringify({
            type: "setup",
            config: {
              systemInstruction: {
                parts: [
                  {
                    text:
                      STRATEGIST_SYSTEM_PROMPT +
                      "\n\nCRITICAL DIRECTIVE: Your very first action immediately upon connecting must be a warm, brief 1-sentence verbal greeting. Introduce yourself as the LIONOVART AI Strategist and ask what they are building. Do not wait for the user to speak first.",
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
              // Transcription — surfaces user speech and AI speech as text in the UI
              inputAudioTranscription: {},
              outputAudioTranscription: {},
            },
          })
        );
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        // ── Backend / proxy error ────────────────────────────────────
        if (data.type === "error") {
          console.error("[WS] Backend error:", data.message);
          stopSession();
          alert("Could not connect to AI Voice Agent: " + data.message);
          return;
        }

        // ── Setup confirmed ──────────────────────────────────────────
        if (data.type === "setup_complete") {
          hasConnected = true;
          setIsSessionActive(true);
          setState("listening");

          // 30-minute session timer with 5-minute wrap-up warning
          const startTime = Date.now();
          sessionTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const timeLeftMs = 30 * 60 * 1000 - elapsed;

            if (timeLeftMs <= 300_000 && !fiveMinWarningFiredRef.current) {
              fiveMinWarningFiredRef.current = true;
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({
                    realtimeInput: {
                      text: "SYSTEM ALERT: The conversation will automatically disconnect in exactly 5 minutes. Please briefly mention to the user that we only have 5 minutes left to wrap up our thoughts.",
                    },
                  })
                );
              }
            }

            if (timeLeftMs <= 0) {
              stopSession();
              alert("The 30-minute consultation has concluded. Please book a follow-up call to continue!");
            }
          }, 1000);

          // Trigger the AI greeting — use sendRealtimeInput per Gemini 3.1 migration guide
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                realtimeInput: {
                  text: "Hello. Please greet me out loud as instructed.",
                },
              })
            );
          }

          // Start streaming mic audio once setup is confirmed
          processor.port.onmessage = (e) => {
            if (e.data.type === "audio" && ws.readyState === WebSocket.OPEN) {
              const base64Audio = arrayBufferToBase64(e.data.pcm.buffer);
              // Correct SDK format: { audio: { mimeType, data } } — not legacy mediaChunks
              ws.send(
                JSON.stringify({
                  realtimeInput: {
                    audio: {
                      mimeType: "audio/pcm;rate=16000",
                      data: base64Audio,
                    },
                  },
                })
              );
            }
          };
          return;
        }

        // ── Gemini session-ending warning ────────────────────────────
        if (data.goAway) {
          const timeLeft = data.goAway.timeLeft ?? "soon";
          setSessionWarning(`Session ending in ${timeLeft} — wrapping up now.`);
        }

        // ── Barge-in: user interrupted the AI ───────────────────────
        if (data.serverContent?.interrupted) {
          activeSourcesRef.current.forEach((src) => { try { src.stop(); } catch (_) {} });
          activeSourcesRef.current = [];
          if (audioContextRef.current) {
            nextPlaybackTimeRef.current = audioContextRef.current.currentTime;
          }
        }

        // ── User speech transcription ────────────────────────────────
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

        // ── AI speech transcription ──────────────────────────────────
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

        // ── Audio + text parts from the model ───────────────────────
        if (data.serverContent?.modelTurn?.parts) {
          const parts = data.serverContent.modelTurn.parts;
          for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith("audio/pcm")) {
              const pcm16 = base64ToInt16Array(part.inlineData.data);
              const ctx = audioContextRef.current;
              if (!ctx) continue;

              if (ctx.state === "suspended") {
                ctx.resume().catch((err) => console.error("[Audio] Failed to resume context:", err));
              }

              // Int16 → Float32
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768.0;
              }

              // Buffer at 24kHz — Gemini outputs 24kHz audio
              const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
              audioBuffer.getChannelData(0).set(float32);

              const bufSource = ctx.createBufferSource();
              bufSource.buffer = audioBuffer;
              bufSource.connect(ctx.destination);

              const now = ctx.currentTime;
              if (nextPlaybackTimeRef.current < now) {
                nextPlaybackTimeRef.current = now;
              }
              bufSource.start(nextPlaybackTimeRef.current);
              nextPlaybackTimeRef.current += audioBuffer.duration;

              activeSourcesRef.current.push(bufSource);
              bufSource.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== bufSource);
              };

              setState("speaking");
            } else if (part.text) {
              // Text parts — fallback for non-audio responses
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

        // ── Turn complete → back to listening ───────────────────────
        if (data.serverContent?.turnComplete) {
          setState("listening");
        }

        // ── Tool calls from the model ────────────────────────────────
        if (data.toolCall) {
          const calls = data.toolCall.functionCalls;
          const serverTools = ["fetch_user_memory", "save_lead_data", "generate_whatsapp_link", "fetch_booking_link"];
          const toolPromises: Promise<{ id: string; name: string; response: unknown }>[] = [];

          for (const call of calls) {
            if (call.name === "update_screen_info") {
              const { name, phone, email } = call.args as Record<string, string>;
              setLeadData((prev) => ({
                name: name !== undefined ? name : prev.name,
                phone: phone !== undefined ? phone : prev.phone,
                email: email !== undefined ? email : prev.email,
              }));
            } else if (call.name === "show_handoff_cards") {
              const { whatsapp_url, booking_url, summary_message } = call.args as Record<string, string>;
              setHandoffData({
                whatsappUrl: whatsapp_url,
                bookingUrl: booking_url,
                summaryMessage: summary_message,
              });
              setState("handoff");
            } else if (serverTools.includes(call.name)) {
              toolPromises.push(
                (async () => {
                  try {
                    const res = await fetch("/api/strategist/tool", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: call.name, args: call.args }),
                    });
                    const result = await res.json();
                    return { id: call.id, name: call.name, response: result };
                  } catch (e: unknown) {
                    const msg = e instanceof Error ? e.message : String(e);
                    return { id: call.id, name: call.name, response: { error: msg } };
                  }
                })()
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
        if (!hasConnected) {
          alert(
            `Could not connect to Voice Server at ${wsUrl}\n\nCode: ${event.code}, Reason: ${event.reason || "None"}.\nEnsure GEMINI_API_KEY is set in the environment.`
          );
        }
        stopSession();
      };
    } catch (err) {
      console.error("[WS] Failed to start session:", err);
      alert(`Error starting session: ${err instanceof Error ? err.message : String(err)}`);
      stopSession();
    }
  }, [stopSession]);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    isSessionActive,
    state,
    leadData,
    setLeadData,
    handoffData,
    transcript,
    sessionWarning,
    startSession,
    stopSession,
    sendTextToAgent,
  };
}
