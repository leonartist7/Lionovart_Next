"use client";

/**
 * Liquid glass panels for /services/ai.
 *
 * Why real CSS and not a shader per panel: `backdrop-filter` genuinely refracts
 * what is behind it, and it composites on the GPU for free. Five ShaderMounts
 * would mean five WebGL contexts on a page that already has one for the lion.
 * The premium read comes from getting the EDGES right, which is where cheap
 * glass always fails:
 *
 *  - a bright 1px top edge and a dark bottom edge, so the slab has thickness
 *  - a specular sweep that travels once on entry, so it reads as a surface
 *    catching light rather than a translucent rectangle
 *  - a caustic bleed at the rim, tinted with the page's red accent
 *
 * Panels need something behind them to bend or they look like flat grey.
 * GlassAmbience provides that: a static, zero-cost field the glass refracts.
 */

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * The field the glass refracts. Static gradients, no animation, no canvas:
 * it exists to give `backdrop-filter` something to work on.
 */
export function GlassAmbience() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-[-10%] top-[8%] h-[52vh] w-[52vh] rounded-full opacity-[0.16] blur-[90px]"
        style={{ background: "radial-gradient(circle, var(--ai-blue) 0%, transparent 68%)" }}
      />
      <div
        className="absolute right-[-8%] top-[44%] h-[46vh] w-[46vh] rounded-full opacity-[0.14] blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--ai-cyan) 0%, transparent 68%)" }}
      />
      <div
        className="absolute bottom-[6%] left-[30%] h-[38vh] w-[38vh] rounded-full opacity-[0.10] blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--ai-deep) 0%, transparent 70%)" }}
      />
    </div>
  );
}

export interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  /** Ribbed, refractive glass. Use sparingly: it is the loudest variant. */
  fluted?: boolean;
  /** Skip the entry sweep for panels that are already in view on load. */
  still?: boolean;
}

export function LiquidGlass({ children, className = "", fluted = false, still = false }: LiquidGlassProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const reduce = useReducedMotion();
  const animate = !still && !reduce;

  return (
    <motion.div
      ref={ref}
      initial={animate ? { opacity: 0, y: 26 } : false}
      animate={animate ? (inView ? { opacity: 1, y: 0 } : {}) : undefined}
      // exponential ease-out per DESIGN.md: decisive, never bouncy
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`relative isolate overflow-hidden rounded-[28px] ${className}`}
      style={{
        background:
          "linear-gradient(158deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.022) 38%, rgba(255,255,255,0.008) 100%), rgba(10,10,10,0.42)",
        backdropFilter: "blur(26px) saturate(150%)",
        WebkitBackdropFilter: "blur(26px) saturate(150%)",
        boxShadow: [
          "0 40px 90px -32px rgba(0,0,0,0.85)",       // the panel floats
          "inset 0 1px 0 rgba(255,255,255,0.22)",     // lit top edge = thickness
          "inset 0 -1px 0 rgba(0,0,0,0.55)",          // dark bottom edge
          "inset 1px 0 0 rgba(255,255,255,0.06)",
          "inset -1px 0 0 rgba(255,255,255,0.04)",
          "0 0 0 1px rgba(255,255,255,0.055)",        // crisp outer rim
        ].join(", "),
      }}
    >
      {/* ribbed refraction: the fluted-glass look, done with gradients */}
      {fluted && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay"
          style={{
            background:
              "repeating-linear-gradient(96deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.015) 3px, rgba(0,0,0,0.06) 7px, rgba(255,255,255,0.10) 11px)",
          }}
        />
      )}

      {/* caustic rim bleed, tinted with the page's red accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{
          background:
            "radial-gradient(120% 80% at 12% 0%, rgba(229,25,42,0.15) 0%, transparent 46%), radial-gradient(100% 70% at 92% 100%, rgba(229,25,42,0.10) 0%, transparent 52%)",
        }}
      />

      {/* one specular sweep on entry: light travelling across a real surface */}
      {animate && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.11), transparent)",
          }}
          initial={{ x: "-40%", opacity: 0 }}
          animate={inView ? { x: "460%", opacity: [0, 1, 0] } : {}}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
