"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  getShaderColorFromString,
  meshGradientFragmentShader,
  ShaderFitOptions,
  ShaderMount,
} from "@paper-design/shaders";

const COLORS = ["#f4efe6", "#ebe1d2", "#f7f2e9", "#e7b8ad"].map((color) =>
  getShaderColorFromString(color),
);
const MAX_PIXEL_COUNT = 900_000;
const SHADER_SPEED = 0.055;

/** A restrained, low-resolution living paper surface for the partnership scene. */
const StrongTogetherShader = memo(function StrongTogetherShader() {
  const mountRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<ShaderMount | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const isInView = useInView(mountRef, { margin: "160px" });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || reduceMotion || !isInView) return;

    try {
      const shader = new ShaderMount(
        mount,
        meshGradientFragmentShader,
        {
          u_colors: COLORS,
          u_colorsCount: COLORS.length,
          u_distortion: 0.32,
          u_swirl: 0.14,
          u_grainMixer: 0.12,
          u_grainOverlay: 0.035,
          u_fit: ShaderFitOptions.cover,
          u_scale: 1.15,
          u_rotation: 0,
          u_originX: 0.5,
          u_originY: 0.5,
          u_offsetX: 0,
          u_offsetY: 0,
          u_worldWidth: 0,
          u_worldHeight: 0,
        },
        { alpha: false, antialias: false },
        0,
        0,
        1,
        MAX_PIXEL_COUNT,
      );

      shaderRef.current = shader;
      setIsLive(true);

      return () => {
        shader.dispose();
        shaderRef.current = null;
        mount.removeAttribute("data-paper-shader");
        setIsLive(false);
      };
    } catch {
      // The warm CSS poster remains when WebGL is unavailable.
      setIsLive(false);
    }
  }, [isInView, reduceMotion]);

  useEffect(() => {
    shaderRef.current?.setSpeed(isInView && !reduceMotion ? SHADER_SPEED : 0);
  }, [isInView, isLive, reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#f4efe6]"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(229,25,42,0.09),transparent_42%),linear-gradient(135deg,#f4efe6_0%,#ebe1d2_48%,#f7f2e9_100%)]"
      />
      <div
        ref={mountRef}
        className={`absolute inset-0 transition-opacity duration-700 ${
          isLive ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
});

export default StrongTogetherShader;
