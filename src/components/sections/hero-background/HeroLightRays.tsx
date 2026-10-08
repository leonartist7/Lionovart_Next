"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
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
  const { openingProgress, copy } = useLionJourney()!;
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(() => openingProgress.get() <= 0.25);
  const opacity = useTransform(openingProgress, [0, 0.03, 0.26], [1, 1, 0]);
  useMotionValueEvent(openingProgress, "change", progress => setActive(progress <= 0.25));
  const { composition: { scene } } = useHeroComposition();
  const visible = useSyncExternalStore(subscribeVisibility, isPageVisible, serverVisible);
  const reducedMotion = useReducedMotion();
  const animated = active && visible && !reducedMotion;

  useEffect(() => {
    const backdrop = host.current;
    const headline = copy.current?.querySelector<HTMLElement>("#hero-heading");
    if (!active || !visible || !backdrop || !headline) return;
    let frame = 0, disposed = false;
    const measure = () => {
      frame = 0;
      if (disposed) return;
      const title = headline.getBoundingClientRect();
      const bounds = backdrop.getBoundingClientRect();
      backdrop.style.setProperty("--spotlight-x", `${title.left + title.width / 2 - bounds.left}px`);
      backdrop.style.setProperty("--spotlight-y", `${title.top + title.height / 2 - bounds.top}px`);
      backdrop.style.setProperty("--spotlight-width", `${Math.max(160, title.width * .7)}px`);
      backdrop.style.setProperty("--spotlight-height", `${Math.max(120, title.height * .85)}px`);
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(headline);
    const hero = headline.closest(".lion-hero");
    if (hero) observer.observe(hero);
    const nav = document.querySelector("[data-nav-state]");
    if (nav) observer.observe(nav);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    void document.fonts.ready.then(schedule);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
    };
  }, [active, visible, copy]);
  return <motion.div ref={host} className={styles.host} style={{ ...({ "--spotlight-color": `${scene.raysColor}26` } as CSSProperties), opacity }} aria-hidden="true" data-hero-light-rays data-rays-active={animated} data-rays-color={scene.raysColor} data-rays-secondary-color="#ef152b" data-rays-cycle-seconds="16" data-rays-origin={scene.raysOrigin}>
    {active && <div className={styles.focus} />}
    {active && reducedMotion && <div className={styles.still} style={{ background: `radial-gradient(ellipse at 50% ${scene.raysOrigin === "top-center" ? "0%" : "100%"}, ${scene.raysColor}26 0%, ${scene.raysColor}0a 35%, transparent 72%)` }} />}
    {animated && <LightRays
      raysOrigin={scene.raysOrigin}
      raysColor={scene.raysColor}
      raysSecondaryColor="#ef152b"
      colorCycleDuration={16}
      raysSpeed={1.5}
      lightSpread={0.8}
      rayLength={1.2}
      followMouse={false}
      mouseInfluence={0}
      noiseAmount={0.1}
      distortion={0}
      className="custom-rays"
    />}
  </motion.div>;
}
