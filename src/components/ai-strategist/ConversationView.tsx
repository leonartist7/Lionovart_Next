"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Play } from "lucide-react";
import type { HandoffData, SessionState } from "@/lib/strategist-config";
import type { LeadData } from "./useStrategistSession";
import VoiceVisualizer from "./VoiceVisualizer";
import HandoffCards from "./HandoffCards";

export interface ConversationViewProps {
  isSessionActive: boolean;
  state: SessionState;
  leadData: LeadData;
  setLeadData: (updater: (prev: LeadData) => LeadData) => void;
  handoffData: HandoffData | null;
  onStartSession: () => void;
  onStopSession: () => void;
  onSendText: (text: string) => void;
}

export default function ConversationView({
  isSessionActive,
  state,
  leadData,
  setLeadData,
  handoffData,
  onStartSession,
  onStopSession,
  onSendText,
}: ConversationViewProps) {
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isHandoff = state === "handoff";

  // When user edits the UI manually, we can sync it or just keep it in state
  const handleLeadUpdate = (field: keyof LeadData, value: string) => {
    setLeadData((prev) => ({ ...prev, [field]: value }));
    // Optionally notify Gemini that user updated the screen manually
    onSendText(`I updated my ${field} to ${value} on the screen.`);
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center">
            <Mic size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-white">LIONOVART AI</span>
        </div>
        <div className="flex items-center gap-2">
          {isSessionActive && (
            <span className="flex items-center gap-2 text-xs font-medium text-brand-red uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 overflow-y-auto no-scrollbar">
        
        {!isSessionActive ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
               <Mic size={32} className="text-white/40" />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase font-clash">Strategic Partner</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Let's discuss your brand vision. Our AI listens, remembers, and helps qualify your project instantly.
            </p>
            <button
              onClick={onStartSession}
              className="mt-4 px-8 py-4 rounded-full bg-brand-red text-white font-bold uppercase tracking-widest text-sm hover:bg-brand-red/90 transition-all active:scale-95 flex items-center gap-3 shadow-[0_0_30px_rgba(229,25,42,0.3)]"
            >
              <Play fill="currentColor" size={14} />
              Start Voice Chat
            </button>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Requires Microphone Access</p>
          </motion.div>
        ) : (
          <>
            {/* Visualizer & Status */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                 {/* Glowing Orb effect when speaking */}
                 {isSpeaking && (
                   <div className="absolute inset-0 rounded-full bg-brand-red/20 blur-xl animate-pulse" />
                 )}
                 {/* Reusing the existing VoiceVisualizer which just shows bars usually */}
                 <VoiceVisualizer isListening={isListening} isSpeaking={isSpeaking} />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest text-white/50">
                {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Thinking..."}
              </span>
            </motion.div>

            {/* Interactive Lead UI Panel */}
            <AnimatePresence>
              {(leadData.name || leadData.email || leadData.phone) && !isHandoff && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-sm p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col gap-4"
                >
                  <h4 className="text-[11px] uppercase tracking-widest text-brand-red font-bold mb-1">Live CRM Sync</h4>
                  
                  {["name", "phone", "email"].map((field) => (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">{field}</label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        value={(leadData as any)[field]}
                        onChange={(e) => handleLeadUpdate(field as keyof LeadData, e.target.value)}
                        placeholder={`Waiting for ${field}...`}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red/50 transition-colors placeholder:text-white/20"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Handoff Cards */}
            <AnimatePresence>
              {isHandoff && handoffData && (
                 <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="w-full mt-4"
               >
                 <HandoffCards
                   whatsappUrl={handoffData.whatsappUrl}
                   bookingUrl={handoffData.bookingUrl}
                   summaryMessage={handoffData.summaryMessage}
                 />
               </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Footer Controls (Stop Button) */}
      {isSessionActive && (
        <div className="shrink-0 p-6 flex justify-center border-t border-white/10 bg-black/20">
          <button
            onClick={onStopSession}
            className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 text-white/60 hover:text-white"
            aria-label="End session"
          >
            <MicOff size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
