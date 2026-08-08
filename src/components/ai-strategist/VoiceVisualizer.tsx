"use client";

import { motion } from "framer-motion";

export type VisualizerState = "idle" | "listening" | "speaking" | "thinking";

interface VoiceVisualizerProps {
  state: VisualizerState;
  inputAmplitude?: number;
  outputAmplitude?: number;
}

const BLOB_RADII = ["58% 42% 55% 45% / 45% 55% 45% 55%", "42% 58% 45% 55% / 55% 45% 55% 45%"];

export default function VoiceVisualizer({
  state,
  inputAmplitude = 0,
  outputAmplitude = 0,
}: VoiceVisualizerProps) {
  const amplitude = state === "speaking" ? outputAmplitude : inputAmplitude;
  const scale = 1 + amplitude * 0.22;

  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center">
      <motion.div
        animate={{
          borderRadius: BLOB_RADII,
          opacity: state === "thinking" ? [1, 0.55, 1] : 1,
          scale,
        }}
        transition={{
          borderRadius: {
            duration: state === "idle" ? 7 : 3.5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          },
          opacity: { duration: 1.3, repeat: state === "thinking" ? Infinity : 0, ease: "easeInOut" },
          scale: { duration: 0.1 },
        }}
        className="w-[76px] h-[76px]"
        style={{
          background:
            "radial-gradient(circle at 35% 28%, #fffae0 0%, #f0c917 45%, #b8850a 100%)",
        }}
      />
    </div>
  );
}
