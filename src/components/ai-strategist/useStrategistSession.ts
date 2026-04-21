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
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  
  // Audio playback management refs
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

    // Clear all active audio sources (Barge-in / Stop)
    activeSourcesRef.current.forEach((src) => {
      try { src.stop(); } catch(e) {}
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
      setTranscript(prev => [...prev, { role: "user", text }]);
    }
  }, []);

  const startSession = useCallback(async () => {
    try {
      setTranscript([]);
      activeSourcesRef.current.forEach((src) => { try { src.stop(); } catch(e){} });
      activeSourcesRef.current = [];
      nextPlaybackTimeRef.current = 0;
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
      // Pass the hardware sampleRate into the worklet so it knows exactly how to downsample
      const processor = new AudioWorkletNode(audioCtx, "audio-processor", {
        processorOptions: { sampleRate: audioCtx.sampleRate }
      });
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // Switch UI to active/connecting state immediately to provide feedback
      setIsSessionActive(true);
      setState("thinking");

      // 3. Connect WebSocket
      const host = window.location.hostname;
      const isLocal = host === "localhost" || host === "127.0.0.1";
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = isLocal 
        ? `ws://localhost:3001/api/strategist/live`
        : `${protocol}//${window.location.host}/api/strategist/live`;
      
      console.log("[DEBUG] Attempting WS connection to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      let hasConnected = false;

      ws.onopen = () => {
        // Send setup payload using the NEW SDK schema that completely avoids generationConfig deprecation warnings
        ws.send(
          JSON.stringify({
            type: "setup",
            config: {
              systemInstruction: { 
                parts: [
                  { 
                    text: STRATEGIST_SYSTEM_PROMPT + "\n\nCRITICAL DIRECTIVE: Your very first action immediately upon connecting must be a warm, brief 1-sentence verbal greeting. Introduce yourself as the LIONOVART AI Strategist and ask what they are building. Do not wait for the user to speak first." 
                  }
                ] 
              },
              tools: STRATEGIST_TOOLS,
              // Move these exactly to the root of 'config' per Google's new v1.50+ deprecation warning rules
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede" // Options: Aoede, Charon, Fenrir, Kore, Puck
                  }
                }
              }
            }
          })
        );
      };

      ws.onmessage = async (event) => {
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

          // Start the 30-minute session timer
          const startTime = Date.now();
          sessionTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const timeLeftMs = (30 * 60 * 1000) - elapsed;
            
            // If exactly 5 minutes (300,000 ms) are left, trigger the AI
            if (timeLeftMs <= 300000 && !fiveMinWarningFiredRef.current) {
              fiveMinWarningFiredRef.current = true;
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                // Send a silent system prompt instructing her to wrap up
                wsRef.current.send(
                  JSON.stringify({
                    clientContent: {
                      turns: [
                        {
                          role: "user",
                          parts: [{ text: "SYSTEM ALERT: The conversation will automatically disconnect in exactly 5 minutes. Please briefly mention to the user that we only have 5 minutes left to wrap up our thoughts." }],
                        },
                      ],
                      turnComplete: true,
                    },
                  })
                );
              }
            }
            
            // If time is up, forcefully close
            if (timeLeftMs <= 0) {
               stopSession();
               alert("The 30-minute consultation has concluded. Please book a follow-up call to continue!");
            }
          }, 1000); // Check every second
          
          // Force UI to know we connected successfully
          setTranscript([{ role: "agent", text: "Connected. Waiting for AI..." }]);

          // Trigger the AI to speak first using the exact payload format the new Live API expects
          // If this crashes the connection (50ms drop), it means the model is strictly audio-only right now.
          // However, we will send it anyway, and if it fails, the fallback is the user's microphone.
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                clientContent: {
                  turns: [
                    {
                      role: "user",
                      parts: [{ text: "Hello. Please greet me out loud as instructed." }],
                    },
                  ],
                  turnComplete: true,
                },
              })
            );
          }

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

        // Handle Barge-in (Interruption)
        if (data.serverContent && data.serverContent.interrupted) {
          activeSourcesRef.current.forEach((src) => { try { src.stop(); } catch(e){} });
          activeSourcesRef.current = [];
          if (audioContextRef.current) {
            nextPlaybackTimeRef.current = audioContextRef.current.currentTime;
          }
        }

        // Handle Audio or Text from Gemini
        if (data.serverContent && data.serverContent.modelTurn) {
          const parts = data.serverContent.modelTurn.parts;
          for (const part of parts) {
            // Check for Audio
            if (part.inlineData && part.inlineData.mimeType.startsWith("audio/pcm")) {
              const pcm16 = base64ToInt16Array(part.inlineData.data);
              const ctx = audioContextRef.current;
              if (!ctx) continue;
              
              // Ensure audio context is actually running before we try to play
              // Browsers (like Safari) aggressively suspend contexts even after initial resume
              if (ctx.state === "suspended") {
                ctx.resume().catch(err => console.error("Failed to resume AudioContext:", err));
              }
              
              // 1. Convert Int16 to Float32
              const float32Data = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32Data[i] = pcm16[i] / 32768.0;
              }
              
              // 2. Create a buffer specifically at 24000Hz (Gemini's output rate)
              const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
              audioBuffer.getChannelData(0).set(float32Data);
              
              // 3. Play it natively via C++ AudioEngine (handles upsampling perfectly)
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              const currentTime = ctx.currentTime;
              if (nextPlaybackTimeRef.current < currentTime) {
                nextPlaybackTimeRef.current = currentTime;
              }
              
              source.start(nextPlaybackTimeRef.current);
              nextPlaybackTimeRef.current += audioBuffer.duration;
              
              activeSourcesRef.current.push(source);
              source.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
              };
              
              setState("speaking");
            }
            // Check for Text (Live Transcript update)
            else if (part.text) {
              setTranscript((prev) => {
                const newTranscript = [...prev];
                const last = newTranscript[newTranscript.length - 1];
                if (last && last.role === "agent") {
                  last.text += part.text;
                } else {
                  newTranscript.push({ role: "agent", text: part.text });
                }
                return newTranscript;
              });
            }
          }
        }

        // If turn is complete, revert to listening
        if (data.serverContent && data.serverContent.turnComplete) {
          setState("listening");
        }

        // Handle Tool Calls
        if (data.toolCall) {
          const calls = data.toolCall.functionCalls;
          const serverTools = ["fetch_user_memory", "save_lead_data", "generate_whatsapp_link", "fetch_booking_link"];
          const toolPromises: Promise<any>[] = [];

          for (const call of calls) {
            // 1. Handle UI-only tools locally
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
            } 
            // 2. Handle Server-side tools by calling Hostinger API
            else if (serverTools.includes(call.name)) {
              toolPromises.push(
                (async () => {
                  try {
                    const res = await fetch('/api/strategist/tool', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: call.name, args: call.args })
                    });
                    const result = await res.json();
                    return { id: call.id, name: call.name, response: result };
                  } catch (e: any) {
                    return { id: call.id, name: call.name, response: { error: e.message } };
                  }
                })()
              );
            }
          }

          // If we had server tools, wait for them to finish and send the response back to the WS proxy
          if (toolPromises.length > 0) {
            const responses = await Promise.all(toolPromises);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "tool_response", responses }));
            }
          }
        }
      };

      ws.onclose = (event) => {
        console.log("WS Close event:", event);
        if (!hasConnected) {
          alert(`Could not connect to Voice Server at ${wsUrl}\n\nCode: ${event.code}, Reason: ${event.reason || "None"}. Ensure the Cloud Run container has GEMINI_API_KEY set.`);
        }
        stopSession();
      };

    } catch (err) {
      console.error("Failed to start session:", err);
      // Alert the user so it doesn't fail silently on mobile devices
      alert(`Error starting session: ${err instanceof Error ? err.message : String(err)}`);
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
    transcript,
    startSession,
    stopSession,
    sendTextToAgent
  };
}