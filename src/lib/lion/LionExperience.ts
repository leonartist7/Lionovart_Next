import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import gsap from "gsap";
import {
  PARTICLE_VERT, PARTICLE_FRAG,
  DUST_VERT, DUST_FRAG,
  QUAD_VERT, GRADE_FRAG,
  FLARE_FRAG,
  SWARM_VERT, SWARM_FRAG,
  PLEXUS_VERT, PLEXUS_FRAG,
} from "./shaders";

export interface LionExperienceOptions {
  modelUrl?: string;
  maxParticles?: number;
  onReady?: () => void;
}

/** Bloom is fill-rate bound and scales with DPR squared. */
const DPR_CAP = 1.35;

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Framework-agnostic particle engine: a golden lion that becomes a vertical
 * energy current and reforms at the CTA. Drive `morphTarget` (0..1) from scroll;
 * call `playIntro()`
 * after load. Wrapped by AiLionStage on /services/ai.
 *
 * Renders off `gsap.ticker`, not its own rAF, so it stays in phase with the
 * app-wide Lenis instance (see providers/SmoothScrollProvider). A second rAF
 * loop would render one frame behind the scroll position.
 *
 * Everything that touches `window` / `document` runs in init() or later, never
 * in the constructor, so the module is safe to import anywhere.
 */
export class LionExperience {
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private composer!: EffectComposer;
  private bloom!: UnrealBloomPass;
  private dust: THREE.Points | null = null;
  private swarmMat: THREE.ShaderMaterial | null = null;
  private plexusMat: THREE.ShaderMaterial | null = null;
  private swarmGroup: THREE.Group | null = null;
  private flare: THREE.Mesh | null = null;
  private gainAspect = 1;
  private halfH = 1.85;
  private compactDevice = false;

  private points: THREE.Points | null = null;
  private material!: THREE.ShaderMaterial;
  /** Seconds since start. Accumulated from the ticker delta; THREE.Clock is
   *  deprecated in r185 and THREE.Timer would just be a second thing to update. */
  private elapsed = 0;
  private running = false;
  private disposed = false;
  private disposeHooks: Array<() => void> = [];

  /** Base yaw of the head. Dev-tunable via ?yaw= while framing the shot. */
  public yawProbe = 0.34;

  /** Scroll-driven morph target, eased internally (0 = lion, 1 = energy current) */
  public morphTarget = 0;
  private morph = 0;
  private layoutTarget = 0;
  private layout = 0;
  private baseGain = 1;

  // Act weights, written by the section that owns each beat (lib/lion/stage-ref),
  // so no beat depends on a hand-tuned page offset.
  private bloomW = 0;

  private pointer = new THREE.Vector2(0, 0);
  private pointerWorld = new THREE.Vector3(999, 999, 0);
  private pointerStrength = { value: 0 };
  private camOffset = new THREE.Vector2(0, 0);

  private opts: {
    modelUrl: string;
    maxParticles: number;
    onReady: () => void;
  };

  constructor(canvas: HTMLCanvasElement, options: LionExperienceOptions = {}) {
    this.canvas = canvas;
    this.opts = {
      modelUrl: options.modelUrl ?? "/models/lion.glb",
      // 0 means "decide in init()" — detectParticleBudget touches document/navigator
      maxParticles: options.maxParticles ?? 0,
      onReady: options.onReady ?? (() => {}),
    };
  }

  // ------------------------------------------------------- act inputs ------
  // Each setter is driven by a ScrollTrigger on the section that owns the beat.

  /** Page story: lion → expansion → ecosystem → energy flow → platform hub. */
  setMorph(v: number): void { this.morphTarget = clamp01(v); }

  /** Move the active sculpture horizontally in normalized viewport space. */
  setLayout(v: number): void {
    const responsive = this.compactDevice ? v * 0.35 : v;
    this.layoutTarget = THREE.MathUtils.clamp(responsive, -0.72, 0.72);
  }

  /** Act 7: 0 = energy current, 1 = reformed lion above the CTA. */
  setBloom(v: number): void { this.bloomW = clamp01(v); }

  /** Register a teardown callback (listeners the wrapper owns). */
  onDispose(fn: () => void): void {
    this.disposeHooks.push(fn);
  }

