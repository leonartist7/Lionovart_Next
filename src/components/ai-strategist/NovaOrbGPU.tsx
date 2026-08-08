"use client";

import { useEffect, useRef, type RefObject } from "react";
import { NOVA_ORB_COMPUTE_WGSL, NOVA_ORB_RENDER_WGSL } from "./nova-orb-gpu.wgsl";
import type { VisualizerState } from "./VoiceVisualizer";

/* ─── NovaOrbGPU — "ember-lion" particle presence ────────────────────
   The WebGPU tier. Assumes WebGPU works: any init failure or device.lost
   calls onFail() and renders nothing — NovaOrb.tsx (the engine selector)
   owns the fallback to the WebGL silk tier. This component never shows
   its own fallback.

   No @webgpu/types dependency (repo rule: no new deps) — GPU objects are
   typed loosely and isolated to this file via the GPUAny alias below.
   ───────────────────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUAny = any;

const PARTICLE_COUNT = 24_576; // 96 workgroups × 256 — divisible, a cleaner/less noisy ring
const PARTICLE_FLOATS = 8; // pos.xy, vel.xy, age, ttl, heat, seed = 32 bytes
const WORKGROUP_SIZE = 256;
const UNIFORM_FLOATS = 12; // dt, time, canvasPx.xy, 4 state weights, amp, attack, lowBand, highBand
const K = 0.07; // state-weight lerp constant — matches the WebGL orb exactly, transitions never pop
const DPR_CAP = 2;
const MOUNT_PX = 110; // matches the WebGL orb's mount wrapper size

// WebGPU buffer-usage flags. No @webgpu/types dep (repo rule: no new deps),
// so no GPUBufferUsage global is declared at the type level — these are the
// stable numeric values from the WebGPU spec, not runtime-dependent.
const BUFFER_USAGE_STORAGE = 0x0080;
const BUFFER_USAGE_UNIFORM = 0x0040;
const BUFFER_USAGE_COPY_DST = 0x0008;

type StateWeights = { idle: number; listen: number; think: number; speak: number };
const STATE_TARGETS: Record<VisualizerState, StateWeights> = {
  idle: { idle: 1, listen: 0, think: 0, speak: 0 },
  listening: { idle: 0, listen: 1, think: 0, speak: 0 },
  thinking: { idle: 0, listen: 0, think: 1, speak: 0 },
  speaking: { idle: 0, listen: 0, think: 0, speak: 1 },
};

interface AudioFeatures {
  amp: number;
  attack: number;
  lowBand: number;
  highBand: number;
}

/** Reads frequency data from an analyser and derives amp/attack/band features. */
function makeFeatureExtractor() {
  let ema = 0;
  const buf = new Uint8Array(128); // fftSize 256 → 128 bins
  return function extract(analyser: AnalyserNode | null): AudioFeatures {
    if (!analyser) return { amp: 0, attack: 0, lowBand: 0, highBand: 0 };
    analyser.getByteFrequencyData(buf as Uint8Array<ArrayBuffer>);
    let sum = 0;
    let low = 0;
    let high = 0;
    for (let i = 0; i < buf.length; i++) {
      sum += buf[i];
      if (i >= 1 && i <= 8) low += buf[i];
      if (i >= 40 && i <= 100) high += buf[i];
    }
    const amp = sum / buf.length / 255;
    low = low / 8 / 255;
    high = high / 61 / 255;
    ema += 0.3 * (amp - ema);
    const attack = Math.max(0, amp - ema);
    return { amp, attack, lowBand: low, highBand: high };
  };
}

export interface NovaOrbGPUProps {
  state: VisualizerState;
  inputAnalyser: RefObject<AnalyserNode | null>;
  outputAnalyser: RefObject<AnalyserNode | null>;
  onFail: () => void;
}

