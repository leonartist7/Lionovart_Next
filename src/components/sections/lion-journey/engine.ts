import * as THREE from "three/webgpu";
import { WebGPURenderer, MeshPhysicalNodeMaterial, PMREMGenerator } from "three/webgpu";
import { uniform, positionLocal, positionWorld, vec3, sin, cos, attribute, fract, mix, color, cross, textureLoad, ivec2, smoothstep } from "three/tsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { goldRoute, routePoint, streamEnd, type Anchors, type Pose } from "./motion";

/** One scene, one TSL shader, WebGPU with WebGL2 fallback. No simulation or post stack. */
export class LionEngine {
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5000);
  private lion = new THREE.Group();
  private silk = new THREE.Group();
  private renderer?: WebGPURenderer;
  private environment?: THREE.RenderTarget;
  private clock = uniform(0);
  private maneBottom = uniform(-1);
  private maneFadeEnd = uniform(-0.65);
  private band = uniform(44);
  private fadeInStartY = uniform(0);
  private fadeInEndY = uniform(100);
  private fadeStartY = uniform(3000);
  private fadeEndY = uniform(4000);
  private routeTexture = new THREE.DataTexture(new Float32Array(512 * 2 * 4), 512, 2, THREE.RGBAFormat, THREE.FloatType);
  private mobileTier = false;
  private loader = new DRACOLoader();
  private disposed = false;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private samples: number[] = [];
  private lastFrame = 0;
  private particles = new THREE.Group();
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
    this.scene.add(key, fill, this.lion, this.silk);
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
    // Preserve the supplied PBR appearance; dissolve only the lowest mane tips.
    // World-space height stays consistent across meshes and the lion's yaw.
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
          side: source.side, transparent: true, depthWrite: true, alphaTest: 0.015,
        });
        material.opacityNode = smoothstep(this.maneBottom, this.maneFadeEnd, positionWorld.y).mul(source.opacity);
        converted.set(source, material);
        return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(soften) : soften(object.material);
    });
    converted.forEach((_, source) => source.dispose());
    this.lion.add(gltf.scene);
    this.makeSilk(mobile);
    this.resize(innerWidth, innerHeight);
    // Warm up before replacing the poster.
    await renderer.compileAsync(this.scene, this.camera);
    if (!this.disposed) renderer.render(this.scene, this.camera);
  }

  setRoute(anchors: Anchors) {
    const points = goldRoute(anchors), data = this.routeTexture.image.data as Float32Array;
    for (let i = 0; i < 512; i++) {
      const t = i / 511, p = routePoint(points, t);
      const before = routePoint(points, Math.max(0,t-0.001)), after = routePoint(points,Math.min(1,t+0.001));
      const tangent = new THREE.Vector3(after.x-before.x, before.y-after.y, 0).normalize();
      data.set([p.x, -p.y, -260, 1], i*4);
      data.set([tangent.x, tangent.y, 0, 1], (512+i)*4);
    }
    this.routeTexture.needsUpdate = true;
    this.band.value = anchors.mobile ? 34 : 78;
    this.fadeInStartY.value = points[0].y;
    this.fadeInEndY.value = points[0].y + (anchors.mobile ? 60 : 100);
    this.fadeEndY.value = streamEnd(anchors);
    this.fadeStartY.value = this.fadeEndY.value - (anchors.mobile ? 140 : 220);
    if (this.mobileTier !== anchors.mobile) {
      this.disposeObject(this.silk); this.silk.clear(); this.particles.clear();
      this.makeSilk(anchors.mobile);
    }
  }

  private makeSilk(mobile: boolean) {
    this.mobileTier = mobile;
    // Float texture holds the sampled document spline and its tangents. It is
    // uploaded only on layout changes; particles and folds run entirely on GPU.
    const makeMaterial = (motes: boolean) => {
      const material = new MeshPhysicalNodeMaterial({ roughness: motes ? 0.24 : 0.3, metalness: motes ? 0.35 : 0.65, clearcoat: 0.65,
        transparent: true, depthWrite: false, blending: THREE.NormalBlending });
      const flow = attribute<"vec3">("flow", "vec3");
      const t = motes ? fract(flow.x.add(this.clock.mul(0.008))) : flow.x;
      const sample = t.mul(511), index = sample.floor().toInt(), next = sample.floor().add(1).min(511).toInt();
      const center = mix(textureLoad(this.routeTexture, ivec2(index,0)).xyz, textureLoad(this.routeTexture,ivec2(next,0)).xyz, sample.fract());
      const tangent = mix(textureLoad(this.routeTexture,ivec2(index,1)).xyz,textureLoad(this.routeTexture,ivec2(next,1)).xyz,sample.fract()).normalize();
      const normal = vec3(tangent.y.negate(),tangent.x,0).normalize();
      const strand = flow.y;
      // Three interwoven families open and gather together, like a loose braid.
      // A second slower wave avoids identical, evenly spaced sine-wire loops.
      const family = strand.mul(3).floor();
      const phase = t.mul(44).sub(this.clock.mul(0.62)).add(family.mul(2.094)).add(strand.mul(0.9));
      const taper = sin(t.mul(Math.PI)).max(0).pow(0.3);
      const breath = sin(t.mul(21).sub(this.clock.mul(0.23))).mul(0.25).add(0.75);
      const lateral = sin(phase).mul(breath).mul(this.band.mul(0.85))
        .add(sin(t.mul(18).add(strand.mul(4)).sub(this.clock.mul(0.19))).mul(this.band.mul(0.22)))
        .add(strand.sub(0.5).mul(this.band.mul(0.38))).mul(taper);
      const radial = normal.mul(cos(flow.z)).add(cross(tangent,normal).mul(sin(flow.z)));
      const thickness = sin(strand.mul(31)).mul(0.5).add(0.5).pow(3).mul(0.7).add(0.36).mul(taper).add(0.1);
      const offset = motes ? positionLocal : radial.mul(thickness);
      const displaced = center.add(normal.mul(lateral)).add(vec3(0,0,cos(phase).mul(this.band.mul(0.55)))).add(offset);
      material.positionNode = displaced;
      const shade = mix(color("#8b6026"),color("#f7dba3"),sin(strand.mul(18)).mul(0.5).add(0.5).pow(2));
      material.colorNode = motes ? color("#eecb83") : shade;
      material.emissiveNode = motes ? color("#eecb83").mul(0.75) : shade.mul(0.24);
      const quiet = smoothstep(this.fadeStartY, this.fadeEndY, displaced.y.negate());
      material.opacityNode = taper.mul(smoothstep(this.fadeInStartY, this.fadeInEndY, displaced.y.negate())).mul(quiet.oneMinus()).mul(motes ? 0.98 : 0.8);
      if (!motes) material.normalNode = radial.normalize();
      return material;
    };
    const strands = mobile ? 18 : 36, segments = mobile ? 256 : 512, sides = mobile ? 4 : 6;
    const positions: number[] = [], flows: number[] = [], indices: number[] = [];
    for(let s=0;s<strands;s++) {
      const start=positions.length/3;
      for(let j=0;j<=segments;j++) for(let k=0;k<=sides;k++) {
        positions.push(0,0,0); flows.push(j/segments,s/(strands-1),k/sides*Math.PI*2);
        if(j<segments && k<sides) { const a=start+j*(sides+1)+k,b=a+sides+1; indices.push(a,a+1,b,b,a+1,b+1); }
      }
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute("normal",new THREE.Float32BufferAttribute(positions.map((_,i)=>i%3===2?1:0),3));
    geometry.setAttribute("flow",new THREE.Float32BufferAttribute(flows,3)); geometry.setIndex(indices);
    const threads=new THREE.Mesh(geometry,makeMaterial(false)); threads.frustumCulled=false; this.silk.add(threads);
    const sphere=new THREE.SphereGeometry(1,8,6), seed=sphere.toNonIndexed(); sphere.dispose();
    const base=seed.getAttribute("position"), dots:number[]=[], dotFlows:number[]=[], dotNormals:number[]=[];
    const normals=seed.getAttribute("normal"), particleCount=mobile?80:240;
    for(let i=0;i<particleCount;i++) {
      const t=(i*0.61803398875)%1,s=(i*0.754877666)%1,size=1.15+((i*0.4142)%1)**3*(mobile?1.4:2.2);
      for(let j=0;j<base.count;j++) { dots.push(base.getX(j)*size,base.getY(j)*size,base.getZ(j)*size); dotFlows.push(t,s,0); }
      for(let j=0;j<base.count;j++) dotNormals.push(normals.getX(j),normals.getY(j),normals.getZ(j));
    }
    seed.dispose();
    const dotGeometry=new THREE.BufferGeometry(); dotGeometry.setAttribute("position",new THREE.Float32BufferAttribute(dots,3));
    dotGeometry.setAttribute("flow",new THREE.Float32BufferAttribute(dotFlows,3)); dotGeometry.setAttribute("normal",new THREE.Float32BufferAttribute(dotNormals,3));
    const motes=new THREE.Mesh(dotGeometry,makeMaterial(true)); motes.frustumCulled=false; this.particles.add(motes); this.silk.add(this.particles);
    this.host.dataset.strands=String(strands); this.host.dataset.particles=String(particleCount);
  }

  resize(width: number, height: number) {
    if (!this.renderer || this.disposed) return;
    this.width = width; this.height = height;
    this.camera.left = -width / 2; this.camera.right = width / 2;
    this.camera.top = height / 2; this.camera.bottom = -height / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render(lion: Pose, scroll: number, time: number, mobile: boolean, lionVisible: boolean) {
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
    this.maneBottom.value = this.lion.position.y - lion.size * 0.5;
    this.maneFadeEnd.value = this.lion.position.y - lion.size * 0.32;
    this.lion.visible = lionVisible;
    this.silk.position.set(-this.width / 2, this.height / 2 + scroll, 0);
    // The updated asset is front-facing: look toward the title, then turn left
    // as the lion reaches the right-hand introduction.
    this.lion.rotation.y = lion.turn * 1.25;
    this.lion.rotation.x = lion.pitch ?? 0;
    this.clock.value = time;
    this.particles.visible = this.dpr >= 1;

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
    this.disposeObject(this.scene); this.environment?.dispose(); this.routeTexture.dispose(); this.loader.dispose();
    this.renderer?.dispose(); this.host.replaceChildren();
  }
}