  /**
   * Point the Act 7 convergence at a real element. Called on scroll-enter with
   * the CTA's rect, not per frame.
   */
  setCtaScreenPos(nx: number, ny: number): void {
    if (!this.material) return;
    const w = this.toWorld(nx, ny);
    const crest = new THREE.Vector3(w.x, w.y + this.halfH * 0.72, 0);
    (this.material.uniforms.uCrest.value as THREE.Vector3).copy(crest);
    if (this.swarmMat) (this.swarmMat.uniforms.uCta.value as THREE.Vector3).copy(crest);
    if (this.plexusMat) (this.plexusMat.uniforms.uCta.value as THREE.Vector3).copy(crest);
  }

  /** Normalized screen coords (x right, y down) to a point on the z=0 plane. */
  private toWorld(nx: number, ny: number): THREE.Vector3 {
    const halfW = this.halfH * this.camera.aspect;
    return new THREE.Vector3(nx * halfW, -ny * this.halfH, 0);
  }

  private detectParticleBudget(): number {
    // One deliberately sparse population draws every state. This keeps the
    // lion readable without stacking a separate dust field and neural canvas.
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl");
      const ext = gl?.getExtension("WEBGL_debug_renderer_info");
      const r = ext ? String(gl?.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
      if (/swiftshader|llvmpipe|software/i.test(r)) return 900;
    } catch { /* ignore */ }
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    if (coarse || mobile || mem <= 4) return 1_600;
    if (mem <= 8) return 2_200;
    return 2_800;
  }

  /** Dev-only URL overrides, read once at init: ?count=90000 and ?morph=1. */
  private applyDevOverrides(): void {
    const q = new URLSearchParams(window.location.search);
    const forced = q.get("count");
    if (forced) {
      this.opts.maxParticles = Math.max(800, parseInt(forced, 10) || this.opts.maxParticles);
    }
    if (q.get("morph") === "1") {
      this.morphTarget = 1;
      this.morph = 1;
    }
    const yaw = q.get("yaw");
    if (yaw !== null) this.yawProbe = parseFloat(yaw) || 0;
  }

  /** Bounding box of the sampled cloud, for framing checks. */
  getBounds(): { min: number[]; max: number[]; size: number[] } | null {
    if (!this.points) return null;
    const g = this.points.geometry;
    g.computeBoundingBox();
    const b = g.boundingBox!;
    return {
      min: [b.min.x, b.min.y, b.min.z].map((v) => +v.toFixed(3)),
      max: [b.max.x, b.max.y, b.max.z].map((v) => +v.toFixed(3)),
      size: [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z].map((v) => +v.toFixed(3)),
    };
  }

  async init(): Promise<void> {
    this.applyDevOverrides();
    this.compactDevice = window.matchMedia("(pointer: coarse)").matches
      || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (!this.opts.maxParticles) this.opts.maxParticles = this.detectParticleBudget();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 1); // brand black, matches --color-bg-dark
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Give the particles a little more presence before bloom, while keeping
    // ACES tone mapping in charge of the highlight rolloff.
    this.renderer.toneMappingExposure = 1.0;

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    this.camera.position.set(0, 0.05, 4.8);

