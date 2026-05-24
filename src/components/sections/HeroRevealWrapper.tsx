"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";
import { useHeroImageStore } from "@/lib/stores/hero-image-store";
import { HeroFocalPicker } from "@/components/ui/HeroFocalPicker";
import { HeroImageCycler } from "@/components/ui/HeroImageCycler";

// Dev-only flag — Next/SWC inlines this at build time so production bundles
// drop the dev-only branches entirely.
const IS_DEV = process.env.NODE_ENV !== "production";

/** True when the viewport is ≤768px (mobile/portrait) */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    // Mount-time platform detection; matchMedia is unavailable during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export function HeroRevealWrapper({ children }: { children: React.ReactNode }) {
  const scrollY = useMotionValue(0);
  const [vh, setVh] = useState(900);
  const [contentH, setContentH] = useState(900);
  const contentRef = useRef<HTMLDivElement>(null);

  const { images, currentIndex, positions, pickerActive, init } = useHeroImageStore();
  const current = images[currentIndex];
  const isMobile = useIsMobile();

  // Pick mobile src if available, fall back to desktop
  const currentSrc = current
    ? (isMobile && current.mobile ? current.mobile : current.desktop)
    : null;

  // Saved focal point for this image, default to 50% 70%
  const focalPos = current ? (positions[current.id] ?? { x: 50, y: 70 }) : { x: 50, y: 70 };
  const bgPosition = `${focalPos.x}% ${focalPos.y}%`;

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      if (contentRef.current) setContentH(contentRef.current.scrollHeight);
    };
    measure();

    // ResizeObserver catches ImageMarquee computing its 3D radius after mount
    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
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

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-screen overflow-hidden z-[1] pointer-events-none"
      style={{ opacity: heroOpacity, y: heroY }}
    >
      {/* Full-viewport hero background — covers HeroTop + ImageMarquee */}
      <AnimatePresence>
        {currentSrc && (
          <motion.div
            key={currentSrc}
            className="hero-bg-layer absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              backgroundImage: `url(${currentSrc})`,
              backgroundSize: "cover",
              backgroundPosition: bgPosition,
            }}
          />
        )}
      </AnimatePresence>

      {/* Focal point picker overlay — dev tool, only mounted in development */}
      {IS_DEV && (
        <AnimatePresence>
          {pickerActive && (
            <motion.div
              key="focal-picker"
              className="absolute inset-0 z-[9]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HeroFocalPicker />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div ref={contentRef} className="pointer-events-auto relative z-[1]">
        {children}
      </div>

      {/* Hero image cycler — bottom-center pill, visible on all devices */}
      <HeroImageCycler />
    </motion.div>
  );
}
