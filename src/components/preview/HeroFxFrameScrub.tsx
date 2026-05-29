"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@studio-freight/react-lenis";

interface Props {
  src: string;
  label?: string;
}

/**
 * Frame-scrub scrollytelling. Video plays only as user scrolls — its
 * currentTime is mapped to scroll progress through the pinned section.
 * Heaviest of the three techniques: needs full video preloaded and a
 * low-bitrate WebM/MP4 to feel smooth. MP4 may stutter on Safari.
 */
export default function HeroFxFrameScrub({ src, label = "Frame-scrub scrollytelling" }: Props) {
  // Cloudinary auto-generates a still frame by swapping the extension to .jpg.
  const poster = src.replace(/\.(mp4|webm|mov)$/i, ".jpg");
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const targetTime = useRef(0);
  const rafId = useRef<number | null>(null);

  // Prime the decoder: a brief play()/pause() forces the browser to build
  // its decode pipeline so subsequent currentTime seeks actually paint
  // frames (otherwise the poster stays frozen on Chrome).
  const prime = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      await v.play();
      v.pause();
      v.currentTime = 0.05;
      setReady(true);
    } catch {
      // Autoplay rejected (rare for muted) — still mark ready; scroll will seek.
      setReady(true);
    }
  };

  // Seek toward targetTime each frame so we don't hammer the decoder.
  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      const v = videoRef.current;
      if (v && v.duration) {
        const target = targetTime.current * v.duration;
        const diff = target - v.currentTime;
        if (Math.abs(diff) > 0.01) v.currentTime += diff * 0.2;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [ready]);

  useLenis(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return;
    targetTime.current = Math.min(1, Math.max(0, -rect.top / total));
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "300vh" }}
      data-fx="frame-scrub"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          onLoadedData={prime}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-white/60">Technique 1</p>
          <h2 className="font-clash text-4xl md:text-6xl font-bold tracking-tight">{label}</h2>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Video frames advance as you scroll. Cinematic but heavy bandwidth — needs low-bitrate
            WebM/MP4 to feel smooth. Best for short, deliberate hero sequences.
          </p>
          <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-white/40">Scroll ↓</p>
        </div>
      </div>
    </section>
  );
}
