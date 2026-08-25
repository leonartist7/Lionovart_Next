"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Static light for the few surfaces that need depth; no filter or animation. */
export function GlassAmbience() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-80"
      style={{
        background:
          "radial-gradient(42% 34% at 12% 18%, color-mix(in srgb, var(--ai-blue) 18%, transparent), transparent 74%), radial-gradient(38% 30% at 88% 68%, color-mix(in srgb, var(--ai-cyan) 12%, transparent), transparent 76%)",
      }}
    />
  );
}

export interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  still?: boolean;
}

/**
 * One inexpensive glass primitive. Mobile receives gradient depth and crisp
 * edge lighting only; desktop adds one restrained compositor blur in CSS.
 */
export function LiquidGlass({
  children,
  className,
  still = false,
}: LiquidGlassProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const animate = !still && !reduce;
  return (
    <motion.div
      ref={ref}
      initial={animate ? { opacity: 0, y: 18 } : false}
      animate={animate ? (inView ? { opacity: 1, y: 0 } : {}) : undefined}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className={cn("ai-liquid-glass relative isolate overflow-hidden rounded-[28px]", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[7%] top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-[var(--ai-cyan)]/10"
      />
      {animate && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
          initial={{ x: "-30%", opacity: 0 }}
          animate={inView ? { x: "560%", opacity: [0, 1, 0] } : {}}
          transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
