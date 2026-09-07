import * as THREE from "three";
import { createSilkMaterial, type SilkUniforms } from "./materials";

/**
 * Silk light trails — flattened tube ribbons wrapping the whole composition
 * on two slow, offset orbits. Geometry is built once; all motion lives in
 * the shader (travelling pulses) plus a whisper of group drift.
 */

export interface SilkRig {
  group: THREE.Group;
  update: (time: number) => void;
  dispose: () => void;
}

function buildRibbon(
  radius: number,
  yBase: number,
  yAmp: number,
  zSquash: number,
  phase: number,
  tubeRadius: number,
): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + phase;
    // Organic wobble — the curve reads as silk, not a perfect ellipse.
    const wob = Math.sin(a * 3 + phase * 2) * 0.55 + Math.cos(a * 2 - phase) * 0.35;
    pts.push(
      new THREE.Vector3(
        Math.cos(a) * (radius + wob * 0.5),
        yBase + Math.sin(a * 2 + phase) * yAmp + wob * 0.3,
        Math.sin(a) * (radius * zSquash + wob * 0.4),
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal", 0.6);
  const geo = new THREE.TubeGeometry(curve, 260, tubeRadius, 6, true);
  // Flatten into a ribbon profile.
  geo.scale(1, 0.32, 1);
  return geo;
}

export function createSilkRig(tier: "HIGH" | "MEDIUM" | "LOW"): SilkRig {
  const group = new THREE.Group();
  group.name = "SilkRig";

  const entries: Array<{ mesh: THREE.Mesh; uniforms: SilkUniforms }> = [];

  if (tier !== "LOW") {
    // Warm silk — gold-white, wide slow sweep.
    const aGeo = buildRibbon(5.6, 0.35, 1.15, 0.62, 0.0, 0.03);
    const { material: aMat, uniforms: aU } = createSilkMaterial("#ffd9a0", "#fff3e0", 0.055);
    const a = new THREE.Mesh(aGeo, aMat);
    a.rotation.z = 0.16;
    a.rotation.x = -0.06;
    a.renderOrder = 4;
    group.add(a);
    entries.push({ mesh: a, uniforms: aU });
  }

  {
    // Cool silk — violet-blue, tighter counter-orbit.
    const bGeo = buildRibbon(4.6, -0.5, 0.9, 0.72, 2.4, 0.024);
    const { material: bMat, uniforms: bU } = createSilkMaterial("#7b3ff2", "#4f8dff", 0.075);
    const b = new THREE.Mesh(bGeo, bMat);
    b.rotation.z = -0.22;
    b.rotation.x = 0.1;
    b.renderOrder = 4;
    group.add(b);
    entries.push({ mesh: b, uniforms: bU });
  }

  return {
    group,
    update(time: number) {
      entries.forEach((e) => {
        e.uniforms.uTime.value = time;
      });
      // Barely-there drift — heavy, expensive motion.
      group.rotation.y = Math.sin(time * 0.05) * 0.05;
      group.position.y = Math.sin(time * 0.07 + 1.3) * 0.08;
    },
    dispose() {
      entries.forEach((e) => {
        group.remove(e.mesh);
        (e.mesh.geometry as THREE.BufferGeometry).dispose();
        (e.mesh.material as THREE.Material).dispose();
      });
    },
  };
}
