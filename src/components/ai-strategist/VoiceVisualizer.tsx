"use client";

import { motion, AnimatePresence, useTransform, type MotionValue } from "framer-motion";
import type { RefObject } from "react";
import { useAudioAmplitude } from "./useAudioAmplitude";

export type VisualizerState = "idle" | "listening" | "speaking" | "thinking";

interface VoiceVisualizerProps {
  state: VisualizerState;
  inputAnalyser: RefObject<AnalyserNode | null>;
  outputAnalyser: RefObject<AnalyserNode | null>;
  inputActive?: boolean;
  outputActive?: boolean;
}

export default function VoiceVisualizer({
  state,
  inputAnalyser,
  outputAnalyser,
  inputActive = false,
  outputActive = false,
}: VoiceVisualizerProps) {
  // Amplitude-driven MotionValues — updated imperatively at RAF rate,
  // never through React state, so the panel around this component never re-renders for them.
  const inputAmplitude = useAudioAmplitude(inputAnalyser, inputActive);
  const outputAmplitude = useAudioAmplitude(outputAnalyser, outputActive);

  const listenHaloScale = useTransform(inputAmplitude, (v) => 0.95 + v * 0.35);
  const listenHaloOpacity = useTransform(inputAmplitude, (v) => 0.12 + v * 0.55);
  const speakHaloScale = useTransform(outputAmplitude, (v) => 0.85 + v * 0.4);
  const speakHaloOpacity = useTransform(outputAmplitude, (v) => 0.25 + v * 0.6);

  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center">
      <AnimatePresence>
        {state === "speaking" && (
          <motion.div
            key="speaking-halo"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.08 }}
            className="absolute inset-0 rounded-full"
          >
            <AmplitudeHalo
              scale={speakHaloScale}
              opacity={speakHaloOpacity}
              background="radial-gradient(circle, rgba(229,25,42,0.45) 0%, rgba(229,25,42,0) 70%)"
              blur={8}
            />
          </motion.div>
        )}
        {state === "listening" && (
          <motion.div
            key="listening-halo"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.08 }}
            className="absolute inset-0 rounded-full"
          >
            <AmplitudeHalo
              scale={listenHaloScale}
              opacity={listenHaloOpacity}
              background="radial-gradient(circle, rgba(229,25,42,0.28) 0%, rgba(229,25,42,0) 65%)"
              blur={6}
            />
          </motion.div>
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

/** Inner halo layer — scale/opacity are bound directly to amplitude MotionValues,
 * updated at RAF rate without going through React state or re-rendering the parent. */
function AmplitudeHalo({
  scale,
  opacity,
  background,
  blur,
}: {
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
  background: string;
  blur: number;
}) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ scale, opacity, background, filter: `blur(${blur}px)` }}
    />
  );
}
