"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const ASPECT = 57.75 / 360; // LOGO.svg height/width

/**
 * HeroLogoFly — the LOGO.svg wordmark sits at the top of the hero and, on scroll,
 * MOVES (one element, no fade) to land exactly on the navbar logo slot and stay
 * there. The navbar's own LOGO.svg ([data-nav-logo]) is an invisible click target
 * underneath; this measures it to dock precisely.
 */
export function HeroLogoFly() {
  const imgRef = useRef<HTMLImageElement>(null);
  // Latest measured travel: end scroll px + target deltas + end scale.
  const dims = useRef({ end: 600, tx: 0, ty: -90, s: 0.16 });

  useEffect(() => {
    const measure = () => {
      const navEl = document.querySelector<HTMLElement>("[data-nav-logo]");
      const img = imgRef.current;
      if (!navEl || !img) return;
      const r = navEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const W0 = img.offsetWidth; // pre-transform layout width
      const H0 = W0 * ASPECT;
      const targetH = r.height || H0 * 0.16;
      const startTopY = 0.11 * vh; // wrapper top: 11vh
      // Center-to-center docking → lands vertically centered on the navbar slot.
      dims.current = {
        end: Math.max(1, vh * 0.55),
        tx: r.left + r.width / 2 - vw / 2,
        ty: r.top + r.height / 2 - (startTopY + H0 / 2),
        s: targetH / H0,
      };
    };
    measure();
    window.addEventListener("resize", measure);
    // Re-measure once after fonts/layout settle.
    const t = setTimeout(measure, 400);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  const { scrollY } = useScroll();
  const prog = (v: number) => {
    const d = dims.current;
    return Math.min(1, Math.max(0, v / d.end));
  };

  // Stacking: BEHIND the navbar while flying down (so nav controls stay on top),
  // then ON TOP once it reaches the navbar slot and stays docked.
  const [docked, setDocked] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => {
    const isDocked = v >= dims.current.end * 0.99;
    setDocked((prev) => (prev === isDocked ? prev : isDocked));
  });
  // Initial state for loads that start already scrolled past the dock point.
  useEffect(() => {
    setDocked(scrollY.get() >= dims.current.end * 0.99);
  }, [scrollY]);
  const x = useTransform(scrollY, (v) => prog(v) * dims.current.tx);
  const y = useTransform(scrollY, (v) => prog(v) * dims.current.ty);
  const scale = useTransform(scrollY, (v) => {
    const s = dims.current.s;
    return 1 + prog(v) * (s - 1);
  });

  return (
    <div className={`fixed top-[11vh] left-1/2 -translate-x-1/2 ${docked ? "z-[60]" : "z-30"} pointer-events-none select-none`}>
      <motion.div style={{ x, y, scale, transformOrigin: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src="/images/LOGO.svg"
          alt="LIONOVART"
          className="block h-auto w-[clamp(340px,90vw,1100px)]"
        />
      </motion.div>
    </div>
  );
}
