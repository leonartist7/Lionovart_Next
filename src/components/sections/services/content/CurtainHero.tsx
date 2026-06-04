"use client";

/**
 * Act 1 — Curtain hook for /services/content-studio (Content Studio).
 * A fixed showreel card that lifts up on scroll (same entry language as the
 * homepage VideoCurtainReveal, so the page reads as the same caliber), then
 * the page begins underneath. Placeholder copy + the existing no-text hero
 * clip until a real showreel is supplied.
 *
 * Self-contained: drives off the app-wide Lenis instance, no dependency on the
 * homepage scene scaffolding. Reduced-motion: card sits static, no lift.
 */

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";

export default function CurtainHero() {
  const reduce = useReducedMotion();
  const scrollY = useMotionValue(0);
  const [vh, setVh] = useState(900);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useLenis((lenis: any) => scrollY.set(lenis?.scroll ?? 0));

  const curtainY = useTransform(scrollY, [0, vh], ["0vh", "-100vh"]);
  const cardScale = useTransform(scrollY, [0, vh], [1, 0.9]);
  const backdropOpacity = useTransform(scrollY, [0, vh * 0.65], [1, 0]);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[48] bg-bg-dark pointer-events-none"
        style={{ opacity: reduce ? 1 : backdropOpacity }}
      />

      <motion.div
        className="fixed inset-0 z-[49] will-change-transform pointer-events-none"
        style={{ y: reduce ? "0vh" : curtainY }}
      >
        <motion.div
          className="absolute top-[72px] bottom-[14px] left-[10vw] right-[10vw] overflow-hidden rounded-[22px] md:rounded-[30px] pointer-events-auto"
          style={{ scale: reduce ? 1 : cardScale }}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="https://res.cloudinary.com/dgio9uutc/video/upload/v1775960150/hero-notext_eqjdin.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center select-none -translate-y-[8%]">
            <p className="mb-6 text-[12px] md:text-[14px] uppercase tracking-[0.35em] text-white/70">
              Content Studio
            </p>

            <h1
              className="font-normal leading-[1.02] tracking-tight text-white"
              style={{ fontSize: "clamp(2rem, 7vw, 8.5rem)", fontFamily: "var(--font-clash)" }}
            >
              <span className="block">We make brands</span>
              <span className="block font-semibold text-brand-red">impossible to ignore</span>
            </h1>

            <p className="mt-7 text-[12px] md:text-[13px] uppercase tracking-[0.3em] text-white/55">
              Creative content &amp; film
            </p>

            <motion.div
              className="absolute bottom-8 flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
              <motion.div
                className="w-px bg-white/30"
                style={{ height: 32 }}
                animate={reduce ? undefined : { scaleY: [0.3, 1, 0.3], opacity: [0.3, 0.9, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll spacer: gives the curtain one viewport of travel. */}
      <div className="h-screen" />
    </>
  );
}
