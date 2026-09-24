import gsap from "gsap";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Match CSS object-fit: cover at both ends of the transition. The reference
// effect reveals the incoming frame through a growing refractive glass circle.
const fragmentShader = `
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uFromSize;
uniform vec2 uToSize;
uniform vec2 uResolution;
uniform float uProgress;
varying vec2 vUv;

vec2 coverUv(vec2 uv, vec2 imageSize) {
  vec2 scale = uResolution / imageSize;
  float cover = max(scale.x, scale.y);
  vec2 rendered = imageSize * cover;
  vec2 offset = (uResolution - rendered) * 0.5;
  return (uv * uResolution - offset) / rendered;
}

void main() {
  vec2 oldUv = coverUv(vUv, uFromSize);
  vec2 nextUv = coverUv(vUv, uToSize);
  vec4 outgoing = texture2D(uFrom, oldUv);
  if (uProgress <= 0.0) {
    gl_FragColor = outgoing;
  } else if (uProgress >= 1.0) {
    gl_FragColor = texture2D(uTo, nextUv);
  } else {
    vec2 pixel = vUv * uResolution;
    vec2 center = uResolution * 0.5;
    float distanceFromCenter = length(pixel - center);
    float radius = uProgress * length(uResolution) * 0.85;
    float normalizedDistance = distanceFromCenter / max(radius, 0.001);
    float reveal = 1.0 - smoothstep(radius - 3.0, radius + 3.0, distanceFromCenter);
    vec2 direction = distanceFromCenter > 0.0 ? (pixel - center) / distanceFromCenter : vec2(0.0);

    float refraction = 0.08 * pow(smoothstep(0.3, 1.0, normalizedDistance), 1.5);
    vec2 refracted = nextUv - direction * refraction;
    float time = uProgress * 5.0;
    refracted += vec2(sin(time + normalizedDistance * 10.0), cos(time * 0.8 + normalizedDistance * 8.0)) * 0.015 * normalizedDistance * reveal;
    float chromatic = 0.02 * pow(smoothstep(0.3, 1.0, normalizedDistance), 1.2);
    vec4 incoming = vec4(
      texture2D(uTo, refracted + direction * chromatic * 1.2).r,
      texture2D(uTo, refracted + direction * chromatic * 0.2).g,
      texture2D(uTo, refracted - direction * chromatic * 0.8).b,
      1.0
    );
    float rim = smoothstep(0.95, 1.0, normalizedDistance) * (1.0 - smoothstep(1.0, 1.01, normalizedDistance));
    incoming.rgb += rim * 0.08;
    incoming = mix(incoming, texture2D(uTo, nextUv), smoothstep(0.94, 1.0, uProgress));
    gl_FragColor = mix(outgoing, incoming, reveal);
  }
  #include <colorspace_fragment>
}`;

export type GlassRenderer = {
  transition: (from: number, to: number) => Promise<void>;
  resize: () => void;
  dispose: () => void;
};

export async function createGlassRenderer(
  canvas: HTMLCanvasElement,
  projects: readonly { poster: string }[],
): Promise<GlassRenderer> {
  const textures: THREE.Texture[] = [];
  const sizes: THREE.Vector2[] = [];
  try {
    const loader = new THREE.TextureLoader();
    const loaded = await Promise.allSettled(projects.map((project) => loader.loadAsync(project.poster)));
    if (loaded.some((result) => result.status === "rejected")) {
      loaded.forEach((result) => { if (result.status === "fulfilled") result.value.dispose(); });
      throw new Error("A selected-work poster could not load into the glass renderer");
    }
    for (const result of loaded) {
      if (result.status !== "fulfilled") continue;
      const texture = result.value;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      textures.push(texture);
      const image = texture.image as { width: number; height: number };
      sizes.push(new THREE.Vector2(image.width, image.height));
    }

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uFrom: { value: textures[0] },
      uTo: { value: textures[0] },
      uFromSize: { value: new THREE.Vector2(1, 1) },
      uToSize: { value: new THREE.Vector2(1, 1) },
      uResolution: { value: new THREE.Vector2(16, 9) },
      uProgress: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const scene = new THREE.Scene();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let tween: gsap.core.Tween | null = null;
    let settle: (() => void) | null = null;
    let disposed = false;

    const resize = () => {
      if (disposed) return;
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5, 2880 / width));
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
    };
    resize();

    return {
      resize,
      transition(from, to) {
        tween?.kill();
        settle?.();
        const fromTexture = textures[from];
        const toTexture = textures[to];
        uniforms.uFrom.value = fromTexture;
        uniforms.uTo.value = toTexture;
        uniforms.uFromSize.value.copy(sizes[from]);
        uniforms.uToSize.value.copy(sizes[to]);
        uniforms.uProgress.value = 0;
        renderer.render(scene, camera);
        return new Promise<void>((resolve) => {
          settle = resolve;
          tween = gsap.to(uniforms.uProgress, {
            value: 1,
            duration: 2.5,
            ease: "power2.inOut",
            onUpdate: () => renderer.render(scene, camera),
            onComplete: () => {
              tween = null;
              settle = null;
              resolve();
            },
          });
        });
      },
      dispose() {
        disposed = true;
        tween?.kill();
        settle?.();
        geometry.dispose();
        material.dispose();
        textures.forEach((texture) => texture.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      },
    };
  } catch (error) {
    textures.forEach((texture) => texture.dispose());
    throw error;
  }
}
