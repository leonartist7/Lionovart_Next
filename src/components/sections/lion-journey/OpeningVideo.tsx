"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLionJourney } from "./LionJourney";

export default function OpeningVideo() {
  const journey = useLionJourney()!;
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [width, setWidth] = useState(720);
  const enabled = journey.backgroundVideo && !reduced && !failed;
  useEffect(() => {
    const media = matchMedia("(min-width: 768px)");
    const update = () => setWidth(media.matches ? 1280 : 720);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    const element = video.current;
    if (!element) return;
    const update = () => {
      if (document.hidden || journey.backdropOpacity.get() <= .01) element.pause();
      else if (element.paused) void element.play().catch(() => { /* Autoplay refusal retains the black backing. */ });
    };
    update();
    const unsubscribe = journey.backdropOpacity.on("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { unsubscribe(); document.removeEventListener("visibilitychange", update); element.pause(); };
  }, [enabled, width, journey.backdropOpacity]);
  if (!enabled) return null;
  return <motion.div className="opening-video-backdrop" aria-hidden="true" style={{ opacity: journey.backdropOpacity }}>
    <video ref={video} muted playsInline loop preload="metadata" onError={() => setFailed(true)}
      src={`https://res.cloudinary.com/dgio9uutc/video/upload/w_${width},c_limit,f_auto,q_auto/v1779845599/Footage_02_chsoa3.mp4`} />
    <div className="opening-video-tint" />
  </motion.div>;
}
