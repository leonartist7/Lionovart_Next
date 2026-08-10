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
uniform float uMorph;        // 0 = lion, 1 = singularity (scroll-scrubbed)
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
varying float vHot;          // 1 near singularity core

${NOISE_GLSL}

void main(){
  float m = smoothstep(0.0, 1.0, uMorph);

  // ---------- lion state ----------------------------------------------------
  vec3 p = position;

  // breathing along the surface normal
  p += aNormal * (0.018 * sin(uTime * 0.7 + aRand.x * 6.2831));

  // gentle organic turbulence (mane shimmer), ramps up while morphing
  vec3 turb = curl(p * 1.35 + vec3(0.0, uTime * 0.12, uTime * 0.05));
  p += turb * uTurb;

  // scroll onset: the whole lion begins a slow, stately turn in the SAME
  // angular direction as the disk's orbital flow, so the collapse reads as
  // one continuous motion instead of a disperse-then-switch
  float preRot = m * 1.35;
  float prc = cos(preRot), prs = sin(preRot);
  p = vec3(p.x * prc - p.z * prs, p.y, p.x * prs + p.z * prc);

  // ember drift: slow diagonal-up loop, fades at both ends of the cycle.
  // Fades out as particles lock into orbit.
  float ph = fract(uTime * (0.028 + aRand.y * 0.03) + aRand.x);
  vec3 driftDir = normalize(vec3(0.42, 1.0, 0.18));
  p += driftDir * ph * uDriftAmp * (0.35 + aRand.z * 0.65) * (1.0 - m);
  float emberFade = 0.45 + 0.55 * (smoothstep(0.0, 0.12, ph) * smoothstep(1.0, 0.82, ph));

  // ---------- singularity state --------------------------------------------
  // band distribution -> dark shadow center, bright accretion ring
  float orbitR = 0.62 + pow(aRand.z, 1.8) * 0.95;
  // a thin photon ring of super-hot particles hugging the shadow
  orbitR = mix(orbitR, 0.56 + aRand.z * 0.05, step(aRand.w, 0.03));
  float ang = aRand.x * 6.2831 + uTime * (0.5 / (orbitR + 0.10));
  vec3 disk = vec3(
    cos(ang) * orbitR,
    (aRand.w - 0.5) * 0.09 * orbitR,
    sin(ang) * orbitR
  );
  // tilt the disk so it reads as a disk, not a face-on circle
  float tiltA = 0.62;
  disk = vec3(disk.x, disk.y * cos(tiltA) - disk.z * sin(tiltA), disk.y * sin(tiltA) + disk.z * cos(tiltA));

  // ---------- the mess: scattered load of operational work -----------------
  // Between the lion and the settled disk, the particles fly apart into a
  // loose, spinning cloud before converging — "everything, all at once"
  // resolving into "one system." A FIXED per-particle radial direction, not
  // time-varying curl noise: each particle visibly flies outward along its
  // own straight line, which reads as a deliberate event rather than a fast,
  // incoherent shimmer. Driven by this section's own scroll range (see
  // AiChaosBeat.tsx / AiHeroCopy.tsx's split of uMorph at m=0.12).
  float scatterT = smoothstep(0.12, 0.50, m);
  float settleT  = smoothstep(0.50, 1.00, m);

  vec3 burstDir = normalize(aRand.xyz - 0.5 + 1e-4);
  float burstAmp = 2.2 * scatterT * (1.0 - settleT * 0.9);
  vec3 scattered = p + burstDir * burstAmp;
  float chaosSpin = scatterT * 0.9 * (1.0 - settleT);
  float ccs = cos(chaosSpin), csn = sin(chaosSpin);
  scattered = vec3(scattered.x * ccs - scattered.z * csn, scattered.y, scattered.x * csn + scattered.z * ccs);

  // spiral collapse path: rotate & shrink current position while blending.
  // The vertical squash is delayed to the second half of that window so the
  // first half is a pure, slow rotation matching the disk's flow. Driven by
  // settleT (was raw m) — the collapse now only runs once the mess resolves.
  float collapse = settleT;
  float swirlAng = collapse * (4.0 + aRand.y * 5.0);
  float cs = cos(swirlAng), sn = sin(swirlAng);
  float squash = smoothstep(0.45, 1.0, m);
  vec3 spun = vec3(scattered.x * cs - scattered.z * sn, scattered.y * (1.0 - squash * 0.85), scattered.x * sn + scattered.z * cs);
  spun *= (1.0 - collapse * 0.35);

  // spun already carries the scatter (burstAmp itself fades back down as
  // settleT -> 1, so scattered relaxes toward p right where collapse takes
  // over) — no second blend needed here.
  vec3 morphed = mix(spun, disk, collapse);
  vec3 finalPos = mix(p, morphed, m);

  // ---------- Act 7: reform ---------------------------------------------------
  // The peak-end beat. The lion comes back small and whole above the CTA, so
  // the last thing on screen is the mark that opened the page. Scale widened
  // from 0.42 to spread the same particle count over more screen area — pure
  // geometry to reduce local density, no color-math side effect.
  vec3 crest = position * 0.58 + uCrest;
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
  // directional form shadow, lion state only (the disk is self-lit)
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

  // The inner edge of the disk runs hottest: gold burning toward white. This
  // is the moment of transformation and only exists during the collapse.
  float core = smoothstep(0.78, 0.60, orbitR);
  col = mix(col, vec3(1.7, 1.4, 0.85), m * core * 0.55);
  vHot = m * core;

  // doppler beaming: the disk side rotating toward the camera burns brighter
  vec3 tang = vec3(-sin(ang), -cos(ang) * sin(tiltA), cos(ang) * cos(tiltA));
  vec3 toCam = normalize(cameraPosition - world.xyz);
  float dop = dot(normalize(tang + 1e-5), toCam);
  col *= mix(1.0, clamp(1.0 + dop * 0.9, 0.4, 1.7), m);

  // the disk concentrates particles into less area -> dim to compensate
  col *= mix(1.0, 0.38, m);

  // reforming: the gold comes back with the shape
  col = mix(col, gold * 1.15, uBloom);
  vHot *= 1.0 - uBloom;

  // subtle per-particle twinkle
  float twinkle = 0.75 + 0.25 * sin(uTime * (1.2 + aRand.z * 2.0) + aRand.x * 40.0);

  vColor = col * twinkle;
  vAlpha = mix(emberFade, 1.0, m * 0.85) * introT;

  // ---------- projection -----------------------------------------------------
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float sizeJitter = 0.4 + aRand.w * 0.8;
  gl_PointSize = uSize * sizeJitter * uPixelRatio * (1.0 / -mv.z);
  gl_PointSize *= (1.0 + vHot * 0.5);
  gl_PointSize *= (1.0 - m * 0.30); // tighter points in the dense disk

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
varying float vHot;

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
  float a = clamp(exp(-d * d * 6.0) * vAlpha, 0.0, 1.0);
  if (a < 0.02) discard;
  // vHot (vertex-stage: near the disk's hot inner edge) is the only white
  // tint now — no per-pixel dot painted on every particle regardless of state.
  vec3 col = mix(vColor, vec3(1.35, 1.15, 0.85), clamp(vHot, 0.0, 1.0) * 0.5);
  gl_FragColor = vec4(col * a * uGain, a);
}
`;

// Ambient gold dust that always drifts diagonally upward ----------------------
export const DUST_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uFocusDist;
uniform float uDofAmount;
uniform float uMorph;
attribute vec4 aRand;
varying float vAlpha;

void main(){
  vec3 dir = normalize(vec3(0.62, 1.0, 0.18));
  float ph = fract(uTime * (0.016 + aRand.y * 0.024) + aRand.x);

  vec3 p = position;
  p += dir * ph * 7.5;
  // wrap inside a tall diagonal slab
  p.x = mod(p.x + 4.0, 8.0) - 4.0;
  p.y = mod(p.y + 3.0, 6.0) - 3.0;
  p.z = position.z;

  // corkscrew twirl around the rise axis
  vec3 axisU = normalize(cross(dir, vec3(0.0, 0.0, 1.0)));
  vec3 axisV = cross(dir, axisU);
  float swirlA = uTime * (0.55 + aRand.z * 0.85) + aRand.x * 6.2831;
  float swirlR = 0.14 + aRand.w * 0.30;
  p += (axisU * cos(swirlA) + axisV * sin(swirlA)) * swirlR * (1.0 - uMorph * 0.8);

  // on scroll: the twirl converges into the circle of the singularity
  float tiltA = 0.62;
  float ringR = 1.65 + aRand.y * 0.45;
  float ringAng = aRand.x * 6.2831 + uTime * (0.4 / (ringR * 0.5 + 0.4));
  vec3 ring = vec3(cos(ringAng) * ringR, (aRand.w - 0.5) * 0.12, sin(ringAng) * ringR);
  ring = vec3(ring.x, ring.y * cos(tiltA) - ring.z * sin(tiltA), ring.y * sin(tiltA) + ring.z * cos(tiltA));
  float gather = smoothstep(0.08, 0.9, uMorph);
  p = mix(p, ring, gather);

  vAlpha = smoothstep(0.0, 0.2, ph) * smoothstep(1.0, 0.75, ph) * (0.35 + aRand.z * 0.55);
  vAlpha = mix(vAlpha, 0.5 + aRand.z * 0.4, gather);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.3 + aRand.w * 2.8) * uPixelRatio * (1.4 / -mv.z);

  // background dust melts into soft bokeh outside the focus plane
  float coc = clamp(abs(-mv.z - uFocusDist) * uDofAmount, 0.0, 2.5);
  gl_PointSize *= 1.0 + coc * 2.0;
  vAlpha /= 1.0 + coc * 0.9;
}
`;

