// ---------------------------------------------------------------------------
// GLSL for the /services/ai crown-to-system particle story.
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
uniform float uMorph;        // 0 = crown, 1 = connected platform hub
uniform float uIntro;        // 0..1 intro assembly progress
uniform float uDriftAmp;     // ember drift amplitude (grows with morph)
uniform float uTurb;         // turbulence amplitude (grows with morph)
uniform float uMouseStrength;
uniform vec3  uMouse;        // world-space pointer position
uniform float uSize;
uniform float uPixelRatio;
uniform float uFocusDist;    // camera-space focus distance (for DOF)
uniform float uDofAmount;    // depth-of-field strength
uniform float uOrganicDetail;// 0 mobile, 1 full curl-noise detail
uniform float uBloom;        // Act 7: the crown reforms as a crest over the CTA
uniform vec3  uCrest;        // world-space center of that crest

attribute vec3 aNormal;
attribute vec4 aRand;        // x,y,z,w in [0,1]
attribute vec3 aSpawn;       // intro spawn position (far field)
attribute vec3 aBurst;       // precomputed story targets
attribute vec3 aEcosystem;
attribute vec3 aEnergy;
attribute vec3 aHub;

varying vec3  vColor;
varying float vAlpha;

#ifdef USE_ORGANIC_DETAIL
${NOISE_GLSL}
#endif

