import * as THREE from "three";
import { WebGPURenderer, RenderPipeline } from "three/webgpu";
import { pass } from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import type { PillarId } from "../pillars/config/pillars";
import { createPillarCardV2, type PillarCardV2 } from "./card";
import { createSilkRig, type SilkRig } from "./silk";
import { createParticleField, type ParticleField } from "./particles";
import { createStudioEnvironment, createStudioLighting, type StudioLights } from "./studio";
import type { QualityTier } from "./materials";

/**
 * ShowcaseEngine — the v2 WebGPU-first scene manager.
 *
 * Backend strategy (directive §7): ONE TSL codebase, two backends.
 *   1. WebGPURenderer (native WebGPU) when the browser supports it.
 *   2. The same renderer with forceWebGL — identical node materials compile
 *      to GLSL, visual parity by construction, no duplicate shader paths.
 *   3. Total failure → the React boundary shows the polished DOM fallback.
 *
 * Post (directive §8): the native RenderPipeline, not EffectComposer.
 *   pass(scene, camera, { samples: 4 })  — HDR (half-float) MSAA target
 *   bloom(pass, …, threshold 0.82)       — only rims/flares clear it; blacks
 *                                          stay black, glass never blooms
 *   output transform                     — ACES filmic + sRGB, applied by the
 *                                          pipeline's own output node
 */

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  tier: QualityTier;
  reducedMotion: boolean;
  onError?: (err: unknown) => void;
}

const MAX_TILT = THREE.MathUtils.degToRad(4); // restraint per directive §12
const DAMP = 0.06;

const BLOOM_STRENGTH = 0.55;
const BLOOM_RADIUS = 0.45;
const BLOOM_THRESHOLD = 0.82;

export class ShowcaseEngine {
  private renderer: WebGPURenderer | null = null;
  private pipeline: RenderPipeline | null = null;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private cards: PillarCardV2[] = [];
  private silk: SilkRig | null = null;
  private particles: ParticleField | null = null;
  private lights: StudioLights | null = null;
  private disposeEnv: (() => void) | null = null;
  private raf = 0;
  private visible = true;
  private destroyed = false;
  private reveal = 0;
  private revealTarget = 0;
  private scrollProgress = 0;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private hovered: PillarId | null = null;
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private clock = new THREE.Clock();
  private io: IntersectionObserver | null = null;
  private ro: ResizeObserver | null = null;
  private layout: "row" | "column" = "row";
  readonly tier: QualityTier;
  readonly reducedMotion: boolean;

  constructor(private opts: EngineOptions) {
    this.tier = opts.tier;
    this.reducedMotion = opts.reducedMotion;
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    this.camera.position.set(0, 0.15, 10.4);
    this.camera.lookAt(0, 0, 0);
  }

