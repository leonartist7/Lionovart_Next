"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

/**
 * SceneVideoBackdrop — a single fixed, full-viewport video that sits behind the
 * Hero → WhatWeDo → HeroLion "scene". Auto-crossfades through 3 clips (14s each)
 * and fades out / pauses once the white About section scrolls over it, so it
 * stops decoding for the rest of the page.
 *
 * z-[0]: paints above `main`'s bg-bg-dark box but below the sections (z-[2]),
 * which are transparent through this region, so the video shows through them.
 */
// f_auto,q_auto → Cloudinary serves a modern codec (AV1/VP9/H.265) at
// perceptually-optimized quality per browser: same look behind the dark
// tint, meaningfully smaller download + cheaper decode per frame.
const CLIPS = [
  "https://res.cloudinary.com/dgio9uutc/video/upload/f_auto,q_auto/v1779845634/Footage_07_o3rfbu.mp4",
  "https://res.cloudinary.com/dgio9uutc/video/upload/f_auto,q_auto/v1779845599/Footage_02_chsoa3.mp4",
  "https://res.cloudinary.com/dgio9uutc/video/upload/f_auto,q_auto/v1779845553/Footage_05_yalbaj.mp4",
];

const CLIP_DURATION_MS = 14000;

export default function SceneVideoBackdrop() {
  const [index, setIndex] = useState(0);
  // Playback starts ~1s after the user first scrolls into the hero (past the
  // curtain), not on load — so the entrance feels deliberate.
  const [started, setStarted] = useState(false);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement>(null);

  // Scene opacity is driven by scroll: full until About approaches, then 0.
  const sceneOpacity = useMotionValue(1);
  // Derived dark tint that deepens slightly as you scroll into the scene for
  // text contrast over busier footage (kept subtle).
  const tintOpacity = useTransform(sceneOpacity, [0, 1], [0, 1]);

  // Auto-advance the clip every 14s — only once playback has started.
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % CLIPS.length);
    }, CLIP_DURATION_MS);
    return () => clearInterval(id);
  }, [started]);

  useEffect(() => () => { if (startTimer.current) clearTimeout(startTimer.current); }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useLenis((lenis: any) => {
    const vh = window.innerHeight;
    const scroll = lenis?.scroll ?? 0;

    // Arm playback: once the user scrolls into the hero (past ~half the curtain),
    // wait 1s, then begin. Fires once.
    if (!started && scroll > vh * 0.5 && !startTimer.current) {
      startTimer.current = setTimeout(() => setStarted(true), 2000);
    }

    // Fade + pause as the hero exits — video lives behind the hero only,
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

      {/* Light, even tint — the hero's own overlay governs the dark stage +
          the fold peek, so keep this subtle to preserve video detail. */}
      <motion.div
        className="absolute inset-0 bg-black/25"
        style={{ opacity: tintOpacity }}
      />
    </motion.div>
  );
}
