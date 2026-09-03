"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "hover" | "label";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, label, [data-cursor]';

/**
 * Fine-pointer-only brand cursor. Pointer coordinates are coalesced to one RAF
 * only when movement actually occurs; there is no permanent animation loop.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [labelText, setLabelText] = useState("");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.6 });

  const modeRef = useRef<CursorMode>("default");
  const labelRef = useRef("");

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    setEnabled(true);
    document.body.classList.add("cursor-active");

    return () => {
      document.body.classList.remove("cursor-active");
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let nextX = -100;
    let nextY = -100;
    let rafId = 0;

    const flushPosition = () => {
      rafId = 0;
      x.set(nextX);
      y.set(nextY);
    };

    const schedulePosition = (clientX: number, clientY: number) => {
      nextX = clientX;
      nextY = clientY;
      if (!rafId) rafId = window.requestAnimationFrame(flushPosition);
    };

    const handleMove = (event: PointerEvent) => {
      schedulePosition(event.clientX, event.clientY);
    };

    const handleLeaveWindow = () => schedulePosition(-100, -100);

    const handleOver = (event: PointerEvent) => {
      const target = event.target;
      const element =
        target instanceof Element
          ? (target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null)
          : null;

      let nextMode: CursorMode = "default";
      let nextLabel = "";

      if (element) {
        const cursorLabel = element.getAttribute("data-cursor");
        if (cursorLabel && cursorLabel !== "true" && cursorLabel !== "false") {
          nextMode = "label";
          nextLabel = cursorLabel;
        } else {
          nextMode = "hover";
        }
      }

      if (nextMode !== modeRef.current) {
        modeRef.current = nextMode;
        setMode(nextMode);
      }
      if (nextLabel !== labelRef.current) {
        labelRef.current = nextLabel;
        setLabelText(nextLabel);
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerover", handleOver, { passive: true });
    document.addEventListener("mouseleave", handleLeaveWindow);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      document.removeEventListener("mouseleave", handleLeaveWindow);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const showLabel = mode === "label";

  return (
    <>
      <motion.div
        className="cursor-layer cursor-ring"
        style={{ x, y }}
        animate={{
          opacity: showLabel ? 0 : 1,
          width: mode === "hover" ? 16 : 10,
          height: mode === "hover" ? 16 : 10,
          marginTop: mode === "hover" ? -8 : -5,
          marginLeft: mode === "hover" ? -8 : -5,
        }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      />

      <motion.div
        className="cursor-label"
        style={{ x: ringX, y: ringY }}
        initial={false}
        animate={{
          opacity: showLabel ? 1 : 0,
          scale: showLabel ? 1 : 0.92,
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      >
        {labelText}
      </motion.div>
    </>
  );
}