  /** Async — WebGPU first, WebGL2 node fallback, false on total failure. */
  async init(): Promise<boolean> {
    const { canvas } = this.opts;
    const dprCap = this.tier === "HIGH" ? 2 : this.tier === "MEDIUM" ? 1.5 : 1;

    for (const forceWebGL of [false, true]) {
      try {
        const renderer = new WebGPURenderer({
          canvas,
          antialias: this.tier !== "LOW",
          alpha: true,
          powerPreference: "high-performance",
          forceWebGL,
        });
        await renderer.init();
        this.renderer = renderer;
        break;
      } catch (err) {
        if (forceWebGL) {
          this.opts.onError?.(err);
          return false;
        }
        // WebGPU unavailable — fall through to the WebGL2 node backend.
      }
    }
    if (!this.renderer) return false;

    try {
      const renderer = this.renderer;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
      renderer.setClearColor(new THREE.Color("#000000"), 0);
      // Cinematic filmic tone mapping — the pipeline's output node applies it.
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      // Studio: env (PMREM works with the WebGPU renderer) + lights.
      this.disposeEnv = createStudioEnvironment(
        renderer as unknown as THREE.WebGLRenderer,
        this.scene,
        this.tier === "LOW" ? 0.4 : 0.55,
      );
      this.lights = createStudioLighting(this.scene);

      // Cards: LION left / NOVA hero-forward / ART right, opposed rotations.
      const defs: Array<{ id: PillarId; x: number; rotY: number; z: number; phase: number }> = [
        { id: "LION", x: -4.05, rotY: 0.22, z: 0, phase: 0 },
        { id: "NOVA", x: 0, rotY: -0.04, z: 0.55, phase: 2.1 },
        { id: "ART", x: 4.05, rotY: -0.22, z: 0, phase: 4.2 },
      ];
      defs.forEach((d) => {
        const card = createPillarCardV2(d.id, this.tier, { phase: d.phase, baseRotY: d.rotY });
        card.group.position.set(d.x, 0, d.z);
        card.group.rotation.y = d.rotY;
        card.setReveal(this.reducedMotion ? 1 : 0);
        this.cards.push(card);
        this.scene.add(card.group);
      });

      // Silk trails + particle dust wrap the whole composition.
      this.silk = createSilkRig(this.tier);
      this.scene.add(this.silk.group);
      this.particles = createParticleField(this.tier);
      this.scene.add(this.particles.points);
      this.particles.uniforms.uReveal.value = this.reducedMotion ? 1 : 0;

      // Post: native RenderPipeline, HDR + MSAA, threshold-selective bloom.
      const scenePass = pass(this.scene, this.camera, { samples: this.tier === "LOW" ? 0 : 4 });
      const output =
        this.tier === "LOW"
          ? scenePass
          : scenePass.add(bloom(scenePass, BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD));
      this.pipeline = new RenderPipeline(renderer, output);

      if (this.reducedMotion) {
        this.reveal = 1;
        this.revealTarget = 1;
      }

      this.measure();
      this.bind();
      this.clock.start();
      this.loop();
      return true;
    } catch (err) {
      this.opts.onError?.(err);
      return false;
    }
  }

  // ── public control ──────────────────────────────────────────────

  /** Staggered cinematic entrance: LION → NOVA → ART. */
  playEntrance(): void {
    if (this.reducedMotion) {
      this.cards.forEach((c) => c.setReveal(1));
      this.revealTarget = 1;
      this.reveal = 1;
      if (this.particles) this.particles.uniforms.uReveal.value = 1;
      return;
    }
    this.revealTarget = 1;
  }

  /** 0..1 scroll progression through the section — separates depth slightly. */
  setScrollProgress(p: number): void {
    this.scrollProgress = THREE.MathUtils.clamp(p, 0, 1);
  }

  setPointer(nx: number, ny: number): void {
    if (this.reducedMotion) return;
    this.pointer.tx = THREE.MathUtils.clamp(nx, -1, 1);
    this.pointer.ty = THREE.MathUtils.clamp(ny, -1, 1);
  }

  clearPointer(): void {
    this.pointer.tx = 0;
    this.pointer.ty = 0;
  }