void main(){
  float m = smoothstep(0.0, 1.0, uMorph);

  // ---------- crown state ---------------------------------------------------
  vec3 p = position;

  // breathing along the surface normal
  p += aNormal * (0.018 * sin(uTime * 0.7 + aRand.x * 6.2831));

  // Curl noise is the most expensive vertex work. It belongs to the organic
  // crown/expansion phases, so stop evaluating it once the system locks into
  // its geometric states.
  #ifdef USE_ORGANIC_DETAIL
  if (m < 0.62) {
    vec3 turb = curl(p * 1.35 + vec3(0.0, uTime * 0.12, uTime * 0.05));
    p += turb * uTurb * uOrganicDetail * (1.0 - smoothstep(0.36, 0.62, m));
  }
  #endif

  // scroll onset: the crown begins a slow, stately turn in the SAME
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

  // ---------- story forms ----------------------------------------------------
  // One population becomes every chapter. The wide spacing and explicit
  // transitions avoid the opaque sphere / white-hole artifact of the previous
  // singularity treatment.
  vec3 burst = aBurst;
  burst += vec3(
    sin(uTime * 0.35 + aRand.x * 12.0),
    cos(uTime * 0.28 + aRand.y * 11.0),
    sin(uTime * 0.31 + aRand.z * 10.0)
  ) * 0.13;

  // Three open, intersecting orbital bands: a connected ecosystem with no
  // filled center. Each particle stays individually readable.
  vec3 ecosystem = aEcosystem;
  float ecoTurn = uTime * (0.10 + aRand.y * 0.06);
  float ecoC = cos(ecoTurn), ecoS = sin(ecoTurn);
  ecosystem.xz = vec2(
    ecosystem.x * ecoC - ecosystem.z * ecoS,
    ecosystem.x * ecoS + ecosystem.z * ecoC
  );

  // A double-helix current: energy visibly travelling through the connected
  // system, rather than a low-resolution full-screen shader.
  vec3 energy = aEnergy;
  float flowY = mod(energy.y - uTime * (0.18 + aRand.y * 0.08) + 2.2, 4.4) - 2.2;
  float energyTurn = -uTime * 0.82;
  float energyC = cos(energyTurn), energyS = sin(energyTurn);
  energy.xz = vec2(
    energy.x * energyC - energy.z * energyS,
    energy.x * energyS + energy.z * energyC
  );
  energy.y = flowY;

  // Five stacked data rings condense the flow into an efficient platform hub.
  vec3 hub = aHub;
  float layer = floor(aRand.y * 5.0);
  float hubTurn = uTime * (0.22 + layer * 0.035);
  float hubC = cos(hubTurn), hubS = sin(hubTurn);
  hub.xz = vec2(hub.x * hubC - hub.z * hubS, hub.x * hubS + hub.z * hubC);

  float burstT = smoothstep(0.08, 0.28, m);
  float ecosystemT = smoothstep(0.30, 0.50, m);
  float flowT = smoothstep(0.56, 0.76, m);
  float hubT = smoothstep(0.80, 0.97, m);

  vec3 finalPos = mix(p, burst, burstT);
  finalPos = mix(finalPos, ecosystem, ecosystemT);
  finalPos = mix(finalPos, energy, flowT);
  finalPos = mix(finalPos, hub, hubT);

  // ---------- Act 7: reform ---------------------------------------------------
  // Keep the sparse crown large enough for its peaks and base band to resolve.
  vec3 crest = position * 0.82 + uCrest;
  finalPos = mix(finalPos, crest, uBloom);

  // ---------- intro reveal ---------------------------------------------------
  float introT = smoothstep(aRand.w * 0.75, aRand.w * 0.75 + 0.25, uIntro);
  finalPos = mix(aSpawn, finalPos, introT);

  // ---------- mouse repulsion ------------------------------------------------
  // A deliberately small radius prevents a visible hole in the constellation.
  vec3 away = finalPos - uMouse;
  float md = length(away);
  finalPos += normalize(away + 1e-4) * smoothstep(0.20, 0.0, md) * uMouseStrength * (1.0 - m * 0.75);

  // ---------- lighting / color ----------------------------------------------
  vec4 world = modelMatrix * vec4(finalPos, 1.0);
  vec3 viewDir = normalize(world.xyz - cameraPosition);

  // fake key light sweep across the gold (drives the highlight hue only)
  vec3 lightDir = normalize(vec3(sin(uTime * 0.21) * 0.7, 0.55, 0.75));
  float diff = clamp(dot(aNormal, lightDir) * 0.5 + 0.5, 0.0, 1.0);

  // Fixed cinematic key from the upper left. A soft wrap preserves the thin
  // crown lines without flattening every point to the same brightness.
  vec3 keyDir = vec3(-0.4355, 0.5323, 0.7259);
  float lit = clamp((dot(aNormal, keyDir) + 0.12) / 1.12, 0.0, 1.0);
  float shade = 0.34 + 0.66 * pow(lit, 1.6);

  // Gold ramp: deep bronze -> amber -> bright gold highlight.
  vec3 gold = mix(vec3(0.35, 0.16, 0.04), vec3(1.35, 0.85, 0.30), aRand.y);
  gold = mix(gold, vec3(1.6, 1.35, 0.95), pow(diff, 2.2) * 0.6);
  gold *= 0.55 + 0.65 * diff;
  // directional form shadow, crown state only
  gold *= mix(1.0, shade, 1.0 - m);

  // warm rim light on silhouette edges, brightest where the form turns away
  float fres = pow(1.0 - abs(dot(viewDir, aNormal)), 2.4);
  vec3 rim = vec3(1.2, 0.75, 0.30) * fres * (0.38 + 0.52 * m);
  vec3 col = gold + rim;

  // Color follows the same chapters: gold erupts into electric violet/cyan,
  // then resolves into a warm connected platform before the CTA crown returns.
  vec3 ecosystemColor = mix(
    vec3(0.10, 0.72, 1.48),
    vec3(0.88, 0.18, 1.42),
    aRand.z
  );
  ecosystemColor = mix(ecosystemColor, vec3(1.28, 0.76, 0.24), step(0.78, aRand.w) * 0.72);
  float energyPulse = 0.78 + 0.22 * sin(
    flowY * 4.0 - uTime * 1.25 + aRand.y * 6.2831853
  );
  vec3 energyColor = mix(vec3(0.06, 0.92, 1.62), vec3(0.96, 0.16, 1.48), aRand.z) * energyPulse;
  vec3 hubColor = mix(vec3(0.24, 0.78, 1.48), vec3(1.42, 0.82, 0.26), aRand.y);
  col = mix(col, ecosystemColor, ecosystemT);
  col = mix(col, energyColor, flowT);
  col = mix(col, hubColor, hubT);

  // reforming: the gold comes back with the shape
  col = mix(col, gold * 1.08, uBloom);

  // subtle per-particle twinkle
  float twinkle = 0.90 + 0.10 * sin(uTime * (1.0 + aRand.z * 1.4) + aRand.x * 40.0);

  vColor = col * twinkle;
  float systemT = smoothstep(0.08, 0.32, m);
  vAlpha = mix(0.97, 0.92, systemT) * introT;
  vAlpha = mix(vAlpha, 0.98, uBloom);

  // ---------- projection -----------------------------------------------------
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float sizeJitter = 0.4 + aRand.w * 0.8;
  gl_PointSize = uSize * sizeJitter * uPixelRatio * (1.0 / -mv.z);
  gl_PointSize *= (1.0 - systemT * 0.10);
  gl_PointSize *= mix(1.0, 1.08, uBloom);

  // depth of field: off-focus particles become soft bokeh discs
  float coc = clamp(abs(-mv.z - uFocusDist) * uDofAmount, 0.0, 2.0);
  gl_PointSize *= 1.0 + coc * 1.5;
  gl_PointSize = min(gl_PointSize, 54.0 * uPixelRatio);
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
  // A real, compact point with a narrow antialiased edge. The old Gaussian
  // made sparse mobile particles look translucent and out of focus.
  float point = 1.0 - smoothstep(0.34, 0.72, d);
  float edgeGlow = exp(-d * d * 11.0) * 0.16;
  float a = clamp((point + edgeGlow) * vAlpha, 0.0, 1.0);
  if (a < 0.02) discard;
  vec3 col = vColor;
  gl_FragColor = vec4(col * uGain, a);
}
`;

// Ambient gold dust. It opens into the immersive burst, then aligns with the
// energy chapters. This remains a lightweight draw call in the same renderer.
export const DUST_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uFocusDist;
uniform float uDofAmount;
uniform float uMorph;
attribute vec4 aRand;
varying float vAlpha;
varying float vMix;
varying float vStory;

void main(){
  float m = smoothstep(0.0, 1.0, uMorph);
  float ph = fract(uTime * (0.018 + aRand.y * 0.022) + aRand.x);

  vec3 ambient = position + normalize(vec3(0.48, 1.0, 0.16)) * ph * 6.0;
  ambient.x = mod(ambient.x + 4.0, 8.0) - 4.0;
  ambient.y = mod(ambient.y + 3.0, 6.0) - 3.0;

  vec3 burstDir = normalize(aRand.xyz - 0.5 + 1e-4);
  vec3 burst = burstDir * (1.6 + aRand.w * 3.4);
  burst.z += (aRand.y - 0.5) * 3.5;

  float flowY = mod(aRand.x * 5.2 - uTime * (0.16 + aRand.y * 0.10) + 2.6, 5.2) - 2.6;
  float flowA = flowY * 2.1 + aRand.w * 6.2831853 - uTime * 0.55;
  vec3 flow = vec3(cos(flowA) * (0.7 + aRand.z * 1.25), flowY, sin(flowA) * 0.28 - 1.8);

  float burstT = smoothstep(0.08, 0.27, m);
  float flowT = smoothstep(0.54, 0.78, m);
  vec3 p = mix(ambient, burst, burstT);
  p = mix(p, flow, flowT);

  float life = smoothstep(0.0, 0.18, ph) * smoothstep(1.0, 0.78, ph);
  float burstGlow = 1.0 + 0.8 * smoothstep(0.12, 0.25, m) * (1.0 - smoothstep(0.34, 0.48, m));
  vAlpha = life * (0.22 + aRand.z * 0.42) * burstGlow;
  vMix = aRand.z;
  vStory = smoothstep(0.10, 0.50, m);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.8 + aRand.w * 1.8) * uPixelRatio * (1.5 / -mv.z);
  float coc = clamp(abs(-mv.z - uFocusDist) * uDofAmount, 0.0, 2.0);
  gl_PointSize *= 1.0 + coc * 1.4;
  gl_PointSize = min(gl_PointSize, 8.5 * uPixelRatio);
  vAlpha /= 1.0 + coc * 0.8;
}
`;

