"use client";

/**
 * Lateral pillar reveal. Front visual + a slower gradient brand-form behind it,
 * the two entering from `side` at DIFFERENT speeds (multi-speed parallax →
 * "rising depth"). Text fades only — no slide. `climax` gives the final pillar
 * a touch more travel + scale. Reduced-motion: everything static, in place.
 *
 * Transform + opacity only. Placeholder visuals are CSS gradients.
 * // TODO: swap asset — replace the gradient front/back with real media.
 */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const EXPO = { stiffness: 90, damping: 26, mass: 0.7 };

export interface LateralFeatureProps {
  eyebrow: string;
  title: string;
  body: string;
  side: "left" | "right";
  /** garnet/ember/gold tint anchor for the brand-form glow */
  tint?: string;
  climax?: boolean;
}

export default function LateralFeature({
  eyebrow,
  title,
  body,
  side,
  tint = "#E5462A",
  climax = false,
}: LateralFeatureProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const dir = side === "right" ? 1 : -1;
  const frontTravel = (climax ? 220 : 160) * dir;
  const backTravel = (climax ? 120 : 90) * dir; // slower → smaller travel = depth offset

  const frontX = useSpring(useTransform(scrollYProgress, [0, 1], [frontTravel, 0]), EXPO);
  const backX = useSpring(useTransform(scrollYProgress, [0, 1], [backTravel, 0]), EXPO);
  const frontScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [climax ? 0.86 : 0.92, 1]),
    EXPO,
  );
  const fade = useSpring(useTransform(scrollYProgress, [0, 0.6], [0, 1]), EXPO);

  // text on the opposite side of the visual
  const textFirst = side === "right";

  const visual = (
    <div className="relative flex-1">
      {/* behind brand-form (slower) */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { x: backX, opacity: fade }}
        className="pointer-events-none absolute -inset-6 -z-[1] rounded-[2rem] blur-[2px]"
      >
        <div
          className="h-full w-full rounded-[2rem]"
          style={{
            background: `radial-gradient(120% 120% at ${side === "right" ? "80%" : "20%"} 30%, ${tint}55 0%, ${tint}18 45%, transparent 75%)`,
          }}
        />
      </motion.div>

      {/* front visual (faster) */}
      <motion.div
        style={reduce ? undefined : { x: frontX, scale: frontScale, opacity: fade }}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-white/10"
      >
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(135deg, ${tint} 0%, #7B1E22 55%, #1a0608 100%)`,
            willChange: "transform",
          }}
        />
        {/* soft sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5" />
      </motion.div>
    </div>
  );

  const text = (
    <motion.div
      style={reduce ? undefined : { opacity: fade }}
      className="flex-1"
    >
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-red">
        {eyebrow}
      </p>
      <h3
        className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-text-dark-primary"
        style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", letterSpacing: "-0.03em" }}
      >
        {title}
      </h3>
      <p className="mt-6 max-w-[46ch] font-body text-[16px] leading-[1.65] text-text-dark-primary/75 md:text-[18px]">
        {body}
      </p>
    </motion.div>
  );

  return (
    <section
      ref={ref}
      className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-6 py-[14vh] md:flex-row md:gap-16"
    >
      {textFirst ? (
        <>
          {text}
          {visual}
        </>
      ) : (
        <>
          {visual}
          {text}
        </>
      )}
    </section>
  );
}
