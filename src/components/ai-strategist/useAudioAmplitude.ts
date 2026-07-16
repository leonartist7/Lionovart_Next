"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

export function useAudioAmplitude(
  analyserRef: RefObject<AnalyserNode | null>,
  active: boolean,
): MotionValue<number> {
  const amplitude = useMotionValue(0);

  useEffect(() => {
    if (!active) {
      amplitude.set(0);
      return;
    }
    let raf = 0;
    const buffer = new Uint8Array(analyserRef.current?.frequencyBinCount ?? 128);

    const tick = () => {
      const a = analyserRef.current;
      if (!a) {
        raf = requestAnimationFrame(tick);
        return;
      }
      a.getByteFrequencyData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) sum += buffer[i];
      amplitude.set(sum / buffer.length / 255);
      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [active, analyserRef, amplitude]);

  return amplitude;
}
