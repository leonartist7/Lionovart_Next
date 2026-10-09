"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { useLionJourney } from "../lion-journey/LionJourney";
import { useHeroComposition } from "./HeroComposition";
import styles from "./HeroLightRays.module.css";

// Load the ray shader only on the client.
const LightRays = dynamic(() => import("@/components/ui/light-rays/LightRays"), { ssr: false });
const subscribeVisibility = (callback: () => void) => {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
};
const isPageVisible = () => document.visibilityState === "visible";
const serverVisible = () => false;

export default function HeroLightRays() {
  const { openingProgress } = useLionJourney()!;
  const [active, setActive] = useState(() => openingProgress.get() <= 0.25);
  const opacity = useTransform(openingProgress, [0, 0.03, 0.26], [1, 1, 0]);
  useMotionValueEvent(openingProgress, "change", progress => setActive(progress <= 0.25));
  const { composition: { scene } } = useHeroComposition();
  const visible = useSyncExternalStore(subscribeVisibility, isPageVisible, serverVisible);
  const reducedMotion = useHydratedReducedMotion();
  const animated = active && visible && !reducedMotion;

  return <motion.div className={styles.host} style={{ opacity }} aria-hidden="true" data-hero-light-rays data-rays-active={animated} data-rays-color={scene.raysColor} data-rays-secondary-color="#ef152b" data-rays-cycle-seconds="16" data-rays-origin={scene.raysOrigin}>
    {active && reducedMotion && <div className={styles.still} style={{ background: `radial-gradient(ellipse at 50% ${scene.raysOrigin === "top-center" ? "0%" : "100%"}, ${scene.raysColor}33 0%, ${scene.raysColor}0d 35%, transparent 72%)` }} />}
    {animated && <LightRays
      raysOrigin={scene.raysOrigin}
      raysColor={scene.raysColor}
      raysSecondaryColor="#ef152b"
      colorCycleDuration={16}
      raysSpeed={1.5}
      lightSpread={0.8}
      rayLength={2.4}
      intensity={1.35}
      followMouse={true}
      mouseInfluence={0.1}
      noiseAmount={0.1}
      distortion={0.05}
      className="custom-rays"
    />}
  </motion.div>;
}
