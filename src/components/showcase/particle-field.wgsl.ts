/**
 * Particle Field — WebGPU WGSL shaders.
 *
 * A 1,048,576-particle GPU simulation in the spirit of Active Theory's
 * "Face Dust" / ATLAB pieces: divergence-free curl-noise wind, a damped-spring
 * morph system between three mathematical target shapes (dense sphere,
 * spiral galaxy, free chaos), a 3D pointer force-field, HDR velocity-graded
 * additive sprites and a half-res separable bloom chain composited through
 * ACES tonemapping.
 *
 * No CPU particle loops: the only per-frame CPU work is writing small
 * uniform buffers. All motion lives in the compute pass below.
 *
 * Particle struct (32 bytes, matches the JS-side layout in ParticleField.tsx):
 *   pos: vec4f  (xyz = world position, w = stable per-particle seed 0..1)
 *   vel: vec4f  (xyz = velocity, w = |v| cached for the render pass)
 */

/* ─── Shared: simplex noise + curl ────────────────────────────────────────
   Ashima/Ian McEwen 3D simplex noise, ported to WGSL. The curl field is the
   curl of a 3-component simplex potential sampled by central differences,
   which is divergence-free by construction → fluid, turbulent advection
   that never sources or sinks. */

const SIMPLEX_CURL_WGSL = /* wgsl */ `
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn mod289v4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn permute4(x: vec4f) -> vec4f { return mod289v4(((x * 34.0) + 1.0) * x); }
fn taylorInvSqrt4(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }

fn snoise(v: vec3f) -> f32 {
  let C = vec2f(1.0 / 6.0, 1.0 / 3.0);
  let D = vec4f(0.0, 0.5, 1.0, 2.0);

  // First corner
  var i = floor(v + dot(v, vec3f(C.y)));
  let x0 = v - i + dot(i, vec3f(C.x));

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  //  x0 = x0 - 0.0 + 0.0 * C.xxx;
  let x1 = x0 - i1 + vec3f(C.x);
  let x2 = x0 - i2 + vec3f(C.y); // 2.0*C.x = 1/3
  let x3 = x0 - vec3f(D.y);      // -1.0+3.0*C.x = -0.5

  // Permutations
  i = mod289v3(i);
  let p = permute4(permute4(permute4(
        vec4f(i.z) + vec4f(0.0, i1.z, i2.z, 1.0))
      + vec4f(i.y) + vec4f(0.0, i1.y, i2.y, 1.0))
      + vec4f(i.x) + vec4f(0.0, i1.x, i2.x, 1.0));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  let n_ = 0.142857142857; // 1.0/7.0
  let ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p, 7*7)

  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_); // mod(j, 7)

  let x = x_ * ns.x + vec4f(ns.y);
  let y = y_ * ns.x + vec4f(ns.y);
  let h = 1.0 - abs(x) - abs(y);

  let b0 = vec4f(x.xy, y.xy);
  let b1 = vec4f(x.zw, y.zw);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4f(0.0));

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  var p0 = vec3f(a0.xy, h.x);
  var p1 = vec3f(a0.zw, h.y);
  var p2 = vec3f(a1.xy, h.z);
  var p3 = vec3f(a1.zw, h.w);

  // Normalise gradients
  let norm = taylorInvSqrt4(vec4f(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 = p0 * norm.x;
  p1 = p1 * norm.y;
  p2 = p2 * norm.z;
  p3 = p3 * norm.w;

  // Mix final noise value
  var m = max(vec4f(0.6) - vec4f(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), vec4f(0.0));
  m = m * m;
  return 42.0 * dot(m * m, vec4f(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Three decorrelated scalar fields → vector potential.
fn snoiseVec3(p: vec3f) -> vec3f {
  return vec3f(
    snoise(p),
    snoise(p + vec3f(12.8, 42.1, -9.4)),
    snoise(p + vec3f(-33.3, 11.1, 27.9)),
  );
}

// Divergence-free curl of the potential field (central differences).
fn curlNoise(p: vec3f) -> vec3f {
  let e = 0.12;
  let dx = vec3f(e, 0.0, 0.0);
  let dy = vec3f(0.0, e, 0.0);
  let dz = vec3f(0.0, 0.0, e);

  let p_x0 = snoiseVec3(p - dx);
  let p_x1 = snoiseVec3(p + dx);
  let p_y0 = snoiseVec3(p - dy);
  let p_y1 = snoiseVec3(p + dy);
  let p_z0 = snoiseVec3(p - dz);
  let p_z1 = snoiseVec3(p + dz);

  let x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  let y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  let z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  return normalize(vec3f(x, y, z) + vec3f(1e-5));
}
`;

