import * as THREE from "three";
import { createParticleMaterial, type ParticleUniforms } from "./materials";

/**
 * Particle field — one Points draw call. Dust drifts in the shader, tinted
 * per-particle from the three pillar tones, denser near the card rims than
 * in open space (positions are seeded around the three card slots).
 */

export interface ParticleField {
  points: THREE.Points;
  uniforms: ParticleUniforms;
  dispose: () => void;
}

export function createParticleField(tier: "HIGH" | "MEDIUM" | "LOW"): ParticleField {
  const count = tier === "HIGH" ? 320 : tier === "MEDIUM" ? 200 : 90;
  const positions = new Float32Array(count * 3);

  // Card slots in the default row layout — dust clusters near the rims.
  const slots = [
    { x: -4.05, y: 0, z: 0 },
    { x: 0, y: 0, z: 0.55 },
    { x: 4.05, y: 0, z: 0 },
  ];

  for (let i = 0; i < count; i++) {
    const slot = slots[i % 3];
    const rimBias = i % 5 === 0; // 20% free-floating ambience
    if (rimBias) {
      positions[i * 3 + 0] = (Math.random() * 2 - 1) * 6.5;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 2.6;
      positions[i * 3 + 2] = -2.4 + Math.random() * 4.0;
    } else {
      // Ring just outside the card silhouette.
      const angle = Math.random() * Math.PI * 2;
      const rx = 1.95 + Math.random() * 0.55;
      const ry = 1.25 + Math.random() * 0.45;
      positions[i * 3 + 0] = slot.x + Math.cos(angle) * rx;
      positions[i * 3 + 1] = slot.y + Math.sin(angle) * ry;
      positions[i * 3 + 2] = slot.z + (Math.random() * 2 - 1) * 0.8;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const { material, uniforms } = createParticleMaterial();
  const points = new THREE.Points(geo, material);
  points.name = "ParticleField";
  points.renderOrder = 3;
  points.frustumCulled = false; // positions drift in-shader; avoid stale bounds

  return {
    points,
    uniforms,
    dispose() {
      geo.dispose();
      material.dispose();
    },
  };
}
