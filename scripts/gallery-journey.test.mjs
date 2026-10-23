import test from 'node:test';
import { galleryLayout, GALLERY_ENTRY_PROJECTION } from '../src/components/sections/gallery-layout.ts';
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

test('phone and tablet exhibits open vertically within the reading area; desktop stays horizontal', () => {
 for(const [width,height] of [[320,568],[390,844],[390,1180],[768,1024],[1024,768]]) {
  const layout=galleryLayout(width,height,width-15);
  assert.equal(layout.vertical,true);
  assert.equal(layout.x,0);
  assert.ok(layout.y>0);
  const halfHeight=layout.panelWidth*.75/GALLERY_ENTRY_PROJECTION/2;
  const upper=layout.gatherY-layout.y/GALLERY_ENTRY_PROJECTION;
  const lower=layout.gatherY+layout.y/GALLERY_ENTRY_PROJECTION;
  assert.ok(upper-halfHeight>72,`top media clipped at ${width}x${height}`);
  assert.ok(lower+halfHeight<height-100,`bottom media behind navigation at ${width}x${height}`);
  assert.ok(upper+halfHeight<lower-halfHeight,`vertical media overlap at ${width}x${height}`);
  assert.ok(layout.panelWidth/GALLERY_ENTRY_PROJECTION<width-15);
 }
 const desktop=galleryLayout(1440,900,1425);
 assert.equal(desktop.vertical,false);
 assert.equal(desktop.y,0);
 assert.equal(desktop.x,1425*.33);
 assert.equal(desktop.panelTop,54);
});
