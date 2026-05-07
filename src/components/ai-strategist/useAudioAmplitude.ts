"use client";

import { useEffect, useState, type RefObject } from "react";

export function useAudioAmplitude(
  analyserRef: RefObject<AnalyserNode | null>,
  active: boolean,
): number {
  const [amplitude, setAmplitude] = useState(0);

  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAmplitude(0);
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
      setAmplitude(sum / buffer.length / 255);
      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [active, analyserRef]);

  return amplitude;
}
