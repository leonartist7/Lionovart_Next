import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceGalleryHandoff } from '../src/components/sections/service-gallery-handoff.ts';

test('service copy clears before the title, and the original cards gather before the gallery opens', () => {
 const at = p => serviceGalleryHandoff(990 * (1 - p), 900);
 assert.ok(at(0).gather < 1e-10);
 assert.equal(at(.3).serviceCopy, 0);
 assert.equal(at(.3).title, 0);
 assert.equal(at(.5).gather, 1);
 assert.equal(at(.5).services, 1);
 assert.equal(at(.5).gallery, 0);
 assert.equal(at(.5).spread, 0);
 assert.equal(at(.6).title, 1);
 assert.equal(at(1).spread, 1);
 for (let p = 0; p <= 1; p += .01) assert.ok(Math.abs(at(p).services + at(p).gallery - 1) < 1e-10);
});

test('the gather and fan stay reversible, bounded and consistent across viewport sizes', () => {
 for (const h of [568, 844, 900, 1024]) for (const p of [0, .2, .5, .7, 1]) {
  const pose = serviceGalleryHandoff(h * 1.1 * (1 - p), h);
  const reference = serviceGalleryHandoff(990 * (1 - p), 900);
  for (const key of Object.keys(pose)) assert.ok(Math.abs(pose[key] - reference[key]) < 1e-10);
 }
 for (const top of [-100000, 0, 100000]) {
  for (const value of Object.values(serviceGalleryHandoff(top, 0))) assert.ok(Number.isFinite(value) && value >= 0 && value <= 1);
 }
 const points = [0, .25, .5, .75, 1];
 assert.deepEqual(points.map(p => serviceGalleryHandoff(990 * (1 - p), 900)).reverse(), points.toReversed().map(p => serviceGalleryHandoff(990 * (1 - p), 900)));
});
