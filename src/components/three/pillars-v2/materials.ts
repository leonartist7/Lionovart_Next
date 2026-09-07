import * as THREE from "three";
import {
  MeshPhysicalNodeMaterial,
  MeshBasicNodeMaterial,
  PointsNodeMaterial,
  type Node,
} from "three/webgpu";
import {
  Fn,
  abs,
  clamp,
  dot,
  exp,
  float,
  fract,
  hash,
  length,
  min,
  mix,
  normalView,
  normalize,
  oneMinus,
  positionLocal,
  positionViewDirection,
  positionWorld,
  pow,
  rotate,
  saturate,
  sin,
  smoothstep,
  step,
  uniform,
  uv,
  vec3,
} from "three/tsl";
import { PILLARS, type PillarId } from "../pillars/config/pillars";

/**
 * All materials for the v2 pillar system, authored entirely in TSL so one
 * codebase compiles to WGSL (WebGPU) and GLSL (WebGL2) with visual parity.
 *
 * Glass: MeshPhysicalNodeMaterial — real transmission/refraction; the shell
 * stays near-black in the centre (smoked core + backing behind it) while the
 * bevel catches the studio environment.
 *
 * Edge: custom view-dependent fresnel emission (pow(1 - |dot(N, V)|, k))
 * driving a per-pillar colour ramp, double-rail z-banding, corner pooling
 * and a pointer-driven sweep highlight. Additive, depth-write off — light on
 * glass, not paint. HDR output (>1) feeds the selective bloom threshold.
 */

export type QualityTier = "HIGH" | "MEDIUM" | "LOW";

/* Uniform node types, derived from the factory itself (pure JS objects —
 * creating one here costs nothing and never touches the GPU). */
const _floatU = uniform(0);
const _vec2U = uniform(new THREE.Vector2());
export type FloatUniform = typeof _floatU;
export type Vec2Uniform = typeof _vec2U;

/* ─────────────────────────── glass ─────────────────────────── */

export function createGlassShellMaterial(tier: QualityTier): MeshPhysicalNodeMaterial {
  const low = tier === "LOW";
  const mat = new MeshPhysicalNodeMaterial({
    color: new THREE.Color("#0b0b0d"),
    metalness: 0,
    // Low roughness keeps bevel reflections tight, not milky; the dim studio
    // env keeps those highlights narrow colored bands, never white plates.
    roughness: low ? 0.1 : 0.055,
    transmission: low ? 0 : 0.95,
    thickness: 0.5,
    ior: 1.45,
    attenuationColor: new THREE.Color("#0d0d10"),
    attenuationDistance: 2.2,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    // Kept low: the glass body must stay smoked-clear; identity light comes
    // from the rim shader + flares, not from env reflection.
    envMapIntensity: 0.45,
    specularIntensity: 0.75,
    transparent: true,
    opacity: low ? 0.5 : 1,
  });
  if (low) {
    mat.depthWrite = false;
  }
  return mat;
}

/* ───────────────────── smoked core + sheen ──────────────────── */

export interface CoreUniforms {
  uTime: FloatUniform;
  uReveal: FloatUniform;
}

/**
 * Near-black smoked plate. The diagonal caustic sheen bands from the
 * reference live here as a whisper-quiet emissive term (no extra planes).
 */
export function createSmokedCoreMaterial(
  pillar: PillarId,
): { material: MeshPhysicalNodeMaterial; uniforms: CoreUniforms } {
  const cfg = PILLARS[pillar];
  const uTime = uniform(0);
  const uReveal = uniform(0);
  const sheenTint = uniform(new THREE.Color(cfg.glow).lerp(new THREE.Color("#ffffff"), 0.4));

  const sheen = Fn(() => {
    // Two crossed diagonal bands, drifting slowly — structured light so the
    // face never reads as flat gray.
    const d1 = positionLocal.x.mul(0.55).add(positionLocal.y.mul(1.15));
    const band1 = pow(
      saturate(oneMinus(abs(fract(d1.mul(0.24).sub(uTime.mul(0.018))).sub(0.5)).mul(5.2))),
      3.0,
    );
    const d2 = positionLocal.x.mul(1.3).sub(positionLocal.y.mul(0.62));
    const band2 = pow(
      saturate(oneMinus(abs(fract(d2.mul(0.2).add(uTime.mul(0.012))).sub(0.5)).mul(6.4))),
      3.0,
    );
    // Luminous top third, falling off downward.
    const top = smoothstep(-0.35, 0.85, positionLocal.y).mul(0.4);
    const dust = hash(positionLocal.x.mul(913.7).add(positionLocal.y.mul(517.3))).mul(0.035);
    return sheenTint.mul(band1.mul(0.10).add(band2.mul(0.055)).add(top.mul(0.05)).add(dust));
  });

  const mat = new MeshPhysicalNodeMaterial({
    color: new THREE.Color("#060607"),
    metalness: 0.1,
    roughness: 0.38,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.55,
  });
  mat.emissiveNode = sheen().mul(uReveal);

  return { material: mat, uniforms: { uTime, uReveal } };
}

