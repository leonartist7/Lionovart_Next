"use client";

import { motion } from "framer-motion";

export type VisualizerState = "idle" | "listening" | "speaking" | "thinking";

interface VoiceVisualizerProps {
  state: VisualizerState;
  inputAmplitude?: number;
  outputAmplitude?: number;
}

const BLOB_RADII = ["58% 42% 55% 45% / 45% 55% 45% 55%", "42% 58% 45% 55% / 55% 45% 55% 45%"];

// Small fixed glints inside the blob — cheap stand-in for the WebGPU tier's
// particle sparkle, clipped to the blob's own animated shape (no separate
// glow/shadow layer behind it).
const GLINTS =
  "radial-gradient(circle 4px at 26% 64%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 45%, transparent 70%)," +
  "radial-gradient(circle 3px at 70% 38%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 45%, transparent 70%)," +
  "radial-gradient(circle 3.5px at 46% 80%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.45) 45%, transparent 70%)," +
  "radial-gradient(circle 2px at 64% 66%, rgba(255,255,255,0.9) 0%, transparent 70%)";

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
        className="relative w-[76px] h-[76px] overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 35% 28%, #ffffff 0%, #fff5c2 15%, #f7cf1f 40%, #d9a30f 75%, #a67208 100%)",
        }}
      >
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: GLINTS, mixBlendMode: "screen" }}
        />
      </motion.div>
    </div>
  );
}
