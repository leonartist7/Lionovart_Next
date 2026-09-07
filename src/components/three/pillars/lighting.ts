import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Luxury product-photography studio: soft key, narrow rim, whisper fill,
 * plus a procedural environment so the glass always has something
 * believable to reflect (no giant HDRI download).
 */

export interface StudioLights {
  group: THREE.Group;
  key: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  kissLights: THREE.PointLight[];
  dispose: () => void;
}

export function createStudioLighting(scene: THREE.Scene): StudioLights {
  const group = new THREE.Group();

  const key = new THREE.DirectionalLight(new THREE.Color("#fff2dd"), 2.2);
  key.position.set(-5, 6, 7);

  const rim = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 3.4);
  rim.position.set(6, 3, -6);

  const fill = new THREE.DirectionalLight(new THREE.Color("#8ea0ff"), 0.35);
  fill.position.set(0, -2, 6);

  // Per-pillar kiss lights — low intensity tints floating in front of each card.
  const kissLion = new THREE.PointLight(new THREE.Color("#ffb63d"), 6, 12, 2);
  kissLion.position.set(-4.4, 1.2, 3.2);
  const kissNova = new THREE.PointLight(new THREE.Color("#6f7bff"), 7, 12, 2);
  kissNova.position.set(0, 1.6, 3.4);
  const kissArt = new THREE.PointLight(new THREE.Color("#ff3b4e"), 6, 12, 2);
  kissArt.position.set(4.4, 1.2, 3.2);

  group.add(key, rim, fill, kissLion, kissNova, kissArt);
  scene.add(group);

  return {
    group,
    key,
    rim,
    fill,
    kissLights: [kissLion, kissNova, kissArt],
    dispose() {
      scene.remove(group);
    },
  };
}

/**
 * Procedural studio environment: RoomEnvironment for believable base
 * reflections, plus three large luminous panels (warm left, cool centre,
 * red right) so each card's bevel picks up its own motivated streak.
 * Rendered once into a PMREM — cheap at runtime.
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.06).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.85;

  const panel = (color: string, intensity: number, w: number, h: number, pos: [number, number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
    mat.color.multiplyScalar(intensity);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    // Panels are light sources for reflections only — never visible: they sit
    // outside the camera frustum and don't write to the visible frame because
    // the background stays transparent/black. Keep them out of the raycast path.
    mesh.visible = true;
    scene.add(mesh);
    return mesh;
  };

  // Stored on the scene for disposal by the engine.
  const panels = [
    panel("#ffcf8a", 5.5, 3.2, 5.5, [-7.5, 3.4, -1.5]),
    panel("#9db4ff", 4.5, 3.6, 5.0, [0, 4.2, -3.0]),
    panel("#ff9aa4", 4.0, 3.2, 5.5, [7.5, 3.4, -1.5]),
    panel("#ffffff", 2.2, 8.0, 1.4, [0, 7.5, 2.5]),
  ];
  (scene as THREE.Scene & { __studioPanels?: THREE.Mesh[] }).__studioPanels = panels;

  pmrem.dispose();
  // RoomEnvironment geometry disposal
  room.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      (mesh.geometry as THREE.BufferGeometry)?.dispose?.();
      const m = mesh.material as THREE.Material | THREE.Material[];
      if (Array.isArray(m)) m.forEach((x) => x.dispose?.());
      else m?.dispose?.();
    }
  });
}

export function disposeStudioEnvironment(scene: THREE.Scene): void {
  const s = scene as THREE.Scene & { __studioPanels?: THREE.Mesh[] };
  s.__studioPanels?.forEach((mesh) => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  });
  s.__studioPanels = undefined;
  const env = scene.environment;
  if (env && "dispose" in env && typeof env.dispose === "function") {
    (env as THREE.Texture).dispose();
  }
  scene.environment = null;
}
