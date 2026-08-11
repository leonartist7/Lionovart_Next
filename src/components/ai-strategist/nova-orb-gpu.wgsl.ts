/**
 * NovaOrb v3 — "ember-lion" WGSL shaders.
 *
 * Not a sphere of dots, not a neural-net glow: a particle field that behaves
 * like embers and drifting ash off a low fire, occasionally sparking upward
 * like a mane catching wind. Figurative, not literal — no lion shape, no
 * fire shape, just ember physics (buoyant drift, coherent wander, occasional
 * fast streak) in a strict 3-stop gold heat gradient (near-black → deep
 * bronze → bright brand-gold) on a fully transparent canvas — gold only,
 * no red.
 *
 * Particle struct (32 bytes, matches the JS-side layout in NovaOrbGPU.tsx):
 *   pos: vec2f, vel: vec2f, age: f32, ttl: f32, heat: f32, seed: f32
 *
 * Uniforms (48 bytes): dt, time, canvasPx (vec2f), stateIdle, stateListen,
 * stateThink, stateSpeak, amp, attack, lowBand, highBand.
 */

const SHARED_STRUCTS = /* wgsl */ `
struct Particle {
  pos: vec2f,
  vel: vec2f,
  age: f32,
  ttl: f32,
  heat: f32,
  seed: f32,
}

struct Uniforms {
  dt: f32,
  time: f32,
  canvasPx: vec2f,
  stateIdle: f32,
  stateListen: f32,
  stateThink: f32,
  stateSpeak: f32,
  amp: f32,
  attack: f32,
  lowBand: f32,
  highBand: f32,
}

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

fn noise2(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  let u2 = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u2.x), mix(c, d, u2.x), u2.y);
}

// Curl of a value-noise field — coherent wander, not random jitter.
// Deliberately NOT simplex: indistinguishable at this particle scale, half
// the ALU cost. Finite-difference gradient, rotated 90° for zero divergence.
fn curl2(p: vec2f) -> vec2f {
  let e = 0.06;
  let n1 = noise2(p + vec2f(0.0, e));
  let n2 = noise2(p - vec2f(0.0, e));
  let n3 = noise2(p + vec2f(e, 0.0));
  let n4 = noise2(p - vec2f(e, 0.0));
  let dx = (n1 - n2) / (2.0 * e);
  let dy = (n3 - n4) / (2.0 * e);
  return vec2f(dx, -dy);
}

// 3-octave curl fbm, phase-offset per particle via seed so identical
// particles never move in lockstep.
fn curlFbm(p: vec2f, seed: f32) -> vec2f {
  var sum = vec2f(0.0, 0.0);
  var amp = 1.0;
  var freq = 1.0;
  let pp = p + vec2f(seed * 13.7, seed * 7.3);
  for (var o = 0; o < 3; o = o + 1) {
    sum += curl2(pp * freq) * amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return sum;
}
`;

