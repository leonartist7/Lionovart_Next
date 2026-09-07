import * as THREE from "three";
import { WebGPURenderer, RenderPipeline } from "three/webgpu";
import { pass } from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { PILLARS, type PillarId } from "../pillars/config/pillars";
import { createPillarCardV2, type PillarCardV2 } from "./card";
import { createStudioEnvironment } from "./studio";
import type { QualityTier } from "./materials";

/**
 * PaneCardEngine — renders ONE v2 pillar card into a transparent canvas that
 * lives inside a SplitShowcase pane back face.
 *
 * The pane's scroll-scrubbed flip/split/tilt moves the canvas, so this
 * engine only owns: studio light + environment, fitted camera, reveal
 * (driven by the pane's flip progress), and a whisper of idle motion.
 *
 * Backend: same TSL materials as the showcase. HIGH tier tries native WebGPU;
 * everything else runs the WebGL2 node backend (identical visuals, lighter
 * context budget — three panes + the hero can coexist).
 */

export interface PaneCardOptions {
  canvas: HTMLCanvasElement;
  pillar: PillarId;
  tier: QualityTier;
  reducedMotion: boolean;
}

// Glass reference width; height follows the pane aspect exactly.
const GLASS_W = 3.6;
const GLASS_H = 2.15;

const BLOOM_STRENGTH = 0.5;
const BLOOM_RADIUS = 0.4;
const BLOOM_THRESHOLD = 0.82;

export class PaneCardEngine {
  private renderer: WebGPURenderer | null = null;
  private pipeline: RenderPipeline | null = null;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private card: PillarCardV2 | null = null;
  private lights = new THREE.Group();
  private disposeEnv: (() => void) | null = null;
  private raf = 0;
  private visible = true;
  private destroyed = false;
  private reveal = 0;
  private revealTarget = 0;
  private time = 0;
  private last = 0;
  private io: IntersectionObserver | null = null;
  private ro: ResizeObserver | null = null;
  private builtAspect = 0;
  private cardSize = { w: GLASS_W, h: GLASS_H };
  private sweep = 0;
  private sweepTarget = 0;

