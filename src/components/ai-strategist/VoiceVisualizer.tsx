"use client";

import { motion, useTransform } from "framer-motion";
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

const BLOB_RADII = ["58% 42% 55% 45% / 45% 55% 45% 55%", "42% 58% 45% 55% / 55% 45% 55% 45%"];

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

  const amplitude = state === "speaking" ? outputAmplitude : inputAmplitude;
  const blobScale = useTransform(amplitude, (v) => 1 + v * 0.22);
  const glowScale = useTransform(amplitude, (v) => 1.1 + v * 0.5);
  const glowOpacity = useTransform(amplitude, (v) => 0.35 + v * 0.5);

  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center">
      {/* Soft reactive glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          scale: glowScale,
          opacity: glowOpacity,
          background:
            "radial-gradient(circle, rgba(240,201,23,0.55) 0%, rgba(240,201,23,0) 70%)",
          filter: "blur(14px)",
        }}
      />

      {/* Golden blob */}
      <motion.div
        animate={{
          borderRadius: BLOB_RADII,
          opacity: state === "thinking" ? [1, 0.55, 1] : 1,
        }}
        transition={{
          borderRadius: {
            duration: state === "idle" ? 7 : 3.5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          },
          opacity: { duration: 1.3, repeat: state === "thinking" ? Infinity : 0, ease: "easeInOut" },
        }}
        style={{ scale: blobScale }}
        className="relative w-[76px] h-[76px]"
      >
        <div
          className="w-full h-full"
          style={{
            borderRadius: "inherit",
            background:
              "radial-gradient(circle at 35% 28%, rgba(255,250,224,0.9) 0%, #f0c917 45%, #c99a0a 100%)",
            boxShadow:
              "0 0 30px rgba(240,201,23,0.45), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -3px 8px rgba(0,0,0,0.15)",
          }}
        />
      </motion.div>
    </div>
  );
}