export const NOVA_ORB_COMPUTE_WGSL = /* wgsl */ `
${SHARED_STRUCTS}

@group(0) @binding(0) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(1) var<storage, read_write> particlesOut: array<Particle>;
@group(0) @binding(2) var<uniform> u: Uniforms;

const RING_R: f32 = 0.58;

fn respawn(p: ptr<function, Particle>, i: u32) {
  let h1 = hash21(vec2f(f32(i), u.time));
  let h2 = hash21(vec2f(u.time, f32(i)) + vec2f(7.0, 3.0));
  (*p).seed = h1;
  (*p).age = 0.0;

  // Ring spawn only — born already orbiting, not rising from one source.
  // Speaking no longer spawns a center spark burst; voice reactivity comes
  // from the whole-orb pulsate scale (see NovaOrb.tsx) instead.
  let ang = h2 * 6.2831853;
  let r = RING_R + (h1 - 0.5) * 0.1; // band: 0.53–0.63, tightened for fewer particles
  let dir = vec2f(cos(ang), sin(ang));        // outward radial
  let tan = vec2f(-dir.y, dir.x);             // fixed CCW handedness

  (*p).pos = r * dir;
  (*p).vel = tan * (0.55 + 0.3 * h1) + dir * (h2 - 0.5) * 0.06;
  (*p).heat = 0.28 + 0.12 * h2;
  (*p).ttl = 3.0 + 2.5 * h1;
}

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= arrayLength(&particlesIn)) {
    return;
  }

  var p = particlesIn[i];
  p.age += u.dt;

  if (p.age >= p.ttl) {
    respawn(&p, i);
    particlesOut[i] = p;
    return;
  }

  let distC = length(p.pos) + 1e-4;
  let outward = p.pos / distC;

  // Target ring radius — one topology, state only changes the number.
  var targetR = RING_R;
  targetR -= 0.12 * u.stateThink;              // tighter, faster vortex
  targetR -= 0.05 * u.stateListen;             // leaning in
  targetR += 0.05 * u.amp * u.stateSpeak;      // breathing with voice energy

  // Radial spring — keeps drift legible as a ring, not a rigid cage.
  let springK = 1.1 + 1.4 * u.stateThink + 0.3 * u.stateListen;
  var accel = outward * (targetR - distC) * springK;

  // Tangential orbit — fixed handedness always; states only scale speed.
  let tangent = vec2f(-p.pos.y, p.pos.x) / distC;
  let tangentSpeed = 0.9 + 1.6 * u.stateThink - 0.15 * u.stateListen
      + 0.4 * u.stateSpeak * (0.5 + 0.5 * u.amp);
  accel += tangent * tangentSpeed;

  // Coherent wander — the difference between "living" and "jittery",
  // toned down so the ring stays legible; a bit more freedom at idle,
  // reeled in during the tight thinking vortex.
  let wander = curlFbm(p.pos * 1.6 + vec2f(0.0, u.time * 0.15), p.seed);
  accel += wander * (0.35 + 0.15 * u.stateIdle) * (1.0 - 0.35 * u.stateThink);

  p.vel = p.vel * (1.0 - 1.6 * u.dt) + accel * u.dt;
  p.pos += p.vel * u.dt;

  // Heat: attacks/thinking spike it (sparks, the vortex stoking the fire),
  // sustained amplitude brightens rather than agitates, edges dim softly —
  // nothing has a hard boundary.
  var targetHeat = 0.34 + 0.08 * u.stateListen + 0.35 * u.stateThink + 0.3 * u.amp * u.stateSpeak;
  targetHeat -= 0.15 * clamp(distC - 0.5, 0.0, 1.0);
  p.heat += (targetHeat - p.heat) * clamp(u.dt * 4.0, 0.0, 1.0);

  particlesOut[i] = p;
}
`;

export const NOVA_ORB_RENDER_WGSL = /* wgsl */ `
${SHARED_STRUCTS}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> u: Uniforms;

const QUAD = array<vec2f, 6>(
  vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
  vec2f(-1.0, -1.0), vec2f(1.0, 1.0), vec2f(-1.0, 1.0),
);

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) heat: f32,
  @location(1) uv: vec2f,
}

@vertex
fn vs_main(@builtin(vertex_index) vIdx: u32, @builtin(instance_index) iIdx: u32) -> VSOut {
  let p = particles[iIdx];
  let corner = QUAD[vIdx];

  // Instanced quad, not point-list — WebGPU has no point-size. Quad size in
  // physical px (~2.5-5.5px) scales with heat so hot particles read larger,
  // not just brighter.
  let pxSize = mix(2.5, 5.5, clamp(p.heat, 0.0, 1.0));
  let clipSize = vec2f(pxSize / u.canvasPx.x, pxSize / u.canvasPx.y) * 2.0;

  var out: VSOut;
  out.pos = vec4f(p.pos + corner * clipSize * 0.5, 0.0, 1.0);
  out.heat = p.heat;
  out.uv = corner;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4f {
  let d = length(in.uv);
  // Bright core + soft outer halo within the same quad — cheap per-particle
  // glow, no extra draw calls or bloom pass.
  let core = smoothstep(0.55, 0.0, d);
  let halo = smoothstep(1.0, 0.0, d) * 0.4;
  let falloff = clamp(core + halo, 0.0, 1.0);
  let heat = clamp(in.heat, 0.0, 1.0);

  // Strict 3-stop gold heat gradient — no red anywhere in the ramp.
  let emberBase = vec3f(0.05, 0.04, 0.02);  // near-black, warm dark
  let deepGold = vec3f(0.55, 0.38, 0.05);   // deep bronze mid-tone
  let brightGold = vec3f(0.941, 0.788, 0.090); // #f0c917

  var color: vec3f;
  if (heat < 0.55) {
    color = mix(emberBase, deepGold, heat / 0.55);
  } else {
    color = mix(deepGold, brightGold, (heat - 0.55) / 0.45);
  }

  let alpha = min(falloff * (0.32 + 0.55 * heat), 0.95);
  return vec4f(color * alpha, alpha);
}
`;
