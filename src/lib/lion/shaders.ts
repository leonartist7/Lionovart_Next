// ---------------------------------------------------------------------------
// GLSL for the /services/ai particle lion.
//
// The particle system is GOLD: deep bronze through amber to a white-hot gold
// highlight. This is scoped to the engine only — the page's DOM chrome (font,
// headline accent, flow rail, glass caustics) runs its own blue accent and is
// intentionally not matched here.
//
// Values run above 1.0 because the renderer tone-maps with ACES, so anything
// meant to bloom must exceed the clamp before grading.
// ---------------------------------------------------------------------------

/** Simplex 3D noise + curl. Shared by any stage that needs organic drift. */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 curl(vec3 p){
  const float e = 0.12;
  float n1 = snoise(p + vec3(0.0, e, 0.0));
  float n2 = snoise(p - vec3(0.0, e, 0.0));
  float n3 = snoise(p + vec3(0.0, 0.0, e));
  float n4 = snoise(p - vec3(0.0, 0.0, e));
  float n5 = snoise(p + vec3(e, 0.0, 0.0));
  float n6 = snoise(p - vec3(e, 0.0, 0.0));
  float x = (n1 - n2) - (n3 - n4);
  float y = (n3 - n4) - (n5 - n6);
  float z = (n5 - n6) - (n1 - n2);
  return normalize(vec3(x, y, z) + 1e-5);
}
`;
export const PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;        // 0 = lion, 1 = vertical energy current
uniform float uIntro;        // 0..1 intro assembly progress
uniform float uDriftAmp;     // ember drift amplitude (grows with morph)
uniform float uTurb;         // turbulence amplitude (grows with morph)
uniform float uMouseStrength;
uniform vec3  uMouse;        // world-space pointer position
uniform float uSize;
uniform float uPixelRatio;
uniform float uFocusDist;    // camera-space focus distance (for DOF)
uniform float uDofAmount;    // depth-of-field strength
uniform float uBloom;        // Act 7: the lion reforms as a crest over the CTA
uniform vec3  uCrest;        // world-space center of that crest

attribute vec3 aNormal;
attribute vec4 aRand;        // x,y,z,w in [0,1]
attribute vec3 aSpawn;       // intro spawn position (far field)

varying vec3  vColor;
varying float vAlpha;

${NOISE_GLSL}

void main(){
  float m = smoothstep(0.0, 1.0, uMorph);

  // ---------- lion state ----------------------------------------------------
  vec3 p = position;

  // breathing along the surface normal
  p += aNormal * (0.018 * sin(uTime * 0.7 + aRand.x * 6.2831));

  // Curl noise is the most expensive vertex work. It belongs to the mane, so
  // stop evaluating it once the particles have become the energy current.
  if (m < 0.98) {
    vec3 turb = curl(p * 1.35 + vec3(0.0, uTime * 0.12, uTime * 0.05));
    p += turb * uTurb * (1.0 - m);
  }

  // scroll onset: the whole lion begins a slow, stately turn in the SAME
  // direction as the energy current, so the transformation reads as one
  // continuous movement instead of a sudden mode switch
  float preRot = m * 0.55;
  float prc = cos(preRot), prs = sin(preRot);
  p = vec3(p.x * prc - p.z * prs, p.y, p.x * prs + p.z * prc);

  // ember drift: slow diagonal-up loop, fades at both ends of the cycle.
  // Fades out as particles lock into orbit.
  float ph = fract(uTime * (0.028 + aRand.y * 0.03) + aRand.x);
  vec3 driftDir = normalize(vec3(0.42, 1.0, 0.18));
  p += driftDir * ph * uDriftAmp * (0.35 + aRand.z * 0.65) * (1.0 - m);
  float emberFade = 0.45 + 0.55 * (smoothstep(0.0, 0.12, ph) * smoothstep(1.0, 0.82, ph));

  // ---------- vertical energy state -----------------------------------------
  // The same lion particles stretch into a narrow current. There is no second
  // shader layer and no central sphere: every mark remains traceable from the
  // lion into the flow and back again.
  float flowY = mod(
    aRand.x * 4.4 - uTime * (0.18 + aRand.y * 0.08) + 2.2,
    4.4
  ) - 2.2;
  float phase = aRand.w * 6.2831853;
  float lane = (aRand.z - 0.5) * 0.38;
  float wideWave = sin(flowY * 2.35 - uTime * 0.72 + phase)
    * (0.07 + aRand.y * 0.11);
  float fineWave = cos(flowY * 5.1 + uTime * 1.05 + phase) * 0.045;
  vec3 energy = vec3(
    lane + wideWave + fineWave,
    flowY,
    (aRand.w - 0.5) * 0.26 + sin(flowY * 3.4 + phase) * 0.08
  );

  float energyT = smoothstep(0.10, 0.92, m);
  vec3 finalPos = mix(p, energy, energyT);

  // ---------- Act 7: reform ---------------------------------------------------
  // The peak-end beat. Give the sparse lion enough screen area for its muzzle,
  // eyes, and mane to resolve instead of compressing it into a bright blob.
  vec3 crest = position * 0.72 + uCrest;
  finalPos = mix(finalPos, crest, uBloom);

  // ---------- intro reveal ---------------------------------------------------
  float introT = smoothstep(aRand.w * 0.75, aRand.w * 0.75 + 0.25, uIntro);
  finalPos = mix(aSpawn, finalPos, introT);

  // ---------- mouse repulsion ------------------------------------------------
  // Radius is deliberately small: at 0.85 (the old value) against a ~1.6-unit
  // head this pushed nearly half the object away and read as a visible hole
  // punched by the cursor rather than a subtle touch.
  vec3 away = finalPos - uMouse;
  float md = length(away);
  finalPos += normalize(away + 1e-4) * smoothstep(0.20, 0.0, md) * uMouseStrength * (1.0 - m * 0.75);

  // ---------- lighting / color ----------------------------------------------
  vec4 world = modelMatrix * vec4(finalPos, 1.0);
  vec3 viewDir = normalize(world.xyz - cameraPosition);

  // fake key light sweep across the gold (drives the highlight hue only)
  vec3 lightDir = normalize(vec3(sin(uTime * 0.21) * 0.7, 0.55, 0.75));
  float diff = clamp(dot(aNormal, lightDir) * 0.5 + 0.5, 0.0, 1.0);

  // fixed cinematic key from the upper left (matches the flare/god-ray
  // source): one-sided lambert carves real form shadow — the far side of
  // the nose, the eye sockets and the mane underside fall into darkness.
  // A small wrap term keeps the terminator soft instead of a hard line.
  vec3 keyDir = vec3(-0.4355, 0.5323, 0.7259);
  float lit = clamp((dot(aNormal, keyDir) + 0.12) / 1.12, 0.0, 1.0);
  float shade = 0.34 + 0.66 * pow(lit, 1.6);

  // Gold ramp: deep bronze -> amber -> bright gold highlight.
  vec3 gold = mix(vec3(0.35, 0.16, 0.04), vec3(1.35, 0.85, 0.30), aRand.y);
  gold = mix(gold, vec3(1.6, 1.35, 0.95), pow(diff, 2.2) * 0.6);
  gold *= 0.55 + 0.65 * diff;
  // directional form shadow, lion state only
  gold *= mix(1.0, shade, 1.0 - m);

  // warm rim light on silhouette edges, brightest where the form turns away
  float fres = pow(1.0 - abs(dot(viewDir, aNormal)), 2.4);
  vec3 rim = vec3(1.2, 0.75, 0.30) * fres * (0.38 + 0.52 * m);
  vec3 col = gold + rim;

  // lift the face region so the muzzle/brow read against the mane
  float faceMask = smoothstep(0.35, 1.0, position.z);
  col *= 1.0 + faceMask * 0.25 * (1.0 - m);

  // relief folds (eyes, nose, whiskers) darken -> facial features emerge.
  // Restricted to the front relief so the silhouette rim survives.
  float fold = smoothstep(0.90, 0.45, aNormal.z) * step(0.0, aNormal.z);
  col *= 1.0 - fold * 0.62 * faceMask * (1.0 - m);

  // The energy current shifts toward violet/cyan without changing renderers.
  // A restrained pulse gives it life while keeping individual particles crisp.
  vec3 energyColor = mix(
    vec3(0.16, 0.48, 1.25),
    vec3(0.72, 0.20, 1.18),
    aRand.z
  );
  float energyPulse = 0.78 + 0.22 * sin(
    flowY * 4.0 - uTime * 1.25 + aRand.y * 6.2831853
  );
  energyColor *= energyPulse;
  col = mix(col, energyColor, energyT);

  // reforming: the gold comes back with the shape
  col = mix(col, gold * 1.08, uBloom);

  // subtle per-particle twinkle
  float twinkle = 0.75 + 0.25 * sin(uTime * (1.2 + aRand.z * 2.0) + aRand.x * 40.0);

  vColor = col * twinkle;
  vAlpha = mix(emberFade, 0.68, energyT) * introT;
  vAlpha = mix(vAlpha, 0.92, uBloom);

  // ---------- projection -----------------------------------------------------
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float sizeJitter = 0.4 + aRand.w * 0.8;
  gl_PointSize = uSize * sizeJitter * uPixelRatio * (1.0 / -mv.z);
  gl_PointSize *= (1.0 - energyT * 0.22);
  gl_PointSize *= mix(1.0, 1.08, uBloom);

  // depth of field: off-focus particles become soft bokeh discs
  float coc = clamp(abs(-mv.z - uFocusDist) * uDofAmount, 0.0, 2.0);
  gl_PointSize *= 1.0 + coc * 1.5;
  vAlpha /= 1.0 + coc * 1.2;
}
`;

