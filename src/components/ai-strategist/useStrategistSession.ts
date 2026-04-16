"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { HandoffData, SessionState } from "@/lib/strategist-config";
import { STRATEGIST_SYSTEM_PROMPT, STRATEGIST_TOOLS } from "@/lib/strategist-config";

export interface LeadData {
  name: string;
  phone: string;
  email: string;
}

export interface UseStrategistSessionReturn {
  isSessionActive: boolean;
  state: SessionState;
  leadData: LeadData;
  setLeadData: (updater: (prev: LeadData) => LeadData) => void;
  handoffData: HandoffData | null;
  startSession: () => Promise<void>;
  stopSession: () => void;
  sendTextToAgent: (text: string) => void;
}

// Convert Int16Array to Base64 for the Gemini Live API
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 back to Int16Array
function base64ToInt16Array(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

export function useStrategistSession({ onClose }: { onClose: () => void }): UseStrategistSessionReturn {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [state, setState] = useState<SessionState>("idle");
  const [leadData, setLeadData] = useState<LeadData>({ name: "", phone: "", email: "" });
  const [handoffData, setHandoffData] = useState<HandoffData | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);

  const stopSession = useCallback(() => {
    if (wsRef.current) {
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
  }, []);

  const sendTextToAgent = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send text back to Gemini
      wsRef.current.send(
        JSON.stringify({
          clientContent: {
            turns: [
              {
                role: "user",
                parts: [{ text }],
              },
            ],
            turnComplete: true,
          },
        })
      );
    }
  }, []);

  const startSession = useCallback(async () => {
    try {
      // 1. Request Mic first (important for mobile safari to have immediate user gesture)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // 2. Initialize AudioContext at 16kHz
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioCtx;

      // Resume context on iOS
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      await audioCtx.audioWorklet.addModule("/audio-processor.js");

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = new AudioWorkletNode(audioCtx, "audio-processor");
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // Switch UI to active/connecting state immediately to provide feedback
      setIsSessionActive(true);
      setState("thinking");

      // 3. Connect WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      
      // Development mode runs the WebSocket on port 3001
      const isDev = process.env.NODE_ENV === "development";
      const wsUrl = isDev 
        ? `ws://${window.location.hostname}:3001/api/strategist/live`
        : `${protocol}//${window.location.host}/api/strategist/live`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      let hasConnected = false;

      ws.onopen = () => {
        // Send setup payload
        ws.send(
          JSON.stringify({
            type: "setup",
            config: {
              systemInstruction: { parts: [{ text: STRATEGIST_SYSTEM_PROMPT }] },
              tools: STRATEGIST_TOOLS,
            },
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Handle backend errors
        if (data.type === "error") {
          console.error("Backend error:", data.message);
          stopSession();
          alert("Could not connect to AI Voice Agent: " + data.message);
          return;
        }

        // Setup confirmed
        if (data.type === "setup_complete") {
          hasConnected = true;
          setIsSessionActive(true);
          setState("listening");
          
          // Once setup is complete, start sending mic data from worklet
          processor.port.onmessage = (e) => {
            if (e.data.type === "audio" && ws.readyState === WebSocket.OPEN) {
              const base64Audio = arrayBufferToBase64(e.data.pcm.buffer);
              ws.send(
                JSON.stringify({
                  realtimeInput: {
                    mediaChunks: [
                      {
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Audio,
                      },
                    ],
                  },
                })
              );
            }
          };
          return;
        }

        // Handle Audio from Gemini
        if (data.serverContent && data.serverContent.modelTurn) {
          const parts = data.serverContent.modelTurn.parts;
          for (const part of parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith("audio/pcm")) {
              const pcm16 = base64ToInt16Array(part.inlineData.data);
              processor.port.postMessage({ pcm: Array.from(pcm16) });
              setState("speaking"); // Currently playing audio
            }
          }
        }

        // If turn is complete, revert to listening
        if (data.serverContent && data.serverContent.turnComplete) {
          setState("listening");
        }

        // Handle Client Tool Calls (update_screen_info, show_handoff_cards)
        if (data.toolCall) {
          const calls = data.toolCall.functionCalls;
          for (const call of calls) {
            if (call.name === "update_screen_info") {
              const { name, phone, email } = call.args as Record<string, string>;
              setLeadData((prev) => ({
                name: name !== undefined ? name : prev.name,
                phone: phone !== undefined ? phone : prev.phone,
                email: email !== undefined ? email : prev.email,
              }));
            }
            if (call.name === "show_handoff_cards") {
              const { whatsapp_url, booking_url, summary_message } = call.args as Record<string, string>;
              setHandoffData({
                whatsappUrl: whatsapp_url,
                bookingUrl: booking_url,
                summaryMessage: summary_message,
              });
              setState("handoff");
            }
          }
        }
      };

      ws.onclose = () => {
        if (!hasConnected) {
          alert("Could not connect to Voice Server. Are you running npm run dev:ws?");
        }
        stopSession();
      };

    } catch (err) {
      console.error("Failed to start session:", err);
      stopSession();
    }
  }, [stopSession]);

  // Clean up on unmount
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
    startSession,
    stopSession,
    sendTextToAgent
  };
}