    this.buildDust();
    this.buildFlare();
    await this.buildLionParticles();
    if (this.disposed) return; // unmounted while the GLB was in flight
    this.buildPost();
    this.bindEvents();
    this.resize();
    this.start();
    this.opts.onReady();
  }

  // ------------------------------------------------------------------ lion --
  private async buildLionParticles(): Promise<void> {
    const gltf = await new GLTFLoader().loadAsync(this.opts.modelUrl);
    if (this.disposed) return;

    let mesh: THREE.Mesh | null = null;
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((o) => {
      if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh;
    });
    if (!mesh) throw new Error("No mesh found in lion model");

    const src = mesh as THREE.Mesh;
    src.geometry.applyMatrix4(src.matrixWorld);

    const count = this.opts.maxParticles;
    const sampler = new MeshSurfaceSampler(src).build();

    const positions = new Float32Array(count * 3);
    const normals = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    const spawn = new Float32Array(count * 3);

    const p = new THREE.Vector3();
    const n = new THREE.Vector3();
    const spherical = new THREE.Spherical();

    for (let i = 0; i < count; i++) {
      // Importance sampling to equalize screen-space density: surface patches
      // edge-on to the camera compress into few pixels (overbright silhouette,
      // hollow face). Accept probability ~ |n.z| rebalances that.
      //
      // Bounded at 8 attempts: the acceptance rate bottoms out near 0.12, so an
      // unbounded loop has a long tail for no visual gain.
      for (let attempt = 0; attempt < 8; attempt++) {
        sampler.sample(p, n);
        let w = Math.min(0.22 + 0.78 * Math.abs(n.z), 1.0);
        // Shadow thinning: patches turned away from the key light keep fewer
        // particles, so the shadow side of the nose, the eye sockets and the
        // mane underside are genuinely sparse instead of merely dimmed.
        // These coefficients ARE keyDir in PARTICLE_VERT — change both or neither.
        const kd = n.x * -0.4355 + n.y * 0.5323 + n.z * 0.7259;
        if (kd < 0.3) w *= 0.55 + 1.5 * Math.max(kd, 0);
        if (Math.random() < w) break;
      }
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
      normals[i * 3] = n.x;
      normals[i * 3 + 1] = n.y;
      normals[i * 3 + 2] = n.z;

      rand[i * 4] = Math.random();
      rand[i * 4 + 1] = Math.random();
      rand[i * 4 + 2] = Math.random();
      rand[i * 4 + 3] = Math.random();

      // spawn shell: far field the particles fly in from during the intro
      spherical.set(5.5 + Math.random() * 4.5, Math.acos(2 * Math.random() - 1), Math.random() * Math.PI * 2);
      const s = new THREE.Vector3().setFromSpherical(spherical);
      spawn[i * 3] = s.x;
      spawn[i * 3 + 1] = s.y;
      spawn[i * 3 + 2] = s.z;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aNormal", new THREE.BufferAttribute(normals, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
    geo.setAttribute("aSpawn", new THREE.BufferAttribute(spawn, 3));

    const dpr = Math.min(window.devicePixelRatio, DPR_CAP);
    this.material = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uIntro: { value: 0 },
        uDriftAmp: { value: 0.55 },
        uTurb: { value: 0.02 },
        uMouseStrength: { value: 0 },
        uMouse: { value: new THREE.Vector3(999, 999, 0) },
        // Sparse enough to read as particles, large enough to preserve the
        // silhouette on a phone without turning into overlapping blobs.
        uSize: { value: 42.0 },
        uGain: { value: 1 },
        uFocusDist: { value: 3.9 },
        uDofAmount: { value: 0.38 },
        uPixelRatio: { value: dpr },
        uBloom: { value: 0 },
        uCrest: { value: new THREE.Vector3(0, 0, 0) },
      },
    });

    // Keep the population sparse, but compensate its luminance so the lion
    // remains readable on both the black hero and the brighter middle beats.
    this.baseGain = THREE.MathUtils.clamp(3200 / count, 0.95, 1.65);
    this.material.uniforms.uGain.value = this.baseGain;
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    // The head is the hero asset, so it gets the room. Too small and the
    // muzzle and brow stop resolving and it reads as a glowing sphere.
    this.points.scale.setScalar(0.92);
    this.scene.add(this.points);
    this.buildSwarm();
  }

  // -------------------------------------------------------- ambient dust --
  private buildDust(): void {
    const count = this.compactDevice ? 520 : 1_600;
    const positions = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = -1.5 - Math.random() * 3.5;
      for (let j = 0; j < 4; j++) rand[i * 4 + j] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
    const mat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, this.compactDevice ? 1 : DPR_CAP) },
        uColor: { value: new THREE.Color(1.15, 0.78, 0.32) },
        uFocusDist: { value: 3.9 },
        uDofAmount: { value: 0.30 },
        uMorph: { value: 0 },
      },
    });

    this.dust = new THREE.Points(geo, mat);
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  // ----------------------------------------------- swarm, trails, plexus --
  private buildSwarm(): void {
    const heads = this.compactDevice ? 56 : 120;
    const trailLength = this.compactDevice ? 3 : 5;
    const count = heads * (trailLength + 1);
    const positions = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    const trail = new Float32Array(count);
    const lag = new Float32Array(count);
    const headRand = new Float32Array(heads * 4);

    let cursor = 0;
    for (let i = 0; i < heads; i++) {
      const seed = [Math.random(), Math.random(), Math.random(), Math.random()];
      headRand.set(seed, i * 4);
      for (let j = 0; j <= trailLength; j++) {
        const amount = j / trailLength;
        rand.set(seed, cursor * 4);
        trail[cursor] = amount;
        lag[cursor] = j === 0 ? 0 : amount * 1.25;
        cursor++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
    geo.setAttribute("aTrail", new THREE.BufferAttribute(trail, 1));
    geo.setAttribute("aLag", new THREE.BufferAttribute(lag, 1));

    this.swarmMat = new THREE.ShaderMaterial({
      vertexShader: SWARM_VERT,
      fragmentShader: SWARM_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, this.compactDevice ? 1 : DPR_CAP) },
        uMorph: { value: 0 },
        uFocusDist: { value: 3.9 },
        uDofAmount: { value: 0.28 },
        uBloom: { value: 0 },
        uCta: { value: new THREE.Vector3() },
      },
    });

    this.swarmGroup = new THREE.Group();
    const swarm = new THREE.Points(geo, this.swarmMat);
    swarm.frustumCulled = false;
    this.swarmGroup.add(swarm);
    this.scene.add(this.swarmGroup);
    this.buildPlexus(headRand, heads);
  }

  private buildPlexus(headRand: Float32Array, heads: number): void {
    const order = Array.from({ length: heads }, (_, index) => index)
      .sort((a, b) => headRand[a * 4] - headRand[b * 4]);
    const pairs: Array<[number, number]> = [];
    for (let i = 0; i + 1 < heads; i += 2) pairs.push([order[i], order[i + 1]]);
    for (let i = 0; i + 2 < heads; i += 4) pairs.push([order[i], order[i + 2]]);

    const vertices = pairs.length * 2;
    const position = new Float32Array(vertices * 3);
    const aRand = new Float32Array(vertices * 4);
    const aLag = new Float32Array(vertices);
    const aRandB = new Float32Array(vertices * 4);
    const aLagB = new Float32Array(vertices);

    pairs.forEach(([a, b], index) => {
      const seedA = headRand.subarray(a * 4, a * 4 + 4);
      const seedB = headRand.subarray(b * 4, b * 4 + 4);
      aRand.set(seedA, index * 8);
      aRandB.set(seedB, index * 8);
      aRand.set(seedB, index * 8 + 4);
      aRandB.set(seedA, index * 8 + 4);
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 4));
    geo.setAttribute("aLag", new THREE.BufferAttribute(aLag, 1));
    geo.setAttribute("aRandB", new THREE.BufferAttribute(aRandB, 4));
    geo.setAttribute("aLagB", new THREE.BufferAttribute(aLagB, 1));

    this.plexusMat = new THREE.ShaderMaterial({
      vertexShader: PLEXUS_VERT,
      fragmentShader: PLEXUS_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uFade: { value: 1 },
        uBloom: { value: 0 },
        uCta: { value: new THREE.Vector3() },
      },
    });

    const plexus = new THREE.LineSegments(geo, this.plexusMat);
    plexus.frustumCulled = false;
    this.swarmGroup?.add(plexus);
  }


  // --------------------------------------------------------- lens flare ----
  /**
   * One restrained anamorphic streak low behind the jaw in the lion state.
   */
  private buildFlare(): void {
    const intensity = 0.12;
    const mat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: FLARE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uColor: { value: new THREE.Vector3(1.1, 0.75, 0.35) },
      },
    });
    this.flare = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.85), mat);
    this.flare.position.set(-1.55, -1.35, 0.2);
    this.flare.rotation.z = 0.55;
    this.flare.userData.baseIntensity = intensity;
    this.flare.renderOrder = 4;
    this.scene.add(this.flare);
  }


  // ------------------------------------------------------------------ post --
  private buildPost(): void {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // Bloom only the brightest gold accents; the particles themselves remain
    // individually legible, especially in the final lion.
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.24, 0.22, 0.82);
    this.composer.addPass(this.bloom);

    const gradePass = new ShaderPass(new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: GRADE_FRAG,
      uniforms: {
        tDiffuse: { value: null },
        uVignette: { value: 0.42 },
      },
    }));
    this.composer.addPass(gradePass);
  }

  // ---------------------------------------------------------------- events --
  private onPointerMove = (e: PointerEvent): void => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    this.pointer.set(nx, ny); // drives camera parallax regardless of repulsion state
    // The unproject below only feeds the repulsion field, which is zero until
    // the pointer has actually entered the canvas — skip it until then.
    if (this.pointerStrength.value === 0) return;
    const v = new THREE.Vector3(nx, ny, 0.5).unproject(this.camera);
    const dir = v.sub(this.camera.position).normalize();
    const dist = -this.camera.position.z / dir.z;
    this.pointerWorld.copy(this.camera.position).add(dir.multiplyScalar(dist));
  };

  // documentElement, not window: pointerenter/leave do not fire reliably on window
  private onPointerEnter = (): void => {
    gsap.to(this.pointerStrength, { value: 0.15, duration: 0.6, ease: "power2.out" });
  };

  private onPointerLeave = (): void => {
    gsap.to(this.pointerStrength, { value: 0, duration: 0.8, ease: "power2.out" });
  };

  private onResize = (): void => this.resize();

  private onVisibility = (): void => {
    if (document.hidden) this.stop();
    else this.start();
  };

  private bindEvents(): void {
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerenter", this.onPointerEnter);
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  // ------------------------------------------------------------------ loop --
  private start(): void {
    if (this.running || this.disposed) return;
    gsap.ticker.add(this.tick);
    this.running = true;
  }

  private stop(): void {
    if (!this.running) return;
    gsap.ticker.remove(this.tick);
    this.running = false;
  }

  /**
    * Render exactly one frame without joining the ticker (the reduced-motion
    * path). Pass a delta to advance the internal eases too, which is how the
    * choreography can be stepped from the console while tuning.
    */
  renderOnce(deltaMs = 0): void {
    this.tick(0, deltaMs);
  }

  private tick = (_time: number, deltaMs: number): void => {
    if (this.disposed || !this.composer) return;

    // Frame-rate independent ease toward the scroll target. The prototype used
    // a fixed 0.075 per frame, which ran ~2.4x faster on a 144Hz display.
    const dt = Math.min(deltaMs, 100) / 1000;
    this.elapsed += dt;
    const t = this.elapsed;
    this.morph += (this.morphTarget - this.morph) * (1 - Math.exp(-9 * dt));
    this.layout += (this.layoutTarget - this.layout) * (1 - Math.exp(-7 * dt));
    const m = this.morph;

    if (this.material) {
      const u = this.material.uniforms;
      u.uTime.value = t;
      u.uMorph.value = m;
      u.uDriftAmp.value = 0.12 + m * 0.18;
      u.uTurb.value = 0.015 + Math.min(m, 0.45) * 0.12;
      u.uMouse.value.copy(this.pointerWorld);
      u.uMouseStrength.value = this.pointerStrength.value;
      u.uBloom.value = this.bloomW;
      // The energy current and reformed lion use the same sparse population,
      // so only a light compensation is needed across states.
      u.uGain.value = this.baseGain * this.gainAspect * (1 - m * 0.08) * (1 - this.bloomW * 0.05);
    }

    if (this.dust) {
      const du = (this.dust.material as THREE.ShaderMaterial).uniforms;
      du.uTime.value = t;
      du.uMorph.value = m;
    }

    if (this.swarmMat) {
      const su = this.swarmMat.uniforms;
      su.uTime.value = t;
      su.uMorph.value = m;
      su.uBloom.value = this.bloomW;
    }

    if (this.plexusMat) {
      const pu = this.plexusMat.uniforms;
      pu.uTime.value = t;
      pu.uMorph.value = m;
      pu.uBloom.value = this.bloomW;
      pu.uFade.value = 1;
    }


    // the flare belongs to the lion state and dissolves as the collapse begins
    if (this.flare) {
      const fu = (this.flare.material as THREE.ShaderMaterial).uniforms;
      fu.uTime.value = t;
      fu.uIntensity.value = (this.flare.userData.baseIntensity as number) * (1 - m * 0.9);
    }


    // Camera enters the expanded field, then eases back to frame the connected
    // forms. This is spatial movement, not a lens-warp post effect, so there is
    // no transparent sphere or white-hole artifact.
    this.camOffset.x += (this.pointer.x * 0.22 - this.camOffset.x) * 0.045;
    this.camOffset.y += (this.pointer.y * 0.14 - this.camOffset.y) * 0.045;
    const idleSway = Math.sin(t * 0.24) * 0.03;
    const immersive = THREE.MathUtils.smoothstep(m, 0.12, 0.28)
      * (1 - THREE.MathUtils.smoothstep(m, 0.34, 0.50));
    this.camera.position.set(
      this.camOffset.x,
      0.05 + this.camOffset.y + idleSway,
      4.8 - immersive * 1.45,
    );
    this.camera.lookAt(0, 0, 0);

    // The lion breathes; the energy current moves entirely in-shader.
    if (this.points) {
      // A slight three-quarter turn, not dead-on: a frontal particle head
      // reads as a symmetrical sphere, while an angled one shows the muzzle
      // against the mane and resolves as a face.
      this.points.rotation.y = (this.yawProbe + Math.sin(t * 0.1) * 0.07) * (1 - m);
      // Centred and lifted, so the whole head is in frame and the copy has
      // clean space beneath it. The prototype pushed the lion off to the left,
      // which cropped the mane and put the face behind the headline.
      const halfW = this.halfH * this.camera.aspect;
      this.points.position.x = this.layout * halfW;
      this.points.position.y = (this.halfH * 0.22) * (1 - THREE.MathUtils.smoothstep(m, 0.04, 0.18));
      // Always drawn: the same population becomes the ambient current for the
      // middle sections rather than handing off to another canvas.
      this.points.visible = true;
      // Act 7 crest sits above the CTA; drop the Act 1 side offset for it
      if (this.bloomW > 0.002) {
        this.points.position.multiplyScalar(1 - this.bloomW);
        this.points.rotation.y *= 1 - this.bloomW;
      }
    }

    // The swarm and plexus are part of the same sculpture. They follow every
    // side-to-side layout move, then detach into viewport coordinates for CTA.
    if (this.swarmGroup && this.points) {
      const follow = 1 - this.bloomW;
      this.swarmGroup.position.copy(this.points.position).multiplyScalar(follow);
      this.swarmGroup.rotation.y = this.points.rotation.y * follow;
      this.swarmGroup.scale.setScalar(THREE.MathUtils.lerp(0.92, 1, 1 - follow));
    }


    // A restrained bloom keeps individual points visible instead of merging
    // the lion or energy current into a white mass.
    const bloomBase = this.compactDevice ? 0.21 : 0.28;
    const ecosystemGlow = THREE.MathUtils.smoothstep(m, 0.30, 0.48)
      * (1 - THREE.MathUtils.smoothstep(m, 0.70, 0.86));
    this.bloom.strength = bloomBase + ecosystemGlow * 0.09 + this.bloomW * 0.04;

    // Keep the same focus plane across states. The old moving focus and lens
    // warp created a transparent sphere/white-hole artifact in the middle.
    if (this.material) this.material.uniforms.uFocusDist.value = 3.9;
    if (this.dust) (this.dust.material as THREE.ShaderMaterial).uniforms.uFocusDist.value = 3.9;
    if (this.swarmMat) this.swarmMat.uniforms.uFocusDist.value = 3.9;

    this.composer.render();
  };

  private resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    // One clean canvas. Mobile renders at native CSS-pixel density; the sparse
    // points stay crisp without paying the quadratic cost of a high DPR.
    const dpr = Math.min(window.devicePixelRatio, this.compactDevice ? 1 : DPR_CAP);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.composer?.setSize(w * dpr, h * dpr);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // Portrait viewports pack the same energy into fewer pixels, but the
    // prototype's 0.5 floor dimmed narrow desktop windows into mud.
    this.gainAspect = THREE.MathUtils.clamp(this.camera.aspect / 1.4, 0.82, 1);

    // Half the visible height at the z=0 plane. Everything laid out against the
    // viewport (the ribbon, the graph, the CTA target) is measured in these units.
    this.halfH = Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;

    if (this.material) this.material.uniforms.uPixelRatio.value = dpr;
    if (this.dust) (this.dust.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value = dpr;
    if (this.swarmMat) this.swarmMat.uniforms.uPixelRatio.value = dpr;
  }

  /** Cinematic intro: particles fly in from the void and assemble the lion. */
  playIntro(duration = 2.6): gsap.core.Tween | null {
    if (!this.material) return null;
    return gsap.to(this.material.uniforms.uIntro, {
      value: 1,
      duration,
      ease: "power2.inOut",
    });
  }

  /** Skip the fly-in and show the assembled lion immediately. */
  skipIntro(): void {
    if (this.material) this.material.uniforms.uIntro.value = 1;
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    this.disposeHooks.forEach((fn) => fn());
    this.disposeHooks = [];
    window.removeEventListener("pointermove", this.onPointerMove);
    document.documentElement.removeEventListener("pointerenter", this.onPointerEnter);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.scene.traverse((o) => {
      const anyO = o as THREE.Mesh;
      if (anyO.geometry) anyO.geometry.dispose();
      const mat = anyO.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
      else mat?.dispose();
    });
    this.composer?.dispose();
    this.renderer?.dispose();
  }
}
