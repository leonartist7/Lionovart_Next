import * as THREE from "three";
import { PILLARS, type PillarId } from "../pillars/config/pillars";
import {
  createBackingGeometry,
  createContentPlaneGeometry,
  createEdgeFrameGeometry,
  createGlassShellGeometry,
  createSmokedCoreGeometry,
  disposeGeometry,
} from "./geometry";
import {
  createAuraMaterial,
  createBackingMaterial,
  createEdgeMaterial,
  createGlassShellMaterial,
  createSmokedCoreMaterial,
  type QualityTier,
} from "./materials";
import { createFlareRig, type FlareRig } from "./flares";

/**
 * PillarCardV2 — one reusable 3D object, three material variants.
 *
 *   PillarCardV2 (Group)
 *   ├── Backing       (near-black slab, keeps the centre smoked)
 *   ├── Aura          (additive halo behind/beneath — under-light)
 *   ├── SmokedCore    (inset plate, sheen bands in its emissive term)
 *   ├── GlassShell    (RoundedBox, MeshPhysicalNodeMaterial transmission)
 *   ├── EdgeEmitter   (full-depth rim frame, TSL fresnel, double rail)
 *   ├── ContentPlane  (reserved — typography stays DOM, directive §14)
 *   └── FlareRig      (specular-gated starburst billboards at the corners)
 */

export interface PillarCardV2 {
  id: PillarId;
  group: THREE.Group;
  phase: number;
  baseRotY: number;
  setHover: (hovered: boolean) => void;
  setReveal: (v: number) => void;
  /** Rebuild the glass to a new size (same materials — no shader recompile). */
  setSize: (w: number, h: number) => void;
  update: (time: number, cameraPos: THREE.Vector3, sweepX?: number) => void;
  dispose: () => void;
}

export function createPillarCardV2(
  id: PillarId,
  tier: QualityTier,
  opts?: { phase?: number; baseRotY?: number; size?: { w: number; h: number } },
): PillarCardV2 {
  const cfg = PILLARS[id];
  let size = opts?.size ?? { w: 3.6, h: 2.15 };
  const group = new THREE.Group();
  group.name = `PillarCardV2_${id}`;

  let backingGeo = createBackingGeometry(size.w, size.h);
  let coreGeo = createSmokedCoreGeometry(size.w, size.h);
  let shellGeo = createGlassShellGeometry(size.w, size.h);
  let edgeGeo = createEdgeFrameGeometry(size.w, size.h);
  let contentGeo = createContentPlaneGeometry(size.w, size.h);
  let auraGeo = new THREE.PlaneGeometry(size.w * 1.8, size.h * 2.0);

  const backingMat = createBackingMaterial();
  const { material: coreMat, uniforms: coreUniforms } = createSmokedCoreMaterial(id);
  const shellMat = createGlassShellMaterial(tier);
  const { material: edgeMat, uniforms: edgeUniforms } = createEdgeMaterial(id);
  const { material: auraMat, uniforms: auraUniforms } = createAuraMaterial(cfg.secondary, 0.0);

  const backing = new THREE.Mesh(backingGeo, backingMat);
  backing.name = "Backing";
  backing.position.z = -0.085;
  backing.renderOrder = 1;

  const aura = new THREE.Mesh(auraGeo, auraMat);
  aura.name = "Aura";
  aura.position.set(0, -0.3, -0.6);
  aura.renderOrder = 2;

  const core = new THREE.Mesh(coreGeo, coreMat);
  core.name = "SmokedCore";
  core.position.z = -0.03;
  core.renderOrder = 5;

  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.name = "GlassShell";
  shell.renderOrder = 10;

  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.name = "EdgeEmitter";
  edge.renderOrder = 20;

  const content = new THREE.Mesh(
    contentGeo,
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  content.name = "ContentPlane";
  content.position.z = 0.075;
  content.renderOrder = 15;

  const flares: FlareRig = createFlareRig(size.w, size.h, cfg.glow, cfg.secondary, tier);

  group.add(backing, aura, core, shell, edge, content, flares.group);

  let hovered = false;
  const boost = { value: 1 };
  let reveal = 0;

  return {
    id,
    group,
    phase: opts?.phase ?? Math.random() * Math.PI * 2,
    baseRotY: opts?.baseRotY ?? 0,

    setHover(h: boolean) {
      hovered = h;
    },
    setReveal(v: number) {
      reveal = THREE.MathUtils.clamp(v, 0, 1);
      edgeUniforms.uReveal.value = reveal;
      coreUniforms.uReveal.value = reveal;
      auraUniforms.uIntensity.value = 0.16 * reveal;
      flares.setReveal(reveal);
    },
    setSize(w: number, h: number) {
      size = { w, h };
      disposeGeometry(backingGeo);
      disposeGeometry(coreGeo);
      disposeGeometry(shellGeo);
      disposeGeometry(edgeGeo);
      disposeGeometry(contentGeo);
      disposeGeometry(auraGeo);
      backingGeo = createBackingGeometry(w, h);
      coreGeo = createSmokedCoreGeometry(w, h);
      shellGeo = createGlassShellGeometry(w, h);
      edgeGeo = createEdgeFrameGeometry(w, h);
      contentGeo = createContentPlaneGeometry(w, h);
      auraGeo = new THREE.PlaneGeometry(w * 1.8, h * 2.0);
      backing.geometry = backingGeo;
      core.geometry = coreGeo;
      shell.geometry = shellGeo;
      edge.geometry = edgeGeo;
      content.geometry = contentGeo;
      aura.geometry = auraGeo;
      edgeUniforms.uHalf.value.set(w / 2, h / 2);
      flares.relayout(w, h);
    },
    update(time: number, cameraPos: THREE.Vector3, sweepX = 0) {
      // Hover eases edge boost ~+15% (damped, never snapped).
      const target = hovered ? 1.16 : 1;
      boost.value += (target - boost.value) * 0.08;
      edgeUniforms.uBoost.value = boost.value;
      edgeUniforms.uTime.value = time;
      edgeUniforms.uSweep.value = sweepX;
      coreUniforms.uTime.value = time;
      flares.update(time, cameraPos, reveal, boost.value);
    },
    dispose() {
      disposeGeometry(backingGeo);
      disposeGeometry(coreGeo);
      disposeGeometry(shellGeo);
      disposeGeometry(edgeGeo);
      disposeGeometry(contentGeo);
      disposeGeometry(auraGeo);
      backingMat.dispose();
      coreMat.dispose();
      shellMat.dispose();
      edgeMat.dispose();
      auraMat.dispose();
      (content.material as THREE.Material).dispose();
      flares.dispose();
    },
  };
}