/* ─── Init pass ───────────────────────────────────────────────────────────
   One dispatch per shape writes that shape's target-position buffer. The
   first dispatch (shape 0) also seeds the live particle buffer so the sim
   starts inside the sphere. Deterministic PCG hashes — zero CPU particle
   loops, zero buffer uploads of particle data. */

export const INIT_WGSL = /* wgsl */ `
struct Particle {
  pos: vec4f,
  vel: vec4f,
}

struct InitU {
  a: vec4f, // x = shape index, y = particle count (f32), z = also seed particles (0/1), w = unused
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> target0: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> target1: array<vec4f>;
@group(0) @binding(3) var<storage, read_write> target2: array<vec4f>;
@group(0) @binding(4) var<uniform> U: InitU;

fn pcg(v: u32) -> u32 {
  var state = v * 747796405u + 2891336453u;
  let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}

fn rnd(seed: u32) -> f32 {
  return f32(pcg(seed)) * (1.0 / 4294967295.0);
}

// Irwin–Hall pseudo-gaussian in [-1, 1].
fn gauss(a: u32, b: u32, c: u32, d: u32) -> f32 {
  return (rnd(a) + rnd(b) + rnd(c) + rnd(d)) * 0.5 - 1.0;
}

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= arrayLength(&particles)) { return; }

  let shape = u32(U.a.x + 0.5);
  let countF = U.a.y;
  let seed = rnd(idx ^ 0x9E3779B9u);
  var target = vec3f(0.0);

  if (shape == 0u) {
    // ── SHAPE 0 · high-density sphere ──────────────────────────────
    // Fibonacci lattice for an even shell, blended inward for volume.
    let fi = f32(idx);
    let ny = 1.0 - 2.0 * (fi + 0.5) / countF;
    let nr = sqrt(max(0.0, 1.0 - ny * ny));
    let nth = 2.39996322972865332 * fi; // golden angle
    var p = vec3f(cos(nth) * nr, ny, sin(nth) * nr);
    let inward = pow(rnd(idx ^ 0x85EBCA6Bu), 0.55);
    let radius = mix(1.0, inward, 0.35) * 10.0;
    let jitter = vec3f(
      rnd(idx ^ 0xC2B2AE35u) - 0.5,
      rnd(idx ^ 0x27D4EB2Fu) - 0.5,
      rnd(idx ^ 0x165667B1u) - 0.5,
    ) * 0.3;
    target = p * radius + jitter;
  } else if (shape == 1u) {
    // ── SHAPE 1 · three-arm spiral galaxy ──────────────────────────
    let arm = f32(idx % 3u);
    let t = pow(rnd(idx ^ 0x63D83595u), 0.72);
    let ang = t * 4.6 + arm * 2.0943951 + gauss(idx ^ 0xB5297A4Du, idx ^ 0x8D1B2C3Fu, idx ^ 0x1B873593u, idx ^ 0xE52F2C19u) * 0.22;
    let rr = 2.0 + t * 15.0;
    let spread = 1.05 - t * 0.7;
    let gx = gauss(idx ^ 0x9E3779B1u, idx ^ 0x85EBCA77u, idx ^ 0xC2B2AE3Du, idx ^ 0x27D4EB2Du);
    let gz = gauss(idx ^ 0x165667B5u, idx ^ 0xD3A2646Bu, idx ^ 0xFD7046C5u, idx ^ 0xB55D5C4Fu);
    let gy = gauss(idx ^ 0x0469A657u, idx ^ 0x7F4A7C15u, idx ^ 0x6C8E9CF5u, idx ^ 0x9E3779CDu);
    target = vec3f(
      cos(ang) * rr + gx * spread * 1.9,
      gy * (1.3 - t) * 0.9,
      sin(ang) * rr + gz * spread * 1.9,
    );
  } else {
    // ── SHAPE 2 · chaos cloud ──────────────────────────────────────
    // Loose volumetric anchor; the sim drops spring pull to zero for
    // this state so pure curl noise takes over.
    var d = vec3f(
      rnd(idx ^ 0xBF58476Du) * 2.0 - 1.0,
      rnd(idx ^ 0x94D049BBu) * 2.0 - 1.0,
      rnd(idx ^ 0x2545F491u) * 2.0 - 1.0,
    );
    d = normalize(d + vec3f(1e-4));
    let rr = pow(rnd(idx ^ 0x133111EBu), 0.3333) * 22.0;
    target = d * rr;
  }

  if (shape == 0u) {
    target0[idx] = vec4f(target, 0.0);
  } else if (shape == 1u) {
    target1[idx] = vec4f(target, 0.0);
  } else {
    target2[idx] = vec4f(target, 0.0);
  }

  if (U.a.z > 0.5) {
    particles[idx].pos = vec4f(target, seed);
    particles[idx].vel = vec4f(0.0, 0.0, 0.0, 0.0);
  }
}
`;

