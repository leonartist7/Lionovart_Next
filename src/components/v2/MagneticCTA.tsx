"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/* ─── MagneticCTA — subtle pointer-follow physics for primary CTAs ───
   Wraps a button/link so it drifts up to ~10px toward the cursor.
   Motion values only, never React state, so it costs nothing on
   re-render. Disabled under reduced motion or non-mouse pointers.
   ─────────────────────────────────────────────────────────────────── */

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export default function MagneticCTA({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18 });
  const sy = useSpring(y, { stiffness: 180, damping: 18 });

  const handlePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (reduceMotion || e.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);
    x.set(clamp(offsetX * 0.25, -10, 10));
    y.set(clamp(offsetY * 0.25, -10, 10));
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    // The motion-value style is passed unconditionally: values rest at 0
    // (transform "none") and the pointer handlers above already no-op
    // under reduced motion, so the element simply never moves. Branching
    // the style prop on reduceMotion instead caused a hydration mismatch,
    // because useReducedMotion() is null during SSR but resolves
    // instantly on the client (see the master plan's Progress Log).
    <motion.span
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}
