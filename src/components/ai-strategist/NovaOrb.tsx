"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ShaderMount,
  ShaderFitOptions,
  WarpPatterns,
  getShaderColorFromString,
  getShaderNoiseTexture,
  warpFragmentShader,
} from "@paper-design/shaders";
import VoiceVisualizer, { type VisualizerState } from "./VoiceVisualizer";
import NovaOrbGPU from "./NovaOrbGPU";

/* ─── NovaOrb — engine selector ───────────────────────────────────────
   Three tiers, in descending order of "alive":
     gpu   → NovaOrbGPU, the WebGPU ember-particle field (v3, showpiece)
     webgl → NovaOrbWebGL below, the warp-shader silk orb (v2, shipped,
             remains the permanent fallback for the ~15-25% of traffic
             without solid WebGPU support — not deprecated by v3)
     css   → VoiceVisualizer, the floor for reduced-motion / no WebGL

   Starts on "webgl" (never blank-frame while probing). Reads orb_engine
   from Agent Studio via /api/strategist/ui-config: "auto" probes
   navigator.gpu once on mount; an explicit tier forces it (Leon can drop
   to webgl/css live during a demo on flaky hardware without touching
   code). A WebGPU init failure or device.lost demotes to webgl for the
   rest of the session — NovaOrbGPU never shows its own fallback.
   ─────────────────────────────────────────────────────────────────── */

export interface NovaOrbProps {
  state: VisualizerState;
  inputAmplitude?: number;
  outputAmplitude?: number;
  inputAnalyser?: RefObject<AnalyserNode | null>;
  outputAnalyser?: RefObject<AnalyserNode | null>;
}

