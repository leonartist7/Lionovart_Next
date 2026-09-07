import * as THREE from "three";
import { createFlareMaterial, type FlareUniforms } from "./materials";

/**
 * Flare constellation — starburst billboards pinned to the rim corners and
 * edges of one card. Opacity is a true Blinn-Phong specular glint (rim-light
 * direction × corner-leaning normal × view) over a visible rest floor, so
 * the corners always breathe colored light and ignite as the card turns —
 * never constant glowing stars (directive §6).
 */

export interface FlareRig {
  group: THREE.Group;
  update: (time: number, cameraPos: THREE.Vector3, reveal: number, boost: number) => void;
  setReveal: (v: number) => void;
  /** Re-pin anchors after a card resize (same materials, no recompile). */
  relayout: (w: number, h: number) => void;
  dispose: () => void;
}

/** Direction TOWARD the key rim light (rear-right-top studio streak). */
const RIM_LIGHT_DIR = new THREE.Vector3(0.62, 0.32, -0.62).normalize();

const _n = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _toCam = new THREE.Vector3();
const _half = new THREE.Vector3();
const _world = new THREE.Vector3();
const _q = new THREE.Quaternion();

/** [x, y, z, scale] anchors pinned exactly to the rim — never mid-face. */
function flareAnchorsFor(w: number, h: number): Array<[number, number, number, number]> {
  const cx = w / 2 - 0.14;
  const cy = h / 2 - 0.14;
  return [
    [-cx, cy, 0.14, 0.52], // top-left hero burst
    [w / 2 - 0.14, h * 0.05, 0.12, 0.4], // right edge
    [w * 0.18, h / 2 - 0.14, 0.14, 0.32], // upper edge
    [cx, -cy, 0.14, 0.3], // bottom-right
    [-cx, -cy, 0.14, 0.28], // bottom-left
  ];
}

const FLARE_BASE = [0.5, 0.4, 0.34, 0.28, 0.26];

export function createFlareRig(
  w: number,
  h: number,
  glowColor: string,
  secondaryColor: string,
  tier: "HIGH" | "MEDIUM" | "LOW",
): FlareRig {
  const group = new THREE.Group();
  group.name = "FlareRig";

  const count = tier === "LOW" ? 2 : tier === "MEDIUM" ? 4 : 5;
  const anchors = flareAnchorsFor(w, h);
  const geo = new THREE.PlaneGeometry(1, 1);

  interface Entry {
    mesh: THREE.Mesh;
    uniforms: FlareUniforms;
    base: number;
    phase: number;
  }
  const entries: Entry[] = [];

  for (let i = 0; i < count; i++) {
    const a = anchors[i % anchors.length];
    // Corners burn hot (pillar glow), edges run the mid-tone.
    const { material, uniforms } = createFlareMaterial(i % 2 === 0 ? glowColor : secondaryColor);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(a[0], a[1], a[2]);
    mesh.scale.setScalar(a[3]);
    mesh.renderOrder = 30;
    group.add(mesh);
    entries.push({ mesh, uniforms, base: FLARE_BASE[i % FLARE_BASE.length], phase: i * 1.7 });
  }

  let reveal = 0;

  return {
    group,
    setReveal(v: number) {
      reveal = THREE.MathUtils.clamp(v, 0, 1);
    },
    relayout(w: number, h: number) {
      const next = flareAnchorsFor(w, h);
      entries.forEach((e, i) => {
        const a = next[i % next.length];
        e.mesh.position.set(a[0], a[1], a[2]);
        e.mesh.scale.setScalar(a[3]);
      });
    },
    update(time: number, cameraPos: THREE.Vector3, revealNow: number, boost: number) {
      group.getWorldQuaternion(_q);
      _n.set(0, 0, 1).applyQuaternion(_q);
      entries.forEach((e, i) => {
        // Billboard — the starburst always faces the camera.
        e.mesh.getWorldPosition(_world);
        e.mesh.lookAt(cameraPos);

        _dir.copy(e.mesh.position);
        _dir.z = 0;
        if (_dir.lengthSq() < 1e-4) _dir.set(0, 1, 0);
        _dir.normalize().applyQuaternion(_q);
        _dir.multiplyScalar(0.4).add(_n).normalize(); // corner-leaning normal
        _toCam.copy(cameraPos).sub(_world).normalize();
        _half.copy(RIM_LIGHT_DIR).add(_toCam).normalize();
        const spec = Math.pow(Math.max(_dir.dot(_half), 0), 28);
        const breathe = 0.55 + 0.45 * Math.sin(time * 0.9 + i * 1.7);
        e.uniforms.uIntensity.value = THREE.MathUtils.clamp(
          e.base * (0.32 + 0.68 * spec) * (0.6 + 0.4 * breathe) * boost,
          0,
          0.75,
        );
        e.uniforms.uReveal.value = revealNow;
        void e.phase;
      });
      void reveal;
    },
    dispose() {
      entries.forEach((e) => {
        group.remove(e.mesh);
        (e.mesh.material as THREE.Material).dispose();
      });
      geo.dispose();
    },
  };
}
