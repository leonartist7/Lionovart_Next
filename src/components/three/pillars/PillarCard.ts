import * as THREE from "three";
import { PILLARS, type PillarId } from "./config/pillars";
import {
  createBackingGeometry,
  createContentPlaneGeometry,
  createEdgeFrameGeometry,
  createGlassShellGeometry,
  createSmokedCoreGeometry,
  disposeGeometry,
} from "./geometry";
import {
  createBackingMaterial,
  createEdgeMaterial,
  createFlareMaterial,
  createGlassShellMaterial,
  createSmokedCoreMaterial,
  getSheenTexture,
  type EdgeUniforms,
  type QualityTier,
} from "./materials";

/**
 * PillarCard — one reusable 3D object, three material variants.
 *
 *   PillarCard (Group)
 *   ├── GlassShell   (RoundedBox, MeshPhysicalMaterial, transmission)
 *   ├── SmokedCore   (inset RoundedBox, near-black physical)
 *   ├── EdgeEmitter  (extruded rim frame, fresnel ShaderMaterial)
 *   ├── Backing      (dark plane, keeps the centre smoked)
 *   ├── ContentPlane (transparent plane — reserved for future canvas textures)
 *   └── Flares       (3 additive sprites, view/light-driven opacity)
 */

export interface PillarCard {
  id: PillarId;
  group: THREE.Group;
  uniforms: EdgeUniforms;
  flares: THREE.Sprite[];
  flareBase: number[];
  phase: number;
  baseY: number;
  baseRotY: number;
  /** Current glass size in world units. */
  size: { w: number; h: number };
  setHover: (hovered: boolean) => void;
  setReveal: (v: number) => void;
  /**
   * Rebuild the glass to a new size (same materials/programs — no shader
   * recompile). Used to match the host pane aspect exactly so the 3D rim
   * coincides with the DOM reactive contour: one card, not two.
   */
  setSize: (w: number, h: number) => void;
  update: (time: number, cameraPos: THREE.Vector3) => void;
  dispose: () => void;
}

/**
 * Flare constellation derived from the live glass size — pinned exactly to
 * the rim corners/edges like the reference bursts: top-left hero, right
 * edge, upper-right, bottom corners. Never mid-face, never white blobs.
 */
function flareAnchorsFor(
  w: number,
  h: number,
): Array<[x: number, y: number, z: number, s: number]> {
  const cx = w / 2 - 0.14;
  const cy = h / 2 - 0.14;
  return [
    [-cx, cy, 0.12, 0.5], // top-left hero burst
    [w / 2 - 0.14, h * 0.05, 0.1, 0.4], // right edge
    [w * 0.18, h / 2 - 0.14, 0.12, 0.32], // upper edge
    [cx, -cy, 0.12, 0.3], // bottom-right
    [-cx, -cy, 0.12, 0.28], // bottom-left
  ];
}

const FLARE_BASE = [0.5, 0.4, 0.34, 0.28, 0.26];

/** Direction TOWARD the key rim light (rear-right-top studio streak). */
const RIM_LIGHT_DIR = new THREE.Vector3(0.62, 0.32, -0.62).normalize();

const _q = new THREE.Quaternion();
const _n = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _toCam = new THREE.Vector3();
const _half = new THREE.Vector3();
const _world = new THREE.Vector3();

