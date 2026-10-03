"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./HeroLightRays.module.css";

// Keep the upstream JS + plain CSS component intact and load WebGL only on the client.
const LightRays = dynamic(() => import("@/components/ui/light-rays/LightRays"), { ssr: false });
const subscribeVisibility = (callback: () => void) => {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
};
const isPageVisible = () => document.visibilityState === "visible";
const serverVisible = () => false;

export default function HeroLightRays({ active }: { active: boolean }) {
  const visible = useSyncExternalStore(subscribeVisibility, isPageVisible, serverVisible);
  const reducedMotion = useReducedMotion();
  const animated = active && visible && !reducedMotion;
  return <div className={styles.host} aria-hidden="true" data-hero-light-rays data-rays-active={animated}>
    {active && reducedMotion && <div className={styles.still} />}
    {animated && <LightRays
      raysOrigin="top-center"
      raysColor="#00ffff"
      raysSpeed={1.5}
      lightSpread={0.8}
      rayLength={1.2}
      followMouse={true}
      mouseInfluence={0.1}
      noiseAmount={0.1}
      distortion={0.05}
      className="custom-rays"
    />}
  </div>;
}