export default function NovaOrb({
  state,
  inputAmplitude = 0,
  outputAmplitude = 0,
  inputAnalyser,
  outputAnalyser,
}: NovaOrbProps) {
  const reduceMotion = useReducedMotion();
  const [engine, setEngine] = useState<"gpu" | "webgl" | "css">("webgl");
  const hasProbedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion || hasProbedRef.current) return;
    hasProbedRef.current = true;

    let cancelled = false;
    (async () => {
      let orbEngine = "auto";
      try {
        const res = await fetch("/api/strategist/ui-config");
        const data = await res.json();
        if (typeof data?.orb_engine === "string") orbEngine = data.orb_engine;
      } catch {
        // network hiccup — "auto" default still probes below
      }
      if (cancelled) return;

      if (orbEngine === "css") {
        setEngine("css");
        return;
      }
      if (orbEngine === "webgl") return; // already the default

      // "auto" or "webgpu": probe. A forced "webgpu" that fails still
      // falls back to webgl — never a blank orb over a config typo.
      const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
      if (!gpu) return;
      try {
        const adapter = await gpu.requestAdapter();
        if (!cancelled && adapter) setEngine("gpu");
      } catch {
        // stays webgl
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return <VoiceVisualizer state={state} inputAmplitude={inputAmplitude} outputAmplitude={outputAmplitude} />;
  }

  if (engine === "css") {
    return <VoiceVisualizer state={state} inputAmplitude={inputAmplitude} outputAmplitude={outputAmplitude} />;
  }

  if (engine === "gpu" && inputAnalyser && outputAnalyser) {
    return (
      <div className="relative w-[120px] h-[120px] flex items-center justify-center" aria-hidden>
        <div
          className="relative w-[110px] h-[110px] rounded-full overflow-hidden"
          style={{
            boxShadow:
              state === "speaking"
                ? "0 0 44px rgba(229,25,42,0.5), inset 0 1px 1px rgba(255,255,255,0.15)"
                : state === "listening"
                  ? "0 0 28px rgba(229,25,42,0.3), inset 0 1px 1px rgba(255,255,255,0.12)"
                  : "0 0 16px rgba(229,25,42,0.14), inset 0 1px 1px rgba(255,255,255,0.08)",
            transition: "box-shadow 500ms ease",
          }}
        >
          <NovaOrbGPU
            state={state}
            inputAnalyser={inputAnalyser}
            outputAnalyser={outputAnalyser}
            onFail={() => setEngine("webgl")}
          />
        </div>
      </div>
    );
  }

  return <NovaOrbWebGL state={state} inputAmplitude={inputAmplitude} outputAmplitude={outputAmplitude} />;
}

/* ─── NovaOrbWebGL — the living presence (v2, shipped) ────────────────
   WebGL silk orb (same warp shader family as V2Silk / liquid-metal
   button) whose motion is driven per-frame by the conversation state
   machine + real audio amplitude:

     idle      → slow dark breathing, barely alive
     listening → silk leans toward the user's voice (input amplitude)
     thinking  → tight fast inward churn — the latency window made
                 beautiful instead of dead
     speaking  → red surges with Nova's voice (output amplitude)

   State morphs are exponentially smoothed so transitions feel organic,
   never switched. Falls back to the CSS VoiceVisualizer under
   prefers-reduced-motion, missing WebGL, or shader init failure —
   same props, drop-in swap. Internals unchanged since Phase 2 — this is
   the permanent fallback tier, do not touch casually.
   ─────────────────────────────────────────────────────────────────── */

const ORB_COLORS = ["#0d0d0d", "#4a0d14", "#e5192a"].map((c) => getShaderColorFromString(c));

interface UniformTargets {
  speed: number;
  distortion: number;
  swirl: number;
  proportion: number;
  scale: number;
}

// Base character of each state — amplitude is layered on top per frame.
const STATE_TARGETS: Record<VisualizerState, UniformTargets> = {
  idle: { speed: 0.12, distortion: 0.32, swirl: 0.35, proportion: 0.38, scale: 1.0 },
  listening: { speed: 0.28, distortion: 0.42, swirl: 0.4, proportion: 0.46, scale: 1.0 },
  thinking: { speed: 0.95, distortion: 0.5, swirl: 0.9, proportion: 0.5, scale: 0.94 },
  speaking: { speed: 0.5, distortion: 0.48, swirl: 0.5, proportion: 0.52, scale: 1.0 },
};

interface NovaOrbWebGLProps {
  state: VisualizerState;
  inputAmplitude?: number;
  outputAmplitude?: number;
}

function NovaOrbWebGL({
  state,
  inputAmplitude = 0,
  outputAmplitude = 0,
}: NovaOrbWebGLProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<ShaderMount | null>(null);
  const reduceMotion = useReducedMotion();
  const [live, setLive] = useState(false);

  // Live values read by the rAF loop without re-running effects
  const stateRef = useRef(state);
  const inAmpRef = useRef(inputAmplitude);
  const outAmpRef = useRef(outputAmplitude);

  useEffect(() => {
    stateRef.current = state;
    inAmpRef.current = inputAmplitude;
    outAmpRef.current = outputAmplitude;
  }, [state, inputAmplitude, outputAmplitude]);

  useEffect(() => {
    const mount = mountRef.current;
    if (reduceMotion || !mount) return;

    let raf = 0;
    let cancelled = false;

    const init = (noiseTexture: ReturnType<typeof getShaderNoiseTexture>) => {
      if (cancelled) return;
      try {
        shaderRef.current = new ShaderMount(
          mount,
          warpFragmentShader,
          {
            u_colors: ORB_COLORS,
            u_colorsCount: ORB_COLORS.length,
            u_proportion: STATE_TARGETS.idle.proportion,
            u_softness: 1,
            u_shape: WarpPatterns.edge,
            u_shapeScale: 0.5,
            u_distortion: STATE_TARGETS.idle.distortion,
            u_swirl: STATE_TARGETS.idle.swirl,
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
          STATE_TARGETS.idle.speed,
        );
        setLive(true);

        // Current smoothed values, morphed toward the state's targets each
        // frame. k=0.07 ≈ organic ~350ms morph at 60fps; amplitude terms ride
        // on top unsmoothed (the analyser already smooths at 0.7).
        const current: UniformTargets = { ...STATE_TARGETS.idle };
        const K = 0.07;

        const tick = () => {
          const shader = shaderRef.current;
          if (!shader) return;
          const target = STATE_TARGETS[stateRef.current] ?? STATE_TARGETS.idle;
          current.speed += (target.speed - current.speed) * K;
          current.distortion += (target.distortion - current.distortion) * K;
          current.swirl += (target.swirl - current.swirl) * K;
          current.proportion += (target.proportion - current.proportion) * K;
          current.scale += (target.scale - current.scale) * K;

          // Voice rides the silk: user's voice pulls gently, Nova's pushes red.
          const inAmp = stateRef.current === "listening" ? inAmpRef.current : 0;
          const outAmp = stateRef.current === "speaking" ? outAmpRef.current : 0;

          shader.setUniforms({
            u_distortion: current.distortion + inAmp * 0.35 + outAmp * 0.5,
            u_swirl: current.swirl,
            u_proportion: Math.min(1, current.proportion + outAmp * 0.3),
            u_scale: current.scale + inAmp * 0.05 + outAmp * 0.08,
          });
          shader.setSpeed(current.speed + outAmp * 0.4);

          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (error) {
        console.error("NovaOrb: shader init failed, falling back to CSS orb", error);
        setLive(false);
      }
    };

    // The noise texture is an <img> that must be fully decoded before
    // ShaderMount will accept it (V2Silk sidesteps this via its in-view lazy
    // mount; we mount immediately, so wait for the load explicitly).
    const noise = getShaderNoiseTexture();
    if (noise?.complete && noise.naturalWidth > 0) {
      init(noise);
    } else if (noise) {
      noise.addEventListener("load", () => init(noise), { once: true });
      noise.addEventListener(
        "error",
        () => {
          console.error("NovaOrb: noise texture failed to load, falling back to CSS orb");
          setLive(false);
        },
        { once: true },
      );
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
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
  }, [reduceMotion]);

  // Reduced motion → CSS orb outright. Shader init failure / no WebGL is
  // covered below: the CSS orb renders inside the mount until `live`.
  if (reduceMotion) {
    return (
      <VoiceVisualizer
        state={state}
        inputAmplitude={inputAmplitude}
        outputAmplitude={outputAmplitude}
      />
    );
  }

  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center" aria-hidden>
      {/* Shader orb, circular-masked with a soft vignette edge */}
      <div
        className="relative w-[110px] h-[110px] rounded-full overflow-hidden"
        style={{
          boxShadow:
            state === "speaking"
              ? "0 0 44px rgba(229,25,42,0.5), inset 0 1px 1px rgba(255,255,255,0.15)"
              : state === "listening"
                ? "0 0 28px rgba(229,25,42,0.3), inset 0 1px 1px rgba(255,255,255,0.12)"
                : "0 0 16px rgba(229,25,42,0.14), inset 0 1px 1px rgba(255,255,255,0.08)",
          transition: "box-shadow 500ms ease",
        }}
      >
        <div ref={mountRef} className="absolute inset-0" />
        {/* CSS orb shows through until (or if) the shader goes live */}
        {!live && (
          <div className="absolute inset-0 flex items-center justify-center">
            <VoiceVisualizer
              state={state}
              inputAmplitude={inputAmplitude}
              outputAmplitude={outputAmplitude}
            />
          </div>
        )}
        {/* Soft edge vignette so the silk melts into the panel */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 88%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        {/* Specular highlight — keeps the glassy identity of the CSS orb */}
        <div
          className="absolute top-[8%] left-[16%] w-[42%] h-[30%] rounded-full opacity-50 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(5px)",
          }}
        />
      </div>
    </div>
  );
}
