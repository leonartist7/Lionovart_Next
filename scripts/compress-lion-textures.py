"""Repack opaque embedded textures as high-quality JPEG after Blender export.
Run with Python + Pillow; only web derivatives are modified, never the source.
"""
import io
import json
import struct
from pathlib import Path
from PIL import Image

out = Path(__file__).resolve().parents[1] / 'public/models/lion'
report = json.loads((out / 'asset-report.json').read_text())
for tier in ('desktop', 'mobile'):
    path = out / f'lion-{tier}.glb'
    raw = path.read_bytes()
    length = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20 + length])
    binary = raw[28 + length:]
    replacements = {}
    for image in doc.get('images', []):
        view = doc['bufferViews'][image['bufferView']]
        start = view.get('byteOffset', 0)
        picture = Image.open(io.BytesIO(binary[start:start + view['byteLength']]))
        if 'A' in picture.getbands() and picture.getchannel('A').getextrema()[0] < 255:
            continue
        encoded = io.BytesIO()
        picture.convert('RGB').save(encoded, format='JPEG', quality=90, subsampling=0, optimize=True)
        replacements[image['bufferView']] = encoded.getvalue()
        image['mimeType'] = 'image/jpeg'
    rebuilt = bytearray()
    for i, view in enumerate(doc['bufferViews']):
        start = view.get('byteOffset', 0)
        data = replacements.get(i, binary[start:start + view['byteLength']])
        rebuilt.extend(b'\0' * (-len(rebuilt) % 4))
        view['byteOffset'], view['byteLength'] = len(rebuilt), len(data)
        rebuilt.extend(data)
    doc['buffers'][0]['byteLength'] = len(rebuilt)
    rebuilt.extend(b'\0' * (-len(rebuilt) % 4))
    metadata = json.dumps(doc, separators=(',', ':')).encode()
    metadata += b' ' * (-len(metadata) % 4)
    glb = struct.pack('<III', 0x46546C67, 2, 28 + len(metadata) + len(rebuilt))
    glb += struct.pack('<II', len(metadata), 0x4E4F534A) + metadata
    glb += struct.pack('<II', len(rebuilt), 0x004E4942) + rebuilt
    path.write_bytes(glb)
    report[tier]['bytes'] = len(glb)
    assert len(glb) <= (5_000_000 if tier == 'desktop' else 2_000_000), f'{tier} exceeds transfer budget'
    print(tier, len(glb))
(out / 'asset-report.json').write_text(json.dumps(report, indent=2))
