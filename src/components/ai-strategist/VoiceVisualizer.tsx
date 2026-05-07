"use client";

import { motion, AnimatePresence } from "framer-motion";

export type VisualizerState = "idle" | "listening" | "speaking" | "thinking";

interface VoiceVisualizerProps {
  state: VisualizerState;
}

/**
 * Fluid orb visualizer — replaces the older bar-based design.
 * State-driven; v2 will tap the input/output AnalyserNodes for true
 * amplitude-reactive motion.
 */
export default function VoiceVisualizer({ state }: VoiceVisualizerProps) {
  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center">
      <AnimatePresence>
        {state === "speaking" && (
          <motion.div
            key="speaking-halo"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.35, 0.6, 0.35] }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(229,25,42,0.45) 0%, rgba(229,25,42,0) 70%)",
              filter: "blur(8px)",
            }}
          />
        )}
        {state === "listening" && (
          <motion.div
            key="listening-halo"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.18, 0.32, 0.18] }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(229,25,42,0.28) 0%, rgba(229,25,42,0) 65%)",
              filter: "blur(6px)",
            }}
          />
        )}
        {state === "idle" && (
          <motion.div
            key="idle-halo"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: [0.95, 1.0, 0.95], opacity: [0.08, 0.16, 0.08] }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
              filter: "blur(8px)",
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={
          state === "speaking"
            ? { scale: [1, 1.08, 1] }
            : state === "listening"
            ? { scale: [1, 1.02, 1] }
            : { scale: 1 }
        }
        transition={{
          duration: state === "speaking" ? 0.9 : state === "listening" ? 2 : 0.5,
          repeat: state === "speaking" || state === "listening" ? Infinity : 0,
          ease: "easeInOut",
        }}
        className="relative w-[78px] h-[78px] rounded-full"
        style={{
          background:
            state === "speaking" || state === "listening"
              ? "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18) 0%, rgba(229,25,42,0.45) 40%, rgba(149,15,28,0.7) 100%)"
              : "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.02) 100%)",
          boxShadow:
            state === "speaking"
              ? "0 0 40px rgba(229,25,42,0.55), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -2px 6px rgba(0,0,0,0.3)"
              : state === "listening"
              ? "0 0 26px rgba(229,25,42,0.32), inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -2px 6px rgba(0,0,0,0.25)"
              : "0 0 14px rgba(255,255,255,0.04), inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="absolute top-[10%] left-[18%] w-[40%] h-[28%] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(4px)",
          }}
        />

        <AnimatePresence>
          {state === "thinking" && (
            <motion.div
              key="thinking-dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{
                    y: [0, -4, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-white/85"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {state === "listening" && (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.18, 1.3], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-[10%] rounded-full border border-brand-red/40"
        />
      )}
    </div>
  );
}
