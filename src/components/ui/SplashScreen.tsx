"use client";

/**
 * SplashScreen — LIONOVART first-load preloader
 * ---------------------------------------------
 * Sequence (~2.4s total):
 *  1. Full-bleed black overlay on first paint.
 *  2. Inline "LV" monogram strokes draw on via Framer Motion pathLength.
 *  3. LIONOVART wordmark fades up with the gold shimmer sweep.
 *  4. Numeric counter ticks 0 → 100 (monospaced).
 *  5. Vertical curtain wipe up reveals the page.
 *
 * Guards:
 *  - First-load only (sessionStorage "lionovart_splash_seen").
 *  - prefers-reduced-motion → static fade-out, no draw-on, no curtain.
 *  - Locks scroll while active; pauses Lenis if present.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useLenis } from "lenis/react";

const SESSION_KEY = "lionovart_splash_seen";
const TOTAL_DURATION_MS = 1800;
const EXIT_DURATION_MS = 650;

export default function SplashScreen() {
  // SSR-safe: render nothing until we know whether to show
  const [visible, setVisible] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Counter motion value 0 → 100
  const counter = useMotionValue(0);
  const counterDisplay = useTransform(counter, (v) => String(Math.round(v)).padStart(3, "0"));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = useLenis() as any;

  // Hard-dismiss helper — always restores scroll even if something broke
  const dismiss = () => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(SESSION_KEY, "1");
    document.body.style.overflow = "";
    if (lenis?.start) lenis.start();
    setVisible(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user has already seen splash this session
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (seen) {
      setVisible(false);
      return;
    }

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(rm);
    setVisible(true);

    // Lock scroll + pause Lenis
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (lenis?.stop) lenis.stop();

    // Run counter
    const counterDuration = rm ? 0.3 : (TOTAL_DURATION_MS - 200) / 1000;
    const controls = animate(counter, 100, {
      duration: counterDuration,
      ease: rm ? "linear" : [0.16, 1, 0.3, 1],
    });

    // Schedule exit
    const exitTimer = window.setTimeout(
      () => {
        sessionStorage.setItem(SESSION_KEY, "1");
        setVisible(false);
      },
      rm ? 600 : TOTAL_DURATION_MS,
    );

    // Safety net: no matter what, the splash MUST be gone in 4s.
    const safetyTimer = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      document.body.style.overflow = "";
      if (lenis?.start) lenis.start();
      setVisible(false);
    }, 4000);

    return () => {
      controls.stop();
      window.clearTimeout(exitTimer);
      window.clearTimeout(safetyTimer);
      document.body.style.overflow = prevOverflow;
      if (lenis?.start) lenis.start();
    };
    // We intentionally run this once on mount. Lenis ref is stable per session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Release scroll lock the moment we go invisible (exit animation runs on top)
  useEffect(() => {
    if (visible === false) {
      document.body.style.overflow = "";
      if (lenis?.start) lenis.start();
    }
  }, [visible, lenis]);

  if (visible === null) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          initial={{ y: 0 }}
          exit={
            reducedMotion
              ? { opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }
              : { y: "-100%", transition: { duration: EXIT_DURATION_MS / 1000, ease: [0.76, 0, 0.24, 1] } }
          }
          onClick={dismiss}
          aria-hidden
        >
          {/* Soft gold/red atmospheric glow behind the mark */}
          {!reducedMotion && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(240,201,23,0.10) 0%, transparent 55%), radial-gradient(circle at 50% 60%, rgba(229,25,42,0.08) 0%, transparent 60%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          )}

          {/* LV monogram — stroke draw-on */}
          <motion.svg
            viewBox="0 0 200 120"
            width="180"
            height="108"
            fill="none"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* L */}
            <motion.path
              d="M 18 12 L 18 108 L 78 108"
              initial={{ pathLength: reducedMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reducedMotion ? 0 : 1.0,
                ease: [0.65, 0, 0.35, 1],
                delay: reducedMotion ? 0 : 0.15,
              }}
            />
            {/* V */}
            <motion.path
              d="M 108 12 L 142 108 L 176 12"
              initial={{ pathLength: reducedMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reducedMotion ? 0 : 1.0,
                ease: [0.65, 0, 0.35, 1],
                delay: reducedMotion ? 0 : 0.4,
              }}
            />
            {/* Gold accent underline that fills in after the strokes */}
            <motion.path
              d="M 18 116 L 176 116"
              stroke="#f0c917"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: reducedMotion ? 0 : 0.6,
                ease: "easeOut",
                delay: reducedMotion ? 0 : 1.3,
              }}
            />
          </motion.svg>

          {/* Wordmark with gold shimmer sweep */}
          <motion.div
            className="relative mt-7 select-none"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0.3 : 0.7,
              delay: reducedMotion ? 0 : 1.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span
              className="splash-wordmark font-clash"
              style={{
                fontWeight: 600,
                fontSize: "clamp(1.4rem, 3.2vw, 2.2rem)",
                letterSpacing: "0.42em",
                paddingLeft: "0.42em",
              }}
            >
              LIONOVART
            </span>
          </motion.div>

          {/* 0 → 100 counter, bottom-right */}
          <motion.div
            className="absolute bottom-6 right-6 flex items-baseline gap-2 text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: reducedMotion ? 0 : 0.2 }}
            style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
          >
            <motion.span className="text-2xl tabular-nums">{counterDisplay}</motion.span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">loading</span>
          </motion.div>

          {/* Top-left brand line */}
          <motion.div
            className="absolute top-6 left-6 text-[10px] uppercase tracking-[0.4em] text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: reducedMotion ? 0 : 0.1 }}
          >
            Premium Creative Agency
          </motion.div>

          {/* Bottom-left skip hint */}
          <motion.div
            className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.4em] text-white/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: reducedMotion ? 0 : 0.8 }}
          >
            click anywhere to skip
          </motion.div>

          {/* Bottom thin gold sweep line — completes the wipe choreography */}
          {!reducedMotion && (
            <motion.div
              className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-[#f0c917] to-transparent"
              initial={{ width: "0%", opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