/** Near-black backing slab — keeps the centre smoked against the env. */
export function createBackingMaterial(): MeshBasicNodeMaterial {
  return new MeshBasicNodeMaterial({ color: new THREE.Color("#030304") });
}

/* ─────────────────────── edge emission ──────────────────────── */

export interface EdgeUniforms {
  uTime: FloatUniform;
  uReveal: FloatUniform;
  uBoost: FloatUniform;
  uSweep: FloatUniform;
  uHalf: Vec2Uniform;
}

const NOVA_STOPS = {
  magenta: vec3(1.0, 0.25, 0.83),
  violet: vec3(0.48, 0.25, 0.95),
  purple: vec3(0.17, 0.06, 0.4),
  blue: vec3(0.18, 0.42, 1.0),
};

/** NOVA spatial ramp — predominantly purple/blue; magenta only off-axis. */
function novaRamp(t: Node<"float">) {
  const c1 = mix(NOVA_STOPS.magenta, NOVA_STOPS.violet, smoothstep(0.0, 0.28, t));
  const c2 = mix(c1, NOVA_STOPS.purple, smoothstep(0.28, 0.52, t));
  return mix(c2, NOVA_STOPS.blue, smoothstep(0.52, 0.8, t));
}

/**
 * The signature luminous rim. One TSL program per pillar (ramp choice is
 * baked at build time — no runtime branches).
 */
export function createEdgeMaterial(pillar: PillarId): {
  material: MeshBasicNodeMaterial;
  uniforms: EdgeUniforms;
} {
  const cfg = PILLARS[pillar];
  const isNova = pillar === "NOVA";

  const uTime = uniform(0);
  const uReveal = uniform(0);
  const uBoost = uniform(1);
  const uSweep = uniform(0);
  const uPower = uniform(cfg.edgePower);
  const uIntensity = uniform(cfg.edgeIntensity);
  const uBase = uniform(0.22);
  const uHalf = uniform(new THREE.Vector2(1.8, 1.075));
  const uHalfDepth = uniform(0.105); // extrude depth/2 + bevel
  const uPrimary = uniform(new THREE.Color(cfg.primary));
  const uSecondary = uniform(new THREE.Color(cfg.secondary));
  const uGlow = uniform(new THREE.Color(cfg.glow));

  const edge = Fn(() => {
    const N = normalize(normalView);
    const V = normalize(positionViewDirection);
    const ndv = abs(dot(N, V));
    const fresnel = pow(oneMinus(saturate(ndv)), uPower);

    // Gradient travels spatially around the rim, not just with the camera.
    const rimTravel = clamp(positionWorld.x.mul(0.22).add(positionWorld.y.mul(0.16)).add(0.5), 0, 1);

    // Per-pillar ramp (baked at build time — no branch in the shader).
    let base;
    if (isNova) {
      const t = clamp(rimTravel.mul(0.65).add(fresnel.mul(0.55)), 0, 1);
      base = mix(novaRamp(t), uGlow, smoothstep(0.8, 1.0, t));
    } else {
      const c1 = mix(uPrimary, uSecondary, smoothstep(0.05, 0.55, fresnel));
      const c2 = mix(c1, uGlow, smoothstep(0.55, 0.95, fresnel));
      // Highlight sits where the studio rim light meets the bevel.
      base = mix(c2, uGlow, rimTravel.mul(fresnel).mul(0.25));
    }

    // Double rail: band emission by local z so the front and back bevels
    // read as two separate luminous rails with a recessed middle — the
    // reference's thick-glass left edge.
    const rail = smoothstep(0.1, 0.85, abs(positionLocal.z).div(uHalfDepth));
    const railMix = float(0.32).add(rail.mul(0.68));

    // Corner pooling — the rim burns brightest exactly where flares sit.
    const cuv = abs(positionLocal.xy).div(uHalf);
    const cornerness = pow(clamp(min(cuv.x, cuv.y), 0, 1), 6.0);

    // Pointer-driven reflection sweep gliding along the rim.
    const sweep = exp(pow(positionLocal.x.sub(uSweep).mul(1.3), 2.0).negate()).mul(0.3);

    const rimGlow = fresnel.mul(uIntensity);
    const glowAmt = rimGlow.add(uBase.mul(cornerness.mul(1.6).add(1))).add(sweep).mul(railMix);
    const shimmer = sin(uTime.mul(0.8).add(positionWorld.x.mul(2.0)).add(positionWorld.y.mul(1.4)))
      .mul(0.06)
      .add(1.0);

    const col = mix(base, uGlow, cornerness.mul(0.45));
    const a = glowAmt.mul(uBoost).mul(uReveal).mul(shimmer);
    // HDR: >1 values at grazing angles + corners clear the bloom threshold.
    return col.mul(a).mul(2.1);
  });

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  material.colorNode = edge();

  return { material, uniforms: { uTime, uReveal, uBoost, uSweep, uHalf } };
}

