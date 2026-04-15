"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
}

const BAR_COUNT = 5;
const MIN_HEIGHT = 6;
const MAX_HEIGHT = 32;

/* Random height between min and max */
function randHeight() {
  return Math.floor(Math.random() * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT);
}

export default function VoiceVisualizer({ isListening, isSpeaking }: VoiceVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(Array(BAR_COUNT).fill(MIN_HEIGHT));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Animate bars while listening */
  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setHeights(Array.from({ length: BAR_COUNT }, () => randHeight()));
      }, 120);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setHeights(Array(BAR_COUNT).fill(MIN_HEIGHT));
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isListening]);

  return (
    <div className="flex items-center justify-center h-10 gap-1">
      <AnimatePresence mode="wait">
        {isListening && (
          <motion.div
            key="bars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-1"
          >
            {heights.map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-brand-red transition-all duration-100"
                style={{ height: h }}
              />
            ))}
          </motion.div>
        )}

        {isSpeaking && !isListening && (
          <motion.div
            key="ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex items-center justify-center w-10 h-10"
          >
            {/* Expanding ring */}
            <span
              className="absolute inset-0 rounded-full border-2 border-brand-red"
              style={{
                animation: "speaking-ring 1.5s ease-out infinite",
              }}
            />
            <span className="w-2 h-2 rounded-full bg-brand-red" />
          </motion.div>
        )}

        {!isListening && !isSpeaking && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-1"
          >
            {Array(BAR_COUNT).fill(MIN_HEIGHT).map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-white/20"
                style={{ height: h }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
