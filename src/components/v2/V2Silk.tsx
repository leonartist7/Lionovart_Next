"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  ShaderMount,
  ShaderFitOptions,
  WarpPatterns,
  getShaderColorFromString,
  getShaderNoiseTexture,
  warpFragmentShader,
} from "@paper-design/shaders";

/* ─── V2Silk — the one signature real-time layer ─────────────────────
   Slow red silk/smoke energy on dark, built on the warp shader already
   used elsewhere in this repo (liquid-metal-button.tsx). Reserved for
   Chapter 4's portal moment and Chapter 10's backdrop only — do not
   reuse it decoratively; one real-time moment, everything else calm.

   Lazy-mounts only once in view, disposes fully off-screen, and falls
   back to a static poster under prefers-reduced-motion, missing WebGL,
   or any shader init failure. Public API (the `className` prop) must
   stay stable if the implementation ever swaps to a video loop.
   ─────────────────────────────────────────────────────────────────── */

const SILK_COLORS = ["#0d0d0d", "#4a0d14", "#e5192a"].map((c) => getShaderColorFromString(c));

export default function V2Silk({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<ShaderMount | null>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(wrapRef, { margin: "200px" });
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (reduceMotion || !isInView || !mountRef.current) return;

    try {
      shaderRef.current = new ShaderMount(
        mountRef.current,
        warpFragmentShader,
        {
          u_colors: SILK_COLORS,
          u_colorsCount: SILK_COLORS.length,
          u_proportion: 0.5,
          u_softness: 1,
          u_shape: WarpPatterns.edge,
          u_shapeScale: 0.4,
          u_distortion: 0.55,
          u_swirl: 0.45,
          u_swirlIterations: 6,
          u_noiseTexture: getShaderNoiseTexture(),
          u_fit: ShaderFitOptions.cover,
          u_scale: 1,
          u_rotation: 0,
          u_originX: 0.5,
          u_originY: 0.5,
          u_offsetX: 0,
          u_offsetY: 0,
          u_worldWidth: 0,
          u_worldHeight: 0,
        },
        undefined,
        0.15
      );
      setLive(true);
    } catch (error) {
      console.error("V2Silk: shader init failed, falling back to the static poster", error);
      setLive(false);
    }

    return () => {
      const canvas = mountRef.current?.querySelector("canvas");
      shaderRef.current?.dispose();
      shaderRef.current = null;
      if (canvas) {
        const gl = (canvas.getContext("webgl2") ||
          canvas.getContext("webgl")) as WebGLRenderingContext | null;
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      }
      setLive(false);
    };
  }, [reduceMotion, isInView]);

  return (
    <div ref={wrapRef} aria-hidden className={`pointer-events-none relative ${className}`}>
      <div ref={mountRef} className="absolute inset-0" />
      <Image
        src="/images/hero_img/1231234.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover transition-opacity duration-700"
        style={{ opacity: live ? 0 : 1 }}
      />
    </div>
  );
}
