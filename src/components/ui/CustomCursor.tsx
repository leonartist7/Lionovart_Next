"use client";

/**
 * CustomCursor — LIONOVART premium pointer
 * ----------------------------------------
 * - Inner dot tracks the pointer with zero lag (raw motion values).
 * - Outer ring is spring-lagged via useSpring.
 * - mix-blend-mode: difference auto-inverts over black AND cream sections.
 * - On a, button, [data-cursor]: ring grows + fills.
 * - On [data-cursor="<text>"]: replaces ring with a filled gold disc + label.
 * - Hidden on coarse pointers (touch); reduced-motion friendly.
 *
 * Perf notes:
 * - Position updates are RAF-throttled to 1 paint per frame regardless of
 *   mouse poll rate (matters for 1000Hz gaming mice).
 * - Hover detection is folded into the same RAF tick via elementFromPoint
 *   instead of listening to bubbling pointerover/pointerout, which on deep
 *   DOMs fire dozens of events per second of pointer movement.
 * - State is only updated when the resolved mode/label actually changes.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "hover" | "label";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, label, [data-cursor]';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [labelText, setLabelText] = useState("");

  // Raw pointer position (dot follows this directly).
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Spring-lagged position for ring + label.
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.6 });

  // Refs hold current state for the RAF loop without re-binding.
  const modeRef = useRef<CursorMode>("default");
  const labelRef = useRef<string>("");
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    labelRef.current = labelText;
  }, [labelText]);

  /* ── Mount: detect pointer capability ──────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.body.classList.add("cursor-active");
    return () => {
      document.body.classList.remove("cursor-active");
    };
  }, []);

  /* ── Single RAF loop — handles position + hover detection ──────────── */
  useEffect(() => {
    if (!enabled) return;

    // Latest pointer coords captured by the move listener.
    let px = -100;
    let py = -100;
    let dirty = false;
    let rafId = 0;
    let inside = true;

    const handleMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      dirty = true;
    };

    const handleLeaveWindow = () => {
      inside = false;
      dirty = true;
    };

    const handleEnterWindow = () => {
      inside = true;
    };

    const tick = () => {
      if (dirty) {
        if (!inside) {
          x.set(-100);
          y.set(-100);
        } else {
          x.set(px);
          y.set(py);

          // Hover detection — ONE elementFromPoint call per frame.
          const target = document.elementFromPoint(px, py);
          const el = target
            ? (target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null)
            : null;

          let nextMode: CursorMode = "default";
          let nextLabel = "";
          if (el) {
            const attr = el.getAttribute("data-cursor");
            if (attr && attr !== "true" && attr !== "false") {
              nextMode = "label";
              nextLabel = attr;
            } else {
              nextMode = "hover";
            }
          }
          if (nextMode !== modeRef.current) {
            setMode(nextMode);
            modeRef.current = nextMode;
          }
          if (nextLabel !== labelRef.current) {
            setLabelText(nextLabel);
            labelRef.current = nextLabel;
          }
        }
        dirty = false;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeaveWindow);
    document.addEventListener("mouseenter", handleEnterWindow);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseleave", handleLeaveWindow);
      document.removeEventListener("mouseenter", handleEnterWindow);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const showLabel = mode === "label";
  // Ring hides only when the gold label disc takes over.
  const ringHidden = showLabel;
  // Dot hides only for the gold label state — stays visible on hover.
  const dotHidden = showLabel;

  return (
    <>
      {/* Circle ring — rendered FIRST so the dot sits visually on top.
          Default: 32px outline. Hover: scales to ~56px (1.75×), stays
          fully transparent — circumference only, never fills. */}
      <motion.div
        className="cursor-layer cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: ringHidden ? 0 : 1,
          scale: mode === "hover" ? 1.75 : 1,
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Inner dot — raw, no lag, on top of ring (rendered after). */}
      <motion.div
        className="cursor-layer cursor-dot"
        style={{ x, y }}
        animate={{
          opacity: dotHidden ? 0 : 1,
          scale: dotHidden ? 0.5 : 1,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />

      {/* Contextual gold label (Play / Drag / …) — no blend mode */}
      <motion.div
        className="cursor-label"
        style={{ x: ringX, y: ringY }}
        initial={false}
        animate={{
          opacity: showLabel ? 1 : 0,
          scale: showLabel ? 1 : 0.4,
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      >
        {labelText}
      </motion.div>
    </>
  );
}
