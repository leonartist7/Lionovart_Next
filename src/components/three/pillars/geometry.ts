import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Procedural card geometry — one topology shared by all three pillars.
 * Proportions follow the master directive (3.6 × 2.15, depth ~0.12, corner ~0.22).
 */

export const CARD = {
  width: 3.6,
  height: 2.15,
  depth: 0.11,
  corner: 0.22,
} as const;

export function roundedRectPath(
  target: THREE.Shape | THREE.Path,
  w: number,
  h: number,
  r: number,
): void {
  const x = -w / 2;
  const y = -h / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.quadraticCurveTo(x + w, y, x + w, y + r);
  target.lineTo(x + w, y + h - r);
  target.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  target.lineTo(x + r, y + h);
  target.quadraticCurveTo(x, y + h, x, y + h - r);
  target.lineTo(x, y + r);
  target.quadraticCurveTo(x, y, x + r, y);
}

export function createGlassShellGeometry(
  w: number = CARD.width,
  h: number = CARD.height,
): RoundedBoxGeometry {
  // segments=4 keeps the bevel smooth without excessive subdivision.
  const r = Math.min(CARD.corner, Math.min(w, h) * 0.12);
  return new RoundedBoxGeometry(w, h, CARD.depth, 4, r);
}

export function createSmokedCoreGeometry(
  w: number = CARD.width,
  h: number = CARD.height,
): RoundedBoxGeometry {
  // Slightly inset so the smoked core sits inside the transmissive shell.
  const insetW = Math.max(0.5, w - 0.16);
  const insetH = Math.max(0.5, h - 0.16);
  return new RoundedBoxGeometry(
    insetW,
    insetH,
    CARD.depth * 0.55,
    3,
    Math.max(0.06, Math.min(insetW, insetH) * 0.1),
  );
}

/**
 * Thin luminous frame (outer shape minus inner hole), extruded through the
 * card depth. Sized to the host pane so the 3D rim coincides with the DOM
 * reactive contour — one outline, crisp line + bloom, not two.
 */
export function createEdgeFrameGeometry(
  w: number = CARD.width,
  h: number = CARD.height,
  band = 0.07,
): THREE.ExtrudeGeometry {
  const rOut = Math.min(CARD.corner, Math.min(w, h) * 0.12);
  const outer = new THREE.Shape();
  roundedRectPath(outer, w - 0.015, h - 0.015, Math.max(0.05, rOut - 0.008));
  const inner = new THREE.Path();
  roundedRectPath(
    inner,
    Math.max(0.3, w - band * 2),
    Math.max(0.3, h - band * 2),
    Math.max(0.05, rOut - 0.1),
  );
  outer.holes.push(inner);
  const geo = new THREE.ExtrudeGeometry(outer, {
    depth: CARD.depth * 0.55,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.018,
    bevelSegments: 2,
    curveSegments: 48,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

export function createBackingGeometry(
  w: number = CARD.width,
  h: number = CARD.height,
): THREE.ShapeGeometry {
  // Rounded like the shell — a square-cornered dark slab inside a rounded
  // pane reads as a second overlapping card. This must match the shell.
  const r = Math.min(CARD.corner, Math.min(w, h) * 0.12);
  const shape = new THREE.Shape();
  roundedRectPath(shape, Math.max(0.3, w - 0.12), Math.max(0.3, h - 0.12), Math.max(0.05, r - 0.01));
  const geo = new THREE.ShapeGeometry(shape, 24);
  return geo;
}

export function createContentPlaneGeometry(
  w: number = CARD.width,
  h: number = CARD.height,
): THREE.PlaneGeometry {
  return new THREE.PlaneGeometry(Math.max(0.2, w - 0.5), Math.max(0.2, h - 0.5), 1, 1);
}

export function disposeGeometry(geo: THREE.BufferGeometry | null | undefined): void {
  if (geo) geo.dispose();
}
