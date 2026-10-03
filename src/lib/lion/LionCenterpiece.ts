import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import gsap from "gsap";

export interface LionCenterpieceOptions {
  animate?: boolean;
}

/**
 * Preview-only engine: the low-poly lion as the page's opening centerpiece,
 * orbited by scroll instead of the abstract crown. Deliberately separate
 * from LionExperience.ts — this does not touch the shipped particle-rooms
 * system, so it can be evaluated without risk to that work.
 *
 * Same operating conventions as LionExperience.ts (gsap.ticker-driven loop,
 * DPR cap, visibilitychange pause, full dispose, bloom post-pass) so it fits
 * the codebase's established performance and craft discipline rather than
 * inventing new rules.
 */
export class LionCenterpiece {
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private composer: EffectComposer | null = null;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private lion: THREE.Group | null = null;
  private groundShadow: THREE.Mesh | null = null;
  private embers: THREE.Points | null = null;
  private emberData: Array<{ speed: number; sway: number; phase: number }> = [];

  private renderDpr = 1;
  private running = false;
  private disposed = false;
  private reduce: boolean;

  private scrollTarget = 0;
  private scroll = 0;
  private pointerTarget = new THREE.Vector2(0, 0);
  private pointer = new THREE.Vector2(0, 0);

  private opts: { animate: boolean };

  constructor(canvas: HTMLCanvasElement, options: LionCenterpieceOptions = {}) {
    this.canvas = canvas;
    this.reduce = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.opts = { animate: options.animate ?? !this.reduce };
  }

  /** 0 = arrival (lion turned mostly away), 1 = fully presented three-quarter view. */
  setScroll(v: number): void {
    this.scrollTarget = THREE.MathUtils.clamp(v, 0, 1);
  }

  setPointer(nx: number, ny: number): void {
    this.pointerTarget.set(nx, ny);
  }

  async init(): Promise<void> {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Depth without a modeled environment: a touch of exponential fog keeps
    // the lion from reading as a mesh pasted onto a flat starfield.
    this.scene.fog = new THREE.FogExp2(0x000000, 0.045);

    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    this.camera.position.set(0, 0.3, 5.0);

    this.buildLights();
    this.buildGroundShadow();
    this.buildEmbers();
    await this.loadLion();
    if (this.disposed) return;

    this.buildPost();
    this.resize();
    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibility);

