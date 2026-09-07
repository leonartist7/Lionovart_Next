import * as THREE from "three";
import { PILLAR_ORDER, type PillarId } from "./config/pillars";
import { createPillarCard, type PillarCard } from "./PillarCard";
import {
  createStudioEnvironment,
  createStudioLighting,
  disposeStudioEnvironment,
  type StudioLights,
} from "./lighting";
import type { QualityTier } from "./materials";

/**
 * PillarEngine — vanilla-three scene manager (no R3F dependency, per repo
 * no-new-deps rule). Owns renderer, studio, cards, motion and lifecycle.
 *
 * WebGPU-first architecturally: all materials are node-compatible
 * (physical + fresnel emission terms map 1:1 to TSL), so the scene can move
 * to WebGPURenderer without re-authoring. We ship the WebGL2 path because it
 * is the production-safe backend today; visual parity is preserved by design.
 */

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  tier: QualityTier;
  reducedMotion: boolean;
  onError?: (err: unknown) => void;
}

const MAX_TILT = THREE.MathUtils.degToRad(4); // restraint per directive §12
const DAMP = 0.06;

export class PillarEngine {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private cards: PillarCard[] = [];
  private lights: StudioLights | null = null;
  private aura: THREE.Sprite | null = null;
  private raf = 0;
  private running = false;
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

  init(): boolean {
    try {
      const { canvas } = this.opts;
      const dprCap = this.tier === "HIGH" ? 2 : this.tier === "MEDIUM" ? 1.5 : 1;
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: this.tier !== "LOW",
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      // Cinematic filmic tone mapping — rich blacks, unclipped highlights.
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.12;

      createStudioEnvironment(this.renderer, this.scene);
      this.lights = createStudioLighting(this.scene);

      // Faint volumetric aura behind the cards (no floor, no contact shadow).
      this.aura = this.createAura();
      this.scene.add(this.aura);

      // LION left / NOVA hero-forward / ART right, opposed Y rotations.
      const defs: Array<{ id: PillarId; x: number; rotY: number; z: number; phase: number }> = [
        { id: "LION", x: -4.05, rotY: 0.22, z: 0, phase: 0 },
        { id: "NOVA", x: 0, rotY: -0.04, z: 0.55, phase: 2.1 },
        { id: "ART", x: 4.05, rotY: -0.22, z: 0, phase: 4.2 },
      ];
      defs.forEach((d, i) => {
        const card = createPillarCard(d.id, this.tier, { phase: d.phase });
        card.group.position.set(d.x, 0, d.z);
        card.group.rotation.y = d.rotY;
        card.baseRotY = d.rotY;
        // Entrance starts dark/hidden — reveal animates uReveal per card.
        card.setReveal(this.reducedMotion ? 1 : 0);
        this.cards.push(card);
        this.scene.add(card.group);
        void i;
      });

      if (this.reducedMotion) {
        this.reveal = 1;
        this.revealTarget = 1;
      }

      this.measure();
      this.bind();
      this.running = true;
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
      return;
    }
    this.revealTarget = 1;
  }

  resetEntrance(): void {
    if (this.reducedMotion) return;
    this.revealTarget = 0;
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
        const m = o.name.match(/^PillarCard_(LION|NOVA|ART)$/);
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

  setVisible(v: boolean): void {
    this.visible = v;
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
    if (this.aura) {
      this.scene.remove(this.aura);
      (this.aura.material as THREE.Material).dispose();
      this.aura = null;
    }
    this.lights?.dispose();
    this.lights = null;
    disposeStudioEnvironment(this.scene);
    this.renderer?.dispose();
    this.renderer = null;
  }

  // ── internals ───────────────────────────────────────────────────

  private createAura(): THREE.Sprite {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(88,70,140,0.34)");
      g.addColorStop(0.45, "rgba(60,40,100,0.16)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(0, 0, -2.4);
    sprite.scale.set(16, 9, 1);
    sprite.renderOrder = 0;
    return sprite;
  }

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
        this.setVisible(entry.isIntersecting);
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
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private onVisibility = (): void => {
    if (document.hidden) {
      // Clock keeps running but loop skips work while hidden (see loop()).
    }
  };

  private loop = (): void => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible || document.hidden || !this.renderer) return;

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
        g.position.y = card.baseY;
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
        g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, card.baseY, 0.08);
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
      }

      card.update(time, this.camera.position);
    });

    // Aura breathes almost imperceptibly.
    if (this.aura && !this.reducedMotion) {
      const m = this.aura.material as THREE.SpriteMaterial;
      m.opacity = 0.7 + Math.sin(time * 0.4) * 0.08;
    }

    this.renderer.render(this.scene, this.camera);
  };
}

export { PILLAR_ORDER };
