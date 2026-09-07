"use client";

/**
 * ParticleField — 1M-particle WebGPU showcase.
 * ------------------------------------------------
 * Self-contained GPU engine modeled on the LIONOVART NovaOrbGPU tier
 * (same GPUAny typing, cancelled-flag lifecycle, ping-pong uniform writes),
 * scaled to 1,048,576 particles with:
 *
 *   - divergence-free 3D curl-noise wind (WGSL simplex field)
 *   - damped-spring morphing between 3 GPU-generated target shapes
 *     (dense sphere / 3-arm spiral galaxy / free chaos)
 *   - 3D pointer force-field (ray-plane pick, repel / attract)
 *   - HDR velocity-graded additive sprites, half-res bloom + ACES composite
 *
 * Zero particle iteration on the CPU: init, physics and morphing all run as
 * compute dispatches. The CPU only writes small uniform buffers per frame.
 *
 * If WebGPU is unavailable the component renders a graceful fallback card.
 */

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { INIT_WGSL, SIM_WGSL, RENDER_WGSL, POST_WGSL } from "./particle-field.wgsl";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUAny = any;

const PARTICLE_COUNT = 1_048_576; // 16384 workgroups × 64 — exactly 1M
const PARTICLE_FLOATS = 8; // pos vec4 (xyz + seed) | vel vec4 (xyz + |v|)
const WORKGROUP_SIZE = 64;
const DPR_CAP = 2;
const BLOOM_SCALE = 0.5; // half-res bloom chain
const DEG = Math.PI / 180;

// WebGPU buffer/texture usage flags — stable values from the WebGPU spec
// (repo rule: no @webgpu/types dep, so these aren't typed globally).
const BUFFER_USAGE_STORAGE = 0x0080;
const BUFFER_USAGE_UNIFORM = 0x0040;
const BUFFER_USAGE_COPY_DST = 0x0008;
const TEXTURE_USAGE_RENDER_ATTACHMENT = 0x10;
const TEXTURE_USAGE_TEXTURE_BINDING = 0x04;

const CAM_RADIUS = 36;
const FOV = 60 * DEG;

const SHAPES = [
  { id: 0, label: "01 · Sphere" },
  { id: 1, label: "02 · Galaxy" },
  { id: 2, label: "03 · Chaos" },
] as const;

/* ── Minimal mat4 helpers (only run once per frame, on 16 floats) ───────── */

function perspective(out: Float32Array, fov: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
}

function lookAt(out: Float32Array, eye: number[], c: number[], up: number[]) {
  let zx = eye[0] - c[0];
  let zy = eye[1] - c[1];
  let zz = eye[2] - c[2];
  const zl = Math.hypot(zx, zy, zz) || 1;
  zx /= zl; zy /= zl; zz /= zl;
  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  const xl = Math.hypot(xx, xy, xz) || 1;
  xx /= xl; xy /= xl; xz /= xl;
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
  out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
  out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;
}