/* ─────────────────────── flare starburst ────────────────────── */

export interface FlareUniforms {
  uIntensity: FloatUniform;
  uReveal: FloatUniform;
}

/**
 * Procedural starburst on a billboarded plane — no canvas textures.
 * Pinpoint hot core (bloom makes the sparkle), thin cross streaks, one
 * rotated diagonal pair for the twirl. Tinted per flare anchor.
 */
export function createFlareMaterial(tint: string | THREE.Color): {
  material: MeshBasicNodeMaterial;
  uniforms: FlareUniforms;
} {
  const uTint = uniform(tint instanceof THREE.Color ? tint : new THREE.Color(tint));
  const uIntensity = uniform(0);
  const uReveal = uniform(0);

  const burst = Fn(() => {
    const p = uv().sub(0.5).mul(2.0);
    const r = length(p);
    const core = exp(r.mul(r).mul(-26.0));
    const armH = exp(abs(p.y).mul(-34.0)).mul(exp(abs(p.x).mul(-3.0)));
    const armV = exp(abs(p.x).mul(-44.0)).mul(exp(abs(p.y).mul(-2.6)));
    // Diagonal pair, weaker — the twirl.
    const pr = rotate(p, float(Math.PI / 4));
    const armD = exp(abs(pr.y).mul(-30.0)).mul(exp(abs(pr.x).mul(-4.5))).mul(0.4);
    const mask = smoothstep(1.05, 0.72, r);
    const i = core.mul(1.6).add(armH.mul(0.5)).add(armV.mul(0.36)).add(armD).mul(mask);
    const col = mix(uTint, vec3(1.0), core.mul(0.85));
    return col.mul(i).mul(uIntensity).mul(uReveal);
  });

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  material.colorNode = burst();

  return { material, uniforms: { uIntensity, uReveal } };
}

/* ─────────────────────── silk ribbons ───────────────────────── */

export interface SilkUniforms {
  uTime: FloatUniform;
}

/**
 * Silk light trail — flowing gradient along the tube, fresnel edge fade so
 * it reads as a ribbon of light, not geometry. Restrained by design: peak
 * luminance stays below the bloom threshold except at the pulse crest.
 */