export const DUST_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uBloom;
varying float vAlpha;
varying float vMix;
varying float vStory;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.10, d) * vAlpha;
  if (a < 0.006) discard;
  vec3 tech = mix(vec3(0.08, 0.88, 1.55), vec3(0.92, 0.20, 1.45), vMix);
  vec3 col = mix(uColor, tech, vStory);
  col = mix(col, uColor * 1.08, uBloom);
  gl_FragColor = vec4(col * a, a);
}
`;

// Orbital swarm, trails, and plexus share this exact position function so the
// lines never detach from the nodes while the whole system changes form.
export const SWARM_POS_GLSL = /* glsl */ `
vec3 swarmPos(vec4 r, float lag, float t, float m){
  float heroLane = floor(r.w * 3.0);
  float heroDirection = heroLane == 1.0 ? -1.0 : 1.0;
  float heroSpeed = (0.30 + r.y * 0.48) * heroDirection;
  float heroAngle = r.x * 6.2831853 + t * heroSpeed - lag * heroSpeed;
  float heroRadius = 1.02 + r.z * 0.46 + heroLane * 0.06;
  float heroHeight = heroLane < 0.5
    ? -0.76 + sin(heroAngle * 1.7 + r.z * 6.2831853) * 0.10
    : sin(heroAngle) * (0.60 + heroLane * 0.10);
  vec3 hero = vec3(
    cos(heroAngle) * heroRadius,
    heroHeight,
    sin(heroAngle) * (0.58 + r.y * 0.24)
  );
  float heroTilt = heroLane < 0.5 ? 0.34 : (heroLane - 1.5) * 0.54;
  float htc = cos(heroTilt), hts = sin(heroTilt);
  hero = heroLane < 0.5
    ? vec3(hero.x, hero.y * htc - hero.z * hts, hero.y * hts + hero.z * htc)
    : vec3(hero.x * htc - hero.y * hts, hero.x * hts + hero.y * htc, hero.z);

  vec3 burstDir = normalize(r.xyz - 0.5 + 1e-4);
  vec3 burst = burstDir * (1.35 + r.w * 2.8);
  burst += vec3(sin(t * 0.30 + r.x * 9.0), cos(t * 0.26 + r.y * 8.0), 0.0) * 0.12;

  float ecoAngle = r.x * 6.2831853 + t * (0.20 + r.y * 0.16) - lag * 0.45;
  float ecoRadius = 1.10 + r.z * 0.52;
  vec3 ecosystem = vec3(cos(ecoAngle) * ecoRadius, sin(ecoAngle) * ecoRadius * 0.68, (r.w - 0.5) * 0.72);
  float ecoTilt = (r.y - 0.5) * 1.4;
  ecosystem = vec3(ecosystem.x, ecosystem.y * cos(ecoTilt) - ecosystem.z * sin(ecoTilt), ecosystem.y * sin(ecoTilt) + ecosystem.z * cos(ecoTilt));

  float flowY = mod(r.x * 4.6 - t * (0.22 + r.y * 0.11) + 2.3, 4.6) - 2.3;
  float flowAngle = flowY * 2.45 + r.w * 6.2831853 - t * 0.78 - lag * 0.9;
  vec3 flow = vec3(cos(flowAngle) * (0.30 + r.z * 0.30), flowY, sin(flowAngle) * (0.25 + r.z * 0.22));

  float layer = floor(r.y * 5.0);
  float hubAngle = r.x * 6.2831853 + t * (0.28 + layer * 0.035) - lag * 0.55;
  float hubRadius = 0.54 + r.z * 0.78;
  vec3 hub = vec3(cos(hubAngle) * hubRadius, (layer - 2.0) * 0.34, sin(hubAngle) * hubRadius * 0.5);

  vec3 p = mix(hero, burst, smoothstep(0.08, 0.28, m));
  p = mix(p, ecosystem, smoothstep(0.30, 0.50, m));
  p = mix(p, flow, smoothstep(0.56, 0.76, m));
  p = mix(p, hub, smoothstep(0.80, 0.97, m));
  return p;
}

