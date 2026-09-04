import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
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
 * DPR cap, visibilitychange pause, full dispose) so it fits the codebase's
 * established performance discipline rather than inventing new rules.
 */
export class LionCenterpiece {
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private lion: THREE.Group | null = null;
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
    this.renderer.toneMappingExposure = 1.15;

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0.3, 6.2);

    this.buildLights();
    this.buildEmbers();
    await this.loadLion();
    if (this.disposed) return;

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
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.14));

    // Warm gold key: the human hand.
    const key = new THREE.DirectionalLight(0xffcf8a, 3.2);
    key.position.set(3.5, 4.5, 3.5);
    this.scene.add(key);

    // Cool cyan rim: the machine, matching the page's --ai-cyan accent.
    const rim = new THREE.DirectionalLight(0x6fe3ff, 2.4);
    rim.position.set(-4, 1.5, -3.5);
    this.scene.add(rim);

    // Faint warm fill so the underside never goes fully flat black.
    const fill = new THREE.DirectionalLight(0xffe6c2, 0.35);
    fill.position.set(-1.5, -2, 2);
    this.scene.add(fill);
  }

  private buildEmbers(): void {
    const count = 220;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const gold = new THREE.Color(1.15, 0.78, 0.32);
    const cyan = new THREE.Color(0.32, 0.86, 1.1);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
      const c = Math.random() < 0.82 ? gold : cyan;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      this.emberData.push({
        speed: 0.06 + Math.random() * 0.12,
        sway: 0.15 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
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
        color: 0x2a1a08,
        metalness: 0.88,
        roughness: 0.36,
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
    this.lion.scale.setScalar(2.4 / maxDim);
    this.lion.position.y = 0.25;
  }

  private onResize = (): void => this.resize();

  private resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderDpr = Math.min(window.devicePixelRatio, 1.65);
    this.renderer.setPixelRatio(this.renderDpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.reduce) this.renderOnce();
  }

  private onVisibility = (): void => {
    if (document.hidden) this.stop();
    else if (this.opts.animate) this.start();
  };

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
    const radius = 6.4 - Math.sin(this.scroll * Math.PI) * 0.5;
    this.camera.position.set(
      Math.sin(angle) * radius,
      0.35 + this.pointer.y * 0.15,
      Math.cos(angle) * radius,
    );
    this.camera.lookAt(0, -0.05, 0);

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
        if (positions[idx + 1] > 2.2) positions[idx + 1] = -2.2;
      }
      this.embers.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
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
    this.renderer?.dispose();
  }
}
