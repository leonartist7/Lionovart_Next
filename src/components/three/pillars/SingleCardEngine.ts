import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { PILLARS, type PillarId } from "./config/pillars";
import { createPillarCard, type PillarCard } from "./PillarCard";
import type { QualityTier } from "./materials";

/**
 * SingleCardEngine — renders ONE pillar card into a transparent canvas that
 * lives inside a DisciplineSplit3D pane back face.
 *
 * The glass is built to the pane's exact aspect, so the 3D rim coincides
 * with the DOM reactive contour: one card, crisp contour line + 3D bloom
 * halo just inside it. The pane's own scroll-scrubbed flip/split/tilt moves
 * the canvas, so the engine only owns: studio light + environment, fitted
 * camera, reveal (driven by the pane's flip progress), and a whisper of
 * idle motion. No pointer handling — the stage cursor rig tilts the sheet.
 *
 * Light discipline (the chrome-plate lesson): dim environment, no front
 * point light (its specular hotspot read as a stray dot), identity from
 * the rim shader + corner glints. Body stays smoked.
 *
 * Perf: transmission only on HIGH tier; MEDIUM/LOW use the transparent
 * physical fallback. Rendering pauses while unrevealed or off-screen.
 */

export interface SingleCardOptions {
  canvas: HTMLCanvasElement;
  pillar: PillarId;
  tier: QualityTier;
  reducedMotion: boolean;
}

// Glass reference width; height follows the host pane aspect exactly.
const GLASS_W = 3.6;

// Selective bloom — threshold sits above the smoked glass luminance, so only
// the rim, glints and hot bevel catches bloom. One knob each; tune to taste.
const BLOOM_STRENGTH = 0.5;
const BLOOM_RADIUS = 0.4;
const BLOOM_THRESHOLD = 0.7;

export class SingleCardEngine {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private card: PillarCard | null = null;
  private lights = new THREE.Group();
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
  private composer: EffectComposer | null = null;
  private sweep = new THREE.DirectionalLight(new THREE.Color("#dfe8ff"), 0.8);
  private sweepTarget = { x: 0, y: 0 };
  private sweepCurrent = { x: 0, y: 0 };

  constructor(private opts: SingleCardOptions) {
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);
  }

  init(): boolean {
    try {
      const { canvas, pillar, tier } = this.opts;
      const dprCap = tier === "HIGH" ? 2 : tier === "MEDIUM" ? 1.5 : 1;
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: tier === "HIGH",
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.12;

      // Environment for believable glass reflections (one-time PMREM cost).
      // Kept dim: the body must stay smoked-clear, not chrome.
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const room = new RoomEnvironment();
      const envTex = pmrem.fromScene(room, 0.06).texture;
      this.scene.environment = envTex;
      this.scene.environmentIntensity = tier === "LOW" ? 0.3 : 0.4;
      pmrem.dispose();

      // Reference-matched rig, tinted per pillar: each canvas renders ONE
      // pillar, so the key lights wear its colors — amber top band for LION,
      // violet-blue for NOVA, crimson for ART. Dim overall; the reference
      // glass is black with light living on the rim, never a white wash.
      // NO front point light — its specular hotspot read as a stray dot.
      const secondary = new THREE.Color(PILLARS[pillar].secondary);
      const key = new THREE.DirectionalLight(new THREE.Color("#ffe9c8"), 0.9);
      key.position.set(-4, 5, 6);
      const rim = new THREE.DirectionalLight(
        new THREE.Color("#ffffff").lerp(secondary, 0.4),
        2.2,
      );
      rim.position.set(5, 2.5, -5);
      // Narrow grazing streak across the top bevel — the reference's bright
      // top band, in pillar color, not white.
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

      // Transmission only on HIGH — the edge shader + flares carry identity
      // on lower tiers without the extra transmission pass per canvas.
      // Inlay: this glass IS the DOM card's body (dark smoked centre, light
      // from rim + corners), sized to the pane in fit() below.
      const glassTier: QualityTier = tier === "HIGH" ? "HIGH" : "LOW";
      this.card = createPillarCard(pillar, glassTier, { phase: 0, inlay: true });
      this.card.setReveal(0);
      this.scene.add(this.card.group);

      // Post: HDR pipeline with selective bloom on HIGH/MEDIUM. The scene
      // renders linear into a half-float target (no early tone map), bloom
      // lifts only what clears the threshold, OutputPass finishes with the
      // filmic curve + sRGB. LOW tier renders direct for perf.
      if (tier !== "LOW") {
        const composer = new EffectComposer(this.renderer);
        composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
        composer.addPass(new RenderPass(this.scene, this.camera));
        const bloom = new UnrealBloomPass(
          new THREE.Vector2(256, 256),
          BLOOM_STRENGTH,
          BLOOM_RADIUS,
          BLOOM_THRESHOLD,
        );
        composer.addPass(bloom);
        composer.addPass(new OutputPass());
        this.composer = composer;
      }

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

  /** Normalized pointer (-1..1) driving the reflection sweep light. */
  setSweep(nx: number, ny: number): void {
    if (this.opts.reducedMotion) return;
    this.sweepTarget.x = THREE.MathUtils.clamp(nx, -1, 1);
    this.sweepTarget.y = THREE.MathUtils.clamp(ny, -1, 1);
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
    const env = this.scene.environment;
    if (env && "dispose" in env && typeof (env as THREE.Texture).dispose === "function") {
      (env as THREE.Texture).dispose();
    }
    this.scene.environment = null;
    this.composer?.dispose();
    this.composer = null;
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
    this.composer?.setSize(w, h);
    const aspect = w / h;
    this.camera.aspect = aspect;
    // The glass takes the pane's exact shape: same aspect, ~94% fill, so
    // the 3D rim sits just inside the DOM contour. Rebuild geometry only
    // when the aspect actually moves (breakpoint change), never per frame.
    if (this.card && Math.abs(aspect - this.builtAspect) > 0.02) {
      this.card.setSize(GLASS_W, GLASS_W / aspect);
      this.builtAspect = aspect;
    }
    const card = this.card;
    const fitH = card ? card.size.h : GLASS_W / aspect;
    const fitW = card ? card.size.w : GLASS_W;
    // Tight frame: rim nearly touches the pane border on all four sides.
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const dist = Math.max(fitH / 2 / Math.tan(halfFov), fitW / 2 / Math.tan(halfFov) / aspect) + 0.1;
    this.camera.position.set(0, 0, dist);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  private bind(): void {
    if (!this.renderer) return;
    const canvas = this.renderer.domElement;
    const parent = canvas.parentElement ?? canvas;
    this.io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
    }, { threshold: 0.05 });
    this.io.observe(parent);
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.fit());
      this.ro.observe(parent);
    }
  }

  private loop = (): void => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible || document.hidden || !this.renderer || !this.card) return;
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
      g.rotation.y = 0;
      g.rotation.x = 0;
      g.rotation.z = 0;
      g.position.y = 0;
    }

    this.card.update(this.time, this.camera.position);

    // Damped sweep: highlights glide across the bevel, never snap.
    this.sweepCurrent.x += (this.sweepTarget.x - this.sweepCurrent.x) * 0.06;
    this.sweepCurrent.y += (this.sweepTarget.y - this.sweepCurrent.y) * 0.06;
    this.sweep.position.set(
      this.sweepCurrent.x * 4.5,
      1.5 + this.sweepCurrent.y * 2.5,
      4.2,
    );

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  };
}
