import * as THREE from "three";
import { PILLARS, type PillarId } from "./config/pillars";

/**
 * Materials for the pillar card system.
 *
 * Glass: MeshPhysicalMaterial with real transmission/refraction — the shell
 * stays near-black in the centre (smoked core behind it) while the bevel
 * catches the studio environment.
 *
 * Edge: custom fresnel ShaderMaterial (view-dependent, 1-dot(N,V) power
 * curve) driving a per-pillar 3-stop gradient + highlight. Additive, depth-
 * write off, so it behaves like light on glass rather than paint.
 */

export type QualityTier = "HIGH" | "MEDIUM" | "LOW";

export function createGlassShellMaterial(tier: QualityTier): THREE.MeshPhysicalMaterial {
  const low = tier === "LOW";
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#0b0b0d"),
    metalness: 0,
    // Sharp and clear like the reference: low roughness keeps reflections
    // tight on the bevel instead of a milky wash; the dim env (see engine)
    // means tight highlights stay narrow colored bands, never white plates.
    roughness: low ? 0.08 : 0.05,
    transmission: low ? 0 : 1,
    thickness: 0.5,
    ior: 1.45,
    attenuationColor: new THREE.Color("#0d0d10"),
    attenuationDistance: 2.2,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    // Kept low: the glass body must stay smoked-clear; identity light comes
    // from the rim shader + flares, not from env reflection.
    envMapIntensity: 0.35,
    specularIntensity: 0.7,
    transparent: true,
    opacity: low ? 0.55 : 1,
  });
  // LOW tier has no transmission pass — fake the glass with transparency.
  if (low) {
    mat.transparent = true;
    mat.depthWrite = false;
  }
  return mat;
}

export function createSmokedCoreMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#060607"),
    metalness: 0.1,
    roughness: 0.38,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.55,
    transparent: true,
    opacity: 0.94,
  });
}

export function createBackingMaterial(): THREE.MeshBasicMaterial {
  // Almost-black depth plane — keeps the centre smoked even where the
  // environment would otherwise shine through the transmission pass.
  return new THREE.MeshBasicMaterial({ color: new THREE.Color("#030304"), transparent: true, opacity: 0.9 });
}

export interface EdgeUniforms {
  [uniform: string]: THREE.IUniform;
  uPrimary: THREE.IUniform<THREE.Color>;
  uSecondary: THREE.IUniform<THREE.Color>;
  uGlow: THREE.IUniform<THREE.Color>;
  uPower: THREE.IUniform<number>;
  uIntensity: THREE.IUniform<number>;
  uBoost: THREE.IUniform<number>;
  uReveal: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
  uNovaMode: THREE.IUniform<number>;
  uBase: THREE.IUniform<number>;
  uHalf: THREE.IUniform<THREE.Vector2>;
}

const EDGE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec3 vLocal;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vLocal = position;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mv = viewMatrix * worldPos;
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const EDGE_FRAG = /* glsl */ `
  uniform vec3 uPrimary;
  uniform vec3 uSecondary;
  uniform vec3 uGlow;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uBoost;
  uniform float uReveal;
  uniform float uTime;
  uniform float uNovaMode;
  uniform float uBase;
  uniform vec2 uHalf;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec3 vLocal;

  vec3 novaRamp(float t) {
    // magenta -> violet -> deep purple -> electric blue -> cool highlight.
    // Predominantly purple/blue: magenta only appears at grazing extremes.
    vec3 magenta = vec3(1.0, 0.25, 0.83);
    vec3 violet  = vec3(0.48, 0.25, 0.95);
    vec3 purple  = vec3(0.17, 0.06, 0.40);
    vec3 blue    = vec3(0.18, 0.42, 1.00);
    vec3 c = mix(magenta, violet, smoothstep(0.0, 0.28, t));
    c = mix(c, purple, smoothstep(0.28, 0.52, t));
    c = mix(c, blue, smoothstep(0.52, 0.8, t));
    c = mix(c, uGlow, smoothstep(0.8, 1.0, t));
    return c;
  }

  void main() {
    vec3 N = normalize(vNormal);
    // View dir is in view space; transform normal to view space for the dot.
    vec3 Vv = normalize(vViewDir);
    // Approximate: use world-space up-biased variation so the gradient
    // travels spatially around the rim, not just with the camera.
    float rimTravel = clamp(vWorldPos.x * 0.22 + vWorldPos.y * 0.16 + 0.5, 0.0, 1.0);
    float ndv = abs(dot(N, Vv));
    float fresnel = pow(1.0 - clamp(ndv, 0.0, 1.0), uPower);

    vec3 base;
    vec3 baseCol;
    if (uNovaMode > 0.5) {
      float t = clamp(rimTravel * 0.65 + fresnel * 0.55, 0.0, 1.0);
      base = novaRamp(t);
      baseCol = novaRamp(0.45);
    } else {
      // deep -> metallic mid -> near-white highlight, peaking with fresnel.
      vec3 c = mix(uPrimary, uSecondary, smoothstep(0.05, 0.55, fresnel));
      c = mix(c, uGlow, smoothstep(0.55, 0.95, fresnel));
      // Subtle spatial travel so the highlight sits where light meets rim.
      c = mix(c, uGlow, rimTravel * fresnel * 0.25);
      base = c;
      baseCol = mix(uPrimary, uSecondary, 0.5);
    }

    // Gentle breathing shimmer — restrained, never a pulse.
    float shimmer = 1.0 + 0.06 * sin(uTime * 0.8 + vWorldPos.x * 2.0 + vWorldPos.y * 1.4);
    // uBase keeps the rim breathing pillar color even head-on (where fresnel
    // is ~0); fresnel adds the view-dependent fire on top as the pane turns.
    // Corner boost: the reference rim burns brightest exactly at the corners
    // where the flares sit — min() of the normalized axes isolates corners.
    vec2 cuv = abs(vLocal.xy) / uHalf;
    float cornerness = pow(clamp(min(cuv.x, cuv.y), 0.0, 1.0), 6.0);
    float rimGlow = fresnel * uIntensity;
    float glow = rimGlow + uBase * (1.0 + cornerness * 1.6);
    vec3 col = (baseCol * uBase + base * rimGlow) / max(glow, 1e-3);
    col = mix(col, uGlow, cornerness * 0.45);
    float a = glow * uBoost * uReveal * shimmer;
    gl_FragColor = vec4(col * a * 2.0, clamp(a, 0.0, 1.0));
  }
`;