/* ─── Simulation pass ─────────────────────────────────────────────────────
   Per particle per frame: damped spring toward the eased morph target +
   curl-noise wind + orbital swirl + 3D pointer force-field. One storage
   buffer, each invocation touches only its own index (no races, no
   ping-pong). */

export const SIM_WGSL = /* wgsl */ `
struct Particle {
  pos: vec4f,
  vel: vec4f,
}

struct SimU {
  a: vec4f,     // x = dt, y = time, z = eased morphT, w = noise drift time
  mouse: vec4f, // xyz = world position, w = mode (0 off, +1 repel, -1 attract)
  m1: vec4f,    // x = springK, y = windStrength, z = mouseRadius, w = mouseStrength
  m2: vec4f,    // x = damping, y = noiseScale, z = shapeFrom, w = shapeTo
  m3: vec4f,    // x = swirl, y = idle breathe, z/w = unused
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read> target0: array<vec4f>;
@group(0) @binding(2) var<storage, read> target1: array<vec4f>;
@group(0) @binding(3) var<storage, read> target2: array<vec4f>;
@group(0) @binding(4) var<uniform> U: SimU;

${SIMPLEX_CURL_WGSL}

fn pickTarget(shape: f32, idx: u32) -> vec3f {
  if (shape < 0.5) { return target0[idx].xyz; }
  if (shape < 1.5) { return target1[idx].xyz; }
  return target2[idx].xyz;
}

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= arrayLength(&particles)) { return; }

  var p = particles[idx];
  var pos = p.pos.xyz;
  var vel = p.vel.xyz;

  // Eased morph interpolation between the two active shapes.
  let mT = smoothstep(0.0, 1.0, U.a.z);
  let target = mix(pickTarget(U.m2.z, idx), pickTarget(U.m2.w, idx), mT);

  var force = vec3f(0.0);

  // Damped-spring attraction toward the morph target.
  force = force + (target - pos) * U.m1.x;

  // Curl-noise wind, drifting slowly through the field.
  let np = pos * U.m2.y + vec3f(U.a.w * 0.13, U.a.w * 0.09, -U.a.w * 0.11);
  force = force + curlNoise(np) * U.m1.y;

  // Orbital swirl (galaxy state lerps this in).
  let r = max(length(pos), 0.5);
  force = force + cross(vec3f(0.0, 1.0, 0.0), pos / r) * U.m3.x * (10.0 / (r + 4.0));

  // Gentle idle breathing so the sphere never sits frozen.
  force = force + normalize(pos + vec3f(1e-4)) * sin(U.a.y * 0.7 + p.pos.w * 6.2831) * U.m3.y;

  // Pointer force-field: sphere of influence in world space.
  if (U.mouse.w != 0.0) {
    let d = pos - U.mouse.xyz;
    let dist = length(d);
    if (dist < U.m1.z) {
      let fall = 1.0 - dist / U.m1.z;
      force = force + (d / max(dist, 1e-4)) * fall * fall * U.m1.w * sign(U.mouse.w);
    }
  }

  vel = vel + force * U.a.x;
  vel = vel * U.m2.x;
  pos = pos + vel * U.a.x;

  // Runaway / NaN guard: respawn at the particle's own morph target.
  let nan = (pos.x != pos.x) || (pos.y != pos.y) || (pos.z != pos.z);
  if (nan || dot(pos, pos) > 1e6) {
    pos = target;
    vel = vec3f(0.0);
  }

  particles[idx].pos = vec4f(pos, p.pos.w);
  particles[idx].vel = vec4f(vel, length(vel));
}
`;

