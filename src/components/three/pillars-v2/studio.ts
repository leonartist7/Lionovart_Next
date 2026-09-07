import * as THREE from "three";

/**
 * Luxury product-photography studio for the v2 system.
 *
 * Environment: a small procedural env scene (luminous panels on black —
 * warm left, cool centre-top, red right, white top strip, whisper-dim
 * floor bounce) prefiltered once through PMREM. No HDRI download, and the
 * glass always has something believable to reflect. The panels live ONLY
 * in the env scene — nothing is visible in the main frame (no floor).
 *
 * Lights: soft key front-left, hard rim rear-right (the signature perimeter
 * streak), whisper fill, and one per-pillar kiss light floating in front of
 * each card slot.
 */

export interface StudioLights {
  group: THREE.Group;
  dispose: () => void;
}

export function createStudioLighting(scene: THREE.Scene): StudioLights {
  const group = new THREE.Group();
  group.name = "StudioLights";

  const key = new THREE.DirectionalLight(new THREE.Color("#fff2dd"), 2.0);
  key.position.set(-5, 6, 7);

  const rim = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 3.2);
  rim.position.set(6, 3, -6);

  const fill = new THREE.DirectionalLight(new THREE.Color("#8ea0ff"), 0.3);
  fill.position.set(0, -2, 6);

  // Per-pillar kiss lights — low intensity tints floating in front of each
  // card, so the bevel picks up its own motivated color.
  const kissLion = new THREE.PointLight(new THREE.Color("#ffb63d"), 5, 12, 2);
  kissLion.position.set(-4.4, 1.2, 3.2);
  const kissNova = new THREE.PointLight(new THREE.Color("#6f7bff"), 6, 12, 2);
  kissNova.position.set(0, 1.6, 3.4);
  const kissArt = new THREE.PointLight(new THREE.Color("#ff3b4e"), 5, 12, 2);
  kissArt.position.set(4.4, 1.2, 3.2);

  group.add(key, rim, fill, kissLion, kissNova, kissArt);
  scene.add(group);

  return {
    group,
    dispose() {
      scene.remove(group);
    },
  };
}

/**
 * Prefiltered studio environment. Returns a disposer; assigns
 * scene.environment itself.
 */
export function createStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  intensity = 0.55,
): () => void {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#010102");

  const panel = (
    color: string,
    power: number,
    w: number,
    h: number,
    pos: [number, number, number],
  ) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
    mat.color.multiplyScalar(power);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    envScene.add(mesh);
    return mesh;
  };

  const panels = [
    panel("#ffcf8a", 5.0, 3.2, 5.5, [-7.5, 3.4, -1.5]), // warm key streak, left
    panel("#9db4ff", 4.2, 3.6, 5.0, [0, 4.2, -3.0]), // cool centre-top
    panel("#ff9aa4", 3.8, 3.2, 5.5, [7.5, 3.4, -1.5]), // red rim, right
    panel("#ffffff", 2.0, 8.0, 1.4, [0, 7.5, 2.5]), // white top strip
    panel("#3a2c14", 0.7, 9.0, 3.0, [0, -6.5, 0]), // whisper-dim warm floor bounce
  ];

  const pmrem = new THREE.PMREMGenerator(renderer as THREE.WebGLRenderer);
  const envTex = pmrem.fromScene(envScene, 0.06).texture;
  scene.environment = envTex;
  scene.environmentIntensity = intensity;
  pmrem.dispose();

  return () => {
    panels.forEach((mesh) => {
      envScene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    envTex.dispose();
    scene.environment = null;
  };
}
