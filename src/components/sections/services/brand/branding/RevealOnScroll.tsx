"use client";

/**
 * Ease-out-expo fade + rise on viewport enter. Content is VISIBLE BY DEFAULT
 * (animate={visible} initial only applied client-side via whileInView) — a
 * headless / hidden-tab render still shows everything. Reduced-motion: instant.
 *
 * For plain fades, src/components/ui/SectionReveal.tsx already exists — use this
 * only when the rise + expo timing matters.
 */

import { motion, useReducedMotion } from "framer-motion";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

interface RevealOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  y?: number;
  amount?: number;
}

export default function RevealOnScroll({
  children,
  delay = 0,
  y = 28,
  amount = 0.3,
  ...rest
}: RevealOnScrollProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div {...rest}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: EXPO_OUT, delay }}
      style={{ willChange: "transform, opacity" }}
      {...(rest as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}
