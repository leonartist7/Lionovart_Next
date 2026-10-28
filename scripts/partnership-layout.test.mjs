import test from 'node:test';
import assert from 'node:assert/strict';
import { partnershipLayout } from '../src/components/sections/partnership-layout.ts';
import { galleryEnding } from '../src/components/sections/gallery-journey.ts';

for (const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1365,650],[1440,900],[2560,1080]]) {
 test(`partnership invitation and result action have separate reading areas at ${width}x${height}`, () => {
  const layout = partnershipLayout(width,height);
  const markTop = height * .4 + layout.markDrop - layout.markSize / 2;
  const markBottom = markTop + layout.markSize;
  const actionTop = height - layout.ctaBottom - 52;
  assert.ok(layout.markSize >= 176 && layout.markSize <= 240);
  assert.ok(width/2 + layout.markSize/2 + 32 < width, 'pause control overflows');
  assert.ok(markBottom + 16 < actionTop, 'mark/pause overlaps the results action');
  assert.ok(actionTop + 52 <= height - 32);
  // Reserve two lines for the title/subtitle on narrow screens.
  const narrow = width < 768;
  const short = height <= 740;
  const title = short ? Math.max(32,Math.min(width*.05,56)) : narrow ? Math.max(32,Math.min(width*.08,56)) : Math.max(40,Math.min(width*.058,96));
  const subtitle = short ? Math.max(24,Math.min(width*.04,44)) : narrow ? Math.max(24,Math.min(width*.063,40)) : Math.max(28,Math.min(width*.04,64));
  const titleBottom = layout.copyTop + title*1.05 + 12.8 + subtitle*1.15*(width<360?2:1);
  assert.ok(titleBottom + 24 < markTop, 'heading overlaps the invitation');
 });
}
test('the logo settles below the heading before the result action finishes arriving', () => {
 assert.equal(galleryEnding(.72).markSettle,0);
 assert.equal(galleryEnding(.72).ring,0);
 assert.equal(galleryEnding(.81).ring,1);
 assert.equal(galleryEnding(.86).markSettle,1);
 assert.equal(galleryEnding(.86).copy,1);
 assert.equal(galleryEnding(.92).links,1);
 assert.equal(galleryEnding(.92).dock,0);
});
test('the invitation position and ring reveal are continuous and reversible', () => {
 const samples = Array.from({length:1001},(_,i)=>.7+i*.0003);
 for(const key of ['markSettle','ring']) {
  const values=samples.map(p=>galleryEnding(p)[key]);
  for(let i=1;i<values.length;i++) assert.ok(Math.abs(values[i]-values[i-1])<.01);
  assert.deepEqual(values.toReversed(),samples.toReversed().map(p=>galleryEnding(p)[key]));
 }
});
