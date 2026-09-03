"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useLenis } from "lenis/react";

/**
 * One fixed opening film for the arrival chapter. It is progressive enhancement:
 * mobile, reduced-motion and data-saver visitors keep the authored dark/red
 * stage without paying for video decode.
 */
const CLIPS = [
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845634/Footage_07_o3rfbu.mp4",
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845599/Footage_02_chsoa3.mp4",
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845553/Footage_05_yalbaj.mp4",
];

const CLIP_DURATION_MS = 14000;
const START_DELAY_MS = 1200;

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export default function SceneVideoBackdrop() {
  const reduceMotion = Boolean(useReducedMotion());
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [mediaAllowed, setMediaAllowed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const activeVideoRef = useRef<HTMLVideoElement>(null);

  const sceneOpacity = useMotionValue(1);
  const tintOpacity = useTransform(sceneOpacity, [0, 1], [0, 1]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const syncCapability = () => {
      const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
      setMediaAllowed(!reduceMotion && !mobileQuery.matches && !saveData);
    };

    syncCapability();
    mobileQuery.addEventListener("change", syncCapability);
    return () => mobileQuery.removeEventListener("change", syncCapability);
  }, [reduceMotion]);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(document.visibilityState === "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    if (!mediaAllowed) {
      setStarted(false);
      activeVideoRef.current?.pause();
      return;
    }

    const timer = window.setTimeout(() => setStarted(true), START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [mediaAllowed]);

  useEffect(() => {
    if (!started || !pageVisible) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % CLIPS.length);
    }, CLIP_DURATION_MS);
    return () => window.clearInterval(id);
  }, [started, pageVisible]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useLenis((lenis: any) => {
    const viewportHeight = window.innerHeight;
    const scroll = lenis?.scroll ?? 0;
    const opacity = Math.min(
      1,
      Math.max(0, 1 - (scroll - viewportHeight * 0.7) / (viewportHeight * 0.7)),
    );
    sceneOpacity.set(opacity);

    const video = activeVideoRef.current;
    if (!video || !started || !mediaAllowed) return;

    if (opacity <= 0.01 || !pageVisible) {
      if (!video.paused) video.pause();
    } else if (video.paused) {
      void video.play().catch(() => {});
    }
  });

  useEffect(() => {
    const video = activeVideoRef.current;
    if (!video || !started || !mediaAllowed) return;
    if (!pageVisible || sceneOpacity.get() <= 0.01) {
      video.pause();
      return;
    }
    void video.play().catch(() => {});
  }, [index, mediaAllowed, pageVisible, sceneOpacity, started]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[0] overflow-hidden bg-bg-dark"
      style={{ opacity: sceneOpacity }}
      aria-hidden="true"
      data-scene-video={started && mediaAllowed ? "active" : "static"}
    >
      {started && mediaAllowed && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.video
            key={index}
            ref={activeVideoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={CLIPS[index]}
            loop
            muted
            playsInline
            preload="metadata"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>
      )}

      <motion.div className="absolute inset-0 bg-black/25" style={{ opacity: tintOpacity }} />
    </motion.div>
  );
}