export function createEdgeMaterial(pillar: PillarId): { material: THREE.ShaderMaterial; uniforms: EdgeUniforms } {
  const cfg = PILLARS[pillar];
  const uniforms: EdgeUniforms = {
    uPrimary: { value: new THREE.Color(cfg.primary) },
    uSecondary: { value: new THREE.Color(cfg.secondary) },
    uGlow: { value: new THREE.Color(cfg.glow) },
    uPower: { value: cfg.edgePower },
    uIntensity: { value: cfg.edgeIntensity },
    uBoost: { value: 1 },
    uReveal: { value: 0 },
    uTime: { value: 0 },
    uNovaMode: { value: pillar === "NOVA" ? 1 : 0 },
    uBase: { value: 0.22 },
    uHalf: { value: new THREE.Vector2(1.8, 1.075) },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: EDGE_VERT,
    fragmentShader: EDGE_FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
  });
  return { material, uniforms };
}

/** Starburst flare sprite: pinpoint hot core, fast falloff, thin cross streaks.
 *  Tinted per-sprite via material color; the white core stays tiny so bloom
 *  makes a pinpoint (like the reference corner bursts), never a white blob. */
export function getFlareTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.07, "rgba(255,255,255,0.9)");
    g.addColorStop(0.16, "rgba(255,255,255,0.32)");
    g.addColorStop(0.38, "rgba(255,255,255,0.08)");
    g.addColorStop(0.7, "rgba(255,255,255,0.02)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // Cross streaks — the starburst arms. Narrow, fading at the ends.
    ctx.globalCompositeOperation = "lighter";
    const arm = (horizontal: boolean, alpha: number, thickness: number) => {
      const grad = horizontal
        ? ctx.createLinearGradient(0, 0, size, 0)
        : ctx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      if (horizontal) ctx.fillRect(0, size / 2 - thickness / 2, size, thickness);
      else ctx.fillRect(size / 2 - thickness / 2, 0, thickness, size);
    };
    arm(true, 0.5, 2);
    arm(false, 0.32, 1.5);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Diagonal sheen band: the caustic-like light streak sweeping the glass
 * face in the reference. Drawn once, reused on crossed planes at low
 * opacity — structured light so the face never reads flat gray.
 */
let sheenTextureCache: THREE.CanvasTexture | null = null;

export function getSheenTexture(): THREE.CanvasTexture {
  if (sheenTextureCache) return sheenTextureCache;
  const w = 256;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, w, h);
    // Narrow bright band across the short axis, feathered both sides.
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.38, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,0.85)");
    g.addColorStop(0.62, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Soft top glow falling off downward (the luminous top third).
    const top = ctx.createLinearGradient(0, 0, 0, h);
    top.addColorStop(0, "rgba(255,255,255,0.5)");
    top.addColorStop(0.45, "rgba(255,255,255,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, h * 0.45);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  sheenTextureCache = tex;
  return tex;
}

export function createFlareMaterial(color: string, opacity: number): THREE.SpriteMaterial {
  return new THREE.SpriteMaterial({
    map: getFlareTexture(),
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
  });
}
