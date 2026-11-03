import * as T from 'three/webgpu';
import { sceneArtwork, type StudioExhibit } from './scene-art';

type Kit = {
  scene: T.Scene;
  box: (parent: T.Object3D, x: number, y: number, z: number, w: number, h: number, d: number, m?: T.MeshStandardMaterial, radius?: number) => T.Mesh;
  screen: (parent: T.Object3D, x: number, y: number, z: number, w: number, h: number, m: T.Material, frame?: T.MeshStandardMaterial) => { group: T.Group; face: T.Mesh };
  mesh: (g: T.BufferGeometry, m: T.Material, parent: T.Object3D, x?: number, y?: number, z?: number) => T.Mesh;
  ivory: T.MeshStandardMaterial; chalk: T.MeshStandardMaterial; gold: T.MeshStandardMaterial; ink: T.MeshStandardMaterial;
  geometry: Set<T.BufferGeometry>; materials: Set<T.Material>; textures: Set<T.Texture>;
  schedule: () => void; disposed: () => boolean;
};

/** Four distinct silhouettes, all inside the same fitted camera envelope. */
export function createStudioExhibits(k: Kit) {
  const { scene, box, mesh, ivory, chalk, gold, ink } = k;
  // Match the fallback's cover crop on device and packaging faces instead of stretching art.
  const screen: Kit['screen'] = (parent, x, y, z, w, h, material, frame) => {
    const item = k.screen(parent, x, y, z, w, h, material, frame);
    const geometry = item.face.geometry.clone(); k.geometry.add(geometry); item.face.geometry = geometry;
    const uv = geometry.getAttribute('uv');
    const cropX = Math.min(1, (w / h) / 1.5), cropY = Math.min(1, 1.5 / (w / h));
    for (let i = 0; i < uv.count; i++) uv.setXY(i, .5 + (uv.getX(i) - .5) * cropX, .5 + (uv.getY(i) - .5) * cropY);
    return item;
  };
  const groups = {} as Record<StudioExhibit, T.Group>;
  const art = {} as Record<StudioExhibit, [T.MeshBasicMaterial, T.MeshBasicMaterial]>;
  const requested = new Map<StudioExhibit, number>();
  const generation = new Map<StudioExhibit, number>();
  const loaded = new Map<StudioExhibit, number>();
  for (const name of ['brand', 'digital', 'spaces', 'systems'] as const) {
    const root = new T.Group(); root.name = name; root.visible = false; groups[name] = root; scene.add(root);
    art[name] = [0, 1].map(() => { const m = new T.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }); k.materials.add(m); return m; }) as [T.MeshBasicMaterial, T.MeshBasicMaterial];
  }
  function load(name: StudioExhibit, variant: number) {
    if (requested.get(name) === variant) return;
    requested.set(name, variant); loaded.delete(name);
    const request = (generation.get(name) ?? 0) + 1; generation.set(name, request);
    let count = 0;
    art[name].forEach((m, i) => {
      new T.TextureLoader().load(sceneArtwork(name, variant, i === 1), texture => {
        if (k.disposed() || generation.get(name) !== request) { texture.dispose(); return; }
        texture.colorSpace = T.SRGBColorSpace;
        if (m.map) { k.textures.delete(m.map); m.map.dispose(); }
        k.textures.add(texture); m.map = texture; m.needsUpdate = true;
        if (++count === 2) loaded.set(name, variant);
        k.schedule();
      }, undefined, () => { /* The interactive DOM composition remains visible. */ });
    });
  }
  const brand = groups.brand;
  const board = screen(brand, -.45, 2.5, -.55, 5.6, 3.73, art.brand[0], gold);
  const book = new T.Group(); brand.add(book); book.position.set(-1.1, 1.1, 1.2); book.rotation.x = -.6; book.rotation.z = -.08;
  const pageLeft = screen(book, -1.12, 0, 0, 2.2, 1.65, art.brand[1], chalk); pageLeft.group.rotation.y = -.1;
  const pageRight = screen(book, 1.12, 0, 0, 2.2, 1.65, art.brand[0], chalk); pageRight.group.rotation.y = .1;
  const pack = new T.Group(); brand.add(pack); pack.position.set(2.7, 1.4, .8); pack.rotation.y = -.25;
  box(pack, 0, 0, -.3, 1.25, 2.2, .8, ivory);
  screen(pack, 0, 0, .15, 1.18, 2.1, art.brand[0], gold);
  const card = screen(brand, .8, .45, 2, 2.1, 1.4, art.brand[1], chalk); card.group.rotation.x = -.7; card.group.rotation.z = .15;
  const chips = new T.Group(); brand.add(chips); chips.position.set(-3, 3.5, .2);
  for (const [i, c] of ['#592638', '#9a706e', '#c5a569', '#f4e9dd'].entries()) {
    const mat = new T.MeshStandardMaterial({ color: c, roughness: .8 }); k.materials.add(mat); box(chips, i * .4, 0, 0, .42, .55, .04, mat);
  }

  const digital = groups.digital;
  const laptop = new T.Group(); digital.add(laptop); laptop.position.set(-.8, 1.3, -.3); laptop.rotation.y = -.12;
  screen(laptop, 0, 1.2, 0, 5.1, 3.4, art.digital[0], ink);
  box(laptop, 0, -.6, .5, 5.6, .1, 1.5, ivory); box(laptop, 0, -.54, .55, 1.2, .01, .6, gold);
  const tablet = screen(digital, 2.75, 1.65, .7, 2.25, 2.9, art.digital[0], ink); tablet.group.rotation.y = -.3;
  const mobile = screen(digital, 1.7, 1.5, 1.7, 1.1, 2.2, art.digital[0], ink); mobile.group.rotation.y = -.18;
  box(mobile.group, 0, .99, .1, .3, .04, .02, ink, .01);
  const ui = screen(digital, -2.6, .7, 1.7, 2.3, 1.53, art.digital[1], chalk); ui.group.rotation.x = -.3;

  const spaces = groups.spaces;
  const terra = new T.MeshStandardMaterial({ color: '#a34831', roughness: .72 }); k.materials.add(terra);
  const portal = new T.Group(); spaces.add(portal); portal.position.set(-1, 0, -.7);
  for (const x of [-2, 2]) box(portal, x, 1.6, 0, .28, 3, .38, ivory);
  const arch = mesh(new T.TorusGeometry(2, .14, 8, 40, Math.PI), ivory, portal, 0, 3.1, 0);
  arch.scale.z = 1.4;
  const wall = screen(spaces, .2, 2.4, -.5, 4.4, 2.93, art.spaces[0], terra);
  const reception = new T.Group(); spaces.add(reception); reception.position.set(-.7, .65, 1);
  box(reception, 0, 0, 0, 2.7, 1, 1.1, ivory); box(reception, 0, -.45, .57, 2.7, .06, .02, gold);
  const sign = screen(spaces, 3, 1.75, .7, 1.15, 2.9, art.spaces[1], gold); sign.group.rotation.y = -.25;
  box(spaces, 3, .25, .7, 1.5, .12, .9, gold);
  const plinth = new T.Group(); spaces.add(plinth); plinth.position.set(-3, .6, 1.1);
  box(plinth, 0, 0, 0, 1.1, 1, 1.1, ivory); mesh(new T.CylinderGeometry(.3, .34, .85, 24), terra, plinth, 0, .95, 0);
  const print = screen(spaces, 0, 1, 1.6, 5.3, 3.53, art.spaces[0], chalk); print.group.rotation.x = -.65; print.group.rotation.z = -.1;

  const systems = groups.systems;
  const teal = new T.MeshStandardMaterial({ color: '#203f3b', roughness: .46 }); k.materials.add(teal);
  const active = new T.MeshStandardMaterial({ color: '#b4c99a', roughness: .45, emissive: '#63764a', emissiveIntensity: .15 }); k.materials.add(active);
  const hub = screen(systems, 0, 2.4, .1, 4.5, 3, art.systems[0], gold); hub.group.rotation.y = -.08;
  box(systems, 0, .45, 0, 2.5, .5, 1.4, ivory);
  const nodePositions = [[-3.3, 3.7, 0], [3.3, 3.7, 0], [-3.3, 1, .6], [3.3, 1, .6]] as const;
  const nodes = nodePositions.map(([x, y, z]) => {
    const node = new T.Group(); node.position.set(x, y, z); systems.add(node);
    const shell = box(node, 0, 0, 0, 1.2, .95, .35, teal);
    const mark = mesh(new T.TorusGeometry(.22, .025, 8, 24), gold, node, 0, .1, .2);
    box(node, 0, -.25, .2, .5, .035, .025, gold);
    return { node, shell, mark };
  });
  const signal = new T.MeshBasicMaterial({ color: '#d8b66e', toneMapped: false }); k.materials.add(signal);
  const paths = nodePositions.map(([x,y,z]) => {
    const start = new T.Vector3(x,y,z), end = new T.Vector3(0,2.4,-.2);
    const path = new T.LineCurve3(start, end);
    mesh(new T.TubeGeometry(path, 1, .018, 5, false), gold, systems);
    const dot = mesh(new T.SphereGeometry(.07, 8, 6), signal, systems);
    return { start, end, dot };
  });

  return {
    groups,
    ready: (name: StudioExhibit, variant: number) => loaded.get(name) === variant,
    update(name: StudioExhibit, v: number, elapsed: number, reduced: boolean) {
      load(name, v);
      if (name === 'brand') {
        brand.rotation.y = v === 1 ? .12 : -.05;
        board.group.visible = v !== 3; board.group.scale.setScalar(v === 2 ? .55 : 1); board.group.position.x = v === 2 ? -2 : -.45;
        book.visible = v !== 2; book.scale.setScalar(v === 3 ? 1.55 : 1); book.position.set(v === 3 ? 0 : -1.1, v === 3 ? 2.3 : 1.1, v === 3 ? 0 : 1.2);
        pack.visible = v !== 3; pack.scale.setScalar(v === 2 ? 1.5 : 1); pack.position.x = v === 2 ? 1.5 : 2.7;
        card.group.visible = v < 2;
      } else if (name === 'digital') {
        laptop.scale.setScalar(v === 1 ? .8 : 1); laptop.position.x = v === 1 ? -1.5 : -.8;
        mobile.group.position.x = v === 1 ? 0 : 1.7; mobile.group.scale.setScalar(v === 1 ? 1.55 : 1);
        tablet.group.scale.setScalar(v === 1 ? 1.12 : 1); ui.group.scale.setScalar(v === 3 ? 1.45 : 1);
      } else if (name === 'spaces') {
        print.group.visible = v === 3; wall.group.visible = v !== 3; reception.visible = v === 0 || v === 2; plinth.visible = v !== 3;
        wall.group.scale.setScalar(v === 1 ? .72 : 1); wall.group.position.x = v === 1 ? -1.5 : .2;
        sign.group.scale.setScalar(v === 1 ? 1.35 : 1); sign.group.position.x = v === 1 ? 1.6 : 3;
        plinth.position.x = v === 2 ? .8 : -3; plinth.scale.setScalar(v === 2 ? 1.4 : 1);
      } else {
        nodes.forEach(({ shell, mark }, i) => { shell.material = i === v ? active : teal; mark.rotation.x = i === v && !reduced ? Math.sin(elapsed * .6) * .25 : 0; });
        paths.forEach(({ start, end, dot }, i) => { dot.visible = i === v; dot.position.lerpVectors(start, end, reduced ? .55 : (elapsed * .22) % 1); });
      }
    },
  };
}
