"""Build web derivatives and comparison stills; never modify the source GLB.
Run with Blender --background --python scripts/prepare-lion.py.
"""
import bpy, math, json, sys, hashlib
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/models/lion'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
tier = sys.argv[-1] if sys.argv[-1] in ('desktop', 'mobile') else 'desktop'
repair = '--from-web' in sys.argv
source = Path(sys.argv[sys.argv.index('--source') + 1]) if '--source' in sys.argv else Path(r'C:\Users\leona\Downloads\Lion-HID.glb')
bpy.ops.import_scene.gltf(filepath=str(OUT / f'lion-{tier}.glb') if repair else str(source))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
print('SOURCE', [(o.name, len(o.data.vertices), len(o.data.polygons), list(o.dimensions)) for o in meshes])
# The source includes an unrelated default cube enclosing the actual lion.
for o in list(meshes):
    if o.name == 'Cube' and len(o.data.vertices) <= 24:
        meshes.remove(o)
        bpy.data.objects.remove(o, do_unlink=True)
# Normalize the complete asset without altering its constituent geometry/materials.
for o in meshes:
    world = o.matrix_world.copy()
    o.parent = None
    o.matrix_world = world
bpy.context.view_layer.update()
coords = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
lo = Vector(tuple(min(v[i] for v in coords) for i in range(3)))
hi = Vector(tuple(max(v[i] for v in coords) for i in range(3)))
center = (lo + hi) / 2
scale = 2.0 / (hi.z - lo.z)
for o in meshes:
    o.location = (o.location - center) * scale
    o.scale *= scale
bpy.context.view_layer.update()
# Texture detail is sized for the displayed silhouette, not the source's 8K maps.
texture_limit = 1024 if tier == 'mobile' else 2048
for image in bpy.data.images:
    if image.size[0] and max(image.size) > texture_limit:
        ratio = texture_limit / max(image.size)
        image.scale(round(image.size[0] * ratio), round(image.size[1] * ratio))
        image.pack()
# Each tier runs in a fresh Blender process to bound simplification memory.
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = False
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.world.color = (0.22, 0.22, 0.22)
scene.view_settings.view_transform = 'AgX'
bpy.ops.object.camera_add(location=(0.22, -5.8, 0.18))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 0)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 2.65
scene.camera = camera
for loc, power, size, color in [((-3,-4,4), 650, 4, (1,.88,.72)), ((3,-2,1), 350, 3, (.85,.9,1)), ((1,2,3), 850, 3, (1,.72,.48))]:
    bpy.ops.object.light_add(type='AREA', location=loc)
    light = bpy.context.object
    light.data.energy, light.data.shape, light.data.size, light.data.color = power, 'DISK', size, color
    light.rotation_euler = (-light.location).to_track_quat('-Z','Y').to_euler()
stats = json.loads((OUT / 'asset-report.json').read_text()) if (OUT / 'asset-report.json').exists() else {}
stats['source'] = {'name': source.name, 'bytes': source.stat().st_size, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()}
if tier == 'desktop' and not repair:
    scene.render.filepath = str(OUT / 'source-review.png')
    bpy.ops.render.render(write_still=True)
total = sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes)
for tier, target in [(tier, 145000 if tier == 'desktop' else 55000)]:
    for o in meshes:
        bpy.context.view_layer.objects.active = o
        mod = o.modifiers.new('Web silhouette reduction', 'DECIMATE')
        mod.ratio = 1 if repair else min(1, target / total)
        mod.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    path = OUT / f'lion-{tier}.glb'
    bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', use_selection=True,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14, export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12)
    stats[tier] = {'triangles': sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes), 'bytes': path.stat().st_size, 'textureLimit': texture_limit}
    (OUT / 'asset-report.json').write_text(json.dumps(stats, indent=2))
    scene.render.filepath = str(OUT / f'{tier}-review.png')
    bpy.ops.render.render(write_still=True)
    if tier == 'desktop':
        camera.location = (4.65, -3.6, 0.18)
        camera.rotation_euler = (-camera.location).to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = str(OUT / 'lion-poster.png')
        bpy.ops.render.render(write_still=True)
(OUT / 'asset-report.json').write_text(json.dumps(stats, indent=2))
print('DERIVATIVES', json.dumps(stats))