/* ─── Render pass ─────────────────────────────────────────────────────────
   WebGPU has no point sprites: each particle is a camera-facing quad
   (draw(6, COUNT)), expanded in world space with the camera's right/up
   basis so perspective projection itself gives depth size attenuation.
   Quads grow with speed (motion-streak feel) and carry an HDR color
   gradient keyed to velocity magnitude + radial position, written to an
   rgba16float target with pure additive blending. */

export const RENDER_WGSL = /* wgsl */ `
struct Particle {
  pos: vec4f,
  vel: vec4f,
}

struct CamU {
  viewProj: mat4x4f,
  right: vec4f,   // xyz = camera right, w = base sprite size
  up: vec4f,      // xyz = camera up, w = speed size boost
  params: vec4f,  // x = global intensity, y = time, z/w = unused
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> C: CamU;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) color: vec3f,
}

@vertex
fn vs_main(@builtin(vertex_index) vi: u32) -> VSOut {
  var QUAD = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f(1.0, -1.0),
    vec2f(1.0, 1.0),
    vec2f(-1.0, -1.0),
    vec2f(1.0, 1.0),
    vec2f(-1.0, 1.0),
  );

  let pi = vi / 6u;
  let corner = QUAD[vi % 6u];
  let p = particles[pi];
  let speed = p.vel.w;
  let seed = p.pos.w;

  // Per-particle size jitter + speed streak boost.
  var size = C.right.w * (0.6 + 0.8 * fract(seed * 13.73));
  size = size * (1.0 + min(speed * C.up.w, 3.0));

  let world = p.pos.xyz + (C.right.xyz * corner.x + C.up.xyz * corner.y) * size;

  var out: VSOut;
  out.pos = C.viewProj * vec4f(world, 1.0);
  out.uv = corner;

  // HDR gradient: deep indigo → electric blue → white-hot, keyed to speed.
  let sn = clamp(speed * 0.55, 0.0, 1.0);
  let c0 = vec3f(0.10, 0.07, 0.38);
  let c1 = vec3f(0.16, 0.58, 1.05);
  let c2 = vec3f(1.05, 0.86, 0.62);
  var col = mix(c0, c1, smoothstep(0.04, 0.45, sn));
  col = mix(col, c2, smoothstep(0.5, 0.95, sn));

  // Outer dust drifts violet; keeps dense cores reading white-blue.
  let radial = length(p.pos.xyz);
  col = col + vec3f(0.20, 0.04, 0.30) * smoothstep(9.0, 20.0, radial) * 0.45;

  // Seed-phase twinkle + speed-driven emission (HDR — feeds the bloom pass).
  let twinkle = 0.85 + 0.3 * sin(C.params.y * 3.0 + seed * 40.0);
  let energy = (0.55 + 2.6 * sn) * twinkle * C.params.x;

  out.color = col * energy;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4f {
  let d2 = dot(in.uv, in.uv);
  if (d2 > 1.0) { discard; }
  let fall = 1.0 - d2;
  let soft = fall * fall;
  let core = exp(-d2 * 6.0);
  return vec4f(in.color * (soft * 0.65 + core * 0.95), 1.0);
}
`;