export const DUST_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.08, d) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor * a, a);
}
`;

// Screen-space grade: lens warp + dirt + halation + vignette + grain + CA -----
export const GRADE_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform sampler2D uDirt;
uniform float uTime;
uniform float uVignette;
uniform float uWarp;        // gravitational lensing strength (morph-driven)
uniform vec2  uWarpCenter;
uniform float uAspect;
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main(){
  // gravitational lensing: bend sampling around the singularity core
  vec2 cc = vUv - uWarpCenter;
  cc.x *= uAspect;
  float rr = max(length(cc), 0.07);
  float bend = uWarp * 0.0035 / (rr * rr * 6.0 + 0.05);
  vec2 uv = vUv - (cc / rr) * bend * vec2(1.0 / uAspect, 1.0);

  vec2 c = uv - 0.5;
  float r2 = dot(c, c);

  // chromatic aberration, stronger toward edges
  float ca = 0.0022 * r2 * 4.0;
  vec3 col;
  col.r = texture2D(tDiffuse, uv + c * ca).r;
  col.g = texture2D(tDiffuse, uv).g;
  col.b = texture2D(tDiffuse, uv - c * ca).b;

  float lum = dot(col, vec3(0.299, 0.587, 0.114));

  // halation: warm filmic bleed around strong highlights
  col += vec3(0.22, 0.12, 0.03) * smoothstep(0.85, 2.6, lum) * 0.12;

  // lens dirt: smudges catch the bloom
  vec3 dirt = texture2D(uDirt, vUv).rgb;
  col += dirt * clamp(lum - 0.35, 0.0, 1.2) * 0.55;

  // vignette
  col *= 1.0 - uVignette * smoothstep(0.12, 0.62, r2);

  // film grain
  float g = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime) * 100.0) - 0.5;
  col += g * 0.028;

  gl_FragColor = vec4(col, 1.0);
}
`;

