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

/**
 * Contract: `className` MUST establish this element's own position
 * (`absolute inset-0`, `relative w-56 h-56`, etc.) — same convention as
 * next/image's `fill`. The wrapper does not default to `relative`
 * itself; hardcoding that here previously conflicted with callers
 * passing `absolute`, since both target the `position` property and
 * the cascade winner between two same-specificity Tailwind utilities
 * is undefined by class order alone. Caught wiring this into Chapter 4.
 */
export default function V2Silk({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<ShaderMount | null>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(wrapRef, { margin: "200px" });
  const [live, setLive] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (reduceMotion || !isInView || !mount) return;

    let cancelled = false;

    function mountShader(mountElement: HTMLDivElement, noiseTexture?: HTMLImageElement) {
      if (cancelled) return;
      try {
        shaderRef.current = new ShaderMount(
          mountElement,
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
            u_noiseTexture: noiseTexture,
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
          0.15,
          undefined,
          // minPixelRatio: this defaults to 2 (retina-quality). This is
          // a soft, blurred ambient layer, not a detail shot — capping
          // at 1x cuts fragment-shader cost up to 4x on real high-DPI
          // screens (3x on many phones) with no perceptible fidelity
          // loss, and meaningfully lowers risk on lower-end mobile GPUs.
          1
        );
        setLive(true);
      } catch (error) {
        console.error("V2Silk: shader init failed, falling back to the static poster", error);
        setLive(false);
      }
    }

    // getShaderNoiseTexture() returns an <img> set to a data: URI.
    // ShaderMount requires `image.complete && naturalWidth !== 0` when
    // it binds the texture, but `.complete` can read true for a data
    // URI before decode has actually finished populating naturalWidth
    // (a real browser timing quirk, not IntersectionObserver lag —
    // caught wiring V2Silk into Chapter 4, .complete alone wasn't
    // enough). `decode()` is the correct API: it resolves only once
    // the image is genuinely safe to use as a paint/texture source.
    const noiseTexture = getShaderNoiseTexture();
    if (!noiseTexture) {
      mountShader(mount, undefined);
    } else if (typeof noiseTexture.decode === "function") {
      noiseTexture
        .decode()
        .then(() => mountShader(mount, noiseTexture))
        .catch(() => mountShader(mount, undefined));
    } else if (noiseTexture.complete) {
      mountShader(mount, noiseTexture);
    } else {
      noiseTexture.addEventListener("load", () => mountShader(mount, noiseTexture), { once: true });
      noiseTexture.addEventListener("error", () => mountShader(mount, undefined), { once: true });
    }

    return () => {
      cancelled = true;
      const canvas = mount.querySelector("canvas");
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
    <div ref={wrapRef} aria-hidden className={`pointer-events-none ${className}`}>
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
