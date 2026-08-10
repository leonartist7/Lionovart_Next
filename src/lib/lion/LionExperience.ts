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
  CORE_FRAG,
  FLARE_FRAG,
  RAYS_FRAG,
  SWARM_VERT, SWARM_FRAG,
  PLEXUS_VERT, PLEXUS_FRAG,
} from "./shaders";

export interface LionExperienceOptions {
  modelUrl?: string;
  maxParticles?: number;
  onReady?: () => void;
}

/** Cap below the prototype's 2: bloom is fill-rate bound and scales with DPR squared. */
const DPR_CAP = 1.5;

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Framework-agnostic particle engine: golden lion head that morphs into a
 * singularity. Drive `morphTarget` (0..1) from scroll; call `playIntro()`
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
  private gradePass!: ShaderPass;
  private raysPass!: ShaderPass;
  private swarmMat: THREE.ShaderMaterial | null = null;
  private plexusMat: THREE.ShaderMaterial | null = null;
  private swarmGroup: THREE.Group | null = null;
  private dust: THREE.Points | null = null;
  private flare: THREE.Mesh | null = null;
  private gainAspect = 1;
  private halfH = 1.85;

  private points: THREE.Points | null = null;
  private material!: THREE.ShaderMaterial;
  private coreGlow!: THREE.Mesh;
  /** Seconds since start. Accumulated from the ticker delta; THREE.Clock is
   *  deprecated in r185 and THREE.Timer would just be a second thing to update. */
  private elapsed = 0;
  private running = false;
  private disposed = false;
  private disposeHooks: Array<() => void> = [];

  /** Base yaw of the head. Dev-tunable via ?yaw= while framing the shot. */
  public yawProbe = 0.34;

  /** Scroll-driven morph target, eased internally (0 = lion, 1 = singularity) */
  public morphTarget = 0;
  private morph = 0;
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

  /** Act 1: 0 = lion, 1 = collapsed accretion disk. */
  setMorph(v: number): void { this.morphTarget = clamp01(v); }

  /** Act 7: 0 = collapsed disk, 1 = reformed lion over a ring on the CTA. */
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
    if (!this.swarmMat || !this.material) return;
    const w = this.toWorld(nx, ny);
    (this.swarmMat.uniforms.uCta.value as THREE.Vector3).copy(w);
    (this.material.uniforms.uCrest.value as THREE.Vector3).set(w.x, w.y + this.halfH * 0.55, 0);
  }

  /** Normalized screen coords (x right, y down) to a point on the z=0 plane. */
  private toWorld(nx: number, ny: number): THREE.Vector3 {
    const halfW = this.halfH * this.camera.aspect;
    return new THREE.Vector3(nx * halfW, -ny * this.halfH, 0);
  }

  private detectParticleBudget(): number {
    // Points are now few, large, and near-opaque (a defined point-sculpture,
    // not a soft haze), and the canvas runs continuously behind the whole
    // page. Both push the count down an order of magnitude from the earlier
    // hazy-cloud tiers — fewer, bigger marks read as MORE defined, not less.
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl");
      const ext = gl?.getExtension("WEBGL_debug_renderer_info");
      const r = ext ? String(gl?.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
      if (/swiftshader|llvmpipe|software/i.test(r)) return 2_000;
    } catch { /* ignore */ }
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    if (coarse || mobile || mem <= 4) return 3_200;
    if (mem <= 8) return 5_000;
    return 6_500;
  }

  /** Dev-only URL overrides, read once at init: ?count=90000 and ?morph=1. */
  private applyDevOverrides(): void {
    const q = new URLSearchParams(window.location.search);
    const forced = q.get("count");
    if (forced) {
      this.opts.maxParticles = Math.max(5_000, parseInt(forced, 10) || this.opts.maxParticles);
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
    if (!this.opts.maxParticles) this.opts.maxParticles = this.detectParticleBudget();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 1); // brand black, matches --color-bg-dark
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    this.camera.position.set(0, 0.05, 4.8);

    this.buildDust();
    this.buildFlare();
    this.buildCoreGlow();
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
        // A deliberate, chunky mark rather than a haze — points are down an
        // order of magnitude from the original haze tiers, so each one needs
        // to carry more area. Sized up alongside the softer PARTICLE_FRAG
        // falloff so fewer, softer points don't read as sparse gaps.
        uSize: { value: 56.0 },
        uGain: { value: 1 },
        uFocusDist: { value: 3.9 },
        uDofAmount: { value: 0.38 },
        uPixelRatio: { value: dpr },
        uBloom: { value: 0 },
        uCrest: { value: new THREE.Vector3(0, 0, 0) },
      },
    });

    // Per-particle brightness inversely proportional to density, so accumulated
    // luminance stays constant across quality tiers. Numerator MUST track the
    // desktop tier constant in detectParticleBudget() above, or every tier's
    // brightness balance drifts uncontrolled — currently 6500 to match.
    this.baseGain = THREE.MathUtils.clamp(6500 / count, 0.05, 2.5);
    this.material.uniforms.uGain.value = this.baseGain;
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    // The head is the hero asset, so it gets the room. Too small and the
    // muzzle and brow stop resolving and it reads as a glowing sphere.
    this.points.scale.setScalar(0.92);
    this.scene.add(this.points);
    this.buildSwarm();
  }

  // ------------------------------------------------------------------ dust --
  private buildDust(): void {
    const count = 6500;
    const positions = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = -1.5 - Math.random() * 3.5;
      for (let k = 0; k < 4; k++) rand[i * 4 + k] = Math.random();
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
        uPixelRatio: { value: Math.min(window.devicePixelRatio, DPR_CAP) },
        uColor: { value: new THREE.Color(0.95, 0.65, 0.25) }, // warm amber dust
        uFocusDist: { value: 3.9 },
        uDofAmount: { value: 0.38 },
        uMorph: { value: 0 },
      },
    });
    this.dust = new THREE.Points(geo, mat);
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  // ---------------------------------------------------- neural swarm -------
  /**
   * Energy orbs with comet trails, plus the plexus web between paired orbs.
   *
   * These live in their own group rather than under the lion, because in Act 7
   * they leave the lion's frame to converge on the CTA, which is positioned
   * against the VIEWPORT. The group tracks the lion's transform up to that
   * point and relaxes to identity as the swarm breaks away (see tick).
   */
  private buildSwarm(): void {
    const heads = 260;
    const trailLen = 6;
    const count = heads * (trailLen + 1);

    const positions = new Float32Array(count * 3); // unused; motion is procedural
    const rand = new Float32Array(count * 4);
    const trail = new Float32Array(count);
    const lag = new Float32Array(count);
    const headRand = new Float32Array(heads * 4);

    let k = 0;
    for (let i = 0; i < heads; i++) {
      const r0 = Math.random(), r1 = Math.random(), r2 = Math.random(), r3 = Math.random();
      headRand.set([r0, r1, r2, r3], i * 4);
      for (let j = 0; j <= trailLen; j++) {
        const tr = j / trailLen;
        rand.set([r0, r1, r2, r3], k * 4);
        trail[k] = tr;
        lag[k] = j === 0 ? 0 : tr * 1.4; // seconds behind the head
        k++;
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
        uPixelRatio: { value: Math.min(window.devicePixelRatio, DPR_CAP) },
        uMorph: { value: 0 },
        uFocusDist: { value: 3.9 },
        uDofAmount: { value: 0.38 },
        uBloom: { value: 0 },
        uCta: { value: new THREE.Vector3(0, 0, 0) },
      },
    });

    this.swarmGroup = new THREE.Group();
    const swarm = new THREE.Points(geo, this.swarmMat);
    swarm.frustumCulled = false;
    this.swarmGroup.add(swarm);
    this.scene.add(this.swarmGroup);
    this.buildPlexus(headRand, heads);
  }

  /**
   * Static edge list, authored once. Orbs are paired by adjacency in orbital
   * phase (aRand.x), so partners travel together and their separation is driven
   * by the radius/speed spread — the link genuinely tightens and loosens over
   * time, which is what the shader's distance fade renders. Nothing here
   * evaluates the orbit math; that lives only in SWARM_POS_GLSL.
   */
  private buildPlexus(headRand: Float32Array, heads: number): void {
    const order = Array.from({ length: heads }, (_, i) => i)
      .sort((a, b) => headRand[a * 4] - headRand[b * 4]);

    const pairs: Array<[number, number]> = [];
    for (let i = 0; i + 1 < heads; i += 2) pairs.push([order[i], order[i + 1]]);
    for (let i = 0; i + 2 < heads; i += 4) pairs.push([order[i], order[i + 2]]);

    const n = pairs.length * 2;
    const position = new Float32Array(n * 3); // unused; motion is procedural
    const aRand = new Float32Array(n * 4);
    const aLag = new Float32Array(n);
    const aRandB = new Float32Array(n * 4);
    const aLagB = new Float32Array(n);

    pairs.forEach(([a, b], s) => {
      const seedA = headRand.subarray(a * 4, a * 4 + 4);
      const seedB = headRand.subarray(b * 4, b * 4 + 4);
      // vertex 0 draws from A to B, vertex 1 from B to A: both need both seeds
      aRand.set(seedA, s * 8);
      aRandB.set(seedB, s * 8);
      aRand.set(seedB, s * 8 + 4);
      aRandB.set(seedA, s * 8 + 4);
      aLag[s * 2] = 0;
      aLagB[s * 2] = 0;
      aLag[s * 2 + 1] = 0;
      aLagB[s * 2 + 1] = 0;
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
      },
    });

    const plexus = new THREE.LineSegments(geo, this.plexusMat);
    plexus.frustumCulled = false;
    this.swarmGroup!.add(plexus);
  }

  // --------------------------------------------------------- lens flare ----
  /**
   * One anamorphic streak low behind the jaw. The god-ray pass tracks it, so
   * the shafts fan upward from below instead of washing over the head.
   */
  private buildFlare(): void {
    const intensity = 0.24;
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

  /** Procedural lens-dirt texture: soft smudges that catch the bloom. */
  private makeDirtTexture(): THREE.CanvasTexture {
    const S = 512;
    const cv = document.createElement("canvas");
    cv.width = cv.height = S;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, S, S);
    // broad soft smudges
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * S, y = Math.random() * S;
      const r = 24 + Math.random() * 90;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const a = 0.02 + Math.random() * 0.05;
      g.addColorStop(0, `rgba(255,235,220,${a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);
    }
    // fine dust specks on the "lens"
    for (let i = 0; i < 320; i++) {
      const x = Math.random() * S, y = Math.random() * S;
      const r = 0.4 + Math.random() * 1.6;
      ctx.fillStyle = `rgba(255,240,225,${0.02 + Math.random() * 0.06})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // faint streaks
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = "rgba(255,230,210,1)";
      ctx.lineWidth = 1 + Math.random() * 2.5;
      ctx.beginPath();
      const x0 = Math.random() * S, y0 = Math.random() * S;
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(x0 + 60, y0 + 30, x0 + 120, y0 - 40, x0 + 200, y0 + 20);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // ------------------------------------------------------------- core glow --
  private buildCoreGlow(): void {
    const mat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: CORE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0 },
      },
    });
    this.coreGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), mat);
    this.coreGlow.renderOrder = 5;
    this.scene.add(this.coreGlow);
  }

  // ------------------------------------------------------------------ post --
  private buildPost(): void {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // Threshold high enough that only genuine hotspots bleed — with fewer,
    // bigger, brighter opaque points (Phase 3), a low threshold blooms the
    // whole silhouette into a single white ball instead of just its highlights.
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.30, 0.68);
    this.composer.addPass(this.bloom);
    this.raysPass = new ShaderPass(new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: RAYS_FRAG,
      uniforms: {
        tDiffuse: { value: null },
        uLightPos: { value: new THREE.Vector2(0.55, 0.72) },
        uIntensity: { value: 0.5 },
      },
    }));
    this.composer.addPass(this.raysPass);

    this.gradePass = new ShaderPass(new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: GRADE_FRAG,
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uVignette: { value: 0.55 },
        uDirt: { value: this.makeDirtTexture() },
        uWarp: { value: 0 },
        uWarpCenter: { value: new THREE.Vector2(0.5, 0.52) },
        uAspect: { value: 16 / 9 },
      },
    }));
    this.composer.addPass(this.gradePass);
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
    const m = this.morph;

    // How far the swarm has left the lion's orbit. Drives the group transform
    // relaxation, the plexus fade, and whether the lion is worth drawing.
    const away = this.bloomW;

    if (this.material) {
      const u = this.material.uniforms;
      u.uTime.value = t;
      u.uMorph.value = m;
      u.uDriftAmp.value = 0.12 + m * 0.55;
      u.uTurb.value = 0.02 + m * 0.16;
      u.uMouse.value.copy(this.pointerWorld);
      u.uMouseStrength.value = this.pointerStrength.value;
      u.uBloom.value = this.bloomW;
      // The disk packs the same particles into less area: dim as we morph.
      // The Act 7 crest compresses them further still (0.58x scale into a
      // small screen area around the CTA) — without this bloomW term, gain
      // stayed at its disk-state level exactly when local density peaked,
      // which is what blew the CTA reform out to a solid white ball.
      u.uGain.value = this.baseGain * this.gainAspect * (1 - m * 0.45) * (1 - this.bloomW * 0.35);
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
      this.plexusMat.uniforms.uTime.value = t;
      this.plexusMat.uniforms.uMorph.value = m;
      this.plexusMat.uniforms.uFade.value = 1 - away;
    }

    // the flare belongs to the lion state and dissolves as the collapse begins
    if (this.flare) {
      const fu = (this.flare.material as THREE.ShaderMaterial).uniforms;
      fu.uTime.value = t;
      fu.uIntensity.value = (this.flare.userData.baseIntensity as number) * (1 - m * 0.9);
    }

    const coreMat = this.coreGlow.material as THREE.ShaderMaterial;
    coreMat.uniforms.uTime.value = t;
    coreMat.uniforms.uIntensity.value = THREE.MathUtils.smoothstep(m, 0.55, 1.0) * 0.12;
    this.coreGlow.quaternion.copy(this.camera.quaternion);

    // camera: pointer parallax + scroll push-in
    this.camOffset.x += (this.pointer.x * 0.22 - this.camOffset.x) * 0.045;
    this.camOffset.y += (this.pointer.y * 0.14 - this.camOffset.y) * 0.045;
    const idleSway = Math.sin(t * 0.24) * 0.03;
    this.camera.position.set(
      this.camOffset.x,
      0.05 + this.camOffset.y + idleSway + m * 0.35,
      4.8 - m * 1.1,
    );
    this.camera.lookAt(0, 0, 0);

    // lion breathes (the disk spins in-shader; no container rotation needed)
    if (this.points) {
      // A slight three-quarter turn, not dead-on: a frontal particle head
      // reads as a symmetrical sphere, while an angled one shows the muzzle
      // against the mane and resolves as a face.
      this.points.rotation.y = (this.yawProbe + Math.sin(t * 0.1) * 0.07) * (1 - m);
      // Centred and lifted, so the whole head is in frame and the copy has
      // clean space beneath it. The prototype pushed the lion off to the left,
      // which cropped the mane and put the face behind the headline.
      this.points.position.x = 0;
      this.points.position.y = (this.halfH * 0.22) * (1 - m);
      // Always drawn: the collapsed disk is the ambient backdrop for every
      // section below the hero, not a transient moment to hide.
      this.points.visible = true;
      // Act 7 crest sits above the CTA; drop the Act 1 side offset for it
      if (this.bloomW > 0.002) {
        this.points.position.multiplyScalar(1 - this.bloomW);
        this.points.rotation.y *= 1 - this.bloomW;
      }
    }

    // The swarm follows the lion in Act 1, then relaxes to the viewport frame
    // so the ribbon and the graph can be laid out against the screen.
    if (this.swarmGroup && this.points) {
      const follow = 1 - away;
      this.swarmGroup.position.copy(this.points.position).multiplyScalar(follow);
      this.swarmGroup.rotation.y = this.points.rotation.y * follow;
      this.swarmGroup.scale.setScalar(THREE.MathUtils.lerp(1, 0.88, follow));
    }

    // bloomW's contribution is deliberately small: the crest is already the
    // densest particle moment on the page (see the uGain comment above), so
    // pumping bloom strength further there compounds the whiteout instead of
    // creating the intended peak-end highlight.
    this.bloom.strength = 0.42 + m * 0.26 + this.bloomW * 0.1;

    // camera optics: focus tracks the face in lion state, the core later
    const focusDist = THREE.MathUtils.lerp(3.9, 3.65, m);
    if (this.material) this.material.uniforms.uFocusDist.value = focusDist;
    if (this.dust) (this.dust.material as THREE.ShaderMaterial).uniforms.uFocusDist.value = focusDist;
    if (this.swarmMat) this.swarmMat.uniforms.uFocusDist.value = focusDist;

    // God rays: emitted from the flare, gliding to the core on morph. Its
    // intensity already dims toward ~0.09 at m=1, but the pass still does its
    // full 26-sample-per-pixel sweep every frame. Skip the pass entirely once
    // squarely mid-page (fully collapsed, not yet reforming) — the canvas now
    // runs the whole scroll, so this is a real, always-on cost to cut, with no
    // visible difference since the contribution there is already near-zero.
    this.raysPass.enabled = !(m > 0.98 && this.bloomW < 0.01);
    if (this.raysPass.enabled) {
      const src = this.flare ? this.flare.position : new THREE.Vector3();
      const lightNdc = src.clone().lerp(new THREE.Vector3(0, 0, 0), m).project(this.camera);
      const rayU = this.raysPass.material.uniforms;
      rayU.uLightPos.value.set(lightNdc.x * 0.5 + 0.5, lightNdc.y * 0.5 + 0.5);
      rayU.uIntensity.value = 0.2 * (1 - m * 0.55);
    }

    // gravitational lens warp grows with the singularity
    const gradeU = this.gradePass.material.uniforms;
    gradeU.uTime.value = t;
    gradeU.uWarp.value = THREE.MathUtils.smoothstep(m, 0.62, 1.0) * 1.0;
    gradeU.uAspect.value = this.camera.aspect;

    this.composer.render();
  };

  private resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    // The canvas now runs for the whole page on every device (no bookend to
    // hide it mid-scroll), so mobile gets a tighter cap than desktop — points
    // are large per Phase 3, so the resolution cut isn't a legibility loss.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio, coarse ? 1.2 : DPR_CAP);
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
