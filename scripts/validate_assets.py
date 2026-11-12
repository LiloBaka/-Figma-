#!/usr/bin/env python3
"""Validate all extracted SVG assets without rewriting original vector geometry."""
from pathlib import Path
import json, hashlib, sys, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'spec/assets.json').read_text())
errors=[]
assert manifest['assetCount']==10
for asset in manifest['assets']:
    for variant_name,record in asset['variants'].items():
        path=ROOT/record['file']
        if not path.is_file():errors.append(f'missing {path}');continue
        raw=path.read_bytes()
        if hashlib.sha256(raw).hexdigest()!=record['sha256']:
            errors.append(f'changed raw bytes: {path}')
        try:root=ET.fromstring(raw)
        except ET.ParseError as e:errors.append(f'invalid SVG {path}: {e}');continue
        if not root.tag.endswith('}svg'):errors.append(f'not svg: {path}')
        if any(el.tag.endswith('}image') for el in root.iter()):errors.append(f'raster image detected: {path}')
        if not any(el.tag.endswith('}path') for el in root.iter()):errors.append(f'no path: {path}')
print(f"Checked {len(manifest['assets'])} named assets x 4 variants; errors: {len(errors)}")
for e in errors:print('ERROR:',e)
sys.exit(bool(errors))