  pick(clientX: number, clientY: number): void {
    if (this.reducedMotion || !this.renderer) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.cards.map((c) => c.group), true);
    let id: PillarId | null = null;
    if (hits.length) {
      let o: THREE.Object3D | null = hits[0].object;
      while (o) {
        const m = o.name.match(/^PillarCardV2_(LION|NOVA|ART)$/);
        if (m) {
          id = m[1] as PillarId;
          break;
        }
        o = o.parent;
      }
    }
    if (id !== this.hovered) {
      this.hovered = id;
      this.cards.forEach((c) => c.setHover(c.id === id));
      this.renderer.domElement.style.cursor = id ? "pointer" : "default";
    }
  }

  resize = (): void => {
    this.measure();
  };

  dispose(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.io?.disconnect();
    this.ro?.disconnect();
    this.cards.forEach((c) => {
      this.scene.remove(c.group);
      c.dispose();
    });
    this.cards = [];
    this.silk?.dispose();
    this.silk = null;
    this.particles?.dispose();
    this.particles = null;
    this.lights?.dispose();
    this.lights = null;
    this.disposeEnv?.();
    this.disposeEnv = null;
    this.pipeline = null;
    this.renderer?.dispose();
    this.renderer = null;
  }

  // ── internals ───────────────────────────────────────────────────

  private measure(): void {
    const renderer = this.renderer;
    if (!renderer) return;
    const canvas = renderer.domElement;
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || canvas.clientWidth || 1;
    const h = parent?.clientHeight || canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.layout = this.camera.aspect < 0.95 ? "column" : "row";
  }

  private bind(): void {
    if (!this.renderer) return;
    const canvas = this.renderer.domElement;
    // Pause when the section leaves the viewport — never render invisible.
    this.io = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        if (entry.isIntersecting) this.playEntrance();
      },
      { threshold: 0.12 },
    );
    const parent = canvas.parentElement ?? canvas;
    this.io.observe(parent);
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.measure());
      this.ro.observe(parent);
    } else {
      window.addEventListener("resize", this.resize);
    }
  }

  private loop = (): void => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible || document.hidden || !this.renderer || !this.pipeline) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.elapsedTime;
    void dt;

    // Entrance: staggered per-card reveal (LION → NOVA → ART).
    if (this.reveal < this.revealTarget) {
      this.reveal = Math.min(this.revealTarget, this.reveal + 0.008);
    } else if (this.reveal > this.revealTarget) {
      this.reveal = Math.max(this.revealTarget, this.reveal - 0.02);
    }
    const stagger = (i: number) => THREE.MathUtils.smoothstep(this.reveal, i * 0.22, i * 0.22 + 0.62);
    this.cards.forEach((card, i) => card.setReveal(this.reducedMotion ? 1 : stagger(i)));
    if (this.particles) {
      const pv = this.particles.uniforms.uReveal.value;
      this.particles.uniforms.uReveal.value = pv + (this.reveal - pv) * 0.04;
    }

    // Damped pointer.
    this.pointer.x += (this.pointer.tx - this.pointer.x) * DAMP;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * DAMP;

    const sp = this.scrollProgress;
    this.cards.forEach((card, i) => {
      const g = card.group;
      const center = i - 1; // -1, 0, 1

      if (this.layout === "row") {
        const spread = 4.05 + sp * 0.5;
        g.position.x = THREE.MathUtils.lerp(g.position.x, center * spread, 0.08);
        g.position.z = THREE.MathUtils.lerp(g.position.z, (card.id === "NOVA" ? 0.55 : 0) - sp * 0.7, 0.08);
        g.rotation.y = THREE.MathUtils.lerp(
          g.rotation.y,
          card.baseRotY + this.pointer.x * MAX_TILT + sp * center * 0.28,
          0.07,
        );
      } else {
        // Vertical narrative on narrow screens.
        const gap = 2.75;
        g.position.x = THREE.MathUtils.lerp(g.position.x, 0, 0.08);
        g.position.y = THREE.MathUtils.lerp(g.position.y, -center * gap, 0.08);
        g.position.z = THREE.MathUtils.lerp(g.position.z, (card.id === "NOVA" ? 0.35 : 0) - sp * 0.4, 0.08);
        g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, this.pointer.x * MAX_TILT * 0.7, 0.07);
      }

      if (!this.reducedMotion) {
        // Idle float — heavy, expensive, intentional. Desynced frequencies.
        const t = time * (0.5 + i * 0.13) + card.phase;
        g.position.y += Math.sin(t * 0.9) * 0.055;
        g.rotation.z = Math.sin(t * 0.6) * THREE.MathUtils.degToRad(1.1);
        g.rotation.x +=
          (this.pointer.y * MAX_TILT * 0.8 + Math.sin(t * 0.45) * THREE.MathUtils.degToRad(0.7) - g.rotation.x) *
          0.07;
        // Hover: drift slightly toward camera.
        const hoverZ = card.id === this.hovered ? 0.35 : 0;
        g.position.z += hoverZ * 0.06;
      } else if (this.layout === "column") {
        // Reduced motion still needs the column stacking applied (no float).
        g.position.y = -center * 2.75;
      }

      card.update(time, this.camera.position, this.pointer.x * 1.9 + center * 0.4);
    });

    this.silk?.update(time);
    if (this.particles) this.particles.uniforms.uTime.value = time;

    this.pipeline.render();
  };
}
