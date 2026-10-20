import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const info = JSON.parse(await fs.readFile('public/vendor/tubes1-source.json', 'utf8'));
const patched = await fs.readFile(`public/vendor/${info.file}`, 'utf8');
test('cursor compatibility patch changes exactly the two unsafe upstream checks', () => {
  let restored = patched;
  for (const name of ['s', 't']) {
    const guard = `("undefined"!=typeof VideoFrame&&${name} instanceof VideoFrame)`;
    assert.equal(restored.split(guard).length, 2);
    restored = restored.replace(guard, `${name} instanceof VideoFrame`);
  }
  assert.equal(digest(restored), info.originalSha256, 'Rendering code must match the original published 0.0.19 bundle');
});
test('cursor content hash and lazy import refer to the reviewed artifact', async () => {
  assert.equal(digest(patched), info.patchedSha256);
  assert.ok(info.file.includes(info.patchedSha256.slice(0, 16)));
  const component = await fs.readFile('src/components/ui/TubesCursor.tsx', 'utf8');
  assert.ok(component.includes(`/vendor/${info.file}`));
  assert.ok(patched.includes('Copyright 2010-2025 Three.js Authors'));
});