vec3 ctaSwarmPos(vec4 r, float lag, float t, vec3 cta){
  float lane = floor(r.w * 3.0);
  float direction = lane == 1.0 ? -1.0 : 1.0;
  float speed = (0.27 + r.y * 0.25) * direction;
  float a = r.x * 6.2831853 + t * speed - lag * speed;
  float radius = 0.70 + r.z * 0.64 + lane * 0.05;
  float yScale = lane < 0.5 ? 0.48 : 0.72 + lane * 0.08;
  vec3 orbit = vec3(cos(a) * radius, sin(a) * radius * yScale, sin(a * 1.3) * 0.24);
  float tilt = (lane - 1.0) * 0.46;
  float tc = cos(tilt), ts = sin(tilt);
  orbit.xy = vec2(orbit.x * tc - orbit.y * ts, orbit.x * ts + orbit.y * tc);
  return cta + orbit;
}
`;

export const SWARM_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uMorph;
uniform float uFocusDist;
uniform float uDofAmount;
uniform float uBloom;
uniform vec3 uCta;
attribute vec4 aRand;
attribute float aTrail;
attribute float aLag;
varying float vAlpha;
varying float vMix;
varying float vGlint;

${SWARM_POS_GLSL}

void main(){
  float m = smoothstep(0.0, 1.0, uMorph);
  vec3 p = swarmPos(aRand, aLag, uTime, m);
  p = mix(p, ctaSwarmPos(aRand, aLag, uTime, uCta), uBloom);

  float pulse = 0.78 + 0.22 * sin(uTime * (0.8 + aRand.y) + aRand.x * 6.2831853);
  vAlpha = pulse * (0.62 + aRand.w * 0.42) * (1.0 - aTrail * 0.76);
  vMix = aRand.z;
  vGlint = step(aTrail, 0.001) * step(0.78, fract(aRand.x * 7.31));
  vGlint *= 0.55 + 0.45 * sin(uTime * 2.2 + aRand.x * 40.0);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = (8.0 + aRand.w * 10.5) * (1.0 - aTrail * 0.54);
  gl_PointSize = size * uPixelRatio * (2.5 / -mv.z);
  float coc = clamp(abs(-mv.z - uFocusDist) * uDofAmount, 0.0, 2.0);
  gl_PointSize *= 1.0 + coc;
  gl_PointSize = min(gl_PointSize, 38.0 * uPixelRatio);
  vAlpha /= 1.0 + coc * 0.8;
}
`;

