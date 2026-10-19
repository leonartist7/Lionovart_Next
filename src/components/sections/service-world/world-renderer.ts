import * as T from 'three/webgpu';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { fitDistance, type WorldInput } from './world-state';

export type WorldEngine = { update: (input: WorldInput) => void; dispose: () => void };
const IVORY = '#f7f4ef';
const FILM = 'https://res.cloudinary.com/dgio9uutc/video/upload/c_limit,w_720,f_mp4,vc_h264,q_auto/Demo_hero.mp4';

/** A single room and renderer persist from the partnership threshold to the work gallery. */
export async function createWorld(canvas: HTMLCanvasElement, poster: string, forceWebGL: boolean, onFailure: () => void, onReady: () => void): Promise<WorldEngine> {
  // Avoid Three's asynchronous backend failure when this environment has no GPU contexts.
  if (!('gpu' in navigator) || forceWebGL) {
    if (!canvas.getContext('webgl2')) throw new Error('No GPU context; use the interactive poster.');
  }
  const renderer = new T.WebGPURenderer({ canvas, antialias: true, alpha: false, forceWebGL });
  try { await renderer.init(); } catch (error) { renderer.dispose(); throw error; }
  renderer.onDeviceLost = () => onFailure();
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new T.Scene();
  const background = new T.Color(IVORY); scene.background = background;
  scene.fog = new T.Fog(IVORY, 25, 85);
  const camera = new T.PerspectiveCamera(35, 1, .1, 150);
  const geometry = new Set<T.BufferGeometry>();
  const materials = new Set<T.Material>();
  const textures = new Set<T.Texture>();
  const material = (c: string, roughness = .6, metalness = 0) => {
    const m = new T.MeshStandardMaterial({ color: c, roughness, metalness }); materials.add(m); return m;
  };
  const ivory = material('#ece6db', .86), chalk = material('#faf8f3', .75), gold = material('#b99a58', .28, .75);
  const ink = material('#181719', .35), red = material('#aa2134', .44);
  const glass = new T.MeshStandardMaterial({ color: '#b7d2cc', roughness: .2, transparent: true, opacity: .12, depthWrite: false, side: T.DoubleSide }); materials.add(glass);
  function mesh(g: T.BufferGeometry, m: T.Material, parent: T.Object3D, x = 0, y = 0, z = 0) {
    geometry.add(g); const o = new T.Mesh(g, m); o.position.set(x, y, z); parent.add(o); return o;
  }
  function box(parent: T.Object3D, x: number, y: number, z: number, w: number, h: number, d: number, m = ivory, radius = .04) {
    return mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 4, h / 4, d / 4)), m, parent, x, y, z);
  }
  const hemi = new T.HemisphereLight('#fff9ed', '#a69c89', 3); scene.add(hemi);
  const key = new T.DirectionalLight('#fff3d9', 4.2); key.position.set(-5, 9, 6); scene.add(key);
  const fill = new T.DirectionalLight('#e6edff', 1.5); fill.position.set(6, 4, -2); scene.add(fill);
  const room = new T.Group(); scene.add(room);
  box(room, 0, -.3, 0, 160, .5, 160, chalk);
  // Repeated architectural bays form the gallery's depth, rather than an unrelated backdrop.
  for (let i = 0; i < 5; i++) {
    const z = -5 - i * 7;
    for (const x of [-10, 10]) {
      box(room, x, 5, z, .22, 10, .25, ivory);
      box(room, x - Math.sign(x) * .13, 5, z + .15, .025, 10, .035, gold, .01);
    }
    box(room, 0, 10, z, 20.2, .22, .25, ivory);
  }
  const dais = new T.Group(); scene.add(dais);
  mesh(new T.CylinderGeometry(5.4, 5.5, .22, 72), chalk, dais, 0, -.04, 0);
  mesh(new T.CylinderGeometry(5.48, 5.48, .035, 72), gold, dais, 0, -.12, 0);

  function canvasTexture(draw: (ctx: CanvasRenderingContext2D) => void, w = 1024, h = 1024) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d')!; draw(ctx);
    const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace; textures.add(texture); return texture;
  }
  const shadow = canvasTexture(c => {
    const g = c.createRadialGradient(512, 512, 30, 512, 512, 480); g.addColorStop(0, '#30241740'); g.addColorStop(1, '#30241700'); c.fillStyle = g; c.fillRect(0, 0, 1024, 1024);
  });
  const shadowMaterial = new T.MeshBasicMaterial({ map: shadow, transparent: true, depthWrite: false }); materials.add(shadowMaterial);
  const contact = mesh(new T.PlaneGeometry(12, 9), shadowMaterial, dais, 0, .085, .2); contact.rotation.x = -Math.PI / 2;

  const headlines = [['THE NEXT', 'CHAPTER.'], ['MAKE IT', 'MATTER.'], ['IN', 'MOTION.'], ['EVERY', 'MOMENT.']];
  const artwork = headlines.map((lines, variant) => canvasTexture(c => {
    const bg = ['#aa2037', '#d7b36d', '#19191d', '#f0e8d7'][variant];
    c.fillStyle = bg; c.fillRect(0, 0, 1024, 1024);
    c.strokeStyle = variant === 3 ? '#b39762' : '#fff0c5'; c.lineWidth = 4;
    for (let i = 0; i < 10; i++) { c.beginPath(); c.ellipse(750, 780, 120 + i * 31, 260 + i * 20, -.6, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = variant === 3 ? '#282322' : '#fff7e8'; c.font = '500 23px sans-serif'; c.fillText('L I O N O V A R T   /   S T U D I O', 70, 95);
    c.font = '900 112px sans-serif'; lines.forEach((line, i) => c.fillText(line, 65, 290 + i * 112));
    c.font = '400 24px sans-serif'; c.fillText(['A SEASON OF POSSIBILITIES', 'DESIGNED TO BE NOTICED', 'CREATIVITY, IN MOTION', 'A STORY WORTH SHOWING UP FOR'][variant], 70, 925);
  }));
  const artMaterials = artwork.map(map => { const m = new T.MeshBasicMaterial({ map, toneMapped: false }); materials.add(m); return m; });
  const faceGeometry = new T.PlaneGeometry(1, 1); geometry.add(faceGeometry);
  function screen(parent: T.Object3D, x: number, y: number, z: number, w: number, h: number, m: T.Material, frame = ink) {
    const group = new T.Group(); group.position.set(x, y, z); parent.add(group);
    box(group, 0, 0, 0, w + .14, h + .14, .14, frame);
    const face = new T.Mesh(faceGeometry, m); face.scale.set(w, h, 1); face.position.z = .081; group.add(face);
    return { group, face };
  }
  const content = new T.Group(); scene.add(content);
  box(content, -2.65, .45, .5, 2.25, .75, 2.1, ivory);
  box(content, .25, .28, -.4, 3.55, .4, 1.8, chalk);
  const billboard = screen(content, -.2, 2.45, -.65, 3.8, 3.8, artMaterials[0], gold);
  const phone = screen(content, 2.35, 1.9, .85, 1.25, 2.5, artMaterials[0]); phone.group.rotation.y = -.3;
  box(phone.group, 0, 1.16, .1, .38, .065, .025, ink, .02);
  const product = new T.Group(); content.add(product); product.position.set(-2.65, 1.3, .55);
  mesh(new T.CylinderGeometry(.42, .42, 1.05, 32), red, product, 0, .2, 0);
  mesh(new T.CylinderGeometry(.43, .43, .12, 32), gold, product, 0, .78, 0);
  const ring = mesh(new T.TorusGeometry(.74, .035, 10, 64), gold, product, 0, .4, 0); ring.rotation.y = .6;
  const calendar = new T.Group(); content.add(calendar);
  for (let i = 0; i < 12; i++) {
    const tile = screen(calendar, -2.8 + (i % 4) * 1.82, 1.1 + Math.floor(i / 4) * 1.25, -.15, 1.5, 1.04, artMaterials[i % 4], chalk);
    tile.group.rotation.y = (i % 4 - 1.5) * -.05;
  }

  const led = new T.Group(); scene.add(led);
  // A real interior remains visible behind the transparent LED surface.
  box(led, 0, .18, .1, 7.5, .25, 3.2, ivory);
  for (const x of [-3.5, 3.5]) box(led, x, 2.3, -.15, .14, 4.2, .16, gold);
  for (const y of [.3, 4.3]) box(led, 0, y, -.15, 7.12, .14, .16, gold);
  box(led, 0, 2.3, -.15, .065, 4, .12, gold);
  box(led, 0, 2.3, -.18, 6.9, 3.9, .025, glass, .01);
  box(led, 0, 1.05, -1.3, 2.9, .14, 1, chalk);
  for (const x of [-1.1, 1.1]) box(led, x, .65, -1.3, .08, .8, .6, gold);
  const plantMat = material('#58674c', .9);
  for (const x of [-2.7, 2.7]) {
    mesh(new T.CylinderGeometry(.35, .25, .6, 20), ivory, led, x, .6, -1.05);
    box(led, x, 1.3, -1.05, .045, 1, .045, gold);
    for (let i = 0; i < 5; i++) {
      const leaf = mesh(new T.SphereGeometry(.32, 12, 8), plantMat, led, x + Math.sin(i * 2) * .22, 1.4 + i * .2, -1.05);
      leaf.scale.set(.7, 1.6, .5); leaf.rotation.z = Math.sin(i) * .4;
    }
  }
  const dotGeometry = new T.CircleGeometry(.035, 5); geometry.add(dotGeometry);
  const dotMaterial = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .92, depthWrite: false, toneMapped: false }); materials.add(dotMaterial);
  const cols = 64, rows = 32;
  const dots = new T.InstancedMesh(dotGeometry, dotMaterial, cols * rows); led.add(dots);
  const dummy = new T.Object3D(), color = new T.Color();
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    dummy.position.set((x / (cols - 1) - .5) * 6.7, .45 + y / (rows - 1) * 3.7, -.07); dummy.updateMatrix(); dots.setMatrixAt(y * cols + x, dummy.matrix); dots.setColorAt(y * cols + x, color.set('#ce9e4c'));
  }
  dots.instanceMatrix.needsUpdate = true;
  const orbital = new T.Group(); led.add(orbital); orbital.position.set(0, 2.25, -.025);
  const luminous = new T.MeshBasicMaterial({ color: '#f4cc77', transparent: true, opacity: .85, toneMapped: false }); materials.add(luminous);
  for (let i = 0; i < 3; i++) { const o = mesh(new T.TorusGeometry(.95 + i * .22, .012, 5, 64), luminous, orbital); o.scale.y = .8; o.rotation.z = i * .35; }

  const work = new T.Group(); scene.add(work);
  box(work, 0, .4, 0, 7.1, .6, 1.5, ivory);
  const workArt = new T.MeshBasicMaterial({ map: artwork[0], toneMapped: false }); materials.add(workArt);
  screen(work, 0, 2.5, 0, 6.6, 3.71, workArt, gold);
  let workLoaded = false;
  const video = document.createElement('video'); video.muted = true; video.loop = true; video.playsInline = true; video.crossOrigin = 'anonymous'; video.preload = 'none';
  const videoTexture = new T.VideoTexture(video); videoTexture.colorSpace = T.SRGBColorSpace; textures.add(videoTexture);
  const videoMaterial = new T.MeshBasicMaterial({ map: videoTexture, toneMapped: false }); materials.add(videoMaterial);
  let videoWanted = false, videoFailed = false;
  video.addEventListener('error', () => { videoFailed = true; });
  const groups = { content, led, work };
  let input: WorldInput | null = null, disposed = false, raf = 0, last = 0, elapsed = 0, lastLED = -1, slow = 0, warmup = 0;
  let width = 0, height = 0, ratio = 0, downgraded = false;
  let current = 'arrival', previousVariant = -1, settle = 0;
  const position = new T.Vector3(), target = new T.Vector3(), look = new T.Vector3(0, 1.8, 0);
  let firstFrame = true;
  const tick = (now: number) => {
    raf = 0;
    if (disposed || !input?.visible) { video.pause(); return; }
    try {
      const dt = Math.min((now - (last || now)) / 1000, .033); const frameTime = last ? now - last : 16; last = now;
      if (!input.paused && !input.reduced) elapsed += dt;
      const w = innerWidth, h = innerHeight;
      const dpr = Math.min(devicePixelRatio, downgraded ? 1 : w < 768 ? 1.25 : 1.5);
      if (w !== width || h !== height || dpr !== ratio) { width = w; height = h; ratio = dpr; renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
      if (++warmup > 90 && !input.reduced && frameTime > 29) slow++; else slow = Math.max(0, slow - 1);
      if (slow > 100) downgraded = true;
      background.setRGB((8 + 239 * input.light) / 255, (8 + 236 * input.light) / 255, (10 + 229 * input.light) / 255, T.SRGBColorSpace);
      (scene.fog as T.Fog).color.copy(background);
      hemi.intensity = .35 + input.light * 2.65; key.intensity = 1.2 + input.light * 3;
      room.visible = input.light > .05; dais.visible = input.exhibit !== 'arrival' && input.exhibit !== 'empty';
      if (input.exhibit !== current || previousVariant !== input.variant) { settle = 0; current = input.exhibit; previousVariant = input.variant; }
      settle = input.reduced ? 1 : Math.min(1, settle + dt * 2.3);
      const eased = 1 - Math.pow(1 - settle, 3);
      Object.entries(groups).forEach(([name, group]) => { group.visible = input!.exhibit === name; group.position.y = -.65 * (1 - eased); group.scale.setScalar(.94 + .06 * eased); });
      content.rotation.y = (input.variant - 1.5) * .045;
      billboard.face.material = input.variant === 2 && video.readyState >= 2 && !videoFailed ? videoMaterial : artMaterials[input.variant];
      phone.face.material = artMaterials[input.variant];
      calendar.visible = input.variant === 3; billboard.group.visible = input.variant !== 3; phone.group.visible = input.variant !== 3; product.visible = input.variant !== 3;
      product.rotation.y = input.reduced ? 0 : Math.sin(elapsed * .35) * .13;
      led.rotation.y = input.variant === 3 ? -.38 : input.variant === 2 ? .15 : -.06;
      dots.visible = input.enabled; orbital.visible = input.enabled;
      orbital.rotation.z = input.reduced ? .15 : elapsed * .1;
      if (led.visible && input.enabled && (elapsed - lastLED > .065 || input.reduced || input.paused || settle < 1)) {
        lastLED = elapsed;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const nx = x / cols, ny = y / rows;
          const wave = Math.sin(nx * 9 + ny * 5 + elapsed * (input.variant === 1 ? 1.4 : .45));
          const strength = .08 + Math.pow((wave + 1) / 2, 3) * .92;
          color.set(input.variant === 2 ? '#d63a55' : '#f3be60').multiplyScalar(strength);
          dots.setColorAt(y * cols + x, color);
        }
        if (dots.instanceColor) dots.instanceColor.needsUpdate = true;
      }
      const wantsVideo = input.exhibit === 'content' && input.variant === 2 && !input.paused && !input.reduced;
      if (wantsVideo !== videoWanted) {
        videoWanted = wantsVideo;
        if (wantsVideo && !videoFailed) { if (!video.src) video.src = FILM; void video.play().catch(() => { videoFailed = true; }); }
        else video.pause();
      }
      if (input.exhibit === 'work' && !workLoaded) {
        workLoaded = true;
        new T.TextureLoader().load(poster, texture => { if (disposed) { texture.dispose(); return; } texture.colorSpace = T.SRGBColorSpace; textures.add(texture); workArt.map = texture; workArt.needsUpdate = true; schedule(); }, undefined, () => {});
      }
      const distance = input.exhibit === 'arrival' ? 24 : fitDistance(input.rect.width, input.rect.height, w, h);
      const centerY = input.exhibit === 'arrival' ? h * .48 : input.rect.top + input.rect.height * .51;
      camera.setViewOffset(w, h, w / 2 - (input.rect.left + input.rect.width / 2), h / 2 - centerY, w, h);
      const parallax = input.reduced ? 0 : .22;
      position.set(input.pointer[0] * parallax, 1.8 + distance * .16, distance);
      const blend = input.reduced || !last || settle < .05 ? 1 : 1 - Math.exp(-dt * 8);
      camera.position.lerp(position, blend); target.copy(look); camera.lookAt(target);
      renderer.render(scene, camera);
      if (firstFrame) { firstFrame = false; onReady(); }
      canvas.dataset.backend = renderer.backend.constructor.name;
      canvas.dataset.exhibit = input.exhibit;
      canvas.dataset.variant = String(input.variant);
      canvas.dataset.dpr = String(ratio);
      // Readable diagnostics allow QA without coupling UI to private renderer state.
      canvas.dataset.calls = String(renderer.info.render.calls);
      canvas.dataset.triangles = String(renderer.info.render.triangles);
      if (!input.reduced && ((!input.paused && (input.exhibit === 'content' || input.exhibit === 'led')) || settle < 1 || camera.position.distanceTo(position) > .01)) raf = requestAnimationFrame(tick);
    } catch { onFailure(); }
  };
  function schedule() { if (!raf && !disposed && input?.visible) raf = requestAnimationFrame(tick); }
  const lost = (event: Event) => { event.preventDefault(); onFailure(); };
  canvas.addEventListener('webglcontextlost', lost);
  return {
    update(next) {
      input = next;
      if (!next.visible) { cancelAnimationFrame(raf); raf = 0; last = 0; video.pause(); videoWanted = false; }
      else schedule();
    },
    dispose() {
      if (disposed) return; disposed = true; cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextlost', lost);
      video.pause(); video.removeAttribute('src'); video.load();
      geometry.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); renderer.dispose();
    },
  };
}