  constructor(private opts: PaneCardOptions) {
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);
  }

  async init(): Promise<boolean> {
    const { canvas, tier } = this.opts;
    const dprCap = tier === "HIGH" ? 2 : tier === "MEDIUM" ? 1.5 : 1;

    const attempts = tier === "HIGH" ? [false, true] : [true];
    for (const forceWebGL of attempts) {
      try {
        const renderer = new WebGPURenderer({
          canvas,
          antialias: tier === "HIGH",
          alpha: true,
          powerPreference: "high-performance",
          forceWebGL,
        });
        await renderer.init();
        this.renderer = renderer;
        break;
      } catch {
        // try next backend
      }
    }
    if (!this.renderer) return false;

    try {
      const renderer = this.renderer;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
      renderer.setClearColor(new THREE.Color("#000000"), 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;

      this.disposeEnv = createStudioEnvironment(
        renderer as unknown as THREE.WebGLRenderer,
        this.scene,
        this.opts.tier === "LOW" ? 0.3 : 0.4,
      );

      // Reference-matched rig, tinted per pillar. Dim overall: light lives on
      // the rim, never a white wash. No front point light (stray hotspot).
      const secondary = new THREE.Color(PILLARS[this.opts.pillar].secondary);
      const key = new THREE.DirectionalLight(new THREE.Color("#ffe9c8"), 0.9);
      key.position.set(-4, 5, 6);
      const rim = new THREE.DirectionalLight(
        new THREE.Color("#ffffff").lerp(secondary, 0.4),
        2.2,
      );
      rim.position.set(5, 2.5, -5);
      const streak = new THREE.SpotLight(
        secondary.clone().lerp(new THREE.Color("#ffffff"), 0.5),
        1.6,
        26,
        0.32,
        1,
        1.6,
      );
      streak.position.set(3.5, 5.5, 2.5);
      streak.target.position.set(0, 0.5, 0);
      const hemi = new THREE.HemisphereLight(new THREE.Color("#2c3148"), new THREE.Color("#050505"), 0.25);
      this.lights.add(key, rim, streak, streak.target, hemi);
      this.scene.add(this.lights);

      this.card = createPillarCardV2(this.opts.pillar, this.opts.tier, {
        phase: 0,
        size: { w: GLASS_W, h: GLASS_H },
      });
      this.card.setReveal(0);
      this.scene.add(this.card.group);

      const scenePass = pass(this.scene, this.camera, { samples: this.opts.tier === "HIGH" ? 4 : 0 });
      const output =
        this.opts.tier === "HIGH"
          ? scenePass.add(bloom(scenePass, BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD))
          : scenePass;
      this.pipeline = new RenderPipeline(renderer, output);

      this.fit();
      this.bind();
      this.last = performance.now();
      this.loop();
      return true;
    } catch {
      return false;
    }
  }

  /** 0..1 — wired straight to the pane's flip progress motion value. */
  setReveal(v: number): void {
    this.revealTarget = THREE.MathUtils.clamp(v, 0, 1);
    if (this.opts.reducedMotion) this.reveal = this.revealTarget;
  }

  /** Normalized pointer x (-1..1) driving the rim reflection sweep. */
  setSweep(nx: number): void {
    if (this.opts.reducedMotion) return;
    this.sweepTarget = THREE.MathUtils.clamp(nx, -1, 1);
  }

  dispose(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.io?.disconnect();
    this.ro?.disconnect();
    if (this.card) {
      this.scene.remove(this.card.group);
      this.card.dispose();
      this.card = null;
    }
    this.disposeEnv?.();
    this.disposeEnv = null;
    this.pipeline = null;
    this.renderer?.dispose();
    this.renderer = null;
  }

  private fit(): void {
    const renderer = this.renderer;
    if (!renderer) return;
    const canvas = renderer.domElement;
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || canvas.clientWidth || 1;
    const h = parent?.clientHeight || canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.aspect = aspect;
    // The glass takes the pane's exact shape so the 3D rim sits just inside
    // the DOM contour. Rebuild geometry only when the aspect actually moves
    // (breakpoint/orientation change), never per frame.
    if (this.card && Math.abs(aspect - this.builtAspect) > 0.02) {
      this.card.setSize(GLASS_W, GLASS_W / aspect);
      this.cardSize = { w: GLASS_W, h: GLASS_W / aspect };
      this.builtAspect = aspect;
    }
    // Tight frame: rim nearly touches the pane border on all four sides.
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const dist = Math.max(
      this.cardSize.h / 2 / Math.tan(halfFov),
      this.cardSize.w / 2 / Math.tan(halfFov) / aspect,
    ) + 0.12;
    this.camera.position.set(0, 0, dist);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  private bind(): void {
    if (!this.renderer) return;
    const canvas = this.renderer.domElement;
    const parent = canvas.parentElement ?? canvas;
    this.io = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    this.io.observe(parent);
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.fit());
      this.ro.observe(parent);
    }
  }

  private loop = (): void => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible || document.hidden || !this.renderer || !this.pipeline || !this.card) return;
    // Skip work while the front (video) face is showing — canvas is hidden.
    if (this.revealTarget <= 0.001 && this.reveal <= 0.001) return;

    const now = performance.now();
    this.time += Math.min((now - this.last) / 1000, 0.05);
    this.last = now;

    this.reveal += (this.revealTarget - this.reveal) * 0.12;
    if (Math.abs(this.revealTarget - this.reveal) < 0.001) this.reveal = this.revealTarget;
    const e = THREE.MathUtils.smoothstep(this.reveal, 0, 1);
    this.card.setReveal(e);

    const g = this.card.group;
    if (!this.opts.reducedMotion) {
      // Whisper motion only — the pane owns tilt/float. Settle rotation as
      // the flip lands, then breathe almost imperceptibly.
      g.rotation.y = (1 - e) * 0.45 + Math.sin(this.time * 0.5) * 0.03;
      g.rotation.x = Math.sin(this.time * 0.4 + 1.2) * 0.015;
      g.rotation.z = Math.sin(this.time * 0.55) * 0.012;
      g.position.y = Math.sin(this.time * 0.7) * 0.03;
    } else {
      g.rotation.set(0, 0, 0);
      g.position.y = 0;
    }

    this.sweep += (this.sweepTarget - this.sweep) * 0.06;
    this.card.update(this.time, this.camera.position, this.sweep * 1.8);

    this.pipeline.render();
  };
}
