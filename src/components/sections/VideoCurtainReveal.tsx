"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";

export default function VideoCurtainReveal() {
  // useScroll is bypassed: Lenis drives RAF via GSAP ticker (autoRaf:false)
  // so native scroll events never fire. Sync directly from Lenis instead.
  const scrollY = useMotionValue(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useLenis((lenis: any) => {
    scrollY.set(lenis.scroll ?? 0);
  });

  // One viewport-height of scroll travel to fully exit the curtain.
  const [vh, setVh] = useState(900);
  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Fixed card translates up by exactly one viewport height → guaranteed clean exit
  const curtainY = useTransform(scrollY, [0, vh], ["0vh", "-100vh"]);
  // Subtle scale-down as card lifts (depth cue)
  const cardScale = useTransform(scrollY, [0, vh], [1, 0.9]);

  return (
    <>
      {/*
        position:fixed keeps the card always at viewport top regardless of
        document flow. z-[49] sits just below the Navbar (z-50) so the nav
        stays visible above the card at all times.
        bg-bg-dark fills the margins around the card so nothing bleeds through.
      */}
      <motion.div
        className="fixed inset-0 z-[49] bg-bg-dark will-change-transform pointer-events-none"
        style={{ y: curtainY }}
      >
        {/* Visual card: 80 vw wide, clears the fixed navbar at top */}
        <motion.div
          className="absolute top-[72px] bottom-[14px] left-[10vw] right-[10vw] overflow-hidden rounded-[22px] md:rounded-[30px] pointer-events-auto"
          style={{ scale: cardScale }}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="https://res.cloudinary.com/dgio9uutc/video/upload/v1775960150/hero-notext_eqjdin.mp4"
            autoPlay
            loop
            muted
            playsInline
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />

          {/* Centered text — no entrance delays, appears immediately */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center select-none -translate-y-[12%]">
            <p className="mb-6 text-[15px] uppercase tracking-[0.3em] text-white/80">
              The Art of Brand Innovation
            </p>

            <h1
              className="font-normal leading-[1.05] tracking-tight text-white"
              style={{
                fontSize: "clamp(1.6rem, 6.5vw, 9rem)",
                fontFamily: "var(--font-clash)",
              }}
            >
              <span className="block whitespace-nowrap">Your creative partner</span>
              <span className="block whitespace-nowrap">making your brand</span>
              <span className="block whitespace-nowrap text-brand-red">ROAR</span>
            </h1>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">Scroll</span>
              <motion.div
                className="w-px bg-white/30"
                style={{ height: 32 }}
                animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 0.9, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/*
        Scroll spacer: occupies 100vh in document flow so the page has
        scroll room for the curtain animation. Once the user scrolls past
        this, the fixed card has fully exited and HeroTop is in view.
      */}
      <div className="h-screen" />
    </>
  );
}