export const PARTICLE_FRAG = /* glsl */ `
precision highp float;
uniform float uGain;
varying vec3  vColor;
varying float vAlpha;

void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0; // 0 at center, ~1 at sprite edge
  // Single continuous soft-Gaussian falloff, not a flat plateau plus a
  // separate hot spike — that two-term shape (a hard-edged disc with an
  // independent bright dot at its center) is exactly what reads as "little
  // dots with a big circle around them" at low particle density: each sprite
  // is individually legible as two shapes instead of blending into its
  // neighbors. One curve means no boundary anywhere in the sprite contributes
  // full alpha, which is also why this reduces whiteout under additive
  // blending: THREE.AdditiveBlending's default factors are (SRC_ALPHA, ONE),
  // so col*a is what actually lands in the framebuffer, and a wide flat a=1
  // region is what let overlapping opaque discs sum straight to white.
  float a = clamp(exp(-d * d * 7.5) * vAlpha, 0.0, 1.0);
  if (a < 0.025) discard;
  vec3 col = vColor;
  gl_FragColor = vec4(col * a * uGain, a);
}
`;


// Clean screen-space grade: restrained vignette only --------------------------
export const GRADE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tDiffuse;
uniform float uVignette;
varying vec2 vUv;

void main(){
  vec3 col = texture2D(tDiffuse, vUv).rgb;
  vec2 c = vUv - 0.5;
  float r2 = dot(c, c);
  col *= 1.0 - uVignette * smoothstep(0.18, 0.68, r2);
  gl_FragColor = vec4(col, 1.0);
}
`;


/** Shared fullscreen-quad vertex stage for every ShaderPass and billboard. */
export const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Anamorphic lens flare: thin stretched streak --------------------------------
export const FLARE_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uIntensity;
uniform vec3  uColor;
varying vec2 vUv;

void main(){
  vec2 c = vUv - 0.5;
  // horizontal streak: tight vertically, soft long falloff horizontally
  float streak = exp(-c.y * c.y * 900.0) * exp(-abs(c.x) * 5.5);
  // small round core where the flare originates
  float core = exp(-dot(c, c) * 120.0) * 1.4;
  // faint vertical cross glint
  float glint = exp(-c.x * c.x * 900.0) * exp(-abs(c.y) * 6.0) * 0.35;

  float pulse = 0.75 + 0.25 * sin(uTime * 0.6);
  float a = clamp((streak + core + glint) * uIntensity * pulse, 0.0, 1.0);
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor * (streak + core + glint) * uIntensity * pulse, a);
}
`;