export default function NovaOrbGPU({ state, inputAnalyser, outputAnalyser, onFail }: NovaOrbGPUProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read by the rAF loop, not by render — synced via effect (not a plain
  // render-body assignment) so state/onFail changes never re-trigger the
  // GPU-init effect below, which must run exactly once per mount.
  const stateRef = useRef(state);
  const onFailRef = useRef(onFail);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    onFailRef.current = onFail;
  }, [onFail]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gpu = (navigator as Navigator & { gpu?: GPUAny }).gpu;
    if (!canvas || !gpu) {
      onFailRef.current();
      return;
    }

    let cancelled = false;
    let raf = 0;
    let device: GPUAny = null;
    let context: GPUAny = null;

    const listenExtract = makeFeatureExtractor();
    const speakExtract = makeFeatureExtractor();

    async function init() {
      const adapter = await gpu.requestAdapter();
      if (!adapter) throw new Error("No WebGPU adapter");
      device = await adapter.requestDevice();
      if (cancelled) return;
      device.lost.then(() => {
        if (!cancelled) onFailRef.current();
      });

      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const px = Math.round(MOUNT_PX * dpr);
      canvas!.width = px;
      canvas!.height = px;

      context = canvas!.getContext("webgpu") as GPUAny;
      if (!context) throw new Error("Failed to acquire webgpu context");
      const format = gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "premultiplied" });

      // ── Buffers ──────────────────────────────────────────────────
      const particleBufSize = PARTICLE_COUNT * PARTICLE_FLOATS * 4;
      const zeroInit = new Float32Array(PARTICLE_COUNT * PARTICLE_FLOATS); // age=0,ttl=0 → every particle respawns on frame 1
      const bufA = device.createBuffer({
        size: particleBufSize,
        usage: BUFFER_USAGE_STORAGE | BUFFER_USAGE_COPY_DST,
      });
      const bufB = device.createBuffer({
        size: particleBufSize,
        usage: BUFFER_USAGE_STORAGE | BUFFER_USAGE_COPY_DST,
      });
      device.queue.writeBuffer(bufA, 0, zeroInit);
      device.queue.writeBuffer(bufB, 0, zeroInit);

      const uniformBuf = device.createBuffer({
        size: UNIFORM_FLOATS * 4,
        usage: BUFFER_USAGE_UNIFORM | BUFFER_USAGE_COPY_DST,
      });

      // ── Pipelines ────────────────────────────────────────────────
      const computeModule = device.createShaderModule({ code: NOVA_ORB_COMPUTE_WGSL });
      const renderModule = device.createShaderModule({ code: NOVA_ORB_RENDER_WGSL });

      const computePipeline = device.createComputePipeline({
        layout: "auto",
        compute: { module: computeModule, entryPoint: "cs_main" },
      });
      const renderPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: renderModule, entryPoint: "vs_main", buffers: [] },
        fragment: {
          module: renderModule,
          entryPoint: "fs_main",
          targets: [
            {
              format,
              blend: {
                color: { srcFactor: "one", dstFactor: "one", operation: "add" },
                alpha: { srcFactor: "one", dstFactor: "one", operation: "add" },
              },
            },
          ],
        },
        primitive: { topology: "triangle-list" },
      });

      // Ping-pong: compute[0] reads A writes B, compute[1] reads B writes A.
      // Render[0] reads B (just written by compute[0]), render[1] reads A.
      const computeBindGroups = [
        device.createBindGroup({
          layout: computePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: bufA } },
            { binding: 1, resource: { buffer: bufB } },
            { binding: 2, resource: { buffer: uniformBuf } },
          ],
        }),
        device.createBindGroup({
          layout: computePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: bufB } },
            { binding: 1, resource: { buffer: bufA } },
            { binding: 2, resource: { buffer: uniformBuf } },
          ],
        }),
      ];
      const renderBindGroups = [
        device.createBindGroup({
          layout: renderPipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: bufB } },
            { binding: 1, resource: { buffer: uniformBuf } },
          ],
        }),
        device.createBindGroup({
          layout: renderPipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: bufA } },
            { binding: 1, resource: { buffer: uniformBuf } },
          ],
        }),
      ];

      // ── Loop ─────────────────────────────────────────────────────
      let ping = 0; // which compute/render pair to use this frame
      const weights: StateWeights = { idle: 1, listen: 0, think: 0, speak: 0 };
      const uniformData = new Float32Array(UNIFORM_FLOATS);
      let lastT = performance.now();
      const startT = lastT;

      const tick = () => {
        if (cancelled) return;
        if (document.hidden) {
          raf = requestAnimationFrame(tick);
          return;
        }

        const now = performance.now();
        const dt = Math.min((now - lastT) / 1000, 1 / 30); // clamp — avoid huge steps after a tab-switch pause
        lastT = now;
        const time = (now - startT) / 1000;

        const target = STATE_TARGETS[stateRef.current] ?? STATE_TARGETS.idle;
        weights.idle += (target.idle - weights.idle) * K;
        weights.listen += (target.listen - weights.listen) * K;
        weights.think += (target.think - weights.think) * K;
        weights.speak += (target.speak - weights.speak) * K;

        const isListening = stateRef.current === "listening";
        const isSpeaking = stateRef.current === "speaking";
        const audio = isSpeaking
          ? speakExtract(outputAnalyser.current)
          : isListening
            ? listenExtract(inputAnalyser.current)
            : { amp: 0, attack: 0, lowBand: 0, highBand: 0 };

        uniformData[0] = dt;
        uniformData[1] = time;
        uniformData[2] = canvas!.width;
        uniformData[3] = canvas!.height;
        uniformData[4] = weights.idle;
        uniformData[5] = weights.listen;
        uniformData[6] = weights.think;
        uniformData[7] = weights.speak;
        uniformData[8] = audio.amp;
        uniformData[9] = audio.attack;
        uniformData[10] = audio.lowBand;
        uniformData[11] = audio.highBand;
        device.queue.writeBuffer(uniformBuf, 0, uniformData);

        const encoder = device.createCommandEncoder();

        const computePass = encoder.beginComputePass();
        computePass.setPipeline(computePipeline);
        computePass.setBindGroup(0, computeBindGroups[ping]);
        computePass.dispatchWorkgroups(PARTICLE_COUNT / WORKGROUP_SIZE);
        computePass.end();

        const view = context.getCurrentTexture().createView();
        const renderPass = encoder.beginRenderPass({
          colorAttachments: [
            { view, clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: "clear", storeOp: "store" },
          ],
        });
        renderPass.setPipeline(renderPipeline);
        renderPass.setBindGroup(0, renderBindGroups[ping]);
        renderPass.draw(6, PARTICLE_COUNT);
        renderPass.end();

        device.queue.submit([encoder.finish()]);
        ping = 1 - ping;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    init().catch((err) => {
      console.error("NovaOrbGPU: init failed, demoting to WebGL", err);
      if (!cancelled) onFailRef.current();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      try {
        device?.destroy?.();
      } catch {
        // already lost/destroyed — fine
      }
    };
  }, [inputAnalyser, outputAnalyser]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
