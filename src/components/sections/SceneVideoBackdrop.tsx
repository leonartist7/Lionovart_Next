"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

/**
 * SceneVideoBackdrop â€” a single fixed, full-viewport video that sits behind the
 * Hero â†’ WhatWeDo â†’ HeroLion "scene", and fades out / pauses once the white
 * About section scrolls over it, so it stops decoding for the rest of the page.
 *
 * Playback starts a fixed 3s after mount (not gated on scroll), then fades +
 * pauses as the hero scrolls away.
 *
 * z-[0]: paints above `main`'s bg-bg-dark box but below the sections (z-[2]),
 * which are transparent through this region, so the video shows through them.
 */
// Same lion footage as v2's ChapterHero â€” a local asset, not a Cloudinary
// remote clip, so no width/format transform is needed here.
const HERO_VIDEO = "/videos/v2/hero-lion.mp4";

export default function SceneVideoBackdrop() {
  // Playback starts 3s after page load, regardless of scroll position.
  const [started, setStarted] = useState(false);
  const activeVideoRef = useRef<HTMLVideoElement>(null);

  // Scene opacity is driven by scroll: full until About approaches, then 0.
  const sceneOpacity = useMotionValue(1);
  // Derived dark tint that deepens slightly as you scroll into the scene for
  // text contrast over busier footage (kept subtle).
  const tintOpacity = useTransform(sceneOpacity, [0, 1], [0, 1]);

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

  // Kick off playback the moment it's allowed.
  useEffect(() => {
    if (!started) return;
    const v = activeVideoRef.current;
    if (v) void v.play().catch(() => {});
  }, [started]);

  return (
    <motion.div
      className="fixed inset-0 z-[0] pointer-events-none overflow-hidden bg-black"
      style={{ opacity: sceneOpacity }}
      aria-hidden="true"
    >
      {/* No video element until armed â€” avoids a multi-MB download on first paint. */}
      {started && (
        <motion.video
          ref={activeVideoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO}
          loop
          muted
          playsInline
          preload="auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
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