/* ─── Post chain ──────────────────────────────────────────────────────────
   Half-res bloom: bright-pass with a soft knee, two separable 5-tap
   gaussian blurs (linear-sampling trick: 9 taps' worth), then a composite
   that adds bloom over the scene and tonemaps through ACES with a gentle
   vignette. Fullscreen triangle everywhere. */

export const POST_WGSL = /* wgsl */ `
struct PostU {
  a: vec4f, // x = texel width, y = texel height, z = dirX, w = dirY
  b: vec4f, // x = threshold, y = knee, z = bloom strength, w = exposure
}

struct FullOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs_full(@builtin(vertex_index) vi: u32) -> FullOut {
  var POS = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0),
  );
  let p = POS[vi % 3u];
  var out: FullOut;
  out.pos = vec4f(p, 0.0, 1.0);
  out.uv = vec2f(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  return out;
}

@group(0) @binding(0) var srcTex: texture_2d<f32>;
@group(0) @binding(1) var srcSamp: sampler;
@group(0) @binding(2) var<uniform> P: PostU;

@fragment
fn fs_bright(in: FullOut) -> @location(0) vec4f {
  let c = textureSample(srcTex, srcSamp, in.uv).rgb;
  let l = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  let w = smoothstep(P.b.x, P.b.x + P.b.y, l);
  return vec4f(c * w, 1.0);
}

@fragment
fn fs_blur(in: FullOut) -> @location(0) vec4f {
  let dir = vec2f(P.a.z, P.a.w) * vec2f(P.a.x, P.a.y);
  var c = textureSample(srcTex, srcSamp, in.uv).rgb * 0.2270270270;
  c = c + textureSample(srcTex, srcSamp, in.uv + dir * 1.3846153846).rgb * 0.3162162162;
  c = c + textureSample(srcTex, srcSamp, in.uv - dir * 1.3846153846).rgb * 0.3162162162;
  c = c + textureSample(srcTex, srcSamp, in.uv + dir * 3.2307692308).rgb * 0.0702702703;
  c = c + textureSample(srcTex, srcSamp, in.uv - dir * 3.2307692308).rgb * 0.0702702703;
  return vec4f(c, 1.0);
}

@fragment
fn fs_composite(in: FullOut) -> @location(0) vec4f {
  let scene = textureSample(srcTex, srcSamp, in.uv).rgb;
  let bloom = textureSample(bloomTex, bloomSamp, in.uv).rgb;
  var c = scene + bloom * P.b.z;

  // ACES (Narkowicz) tonemap + display gamma.
  c = c * P.b.w;
  c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);
  c = pow(clamp(c, vec3f(0.0), vec3f(1.0)), vec3f(1.0 / 2.2));

  // Subtle vignette to hold the eye in the cloud.
  let q = in.uv - vec2f(0.5);
  let vg = 1.0 - 0.38 * pow(length(q) * 1.35, 2.5);
  c = c * clamp(vg, 0.0, 1.0);

  return vec4f(c, 1.0);
}

// Composite samples two textures — declared in a second bind-group-compatible
// block so bright/blur can reuse the compact 3-binding layout above while the
// composite pipeline binds group(1) with the bloom texture.
@group(1) @binding(0) var bloomTex: texture_2d<f32>;
@group(1) @binding(1) var bloomSamp: sampler;
`;