    if (this.reduce) {
      this.scroll = this.scrollTarget = 0.5;
      this.renderOnce();
      return;
    }
    this.start();
  }

  private buildLights(): void {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.16));

    // Warm gold key: the human hand.
    const key = new THREE.DirectionalLight(0xffcf8a, 3.6);
    key.position.set(3.5, 4.5, 3.5);
    this.scene.add(key);

    // Cool cyan rim: the machine, matching the page's --ai-cyan accent.
    const rim = new THREE.DirectionalLight(0x6fe3ff, 3.0);
    rim.position.set(-4, 1.5, -3.5);
    this.scene.add(rim);

    // A second, closer cyan point light sharpens the edge definition on the
    // faceted planes that the two directional lights alone leave flat.
    const edge = new THREE.PointLight(0x8fefff, 2.2, 8, 2);
    edge.position.set(-1.8, 0.6, 2.4);
    this.scene.add(edge);

    // Faint warm fill so the underside never goes fully flat black.
    const fill = new THREE.DirectionalLight(0xffe6c2, 0.4);
    fill.position.set(-1.5, -2, 2);
    this.scene.add(fill);
  }

  /** A soft radial gradient beneath the model so it reads as standing on
   *  something rather than floating in a void. */
  private buildGroundShadow(): void {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(0,0,0,0.55)");
    gradient.addColorStop(0.6, "rgba(0,0,0,0.28)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.CircleGeometry(1.6, 48);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    this.groundShadow = new THREE.Mesh(geo, mat);
    this.groundShadow.rotation.x = -Math.PI / 2;
    this.groundShadow.position.y = -1.05;
    this.scene.add(this.groundShadow);
  }

  private createEmberTexture(): THREE.CanvasTexture {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,255,255,0.85)");
    gradient.addColorStop(0.65, "rgba(255,255,255,0.22)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  private buildEmbers(): void {
    const count = 140;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const gold = new THREE.Color(1.25, 0.82, 0.34);
    const cyan = new THREE.Color(0.36, 0.9, 1.15);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.2 - 0.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.6;
      const c = Math.random() < 0.8 ? gold : cyan;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      this.emberData.push({
        speed: 0.05 + Math.random() * 0.09,
        sway: 0.12 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.09,
      map: this.createEmberTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.embers = new THREE.Points(geo, mat);
    this.scene.add(this.embers);
  }

  private async loadLion(): Promise<void> {
    const loader = new FBXLoader();
    const fbx = await loader.loadAsync("/models/lion-lowpoly.fbx");
    if (this.disposed) return;

    this.lion = new THREE.Group();
    fbx.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.computeVertexNormals();
      // Faceted low-poly reads as a deliberate cut-gem finish rather than a
      // smoothing attempt on geometry that was never built for it.
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0x2e1c0a,
        emissive: 0x3a1f06,
        emissiveIntensity: 0.18,
        metalness: 0.9,
        roughness: 0.32,
        flatShading: true,
      });
    });
    this.lion.add(fbx);
    this.scene.add(this.lion);

    // Auto-fit: measure and recenter fbx in its own (unscaled) local space
    // first, then scale the group — recentering in world space instead would
    // divide by the wrong units and throw the model off-center.
    const box = new THREE.Box3().setFromObject(fbx);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    fbx.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 2.7;
    this.lion.scale.setScalar(targetSize / maxDim);
    this.lion.position.y = 0.05;

    if (this.groundShadow) {
      this.groundShadow.position.y = this.lion.position.y - (size.y / maxDim) * targetSize * 0.5 - 0.08;
    }
  }

  private buildPost(): void {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.35, 0.72));
  }

  private onResize = (): void => this.resize();

  private resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderDpr = Math.min(window.devicePixelRatio, 1.65);
    this.renderer.setPixelRatio(this.renderDpr);
    this.renderer.setSize(w, h, false);
    this.composer?.setPixelRatio(this.renderDpr);
    this.composer?.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.reduce) this.renderOnce();
  }

  private onVisibility = (): void => {
    if (document.hidden) this.stop();
    else if (this.opts.animate && !this.pausedByCaller) this.start();
  };

  /** Caller-driven pause, distinct from the tab-visibility pause: the overlay
   *  calls this once it has faded fully out, so this scene stops costing GPU
   *  while invisible instead of rendering behind opacity:0 for the rest of
   *  the page. */
  pause(): void {
    this.pausedByCaller = true;
    this.stop();
  }

  resume(): void {
    this.pausedByCaller = false;
    if (this.opts.animate && !document.hidden) this.start();
  }

  private pausedByCaller = false;

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

  renderOnce(): void {
    this.tick(0, 0);
  }

  private tick = (_time: number, deltaMs: number): void => {
    if (this.disposed) return;
    const dt = Math.min(deltaMs, 100) / 1000;
    const elapsed = gsap.ticker.time;

    this.scroll += (this.scrollTarget - this.scroll) * (1 - Math.exp(-6 * dt));
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * (1 - Math.exp(-5 * dt));
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * (1 - Math.exp(-5 * dt));

    // A restrained 130° arrival arc, not a full orbit — this is a hero
    // moment, not a product-viewer turntable.
    const arc = THREE.MathUtils.degToRad(130);
    const angle = -arc * 0.5 + this.scroll * arc + this.pointer.x * 0.12;
    const radius = 5.0 - Math.sin(this.scroll * Math.PI) * 0.4;
    this.camera.position.set(
      Math.sin(angle) * radius,
      0.35 + this.pointer.y * 0.15,
      Math.cos(angle) * radius,
    );
    this.camera.lookAt(0, 0, 0);

    if (this.lion) {
      this.lion.rotation.y = Math.sin(elapsed * 0.08) * 0.05;
    }

    if (this.embers) {
      const positions = this.embers.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < this.emberData.length; i++) {
        const d = this.emberData[i];
        const idx = i * 3;
        positions[idx + 1] += d.speed * dt;
        positions[idx] += Math.sin(elapsed * d.speed * 3 + d.phase) * d.sway * dt;
        if (positions[idx + 1] > 1.8) positions[idx + 1] = -1.8;
      }
      this.embers.geometry.attributes.position.needsUpdate = true;
    }

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    this.disposed = true;
    this.stop();
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    this.composer?.dispose();
    this.renderer?.dispose();
  }
}
