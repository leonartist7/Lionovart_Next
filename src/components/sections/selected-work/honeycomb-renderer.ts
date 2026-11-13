import {
  CanvasTexture, CircleGeometry, Color, DynamicDrawUsage, Group, InstancedBufferAttribute, InstancedMesh,
  LinearFilter, Matrix4, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Raycaster, Scene,
  ShaderMaterial, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from 'three';
import type { GalleryWork } from './gallery';
import { CELL_X, CELL_Y, nearestProject, tileCenter, tileProject } from './honeycomb-journey';

const CAPACITY = 512;
const POSTER_WIDTH = 256;
const POSTER_HEIGHT = 144;
const ATLAS_COLUMNS = 4;
const FRAME_WIDTH = 1.38;
const FRAME_HEIGHT = FRAME_WIDTH * 9 / 16;

type Pose = { arrival: number; lift: number; push: number; opacity: number; panX?: number; panY?: number };
type RenderOptions = { opening?: boolean; onFirstFrame?: () => void };

export function createHoneycombRenderer(
  canvas: HTMLCanvasElement,
  projects: readonly GalleryWork[],
  onFailure: () => void,
  { opening = false, onFirstFrame }: RenderOptions = {},
) {
  const atlas = document.createElement('canvas');
  const count = projects.length;
  atlas.width = POSTER_WIDTH * ATLAS_COLUMNS;
  atlas.height = POSTER_HEIGHT * Math.ceil(count / ATLAS_COLUMNS);
  const ink = atlas.getContext('2d');
  if (!ink || !count) throw new Error('Project atlas is unavailable');

  const context = canvas.getContext('webgl2', { alpha: true, antialias: false, powerPreference: 'low-power' });
  if (!context) throw new Error('WebGL2 is unavailable');
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: false });
  renderer.setClearColor(0, 0);
  const scene = new Scene();
  const field = new Group();
  scene.add(field);
  const camera = new OrthographicCamera(-1, 1, 1, -1, .01, 100);
  camera.position.z = 12;
  const tile = new CircleGeometry(1, 6);
  const inset = new CircleGeometry(.992, 6);
  const frame = new PlaneGeometry(FRAME_WIDTH, FRAME_HEIGHT);
  const atlasTexture = new CanvasTexture(atlas);
  atlasTexture.colorSpace = SRGBColorSpace;
  atlasTexture.generateMipmaps = false;
  atlasTexture.minFilter = LinearFilter;
  const slot = new InstancedBufferAttribute(new Float32Array(CAPACITY), 1).setUsage(DynamicDrawUsage);
  frame.setAttribute('posterIndex', slot);

  const outline = new MeshBasicMaterial({ color: opening ? '#78644e' : '#d4c6b4' });
  const surface = new MeshBasicMaterial();
  const poster = new ShaderMaterial({
    uniforms: {
      atlas: { value: atlasTexture },
      columns: { value: ATLAS_COLUMNS },
      rows: { value: atlas.height / POSTER_HEIGHT },
    },
    vertexShader: `
      attribute float posterIndex;
      varying vec2 tileUv;
      varying float tileIndex;
      void main() {
        tileUv = uv;
        tileIndex = posterIndex;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D atlas;
      uniform float columns;
      uniform float rows;
      varying vec2 tileUv;
      varying float tileIndex;
      void main() {
        vec2 coord = vec2(mod(tileIndex, columns), rows - 1.0 - floor(tileIndex / columns));
        vec2 safeUv = mix(vec2(0.006, 0.01), vec2(0.994, 0.99), tileUv);
        gl_FragColor = texture2D(atlas, (coord + safeUv) / vec2(columns, rows));
        #include <colorspace_fragment>
      }`,
  });
  const rim = new InstancedMesh(tile, outline, CAPACITY);
  const face = new InstancedMesh(inset, surface, CAPACITY);
  const images = new InstancedMesh(frame, poster, CAPACITY);
  const tileMeshes = [rim, face, images];
  // A soft projected shadow sits above the adjacent flat tiles and below
  // the lifted tile. It uses one instanced draw, with no shadow-map pass.
  const shadowGeometry = opening ? null : new PlaneGeometry(2.66, 2.66);
  const shadowOpacity = opening ? null : new InstancedBufferAttribute(new Float32Array(CAPACITY), 1).setUsage(DynamicDrawUsage);
  if (shadowGeometry && shadowOpacity) shadowGeometry.setAttribute('shadowOpacity', shadowOpacity);
  const shadowMaterial = opening ? null : new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute float shadowOpacity;
      varying vec2 localPoint;
      varying float strength;
      void main() {
        localPoint = position.xy;
        strength = shadowOpacity;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 localPoint;
      varying float strength;
      void main() {
        vec2 p = abs(localPoint);
        float edge = max(p.y, 0.8660254 * p.x + 0.5 * p.y) - 0.8660254;
        float shade = 1.0 - smoothstep(-0.07, 0.28, edge);
        gl_FragColor = vec4(0.19, 0.12, 0.08, shade * strength);
        #include <colorspace_fragment>
      }`,
  });
  const shadows = shadowGeometry && shadowMaterial ? new InstancedMesh(shadowGeometry, shadowMaterial, CAPACITY) : null;
  if (shadows) {
    shadows.count = 0;
    shadows.frustumCulled = false;
    shadows.instanceMatrix.setUsage(DynamicDrawUsage);
    field.add(shadows);
  }
  for (const mesh of tileMeshes) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    field.add(mesh);
  }

  const pan = new Vector2();
  const target = new Vector2();
  const pointer = new Vector2();
  const matrix = new Matrix4();
  const ray = new Raycaster();
  const hit = new Vector3();
  const colors = (opening ? ['#22201f', '#282122', '#242020'] : ['#fffdfa', '#faf6f0', '#fefbf7']).map(value => new Color(value));
  const highlighted = new Color('#ffffff');
  const color = new Color();
  const elevation = new Map<number, number>();
  let focused: ReturnType<typeof tileCenter> | null = null;
  let lastDraw = 0;
  const requests = new Set<HTMLImageElement>();
  let hovered = -1;
  let frameId = 0;
  let disposed = false;
  let running = false;
  let dirty = true;
  let gridColumn = Infinity;
  let gridRow = Infinity;
  let columns = 0, rows = 0;
  let width = 1, height = 1, span = 7;
  let pose: Pose = { arrival: 0, lift: 0, push: 0, opacity: 0 };
  let fittedWidth = 0, fittedTop = .4;
  let nextPoster = 0;
  let painted = false;

  function invalidate() {
    dirty = true;
    if (running && !document.hidden && !disposed && !frameId) frameId = requestAnimationFrame(draw);
  }

  function updateTile(index: number, x: number, y: number, lift: number) {
    const scale = 1 + .075 * lift;
    const rise = .27 * lift;
    const shiftedY = y + .07 * lift;
    matrix.makeScale(scale, scale, 1).setPosition(x, shiftedY, rise);
    rim.setMatrixAt(index, matrix);
    face.setMatrixAt(index, matrix.setPosition(x, shiftedY, rise + .005));
    images.setMatrixAt(index, matrix.setPosition(x, shiftedY, rise + .01));
    face.setColorAt(index, color.copy(colors[slot.getX(index) % colors.length]).lerp(highlighted, lift));
  }

  function instanceAt(column: number, row: number) {
    const x = column - gridColumn + columns, y = row - gridRow + rows;
    return x < 0 || x > columns * 2 || y < 0 || y > rows * 2 ? -1 : x * (rows * 2 + 1) + y;
  }

  function draw(now: number) {
    frameId = 0;
    if (!running || !dirty || disposed || document.hidden) return;
    dirty = false;
    if (pose.opacity < .001) return;
    const delta = Math.min(32, lastDraw ? now - lastDraw : 16.7);
    lastDraw = now;
    const settling = pan.distanceToSquared(target) > .00001;
    if (settling) pan.lerp(target, .22);
    else pan.copy(target);
    const x = pose.panX ?? pan.x, y = pose.panY ?? pan.y;
    const exit = pose.lift > 0 ? nearestProject(x, y, count - 1, count) : { x, y };
    const focus = pose.lift * (1 - pose.push) + pose.push;
    const centerX = x + (exit.x - x) * focus;
    const centerY = y + (exit.y - y) * focus;
    const aspect = width / height;
    const startZoom = 1 + 1.4 * (1 - pose.arrival);
    const endZoom = opening ? 1.08 * span * Math.max(aspect / FRAME_WIDTH, 1 / FRAME_HEIGHT)
      : fittedWidth > 0 ? (fittedWidth / height) * span / FRAME_WIDTH : 3;
    const zoom = startZoom + (endZoom - startZoom) * pose.push;
    const yShift = opening ? 0 : (pose.push * (.5 - fittedTop) * span) / zoom;
    const col = Math.round(centerX / CELL_X), row = Math.round(centerY / CELL_Y);
    rows = Math.ceil(span / (2 * CELL_Y)) + 2;
    const maxColumns = Math.floor((Math.floor(CAPACITY / (rows * 2 + 1)) - 1) / 2);
    columns = Math.min(maxColumns, Math.ceil(span * aspect / (2 * CELL_X)) + 2);

    if (col !== gridColumn || row !== gridRow) {
      gridColumn = col; gridRow = row; hovered = -1;
      elevation.clear();
      let instance = 0;
      for (let x = col - columns; x <= col + columns; x++) {
        for (let y = row - rows; y <= row + rows; y++) {
          const cell = tileCenter(x, y);
          const project = tileProject(x, y, count);
          slot.setX(instance, project);
          updateTile(instance, cell.x, cell.y, 0);
          instance++;
        }
      }
      for (const mesh of tileMeshes) {
        mesh.count = instance;
        mesh.instanceMatrix.needsUpdate = true;
      }
      slot.needsUpdate = true;
      if (face.instanceColor) face.instanceColor.needsUpdate = true;
    }
    let lifting = false;
    if (shadows && shadowOpacity) {
      const focusColumn = focused ? Math.round(focused.x / CELL_X) : 0;
      const active = pose.lift > 0 ? -1 : focused
        ? instanceAt(focusColumn, Math.round(focused.y / CELL_Y - (focusColumn & 1) * .5))
        : hovered;
      if (active >= 0 && !elevation.has(active)) elevation.set(active, 0);
      let shadowCount = 0;
      if (elevation.size) {
        for (const [index, current] of elevation) {
          const targetLift = index === active ? 1 : 0;
          const damped = targetLift + (current - targetLift) * Math.exp(-delta / 47);
          const lift = Math.abs(targetLift - damped) < .006 ? targetLift : damped;
          const column = gridColumn - columns + Math.floor(index / (rows * 2 + 1));
          const row = gridRow - rows + index % (rows * 2 + 1);
          const cell = tileCenter(column, row);
          updateTile(index, cell.x, cell.y, lift);
          if (lift === 0 && targetLift === 0) {
            elevation.delete(index);
            continue;
          }
          elevation.set(index, lift);
          if (lift > .12) {
            matrix.makeTranslation(cell.x + .075 * lift, cell.y - .11 * lift, .025);
            shadows.setMatrixAt(shadowCount, matrix);
            shadowOpacity.setX(shadowCount++, (lift - .12) * .28);
          }
          lifting ||= lift !== targetLift;
        }
        for (const mesh of tileMeshes) mesh.instanceMatrix.needsUpdate = true;
        if (face.instanceColor) face.instanceColor.needsUpdate = true;
      }
      if (shadowCount || shadows.count !== shadowCount) {
        shadows.count = shadowCount;
        shadows.instanceMatrix.needsUpdate = true;
        shadowOpacity.needsUpdate = true;
      }
    }

    // Raise the far edge before the camera moves through the final artwork.
    field.rotation.x = -.42 * pose.lift * (1 - pose.push);
    field.rotation.z = -.045 * pose.lift * (1 - pose.push);
    field.position.set(-centerX, -centerY + yShift, 0).applyEuler(field.rotation);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    try {
      renderer.render(scene, camera);
    } catch {
      onFailure();
      return;
    }
    if (!painted) {
      painted = true;
      onFirstFrame?.();
    }
    if (settling || lifting) invalidate();
  }

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    width = Math.max(1, parent.clientWidth);
    height = Math.max(1, parent.clientHeight);
    const aspect = width / height;
    span = opening ? Math.min(9, Math.max(4.8, 4.6 / aspect))
      : Math.max(3.15, Math.min(8.25, Math.max(3.35, Math.min(7.2, width / 175)) / aspect));
    const stage = canvas.closest<HTMLElement>('[data-gallery-stage]');
    const style = stage && getComputedStyle(stage);
    fittedWidth = style ? parseFloat(style.getPropertyValue('--gallery-panel-width')) || 0 : 0;
    if (stage && style) {
      const panelTop = (parseFloat(style.getPropertyValue('--gallery-panel-top')) || 40) / 100;
      const top = parent.getBoundingClientRect().top - stage.getBoundingClientRect().top;
      fittedTop = (panelTop * stage.clientHeight - top) / height;
    }
    renderer.setPixelRatio(opening ? Math.min(devicePixelRatio || 1, 1.15) : Math.min(devicePixelRatio || 1, width < 768 ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    const halfHeight = span / 2, halfWidth = halfHeight * width / height;
    camera.left = -halfWidth; camera.right = halfWidth;
    camera.top = halfHeight; camera.bottom = -halfHeight;
    gridColumn = Infinity;
    invalidate();
  }

  function paintPoster(index: number, image?: HTMLImageElement) {
    const x = (index % ATLAS_COLUMNS) * POSTER_WIDTH;
    const y = Math.floor(index / ATLAS_COLUMNS) * POSTER_HEIGHT;
    ink!.fillStyle = opening ? '#161415' : '#f3ece2';
    ink!.fillRect(x, y, POSTER_WIDTH, POSTER_HEIGHT);
    if (!image) {
      ink!.fillStyle = opening ? '#dbc4a6' : '#655344';
      ink!.font = '600 17px sans-serif';
      ink!.textAlign = 'center';
      ink!.textBaseline = 'middle';
      ink!.fillText(projects[index].name, x + POSTER_WIDTH / 2, y + POSTER_HEIGHT / 2, POSTER_WIDTH - 16);
      return;
    }
    const factor = (projects[index].fit === 'contain' ? Math.min : Math.max)(POSTER_WIDTH / image.naturalWidth, POSTER_HEIGHT / image.naturalHeight);
    const w = image.naturalWidth * factor, h = image.naturalHeight * factor;
    ink!.save();
    ink!.beginPath();
    ink!.rect(x, y, POSTER_WIDTH, POSTER_HEIGHT);
    ink!.clip();
    ink!.drawImage(image, x + (POSTER_WIDTH - w) / 2, y + (POSTER_HEIGHT - h) / 2, w, h);
    ink!.restore();
  }

  function loadPosters() {
    while (running && !document.hidden && !disposed && requests.size < 2 && nextPoster < count) {
      const index = nextPoster++;
      const asset = projects[index];
      const img = new Image();
      requests.add(img);
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      if (opening) img.fetchPriority = 'low';
      const finish = (loaded: boolean) => {
        requests.delete(img);
        if (disposed) return;
        if (loaded && img.naturalWidth) {
          paintPoster(index, img);
          atlasTexture.needsUpdate = true;
          invalidate();
        }
        loadPosters();
      };
      img.onload = () => finish(true);
      img.onerror = () => finish(false);
      img.src = asset.poster.replace(/w_\d+(?=,c_limit)/, 'w_320');
    }
  }

  function pick(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((clientX - rect.left) / rect.width * 2 - 1, 1 - (clientY - rect.top) / rect.height * 2);
    ray.setFromCamera(pointer, camera);
    // The active browse field is flat. Intersect its plane before resolving
    // the three nearby columns of the hex lattice.
    if (Math.abs(ray.ray.direction.z) < .001) return -1;
    ray.ray.at(-ray.ray.origin.z / ray.ray.direction.z, hit);
    field.worldToLocal(hit);
    const base = Math.round(hit.x / CELL_X);
    for (let col = base - 1; col <= base + 1; col++) {
      const row = Math.round(hit.y / CELL_Y - (col & 1) * .5);
      const center = tileCenter(col, row);
      const x = Math.abs(hit.x - center.x), y = Math.abs(hit.y - center.y);
      if (y <= CELL_Y / 2 && x + y / CELL_Y <= 1) {
        return instanceAt(col, row);
      }
    }
    return -1;
  }

  const lost = (event: Event) => { event.preventDefault(); onFailure(); };
  const visibility = () => { invalidate(); loadPosters(); };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement ?? canvas);
  canvas.addEventListener('webglcontextlost', lost);
  document.addEventListener('visibilitychange', visibility);
  for (let i = 0; i < count; i++) paintPoster(i);
  atlasTexture.needsUpdate = true;
  resize();
  return {
    setActive(active: boolean) {
      if (running === active) return;
      running = active;
      if (active) { invalidate(); loadPosters(); }
      else { cancelAnimationFrame(frameId); frameId = 0; lastDraw = 0; }
    },
    setPose(next: Pose) {
      pose = next;
      invalidate();
    },
    drag(dx: number, dy: number) {
      const worldPerPixel = span / (height * camera.zoom);
      target.set(target.x - dx * worldPerPixel, target.y + dy * worldPerPixel);
      hovered = -1;
      focused = null;
      invalidate();
    },
    goTo(project: number, highlight = false) {
      const next = nearestProject(pan.x, pan.y, project, count);
      target.set(next.x, next.y);
      focused = highlight ? next : null;
      invalidate();
    },
    clearFocus() {
      if (!focused) return;
      focused = null;
      invalidate();
    },
    hover(x: number, y: number) {
      const instance = pick(x, y);
      if (instance !== hovered) { hovered = instance; invalidate(); }
      return instance !== -1;
    },
    clearHover() { hovered = -1; invalidate(); },
    pick(x: number, y: number) {
      const instance = pick(x, y);
      return instance === -1 ? null : slot.getX(instance);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('webglcontextlost', lost);
      for (const img of requests) { img.onload = null; img.onerror = null; img.removeAttribute('src'); }
      for (const mesh of tileMeshes) mesh.dispose();
      shadows?.dispose();
      shadowGeometry?.dispose();
      shadowMaterial?.dispose();
      for (const geometry of [tile, inset, frame]) geometry.dispose();
      for (const material of [outline, surface, poster]) material.dispose();
      atlasTexture.dispose();
      renderer.dispose();
      // The intro owns a throwaway canvas. Gallery canvases may be reused by React.
      if (opening) renderer.forceContextLoss();
    },
  };
}

export type HoneycombRenderer = ReturnType<typeof createHoneycombRenderer>;