export function createSilkMaterial(
  colorA: string | THREE.Color,
  colorB: string | THREE.Color,
  speed = 0.06,
): { material: MeshBasicNodeMaterial; uniforms: SilkUniforms } {
  const uTime = uniform(0);
  const uColA = uniform(colorA instanceof THREE.Color ? colorA : new THREE.Color(colorA));
  const uColB = uniform(colorB instanceof THREE.Color ? colorB : new THREE.Color(colorB));
  const uSpeed = uniform(speed);

  const silk = Fn(() => {
    const t = uv().x;
    // Two travelling pulses, offset in phase.
    const flow1 = fract(t.mul(2.0).sub(uTime.mul(uSpeed)));
    const pulse1 = pow(sin(flow1.mul(Math.PI)), 6.0);
    const flow2 = fract(t.mul(2.0).sub(uTime.mul(uSpeed)).add(0.5));
    const pulse2 = pow(sin(flow2.mul(Math.PI)), 6.0);
    // Bright core fading at the silhouette — light, not a mesh.
    const ndv = saturate(dot(normalize(normalView), normalize(positionViewDirection)));
    const edgeFade = pow(ndv, 1.4);
    const col = mix(uColA, uColB, t);
    const energy = float(0.22).add(pulse1.mul(0.55)).add(pulse2.mul(0.4));
    return col.mul(energy).mul(edgeFade);
  });

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  material.colorNode = silk();

  return { material, uniforms: { uTime } };
}

/* ──────────────────────── particles ─────────────────────────── */

export interface ParticleUniforms {
  uTime: FloatUniform;
  uReveal: FloatUniform;
}

/**
 * Sparse dust drifting near the rims — one draw call. Colour is chosen
 * per-particle from the three pillar tones so the field wraps the whole
 * composition; brightness twinkles slowly, additive on black.
 */
export function createParticleMaterial(): {
  material: PointsNodeMaterial;
  uniforms: ParticleUniforms;
} {
  const uTime = uniform(0);
  const uReveal = uniform(0);
  const gold = uniform(new THREE.Color("#e8a020"));
  const violet = uniform(new THREE.Color("#7b3ff2"));
  const red = uniform(new THREE.Color("#e5192a"));

  const mat = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  mat.sizeAttenuation = true;

  const drift = Fn(() => {
    const seed = positionLocal.x.mul(12.9898).add(positionLocal.y.mul(78.233)).add(positionLocal.z.mul(37.719));
    const dx = sin(uTime.mul(0.1).add(seed)).mul(0.28);
    const dy = sin(uTime.mul(0.13).add(seed.mul(1.7))).mul(0.24);
    const dz = sin(uTime.mul(0.08).add(seed.mul(0.6))).mul(0.2);
    return positionLocal.add(vec3(dx, dy, dz));
  });
  mat.positionNode = drift();

  const tint = Fn(() => {
    const h = hash(positionLocal.x.mul(431.7).add(positionLocal.y.mul(191.3)).add(positionLocal.z.mul(97.1)));
    const c = mix(gold, violet, step(0.34, h));
    return mix(c, red, step(0.67, h));
  });

  const twinkle = Fn(() => {
    const seed = positionLocal.x.mul(311.3).add(positionLocal.y.mul(17.7)).add(positionLocal.z.mul(73.1));
    const rate = hash(seed).mul(0.9).add(0.25);
    const t = sin(uTime.mul(rate).add(seed)).mul(0.5).add(0.5);
    return float(0.06).add(pow(t, 2.0).mul(0.3)).mul(uReveal);
  });

  mat.colorNode = tint().mul(twinkle());
  mat.sizeNode = float(2.4);

  return { material: mat, uniforms: { uTime, uReveal } };
}

/* ───────────────────── under-glow aura ──────────────────────── */

/** Soft radial halo pooled behind each card — light from behind/beneath. */
export function createAuraMaterial(
  tint: string | THREE.Color,
  intensity = 0.16,
): { material: MeshBasicNodeMaterial; uniforms: { uIntensity: FloatUniform } } {
  const uTint = uniform(tint instanceof THREE.Color ? tint : new THREE.Color(tint));
  const uIntensity = uniform(intensity);

  const aura = Fn(() => {
    const p = uv().sub(0.5).mul(2.0);
    const r = length(p);
    // Slight vertical squash pools the light lower, like an under-light.
    const falloff = pow(saturate(oneMinus(r)), 2.4);
    return uTint.mul(falloff).mul(uIntensity);
  });

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  material.colorNode = aura();
  return { material, uniforms: { uIntensity } };
}
