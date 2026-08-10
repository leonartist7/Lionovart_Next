"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

/**
 * SceneVideoBackdrop â€” a single fixed, full-viewport video that sits behind the
 * Hero â†’ WhatWeDo â†’ HeroLion "scene". Auto-crossfades through 3 clips (14s each)
 * and fades out / pauses once the white About section scrolls over it, so it
 * stops decoding for the rest of the page.
 *
 * Playback starts a fixed 3s after mount (not gated on scroll), then fades +
 * pauses as the hero scrolls away.
 *
 * z-[0]: paints above `main`'s bg-bg-dark box but below the sections (z-[2]),
 * which are transparent through this region, so the video shows through them.
 */
// f_auto,q_auto â†’ Cloudinary serves a modern codec (AV1/VP9/H.265) at
// perceptually-optimized quality per browser: same look behind the dark
// tint, meaningfully smaller download + cheaper decode per frame.
// The masters are 3840x2160 (~16MB / 15s each). f_auto,q_auto alone picks a
// modern codec + quality but KEEPS the 4K frame, so every visitor was
// downloading and decoding 4K for a tinted background layer. w_1920,c_limit
// caps it at 1080p (a quarter of the pixels); c_limit only ever downscales.
const CLIPS = [
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845634/Footage_07_o3rfbu.mp4",
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845599/Footage_02_chsoa3.mp4",
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845553/Footage_05_yalbaj.mp4",
];

const CLIP_DURATION_MS = 14000;

export default function SceneVideoBackdrop() {
  const [index, setIndex] = useState(0);
  // Playback starts 3s after page load, regardless of scroll position.
  const [started, setStarted] = useState(false);
  const activeVideoRef = useRef<HTMLVideoElement>(null);

  // Scene opacity is driven by scroll: full until About approaches, then 0.
  const sceneOpacity = useMotionValue(1);
  // Derived dark tint that deepens slightly as you scroll into the scene for
  // text contrast over busier footage (kept subtle).
  const tintOpacity = useTransform(sceneOpacity, [0, 1], [0, 1]);

  // Auto-advance the clip every 14s â€” only once playback has started.
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % CLIPS.length);
    }, CLIP_DURATION_MS);
    return () => clearInterval(id);
  }, [started]);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useLenis((lenis: any) => {
    const vh = window.innerHeight;
    const scroll = lenis?.scroll ?? 0;

    // Fade + pause as the hero exits â€” video lives behind the hero only,
    // then the light body takes over. Full until 0.7vh, gone by 1.4vh.
    const o = Math.min(1, Math.max(0, 1 - (scroll - vh * 0.7) / (vh * 0.7)));
    sceneOpacity.set(o);

    const v = activeVideoRef.current;
    if (!v || !started) return;
    if (o <= 0.01) {
      if (!v.paused) v.pause();
    } else if (v.paused) {
      void v.play().catch(() => {});
    }
  });

  // Kick off playback on the active video the moment it's allowed.
  useEffect(() => {
    if (!started) return;
    const v = activeVideoRef.current;
    if (v) void v.play().catch(() => {});
  }, [started, index]);

  return (
    <motion.div
      className="fixed inset-0 z-[0] pointer-events-none overflow-hidden bg-black"
      style={{ opacity: sceneOpacity }}
      aria-hidden="true"
    >
      {/* No video element until armed â€” avoids multi-MB download on first paint. */}
      {started && (
        <AnimatePresence>
          <motion.video
            key={index}
            ref={activeVideoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={CLIPS[index]}
            loop
            muted
            playsInline
            preload="auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </AnimatePresence>
      )}

      {/* Light, even tint â€” the hero's own overlay governs the dark stage +
          the fold peek, so keep this subtle to preserve video detail. */}
      <motion.div
        className="absolute inset-0 bg-black/25"
        style={{ opacity: tintOpacity }}
      />
    </motion.div>
  );
}