export const SWARM_FRAG = /* glsl */ `
precision highp float;
uniform float uMorph;
uniform float uBloom;
varying float vAlpha;
varying float vMix;
varying float vGlint;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  float core = exp(-d * d * 75.0) * 1.35;
  float inner = exp(-d * d * 16.0) * 0.70;
  float halo = exp(-d * 3.2) * 0.22;
  float star = (exp(-abs(uv.x) * 34.0) + exp(-abs(uv.y) * 34.0)) * exp(-d * 5.5) * vGlint * 0.55;
  float a = clamp((core + inner + halo + star) * vAlpha, 0.0, 1.0);
  if (a < 0.006) discard;
  vec3 gold = mix(vec3(1.05, 0.50, 0.12), vec3(1.48, 1.16, 0.70), vMix);
  vec3 tech = mix(vec3(0.08, 0.86, 1.55), vec3(0.94, 0.18, 1.44), vMix);
  vec3 col = mix(gold, tech, smoothstep(0.12, 0.50, uMorph));
  col = mix(col, gold, uBloom);
  col = mix(col, vec3(1.45, 1.18, 0.76), clamp(core * 0.32, 0.0, 1.0));
  gl_FragColor = vec4(col * a, a);
}
`;

export const PLEXUS_VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uFade;
uniform float uBloom;
uniform vec3 uCta;
attribute vec4 aRand;
attribute float aLag;
attribute vec4 aRandB;
attribute float aLagB;
varying float vAlpha;

${SWARM_POS_GLSL}

void main(){
  float m = smoothstep(0.0, 1.0, uMorph);
  vec3 a = swarmPos(aRand, aLag, uTime, m);
  vec3 b = swarmPos(aRandB, aLagB, uTime, m);
  a = mix(a, ctaSwarmPos(aRand, aLag, uTime, uCta), uBloom);
  b = mix(b, ctaSwarmPos(aRandB, aLagB, uTime, uCta), uBloom);

  float heroW = 1.0 - smoothstep(0.10, 0.24, m);
  float ecosystemW = smoothstep(0.30, 0.46, m) * (1.0 - smoothstep(0.58, 0.74, m));
  float flowW = smoothstep(0.58, 0.72, m) * (1.0 - smoothstep(0.80, 0.92, m));
  float hubW = smoothstep(0.82, 0.96, m);
  float chapterW = max(max(heroW, ecosystemW), max(flowW * 0.34, hubW * 0.72));
  chapterW = mix(chapterW, 0.9, uBloom);
  float d = length(a - b);
  vAlpha = (1.0 - smoothstep(0.10, 0.48, d)) * chapterW * 0.62 * uFade;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(a, 1.0);
}
`;

export const PLEXUS_FRAG = /* glsl */ `
precision highp float;
uniform float uMorph;
uniform float uBloom;
varying float vAlpha;
void main(){
  if (vAlpha < 0.004) discard;
  vec3 gold = vec3(1.02, 0.62, 0.22);
  vec3 connected = vec3(0.24, 0.80, 1.48);
  vec3 col = mix(gold, connected, smoothstep(0.18, 0.48, uMorph));
  col = mix(col, gold, uBloom);
  gl_FragColor = vec4(col * vAlpha, vAlpha);
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
