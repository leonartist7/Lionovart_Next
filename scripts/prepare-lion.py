"""Build web derivatives and comparison stills; never modify the source GLB.
Run with Blender --background --python scripts/prepare-lion.py.
"""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/models/lion'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
tier = sys.argv[-1] if sys.argv[-1] in ('desktop', 'mobile') else 'desktop'
repair = '--from-web' in sys.argv
bpy.ops.import_scene.gltf(filepath=str(OUT / f'lion-{tier}.glb') if repair else r'C:\Users\leona\Documents\LIONHEAD.glb')
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
print('SOURCE', [(o.name, len(o.data.vertices), len(o.data.polygons), list(o.dimensions)) for o in meshes])
# The source includes an unrelated default cube enclosing the actual lion.
for o in list(meshes):
    if o.name == 'Cube' and len(o.data.vertices) <= 24:
        meshes.remove(o)
        bpy.data.objects.remove(o, do_unlink=True)
# Normalize the complete asset without altering its constituent geometry/materials.
coords = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
lo = Vector(tuple(min(v[i] for v in coords) for i in range(3)))
hi = Vector(tuple(max(v[i] for v in coords) for i in range(3)))
center = (lo + hi) / 2
scale = 2.0 / (hi.z - lo.z)
for o in meshes:
    o.location = (o.location - center) * scale
    o.scale *= scale
bpy.context.view_layer.update()
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
    stats[tier] = {'triangles': sum(len(o.data.polygons) for o in meshes), 'bytes': path.stat().st_size}
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
