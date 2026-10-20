import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryProgress, galleryTravel, galleryCardPose, galleryEnding, galleryPairProgress } from '../src/components/sections/gallery-journey.ts';

test('gallery depth is reversible, visits every pair and clears the room before the ending', () => {
 for (const pairs of [1, 6, 17]) {
  const progress = Array.from({ length: 101 }, (_, i) => i / 100);
  const poses = progress.map(p => galleryCardPose(p, 0, pairs));
  assert.deepEqual(poses.toReversed(), progress.toReversed().map(p => galleryCardPose(p, 0, pairs)));
  for (let pair = 0; pair < pairs; pair++) {
   const p = galleryPairProgress(pair, pairs);
   assert.ok(Math.abs(galleryCardPose(p, pair, pairs).z + 350) < 1e-8);
   assert.equal(galleryCardPose(p, pair, pairs).opacity, 1);
   assert.equal(galleryCardPose(.77, pair, pairs).visible, false);
  }
  for (let i = 1; i < progress.length; i++) assert.ok(galleryTravel(progress[i], pairs) >= galleryTravel(progress[i - 1], pairs));
 }
});
test('the logo arrives first, partnership copy follows and CTAs wait for the reading beat', () => {
 assert.equal(galleryEnding(.76).logoZ, 0);
 assert.equal(galleryEnding(.76).copy, 0);
 assert.equal(galleryEnding(.86).copy, 1);
 assert.equal(galleryEnding(.85).links, 0);
 assert.equal(galleryEnding(.92).links, 1);
 assert.equal(galleryEnding(1).copy, 1);
});
test('native gallery progress is finite and consistent across portrait and desktop viewports', () => {
 for (const viewport of [568, 844, 900, 1024]) for (const p of [0, .25, .5, .85, 1]) {
  const height = 12 * viewport;
  assert.ok(Math.abs(galleryProgress(-p * (height - viewport * .85), height, viewport) - p) < 1e-10);
 }
 for (const top of [-100000, 0, 100000]) assert.ok(Number.isFinite(galleryProgress(top, 0, 0)));
});
