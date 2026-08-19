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

import { useId, useRef, type ReactNode } from "react";
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
  /** Skip the entry sweep for panels that are already in view on load. */
  still?: boolean;
}

export function LiquidGlass({ children, className = "", still = false }: LiquidGlassProps) {
  const ref = useRef<HTMLDivElement>(null);
  const distortionId = useId().replace(/:/g, "");
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
          "linear-gradient(158deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.024) 42%, rgba(255,255,255,0.008) 100%), rgba(10,10,10,0.30)",
        // Roughly 10% of the original 26px treatment: enough refraction to
        // read as glass, while keeping the particle field sharply visible.
        backdropFilter: "blur(3px) saturate(120%)",
        WebkitBackdropFilter: "blur(3px) saturate(120%)",
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
      {/* A displaced highlight layer, not a second blur pass. The turbulence
          only distorts this prismatic reflection, giving the panel the slight
          chromatic wobble of liquid glass without fogging its contents. */}
      <svg aria-hidden className="absolute h-0 w-0">
        <defs>
          <filter id={distortionId} x="-12%" y="-12%" width="124%" height="124%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014 0.032"
              numOctaves="2"
              seed="8"
              result="liquid-noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="liquid-noise"
              scale="13"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 opacity-80 mix-blend-screen"
        style={{
          filter: `url(#${distortionId})`,
          background:
            "radial-gradient(54% 46% at 14% 8%, rgba(178,230,255,0.16) 0%, transparent 70%), radial-gradient(52% 42% at 88% 90%, rgba(209,190,255,0.11) 0%, transparent 70%), linear-gradient(122deg, transparent 28%, rgba(255,255,255,0.10) 48%, transparent 68%)",
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
