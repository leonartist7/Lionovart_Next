import * as THREE from "three/webgpu";
import { WebGPURenderer, PMREMGenerator } from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Pose } from "./motion";

/** The standalone lion model, with WebGPU and WebGL2 fallback. */
export class LionEngine {
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5000);
  private lion = new THREE.Group();
  private renderer?: WebGPURenderer;
  private environment?: THREE.RenderTarget;
  private loader = new DRACOLoader();
  private disposed = false;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private samples: number[] = [];
  private lastFrame = 0;
  private lost?: () => void;

  constructor(private host: HTMLDivElement, private onError: () => void) {}

  async init(mobile: boolean) {
    // Use a fresh canvas per backend: a failed GPU context must not poison WebGL.
    const forceFallback = process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("lionWebGL");
    for (const forceWebGL of forceFallback ? [true] : [false, true]) {
      const canvas = document.createElement("canvas");
      const renderer = new WebGPURenderer({ canvas, alpha: true, antialias: true, forceWebGL });
      try {
        await renderer.init();
        if (this.disposed) { renderer.dispose(); return; }
        this.renderer = renderer;
        renderer.onDeviceLost = () => { if (!this.disposed) this.onError(); };
        this.host.replaceChildren(canvas);
        this.host.dataset.backend = renderer.backend.constructor.name;
        this.lost = () => this.onError();
        canvas.addEventListener("webglcontextlost", this.lost);
        break;
      } catch (error) {
        renderer.dispose();
        if (forceWebGL) throw error;
      }
    }
    const renderer = this.renderer;
    if (!renderer || this.disposed) return;
    this.dpr = Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.5);
    renderer.setPixelRatio(this.dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    this.camera.position.z = 1800;
    const studio = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    this.environment = pmrem.fromScene(studio, 0.04);
    studio.dispose(); pmrem.dispose();
    if (this.disposed) { this.environment.dispose(); return; }
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = 0.65;
    this.scene.add(new THREE.HemisphereLight(0xffecd6, 0x17121d, 2));
    const key = new THREE.DirectionalLight(0xffe3c4, 3.4);
    key.position.set(-300, 500, 800);
    const fill = new THREE.DirectionalLight(0xdfe5ff, 1.5);
    fill.position.set(500, 100, 600);
    this.scene.add(key, fill, this.lion);
    this.loader.setDecoderPath("/models/lion/draco/");
    this.loader.setWorkerLimit(1);
    const missingAsset = process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("lionFailAsset");
    const asset = `/models/lion/lion-${missingAsset ? "missing-test" : mobile ? "mobile" : "desktop"}.glb?v=hid-20260914`;
    this.host.dataset.asset = asset;
    const gltf = await new GLTFLoader().setDRACOLoader(this.loader).loadAsync(asset);
    if (this.disposed) { this.disposeObject(gltf.scene); return; }
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const scale = 2 / box.getSize(new THREE.Vector3()).y;
    gltf.scene.position.copy(center).multiplyScalar(-scale);
    gltf.scene.scale.setScalar(scale);
    // The supplied glTF is opaque. Keep its color maps, but do not allow a
    // converted node material to blend the lion with the page or film.
    const converted = new Map<THREE.Material, THREE.MeshStandardNodeMaterial>();
    gltf.scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const soften = (source: THREE.Material) => {
        if (!(source instanceof THREE.MeshStandardMaterial)) return source;
        if (converted.has(source)) return converted.get(source)!;
        const material = new THREE.MeshStandardNodeMaterial({
          color: source.color, map: source.map, metalness: source.metalness, roughness: source.roughness,
          metalnessMap: source.metalnessMap, roughnessMap: source.roughnessMap,
          normalMap: source.normalMap, normalScale: source.normalScale,
          aoMap: source.aoMap, aoMapIntensity: source.aoMapIntensity,
          emissive: source.emissive, emissiveMap: source.emissiveMap, emissiveIntensity: source.emissiveIntensity,
          side: source.side, transparent: false, depthWrite: true,
          alphaTest: 0, opacity: 1,
        });
        converted.set(source, material);
        return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(soften) : soften(object.material);
    });
    converted.forEach((_, source) => source.dispose());
    this.lion.add(gltf.scene);
    this.resize(innerWidth, innerHeight);
    // Warm up before replacing the poster.
    await renderer.compileAsync(this.scene, this.camera);
    if (!this.disposed) renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number) {
    if (!this.renderer || this.disposed) return;
    this.width = width; this.height = height;
    this.camera.left = -width / 2; this.camera.right = width / 2;
    this.camera.top = height / 2; this.camera.bottom = -height / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render(lion: Pose, scroll: number, mobile: boolean, lionVisible: boolean) {
    if (!this.renderer || this.disposed) return;
    if (mobile && this.dpr > 1.25) {
      this.dpr = 1.25;
      this.renderer.setPixelRatio(this.dpr);
      this.renderer.setSize(this.width, this.height);
    }
    const place = (group: THREE.Group, pose: Pose) => {
      group.position.set(pose.x - this.width / 2, this.height / 2 - (pose.y - scroll), 0);
      group.scale.setScalar(pose.size / 2);
    };
    place(this.lion, lion);
    this.lion.visible = lionVisible;
    // The scroll route turns directly from hero-right to video-front.
    this.lion.rotation.y = lion.turn * 1.25;
    this.lion.rotation.x = lion.pitch ?? 0;

    try { this.renderer.render(this.scene, this.camera); }
    catch { this.onError(); return; }
    const now = performance.now();
    if (this.lastFrame) this.samples.push(now - this.lastFrame);
    this.lastFrame = now;
    if (this.samples.length >= 120) {
      const sorted = this.samples.sort((a,b) => a-b);
      this.host.dataset.frameMedian = sorted[60].toFixed(1);
      this.host.dataset.frameP95 = sorted[114].toFixed(1);
      if (sorted[60] > (mobile ? 32 : 22) && this.dpr > 1) {
        this.dpr = Math.max(1, this.dpr - 0.25);
        this.renderer.setPixelRatio(this.dpr);
        this.renderer.setSize(this.width, this.height);
      }
      this.samples = [];
    }
  }

  pause() { this.lastFrame = 0; this.samples = []; }

  private disposeObject(root: THREE.Object3D) {
    const materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>(), geometries = new Set<THREE.BufferGeometry>();
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material);
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
      }
    });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.lost) this.renderer?.domElement.removeEventListener("webglcontextlost", this.lost);
    this.disposeObject(this.scene); this.environment?.dispose(); this.loader.dispose();
    this.renderer?.dispose(); this.host.replaceChildren();
  }
}