function mulMat4(out: Float32Array, a: Float32Array, b: Float32Array) {
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
    out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Refs read by the rAF loop — React state never drives the GPU frame.
  const settingsRef = useRef({
    wind: 2.4,
    mouseRadius: 10,
    mouseStrength: 55,
  });
  const mouseRef = useRef({ ndcX: 0, ndcY: 0, mode: 0 }); // mode: 0 off, 1 repel, -1 attract
  const morphRef = useRef({ from: 0, to: 0, t: 1 }); // t = eased progress 0→1
  const camRef = useRef({ yaw: 0.5, pitch: 0.18, auto: true });

  const [supported, setSupported] = useState(true);
  const [fps, setFps] = useState(0);
  const [shape, setShape] = useState(0);
  const [wind, setWind] = useState(settingsRef.current.wind);
  const [radius, setRadius] = useState(settingsRef.current.mouseRadius);

  const requestShape = useCallback((next: number) => {
    morphRef.current = { from: morphRef.current.to, to: next, t: 0 };
    setShape(next);
  }, []);

  const onWind = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    settingsRef.current.wind = v;
    setWind(v);
  }, []);

  const onRadius = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    settingsRef.current.mouseRadius = v;
    setRadius(v);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gpu = (navigator as Navigator & { gpu?: GPUAny }).gpu;
    if (!canvas || !gpu) {
      setSupported(false);
      return;
    }

    let cancelled = false;
    let raf = 0;
    let device: GPUAny = null;
    let context: GPUAny = null;
    let sceneTex: GPUAny = null;
    let bloomA: GPUAny = null;
    let bloomB: GPUAny = null;

    /* ── Pointer → NDC + orbit ────────────────────────────────────── */
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.ndcX = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouseRef.current.ndcY = -(((e.clientY - r.top) / r.height) * 2 - 1);
      if (e.buttons === 1 && camRef.current.auto) {
        // dragging also orbits the camera gently
        camRef.current.yaw += e.movementX * 0.004;
        camRef.current.pitch = Math.min(
          1.2,
          Math.max(-1.2, camRef.current.pitch - e.movementY * 0.004),
        );
      }
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      mouseRef.current.mode = e.shiftKey || e.button === 2 ? -1 : 1;
      camRef.current.auto = false;
    };
    const onUp = () => {
      mouseRef.current.mode = 0;
      camRef.current.auto = true;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    async function init() {
      const adapter = await gpu.requestAdapter();
      if (!adapter) throw new Error("No WebGPU adapter");
      device = await adapter.requestDevice();
      if (cancelled) return;
      device.lost.then(() => {
        if (!cancelled) setSupported(false);
      });

      context = canvas!.getContext("webgpu") as GPUAny;
      if (!context) throw new Error("Failed to acquire webgpu context");
      const format = gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "premultiplied" });

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
        canvas!.width = Math.max(2, Math.round(canvas!.clientWidth * dpr));
        canvas!.height = Math.max(2, Math.round(canvas!.clientHeight * dpr));
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas!);

      /* ── Buffers ──────────────────────────────────────────────── */
      const particleBuf = device.createBuffer({
        size: PARTICLE_COUNT * PARTICLE_FLOATS * 4,
        usage: BUFFER_USAGE_STORAGE | BUFFER_USAGE_COPY_DST,
      });
      const target0 = device.createBuffer({
        size: PARTICLE_COUNT * 16,
        usage: BUFFER_USAGE_STORAGE,
      });
      const target1 = device.createBuffer({
        size: PARTICLE_COUNT * 16,
        usage: BUFFER_USAGE_STORAGE,
      });
      const target2 = device.createBuffer({
        size: PARTICLE_COUNT * 16,
        usage: BUFFER_USAGE_STORAGE,
      });
      const initU = device.createBuffer({ size: 16, usage: BUFFER_USAGE_UNIFORM | BUFFER_USAGE_COPY_DST });
      const simU = device.createBuffer({ size: 80, usage: BUFFER_USAGE_UNIFORM | BUFFER_USAGE_COPY_DST });
      const camU = device.createBuffer({ size: 96, usage: BUFFER_USAGE_UNIFORM | BUFFER_USAGE_COPY_DST });
      const postU = device.createBuffer({ size: 32, usage: BUFFER_USAGE_UNIFORM | BUFFER_USAGE_COPY_DST });

      /* ── Pipelines ────────────────────────────────────────────── */
      const initModule = device.createShaderModule({ code: INIT_WGSL });
      const simModule = device.createShaderModule({ code: SIM_WGSL });
      const renderModule = device.createShaderModule({ code: RENDER_WGSL });
      const postModule = device.createShaderModule({ code: POST_WGSL });

      const initPipeline = device.createComputePipeline({
        layout: "auto",
        compute: { module: initModule, entryPoint: "cs_main" },
      });
      const simPipeline = device.createComputePipeline({
        layout: "auto",
        compute: { module: simModule, entryPoint: "cs_main" },
      });
      const renderPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: renderModule, entryPoint: "vs_main", buffers: [] },
        fragment: {
          module: renderModule,
          entryPoint: "fs_main",
          targets: [
            {
              format: "rgba16float",
              blend: {
                color: { srcFactor: "one", dstFactor: "one", operation: "add" },
                alpha: { srcFactor: "one", dstFactor: "one", operation: "add" },
              },
            },
          ],
        },
        primitive: { topology: "triangle-list" },
      });
      const brightPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: postModule, entryPoint: "vs_full" },
        fragment: { module: postModule, entryPoint: "fs_bright", targets: [{ format: "rgba16float" }] },
        primitive: { topology: "triangle-list" },
      });
      const blurPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: postModule, entryPoint: "vs_full" },
        fragment: { module: postModule, entryPoint: "fs_blur", targets: [{ format: "rgba16float" }] },
        primitive: { topology: "triangle-list" },
      });
      const compositePipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: postModule, entryPoint: "vs_full" },
        fragment: { module: postModule, entryPoint: "fs_composite", targets: [{ format }] },
        primitive: { topology: "triangle-list" },
      });

      const sampler = device.createSampler({ magFilter: "linear", minFilter: "linear" });

      /* ── One-time GPU init of all three morph targets ─────────── */
      const initBindGroup = device.createBindGroup({
        layout: initPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: particleBuf } },
          { binding: 1, resource: { buffer: target0 } },
          { binding: 2, resource: { buffer: target1 } },
          { binding: 3, resource: { buffer: target2 } },
          { binding: 4, resource: { buffer: initU } },
        ],
      });
      const initData = new Float32Array(4);
      const initEnc = device.createCommandEncoder();
      for (let s = 0; s < 3; s++) {
        initData[0] = s; // shape
        initData[1] = PARTICLE_COUNT;
        initData[2] = s === 0 ? 1 : 0; // seed live particles from shape 0
        device.queue.writeBuffer(initU, 0, initData);
        const pass = initEnc.beginComputePass();
        pass.setPipeline(initPipeline);
        pass.setBindGroup(0, initBindGroup);
        pass.dispatchWorkgroups(PARTICLE_COUNT / WORKGROUP_SIZE);
        pass.end();
      }
      device.queue.submit([initEnc.finish()]);

      /* ── Bind groups ──────────────────────────────────────────── */
      const simBindGroup = device.createBindGroup({
        layout: simPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: particleBuf } },
          { binding: 1, resource: { buffer: target0 } },
          { binding: 2, resource: { buffer: target1 } },
          { binding: 3, resource: { buffer: target2 } },
          { binding: 4, resource: { buffer: simU } },
        ],
      });
      const renderBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: particleBuf } },
          { binding: 1, resource: { buffer: camU } },
        ],
      });

      const mkTargets = () => {
        const w = canvas!.width;
        const h = canvas!.height;
        sceneTex = device.createTexture({
          size: [w, h],
          format: "rgba16float",
          usage: TEXTURE_USAGE_RENDER_ATTACHMENT | TEXTURE_USAGE_TEXTURE_BINDING,
        });
        bloomA = device.createTexture({
          size: [Math.max(2, Math.round(w * BLOOM_SCALE)), Math.max(2, Math.round(h * BLOOM_SCALE))],
          format: "rgba16float",
          usage: TEXTURE_USAGE_RENDER_ATTACHMENT | TEXTURE_USAGE_TEXTURE_BINDING,
        });
        bloomB = device.createTexture({
          size: [Math.max(2, Math.round(w * BLOOM_SCALE)), Math.max(2, Math.round(h * BLOOM_SCALE))],
          format: "rgba16float",
          usage: TEXTURE_USAGE_RENDER_ATTACHMENT | TEXTURE_USAGE_TEXTURE_BINDING,
        });
      };
      mkTargets();

      const postData = new Float32Array(8);
      const simData = new Float32Array(20);
      const camData = new Float32Array(24);
      const proj = new Float32Array(16);
      const view = new Float32Array(16);
      const viewProj = new Float32Array(16);

      let frames = 0;
      let lastFpsT = performance.now();
      let lastT = lastFpsT;
      const startT = lastT;

      const tick = () => {
        if (cancelled) return;
        if (document.hidden) {
          raf = requestAnimationFrame(tick);
          return;
        }

        const now = performance.now();
        const dt = Math.min((now - lastT) / 1000, 1 / 30);
        lastT = now;
        const time = (now - startT) / 1000;

        // FPS counter (updates the React label ~2×/s — not per frame).
        frames++;
        if (now - lastFpsT > 500) {
          setFps(Math.round((frames * 1000) / (now - lastFpsT)));
          frames = 0;
          lastFpsT = now;
        }

        // Ease the morph progress.
        const m = morphRef.current;
        if (m.t < 1) m.t = Math.min(1, m.t + dt / 1.4);

        // Camera: slow auto-orbit until the user drags.
        const cam = camRef.current;
        if (cam.auto) cam.yaw += dt * 0.06;
        const eye = [
          Math.cos(cam.pitch) * Math.sin(cam.yaw) * CAM_RADIUS,
          Math.sin(cam.pitch) * CAM_RADIUS,
          Math.cos(cam.pitch) * Math.cos(cam.yaw) * CAM_RADIUS,
        ];
        const aspect = canvas!.width / canvas!.height;
        perspective(proj, FOV, aspect, 0.1, 200);
        lookAt(view, eye, [0, 0, 0], [0, 1, 0]);
        mulMat4(viewProj, proj, view);

        // Camera basis vectors for world-space billboard expansion.
        const fwd = [-eye[0], -eye[1], -eye[2]];
        const fl = Math.hypot(fwd[0], fwd[1], fwd[2]) || 1;
        fwd[0] /= fl; fwd[1] /= fl; fwd[2] /= fl;
        const rightX = fwd[2]; // cross(fwd, up(0,1,0)) = (-fz, 0, fx) → normalized
        const rightZ = -fwd[0];
        const rl = Math.hypot(rightX, rightZ) || 1;
        const right = [rightX / rl, 0, rightZ / rl];
        const up = [
          right[1] * fwd[2] - right[2] * fwd[1],
          right[2] * fwd[0] - right[0] * fwd[2],
          right[0] * fwd[1] - right[1] * fwd[0],
        ];

        // Pointer ray → z=0 plane → world-space force center.
        const s = settingsRef.current;
        let mwx = 0, mwy = 0, mwz = 0;
        if (mouseRef.current.mode !== 0) {
          const tanHalf = Math.tan(FOV / 2);
          const dx = mouseRef.current.ndcX * tanHalf * aspect;
          const dy = mouseRef.current.ndcY * tanHalf;
          let d = [
            fwd[0] + right[0] * dx + up[0] * dy,
            fwd[1] + right[1] * dx + up[1] * dy,
            fwd[2] + right[2] * dx + up[2] * dy,
          ];
          const dl = Math.hypot(d[0], d[1], d[2]) || 1;
          d = [d[0] / dl, d[1] / dl, d[2] / dl];
          const tHit = Math.abs(d[2]) > 1e-5 ? -eye[2] / d[2] : CAM_RADIUS;
          mwx = eye[0] + d[0] * tHit;
          mwy = eye[1] + d[1] * tHit;
          mwz = eye[2] + d[2] * tHit;
        }

        const shapeTo = morphRef.current.to;
        const chaosW = shapeTo === 2 ? 1 : 0;
        const galaxyW = shapeTo === 1 ? 1 : 0;
        const windScale = [1.0, 1.25, 2.2][shapeTo];

        simData[0] = dt;
        simData[1] = time;
        simData[2] = m.t;
        simData[3] = time; // noise drift time
        simData[4] = mwx;
        simData[5] = mwy;
        simData[6] = mwz;
        simData[7] = mouseRef.current.mode;
        simData[8] = [7.0, 3.2, 0.0][shapeTo]; // springK (chaos drops the spring)
        simData[9] = s.wind * windScale; // curl-noise wind
        simData[10] = s.mouseRadius;
        simData[11] = s.mouseStrength;
        simData[12] = [0.9, 0.955, 0.985][shapeTo]; // damping
        simData[13] = [0.16, 0.13, 0.11][shapeTo]; // noiseScale
        simData[14] = m.from;
        simData[15] = m.to;
        simData[16] = galaxyW * 1.5; // swirl
        simData[17] = (1 - chaosW) * 0.25; // idle breathe
        device.queue.writeBuffer(simU, 0, simData);

        const baseSize = 0.045 * (1080 / canvas!.height) * (CAM_RADIUS / 36);
        camData.set(viewProj, 0);
        camData[16] = right[0]; camData[17] = right[1]; camData[18] = right[2]; camData[19] = baseSize;
        camData[20] = up[0]; camData[21] = up[1]; camData[22] = up[2]; camData[23] = 0.5; // speed size boost
        device.queue.writeBuffer(camU, 0, camData);

        /* ── Rebuild size-dependent targets if the canvas resized ── */
        if (sceneTex.width !== canvas!.width || sceneTex.height !== canvas!.height) {
          sceneTex.destroy();
          bloomA.destroy();
          bloomB.destroy();
          mkTargets();
        }

        const encoder = device.createCommandEncoder();

        // 1 · compute
        const cpass = encoder.beginComputePass();
        cpass.setPipeline(simPipeline);
        cpass.setBindGroup(0, simBindGroup);
        cpass.dispatchWorkgroups(PARTICLE_COUNT / WORKGROUP_SIZE);
        cpass.end();

        // 2 · scene → rgba16float, additive
        const sceneView = sceneTex.createView();
        const rpass = encoder.beginRenderPass({
          colorAttachments: [
            { view: sceneView, clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: "clear", storeOp: "store" },
          ],
        });
        rpass.setPipeline(renderPipeline);
        rpass.setBindGroup(0, renderBindGroup);
        rpass.draw(6, PARTICLE_COUNT);
        rpass.end();

        // 3 · bloom chain (half-res) — groups are rebuilt each frame because
        //    the texture views are recreated on resize; creation is cheap.
        const bw = bloomA.width;
        const bh = bloomA.height;
        const mkPostGroup = (pipeline: GPUAny, tex: GPUAny, dirX: number, dirY: number) => {
          postData[0] = 1 / bw;
          postData[1] = 1 / bh;
          postData[2] = dirX;
          postData[3] = dirY;
          postData[4] = 1.0;  // threshold
          postData[5] = 0.8;  // knee
          postData[6] = 1.15; // bloom strength
          postData[7] = 1.05; // exposure
          device.queue.writeBuffer(postU, 0, postData);
          return device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: tex.createView() },
              { binding: 1, resource: sampler },
              { binding: 2, resource: { buffer: postU } },
            ],
          });
        };

        const brightPass = encoder.beginRenderPass({
          colorAttachments: [
            { view: bloomA.createView(), clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: "clear", storeOp: "store" },
          ],
        });
        brightPass.setPipeline(brightPipeline);
        brightPass.setBindGroup(0, mkPostGroup(brightPipeline, sceneTex, 0, 0));
        brightPass.draw(3);
        brightPass.end();

        const blurH = encoder.beginRenderPass({
          colorAttachments: [
            { view: bloomB.createView(), clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: "clear", storeOp: "store" },
          ],
        });
        blurH.setPipeline(blurPipeline);
        blurH.setBindGroup(0, mkPostGroup(blurPipeline, bloomA, 1, 0));
        blurH.draw(3);
        blurH.end();

        const blurV = encoder.beginRenderPass({
          colorAttachments: [
            { view: bloomA.createView(), clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: "clear", storeOp: "store" },
          ],
        });
        blurV.setPipeline(blurPipeline);
        blurV.setBindGroup(0, mkPostGroup(blurPipeline, bloomB, 0, 1));
        blurV.draw(3);
        blurV.end();

        // 4 · composite → canvas
        const outView = context.getCurrentTexture().createView();
        const compPass = encoder.beginRenderPass({
          colorAttachments: [
            { view: outView, clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: "clear", storeOp: "store" },
          ],
        });
        compPass.setPipeline(compositePipeline);
        compPass.setBindGroup(0, mkPostGroup(compositePipeline, sceneTex, 0, 0));
        compPass.setBindGroup(
          1,
          device.createBindGroup({
            layout: compositePipeline.getBindGroupLayout(1),
            entries: [
              { binding: 0, resource: bloomA.createView() },
              { binding: 1, resource: sampler },
            ],
          }),
        );
        compPass.draw(3);
        compPass.end();

        device.queue.submit([encoder.finish()]);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      return () => ro.disconnect();
    }

    let cleanupObserver: (() => void) | undefined;
    init()
      .then((teardown) => {
        cleanupObserver = teardown;
      })
      .catch((err) => {
        console.error("ParticleField: init failed", err);
        if (!cancelled) setSupported(false);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cleanupObserver?.();
      try {
        device?.destroy?.();
      } catch {
        // already lost/destroyed — fine
      }
    };
  }, []);

  /* ── Fallback ─────────────────────────────────────────────────────────── */
  if (!supported) {
    return (
      <div className="grid h-[100dvh] place-items-center bg-[#05030a] px-6 text-center">
        <div className="max-w-md space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
            WebGPU unavailable
          </p>
          <p className="text-lg text-white/80">
            This showcase simulates 1,048,576 particles entirely on the GPU and
            needs a WebGPU-capable browser — Chrome or Edge, 113+.
          </p>
        </div>
      </div>
    );
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#05030a]">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />

      {/* ── Floating control panel ─────────────────────────────────── */}
      <aside className="absolute left-5 top-5 w-[270px] rounded-2xl border border-white/10 bg-black/55 p-5 text-white shadow-2xl backdrop-blur-xl">
        <header className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            LIONOVART · ATLAB-class
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight">
            Particle Field
          </h1>
        </header>

        {/* Live stats */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">FPS</p>
            <p className="font-mono text-xl tabular-nums text-emerald-300">{fps}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Particles</p>
            <p className="font-mono text-xl tabular-nums text-white/90">
              {PARTICLE_COUNT.toLocaleString("en-US")}
            </p>
          </div>
        </div>

        {/* Morph state selector */}
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
          Morph state
        </p>
        <div className="mb-5 grid grid-cols-3 gap-1.5">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => requestShape(s.id)}
              className={`rounded-lg border px-2 py-2 font-mono text-[11px] transition-colors ${
                shape === s.id
                  ? "border-indigo-400/60 bg-indigo-500/25 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white/85"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Wind */}
        <label className="mb-4 block">
          <span className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-white/40">
            <span>Curl-noise wind</span>
            <span className="tabular-nums text-white/70">{wind.toFixed(1)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={8}
            step={0.1}
            value={wind}
            onChange={onWind}
            className="w-full accent-indigo-400"
          />
        </label>

        {/* Mouse radius */}
        <label className="block">
          <span className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-white/40">
            <span>Mouse field radius</span>
            <span className="tabular-nums text-white/70">{radius.toFixed(0)}</span>
          </span>
          <input
            type="range"
            min={3}
            max={24}
            step={0.5}
            value={radius}
            onChange={onRadius}
            className="w-full accent-indigo-400"
          />
        </label>

        <footer className="mt-5 border-t border-white/10 pt-3 font-mono text-[10px] leading-relaxed text-white/35">
          Drag — repel · Shift / right-drag — attract
          <br />
          Drag also orbits the camera
        </footer>
      </aside>
    </div>
  );
}
