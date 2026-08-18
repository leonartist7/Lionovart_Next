"use client";

import {
  getShaderNoiseTexture,
  pulsingBorderFragmentShader,
  ShaderFitOptions,
  ShaderMount,
} from "@paper-design/shaders";
import { useInView, useReducedMotion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";

const FOIL_SPEED = 0.045;
const MAX_PIXEL_COUNT = 900_000;

interface SovereignFoilContourProps {
  active: boolean;
}

export const SovereignFoilContour = memo(function SovereignFoilContour({
  active,
}: SovereignFoilContourProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<ShaderMount | null>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(mountRef, { margin: "180px" });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (reduceMotion || !mountRef.current) return;

    let cancelled = false;
    const noiseTexture = getShaderNoiseTexture();
    const mountElement = mountRef.current;

    if (!noiseTexture) return;

    const initializeShader = () => {
      if (cancelled) return;

      try {
        const shader = new ShaderMount(
          mountElement,
          pulsingBorderFragmentShader,
          {
            u_colorBack: [0, 0, 0, 0],
            u_colors: [[1, 0.95, 0.65, 1]],
            u_colorsCount: 1,
            u_roundness: 0.18,
            u_thickness: 0.04,
            u_marginLeft: 0.008,
            u_marginRight: 0.008,
            u_marginTop: 0.008,
            u_marginBottom: 0.008,
            u_aspectRatio: 0,
            u_softness: 0.12,
            u_intensity: 0.48,
            u_bloom: 0.02,
            u_spots: 1,
            u_spotSize: 0.18,
            u_pulse: 0,
            u_smoke: 0,
            u_smokeSize: 0,
            u_noiseTexture: noiseTexture,
            u_fit: ShaderFitOptions.none,
            u_scale: 1,
            u_rotation: 0,
            u_originX: 0.5,
            u_originY: 0.5,
            u_offsetX: 0,
            u_offsetY: 0,
            u_worldWidth: 0,
            u_worldHeight: 0,
          },
          {
            alpha: true,
            antialias: true,
            premultipliedAlpha: true,
          },
          0,
          0,
          1,
          MAX_PIXEL_COUNT,
        );

        if (cancelled) {
          shader.dispose();
          return;
        }

        shaderRef.current = shader;
        setIsLive(true);
      } catch {
        // The engraved CSS frame remains visible when WebGL is unavailable.
      }
    };

    if (noiseTexture.complete && noiseTexture.naturalWidth > 0) {
      initializeShader();
    } else {
      noiseTexture.addEventListener("load", initializeShader, { once: true });
    }

    return () => {
      cancelled = true;
      noiseTexture.removeEventListener("load", initializeShader);
      shaderRef.current?.dispose();
      shaderRef.current = null;
      mountElement.removeAttribute("data-paper-shader");
    };
  }, [reduceMotion]);

  useEffect(() => {
    shaderRef.current?.setSpeed(active && isInView && !reduceMotion ? FOIL_SPEED : 0);
  }, [active, isInView, isLive, reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px] md:rounded-[24px]"
    >
      <div
        className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,248,196,0.9),inset_0_-1px_0_rgba(113,73,0,0.5)]"
        style={{
          background:
            "linear-gradient(135deg, #765000 0%, #c99808 18%, #f0c917 34%, #fff1a6 48%, #b37e00 68%, #f0c917 84%, #8d6100 100%)",
        }}
      />

      <div
        ref={mountRef}
        className={`absolute inset-0 z-[1] rounded-[inherit] transition-opacity duration-500 ${
          isLive ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="absolute inset-[4px] z-[2] rounded-[16px] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(112,74,0,0.12)] md:rounded-[20px]" />
    </div>
  );
});