// Screen-space volumetric god rays (radial shafts from a light point) --------
export const RAYS_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2  uLightPos;   // screen-space 0..1
uniform float uIntensity;
varying vec2 vUv;

void main(){
  vec2 dir = uLightPos - vUv;
  float dist = length(dir);
  vec2 stepv = dir / 26.0;
  vec2 suv = vUv;
  vec3 acc = vec3(0.0);
  float w = 1.0, wsum = 0.0;
  for (int i = 0; i < 26; i++) {
    suv += stepv;
    vec3 s = texture2D(tDiffuse, suv).rgb;
    float lum = max(max(s.r, s.g), s.b);
    acc += s * smoothstep(0.22, 1.1, lum) * w;
    wsum += w;
    w *= 0.945;
  }
  acc /= wsum;
  // warm gold shafts, fading with distance from the light
  vec3 rays = acc * vec3(1.1, 0.75, 0.35);
  float fall = smoothstep(1.15, 0.15, dist);
  vec3 base = texture2D(tDiffuse, vUv).rgb;
  gl_FragColor = vec4(base + rays * uIntensity * fall, 1.0);
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

// Singularity core glow sprite -------------------------------------------------
export const CORE_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

void main(){
  vec2 c = vUv - 0.5;
  float d = length(c) * 2.0;
  float core = exp(-d * d * 9.0);
  float halo = exp(-d * 2.6) * 0.55;
  float pulse = 0.9 + 0.1 * sin(uTime * 2.4);
  vec3 col = vec3(1.5, 1.15, 0.65) * core * pulse
           + vec3(1.0, 0.65, 0.25) * halo;
  float a = clamp((core + halo) * uIntensity, 0.0, 1.0);
  if (a < 0.004) discard;
  gl_FragColor = vec4(col * uIntensity, a);
}
`;

// Neural swarm: energy orbs + comet trails circling the lion's jaw -------------

/**
 * THE single definition of where a swarm particle is at time `t`.
 *
 * Both SWARM_VERT (the orbs) and PLEXUS_VERT (the web between them) prepend
 * this, so the connecting lines can never drift out of sync with the orbs they
 * connect. The prototype kept a CPU mirror of this math and paid an O(n^2)
 * proximity test every frame; that is gone.
 */
export const SWARM_POS_GLSL = /* glsl */ `
vec3 swarmPos(vec4 r, float lag, float t, float m){
  // elliptical orbit FRAMING the lower head: low + wide so the lion's face
  // stays clearly visible inside the ring instead of being covered by it
  vec3 center = vec3(0.0, -0.80, 0.05);
  float speed = 0.30 + r.y * 0.55;
  float ang = r.x * 6.2831 + t * speed - lag * speed;
  float rx = 0.98 + r.z * 0.45;
  float rz = 0.56 + r.w * 0.30;
  vec3 rel = vec3(
    cos(ang) * rx,
    sin(ang * 1.7 + r.z * 6.2831) * 0.12,
    sin(ang) * rz
  );
  // tilt the orbit plane so it reads as a circling band, not a flat ring
  float tA = 0.38;
  rel = vec3(rel.x, rel.y * cos(tA) - rel.z * sin(tA), rel.y * sin(tA) + rel.z * cos(tA));
  // gentle organic wobble so it feels like a swarm, not a carousel
  rel.x += sin(t * 0.9 + r.w * 6.2831) * 0.06;
  rel.y += cos(t * 0.7 + r.x * 6.2831) * 0.05;
  vec3 p = center + rel;

  // on scroll: the swarm joins the singularity's outer ring
  float tiltA = 0.62;
  float ringR = 1.55 + r.y * 0.55;
  float ringAng = r.x * 6.2831 + t * (0.5 / (ringR * 0.5 + 0.4));
  vec3 ring = vec3(cos(ringAng) * ringR, (r.w - 0.5) * 0.14, sin(ringAng) * ringR);
  ring = vec3(ring.x, ring.y * cos(tiltA) - ring.z * sin(tiltA), ring.y * sin(tiltA) + ring.z * cos(tiltA));

  return mix(p, ring, smoothstep(0.08, 0.9, m));
}
`;

export const SWARM_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uMorph;
uniform float uFocusDist;
uniform float uDofAmount;

uniform float uBloom;         // Act 7: converge into a ring on the CTA
uniform vec3  uCta;

attribute vec4 aRand;
attribute float aTrail;   // 0 = head orb, (0,1] = position along the comet trail
attribute float aLag;     // seconds of orbital lag behind the head

varying float vAlpha;
varying float vMix;
varying float vGlint;

${SWARM_POS_GLSL}

void main(){
  float m = smoothstep(0.0, 1.0, uMorph);

  vec3 p = swarmPos(aRand, aLag, uTime, m);

  // Act 7: the swarm gathers into a ring on the CTA
  float bloomAng = aRand.x * 6.2831853 + uTime * 0.4;
  float bloomR = 0.55 + aRand.z * 0.85;
  vec3 bloomP = uCta + vec3(cos(bloomAng) * bloomR, sin(bloomAng) * bloomR * 0.55, sin(bloomAng * 1.3) * 0.2);
  p = mix(p, bloomP, uBloom);

  vMix = aRand.z;
  float pulse = 0.78 + 0.22 * sin(uTime * (0.8 + aRand.y) + aRand.x * 6.2831);
  vAlpha = pulse * (0.6 + aRand.w * 0.4) * (1.0 - aTrail * 0.78);

  // diffraction glint on a subset of head orbs, slowly twinkling
  vGlint = step(aTrail, 0.001) * step(0.7, fract(aRand.x * 7.31));
  vGlint *= 0.55 + 0.45 * sin(uTime * 2.2 + aRand.x * 40.0);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = (10.0 + aRand.w * 12.0) * (1.0 - aTrail * 0.55);
  gl_PointSize = size * uPixelRatio * (2.6 / -mv.z);

  // slight defocus softening so the orbs sit naturally in the scene
  float coc = clamp(abs(-mv.z - uFocusDist) * uDofAmount, 0.0, 2.0);
  gl_PointSize *= 1.0 + coc * 1.2;
  vAlpha /= 1.0 + coc * 0.8;
}
`;

export const SWARM_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
varying float vMix;
varying float vGlint;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0; // 0 at center, ~1 at sprite edge
  // energy node: hot pinpoint core + tight inner glow + wide soft halo
  float core = exp(-d * d * 90.0) * 1.6;
  float inner = exp(-d * d * 14.0) * 0.8;
  float halo = exp(-d * 2.8) * 0.30;
  // 4-point diffraction star on select orbs
  float star = (exp(-abs(uv.x) * 30.0) + exp(-abs(uv.y) * 30.0)) * exp(-d * 5.0) * vGlint * 0.8;
  float e = core + inner + halo + star;
  float a = clamp(e * vAlpha, 0.0, 1.0);
  if (a < 0.004) discard;
  // amber -> gold per orb, white-gold at the very center
  vec3 col = mix(vec3(1.0, 0.55, 0.15), vec3(1.4, 0.95, 0.40), vMix);
  col = mix(col, vec3(1.5, 1.25, 0.85), clamp(core * 0.4, 0.0, 1.0));
  gl_FragColor = vec4(col * a, a);
}
`;

// Plexus web: connections between paired swarm orbs ---------------------------
// The pairs are authored once at init and never rewritten. Each vertex knows
// its own orbit seed and its partner's, so it evaluates swarmPos() twice and
// derives the proximity fade itself. 280 vertex evaluations per frame on the
// GPU, replacing 33,670 CPU distance tests.
export const PLEXUS_VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uFade;     // 1 while the swarm is in orbit, 0 once it leaves
attribute vec4 aRand;    // this endpoint's orbit seed
attribute float aLag;
attribute vec4 aRandB;   // the partner endpoint's orbit seed
attribute float aLagB;
varying float vAlpha;

${SWARM_POS_GLSL}

void main(){
  float m = smoothstep(0.0, 1.0, uMorph);
  vec3 a = swarmPos(aRand,  aLag,  uTime, m);
  vec3 b = swarmPos(aRandB, aLagB, uTime, m);

  // the link fades out as the two orbs drift apart, so the web breathes:
  // connections form and dissolve without any pair ever being re-chosen
  float d = length(a - b);
  // The web is an Act 1/2 element. Once the swarm leaves orbit for the ribbon
  // or the flow diagram it draws its own edges out of comet trails, so this
  // whole object drops out rather than trailing behind.
  vAlpha = (1.0 - smoothstep(0.10, 0.34, d)) * (1.0 - m * 0.85) * 0.55 * uFade;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(a, 1.0);
}
`;

export const PLEXUS_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
void main(){
  if (vAlpha < 0.004) discard;
  gl_FragColor = vec4(vec3(1.0, 0.68, 0.28) * vAlpha, vAlpha);
}
`;
