"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";

export function HeroRevealWrapper({ children }: { children: React.ReactNode }) {
  const scrollY = useMotionValue(0);
  const [vh, setVh] = useState(900);
  const [contentH, setContentH] = useState(900);
  const contentRef = useRef<HTMLDivElement>(null);

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
  // About Us doc position = 2×vh. Its viewport y = 2*vh - scroll.
  // Push when: 2*vh - scroll = min(contentH, vh) → pushStart = 2*vh - min(contentH, vh)
  // On desktop content overflows → pushStart = vh (unchanged).
  // On mobile content is shorter → push is deferred until About Us touches carousel bottom.
  const visibleH = Math.min(contentH, vh);
  const pushStart = 2 * vh - visibleH;
  const pushEnd = pushStart + vh * 1.25; // 80% speed (1.25× viewport travel for 1× push)

  const heroY = useTransform(scrollY, [pushStart, pushEnd], [0, -vh]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-screen overflow-hidden z-[1] pointer-events-none"
      style={{ opacity: heroOpacity, y: heroY }}
    >
      <div ref={contentRef} className="pointer-events-auto">
        {children}
      </div>
    </motion.div>
  );
}