export function createPillarCard(
  id: PillarId,
  tier: QualityTier,
  opts?: { phase?: number; baseY?: number; baseRotY?: number; inlay?: boolean; size?: { w: number; h: number } },
): PillarCard {
  const cfg = PILLARS[id];
  const inlay = opts?.inlay ?? false;
  const group = new THREE.Group();
  group.name = `PillarCard_${id}`;

  let size = opts?.size ?? { w: 3.6, h: 2.15 };

  let shellGeo = createGlassShellGeometry(size.w, size.h);
  let coreGeo = createSmokedCoreGeometry(size.w, size.h);
  let edgeGeo = createEdgeFrameGeometry(size.w, size.h);
  let backingGeo = createBackingGeometry(size.w, size.h);
  let contentGeo = createContentPlaneGeometry(size.w, size.h);

  const shellMat = createGlassShellMaterial(tier);
  const coreMat = createSmokedCoreMaterial();
  const backingMat = createBackingMaterial();
  const { material: edgeMat, uniforms } = createEdgeMaterial(id);
  if (inlay) {
    // Inlay mode: the 3D object IS the existing DOM card's glass body. Clear
    // dark centre (black shows through like the reference), while the rim +
    // corner flares supply the light. The DOM's crisp travelling contour
    // keeps the outline; the 3D rim is its bloom halo just inside.
    coreMat.opacity = 0.55;
    backingMat.opacity = 0.5;
    uniforms.uIntensity.value *= 1.1;
  }
  uniforms.uHalf.value.set(size.w / 2, size.h / 2);

  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.name = "GlassShell";
  shell.renderOrder = 10;

  const core = new THREE.Mesh(coreGeo, coreMat);
  core.name = "SmokedCore";
  core.position.z = -0.03;
  core.renderOrder = 5;

  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.name = "EdgeEmitter";
  // Proud rim: sits slightly in front of the glass face like a real beveled
  // plaque, so tilting the pane produces true parallax between rim / glass /
  // recessed core instead of one flat sandwich.
  edge.position.z = 0.025;
  edge.renderOrder = 20;

  const backing = new THREE.Mesh(backingGeo, backingMat);
  backing.name = "Backing";
  backing.position.z = -0.085;
  backing.renderOrder = 1;

  const content = new THREE.Mesh(
    contentGeo,
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  content.name = "ContentPlane";
  content.position.z = 0.075;
  content.renderOrder = 15;

  // Keep the card as one readable object: the glass shell is the body, while
  // the rim and corner flares provide the depth cues. The old backing/core
  // sandwich read as a second black card inside the glass.
  group.add(shell, edge, content);

  // Flares — starburst sprites pinned to the rim corners. Opacity is a true
  // specular glint (Blinn-Phong of rim-light dir × corner-leaning normal ×
  // view) over a visible rest floor, so the corners always breathe colored
  // light and ignite as the pane turns — never white mid-face blobs.
  const flares: THREE.Sprite[] = [];
  const flareBase: number[] = [];
  const low = tier === "LOW";
  const medium = tier === "MEDIUM";
  const flareCount = low ? 2 : medium ? 4 : 5;
  const applyAnchors = () => {
    const anchors = flareAnchorsFor(size.w, size.h);
    flares.forEach((sprite, i) => {
      const a = anchors[i % anchors.length];
      sprite.position.set(a[0], a[1], a[2]);
      sprite.scale.setScalar(a[3]);
    });
  };
  for (let i = 0; i < flareCount; i++) {
    const base = FLARE_BASE[i] ?? 0.24;
    // Corners burn hot (pillar glow), edges run the mid-tone.
    const mat = createFlareMaterial(i % 2 === 0 ? cfg.glow : cfg.secondary, 0);
    const sprite = new THREE.Sprite(mat);
    sprite.renderOrder = 30;
    group.add(sprite);
    flares.push(sprite);
    flareBase.push(base);
  }
  applyAnchors();

  // Sheen bands — the diagonal caustic streaks sweeping the reference face.
  // Two crossed additive planes inside the glass at whisper opacity so the
  // face carries structured light instead of flat gray.
  const sheenTex = getSheenTexture();
  const sheenTint = new THREE.Color(cfg.glow).lerp(new THREE.Color("#ffffff"), 0.55);
  const makeSheen = (opacity: number, rotZ: number, sy: number, z: number) => {
    const m = new THREE.MeshBasicMaterial({
      map: sheenTex,
      color: sheenTint.clone(),
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size.w * 1.15, size.h * sy), m);
    mesh.rotation.z = rotZ;
    mesh.position.z = z;
    mesh.renderOrder = 7;
    group.add(mesh);
    return mesh;
  };
  const sheenA = makeSheen(0.1, -0.5, 0.5, 0.01);
  const sheenB = makeSheen(0.06, 0.42, 0.34, 0.02);
  const rebuildSheen = () => {
    (sheenA.geometry as THREE.BufferGeometry).dispose();
    (sheenB.geometry as THREE.BufferGeometry).dispose();
    sheenA.geometry = new THREE.PlaneGeometry(size.w * 1.15, size.h * 0.5);
    sheenB.geometry = new THREE.PlaneGeometry(size.w * 1.15, size.h * 0.34);
  };

  let hovered = false;
  const boost = { value: 1 };

  const card: PillarCard = {
    id,
    group,
    uniforms,
    flares,
    flareBase,
    phase: opts?.phase ?? Math.random() * Math.PI * 2,
    baseY: opts?.baseY ?? 0,
    baseRotY: opts?.baseRotY ?? 0,
    get size() {
      return size;
    },

    setHover(h: boolean) {
      hovered = h;
    },
    setReveal(v: number) {
      uniforms.uReveal.value = THREE.MathUtils.clamp(v, 0, 1);
    },
    setSize(w: number, h: number) {
      size = { w, h };
      disposeGeometry(shellGeo);
      disposeGeometry(coreGeo);
      disposeGeometry(edgeGeo);
      disposeGeometry(backingGeo);
      disposeGeometry(contentGeo);
      shellGeo = createGlassShellGeometry(w, h);
      coreGeo = createSmokedCoreGeometry(w, h);
      edgeGeo = createEdgeFrameGeometry(w, h);
      backingGeo = createBackingGeometry(w, h);
      contentGeo = createContentPlaneGeometry(w, h);
      shell.geometry = shellGeo;
      core.geometry = coreGeo;
      edge.geometry = edgeGeo;
      backing.geometry = backingGeo;
      content.geometry = contentGeo;
      uniforms.uHalf.value.set(w / 2, h / 2);
      rebuildSheen();
      applyAnchors();
    },
    update(time: number, cameraPos: THREE.Vector3) {
      // Hover eases edge boost ~+15% (damped here, target-driven in engine).
      const target = hovered ? 1.16 : 1;
      boost.value += (target - boost.value) * 0.08;
      uniforms.uBoost.value = boost.value;
      uniforms.uTime.value = time;

      // Per-flare specular glint over a visible rest floor: corners always
      // breathe colored light; the glint fires as the pane turns.
      const reveal = uniforms.uReveal.value;
      group.getWorldQuaternion(_q);
      _n.set(0, 0, 1).applyQuaternion(_q);
      flares.forEach((sprite, i) => {
        const m = sprite.material as THREE.SpriteMaterial;
        sprite.getWorldPosition(_world);
        _dir.copy(sprite.position);
        _dir.z = 0;
        if (_dir.lengthSq() < 1e-4) _dir.set(0, 1, 0);
        _dir.normalize().applyQuaternion(_q);
        _dir.multiplyScalar(0.4).add(_n).normalize(); // corner-leaning normal
        _toCam.copy(cameraPos).sub(_world).normalize();
        _half.copy(RIM_LIGHT_DIR).add(_toCam).normalize();
        const spec = Math.pow(Math.max(_dir.dot(_half), 0), 28);
        const breathe = 0.55 + 0.45 * Math.sin(time * 0.9 + card.phase + i * 1.7);
        m.opacity = THREE.MathUtils.clamp(
          flareBase[i] * (0.32 + 0.68 * spec) * (0.6 + 0.4 * breathe) * reveal * boost.value,
          0,
          0.75,
        );
      });

      // Sheen drift — barely-there travel so the face light feels alive.
      const drift = Math.sin(time * 0.3 + card.phase) * 0.12;
      sheenA.position.x = drift;
      sheenB.position.x = -drift * 0.7;
      const sheenReveal = 0.4 + 0.6 * reveal;
      (sheenA.material as THREE.MeshBasicMaterial).opacity = 0.1 * sheenReveal;
      (sheenB.material as THREE.MeshBasicMaterial).opacity = 0.06 * sheenReveal;
    },
    dispose() {
      disposeGeometry(shellGeo);
      disposeGeometry(coreGeo);
      disposeGeometry(edgeGeo);
      disposeGeometry(backingGeo);
      disposeGeometry(contentGeo);
      disposeGeometry(sheenA.geometry as THREE.BufferGeometry);
      disposeGeometry(sheenB.geometry as THREE.BufferGeometry);
      shellMat.dispose();
      coreMat.dispose();
      backingMat.dispose();
      edgeMat.dispose();
      (sheenA.material as THREE.Material).dispose();
      (sheenB.material as THREE.Material).dispose();
      (content.material as THREE.Material).dispose();
      flares.forEach((s) => {
        group.remove(s);
        (s.material as THREE.Material).dispose();
      });
    },
  };

  return card;
}
