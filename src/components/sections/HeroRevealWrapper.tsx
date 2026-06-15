"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

interface HeroRevealWrapperProps {
  /** Top slot — HeroTop section. */
  heroTop: ReactNode;
}

/**
 * HeroRevealWrapper — pushes the hero *content* (HeroTop + ImageMarquee) up as
 * the user scrolls, fading it in after the curtain. The video background lives
 * in <SceneVideoBackdrop /> (a separate fixed z-[0] layer); this wrapper sits
 * above it at z-[1].
 */
export function HeroRevealWrapper({ heroTop }: HeroRevealWrapperProps) {
  const scrollY = useMotionValue(0);
  const [vh, setVh] = useState(900);
  const [contentH, setContentH] = useState(900);
  const [heroTopH, setHeroTopH] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      if (contentRef.current) setContentH(contentRef.current.scrollHeight);
      if (heroTopRef.current) setHeroTopH(heroTopRef.current.offsetHeight);
    };
    measure();

    // ResizeObserver catches ImageMarquee computing its 3D radius after mount
    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
    if (heroTopRef.current) ro.observe(heroTopRef.current);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useLenis((lenis: any) => { scrollY.set(lenis.scroll ?? 0); });

  // Fade in as card passes 30–60% of its scroll travel
  const heroOpacity = useTransform(scrollY, [vh * 0.3, vh * 0.6], [0, 1]);

  // Push starts exactly when About Us reaches the visual bottom of hero content.
  const visibleH = Math.min(contentH, vh);
  const pushStart = 2 * vh - visibleH;
  const pushEnd = pushStart + vh * 1.25; // 80% speed

  const heroY = useTransform(scrollY, [pushStart, pushEnd], [0, -vh]);

  // Marquee budget: whatever vh remains after HeroTop is laid out, minus a
  // small breathing buffer. Floored at 160px so the carousel still renders
  // even on absurdly squat viewports. Buffer trimmed to 12px so the dome
  // reclaims vertical room on tall desktops (paired with overflow-y-visible
  // on the dome so its projected front cards are no longer clipped).
  const marqueeMaxHeight = Math.max(160, vh - heroTopH - 12);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-screen overflow-hidden z-[1] pointer-events-none"
      style={{ opacity: heroOpacity, y: heroY }}
    >
      <div ref={contentRef} className="pointer-events-auto relative z-[1]">
        <div ref={heroTopRef}>{heroTop}</div>
        {/* Portfolio arc relocated out of the hero (lives on the Work page). */}
      </div>
    </motion.div>
  );
}
