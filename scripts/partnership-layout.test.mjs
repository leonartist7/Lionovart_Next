import test from 'node:test';
import assert from 'node:assert/strict';
import { partnershipDiscLayout, partnershipLayout } from '../src/components/sections/partnership-layout.ts';
import { galleryEnding } from '../src/components/sections/gallery-journey.ts';

for (const [width,height] of [[320,568],[360,640],[390,844],[768,1024],[1024,768],[1365,650],[1366,520],[1440,900],[2560,1080]]) {
 test(`partnership invitation and result action have separate reading areas at ${width}x${height}`, () => {
  const layout = partnershipLayout(width,height);
  const markTop = layout.markCenter - layout.markSize / 2;
  const markBottom = markTop + layout.markSize;
  const actionTop = height - layout.ctaBottom - 52;
  assert.ok(layout.markSize >= 176 && layout.markSize <= 240);
  assert.ok(width/2 + layout.markSize/2 + 32 < width, 'pause control overflows');
  assert.ok(markTop >= 72, 'invitation is behind the navigation');
  assert.ok(markBottom + 24 < layout.copyTop, 'invitation overlaps its copy');
  assert.ok(actionTop + 52 <= height - 32);
  // Reserve two lines for the title/subtitle on narrow screens.
  const narrow = width < 768;
  const short = height <= 740;
  const title = height<=560 && width>1024 ? Math.max(32,Math.min(width*.04,40)) : short ? Math.max(32,Math.min(width*.05,56)) : narrow ? Math.max(32,Math.min(width*.08,56)) : Math.max(40,Math.min(width*.058,96));
  const subtitle = height<=560 && width>1024 ? Math.max(24,Math.min(width*.03,28)) : short ? Math.max(24,Math.min(width*.04,44)) : narrow ? Math.max(24,Math.min(width*.063,40)) : Math.max(28,Math.min(width*.04,64));
  const titleBottom = layout.copyTop + title*1.05 + 12.8 + subtitle*1.15*(width<360?2:1);
  assert.ok(titleBottom + 24 < actionTop, 'copy overlaps the results action');
  assert.ok(layout.markCenter <= height * .34, 'logo left the upper third');
 });
}
test('the red disc remains contained and leaves clear subtitle and action regions', () => {
 for(const [w,h] of [[305,568],[375,844],[753,1024],[1351,520],[1425,900],[2545,1440]]) {
  const disc=partnershipDiscLayout(w,h),finalDiameter=disc.diameter*.76;
  assert.ok(disc.diameter<=w-48&&disc.diameter<=h*.66);
  assert.ok(h*.48-disc.diameter/2>=0);
  assert.ok(h*.48+disc.diameter/2<h);
  assert.ok(disc.center-finalDiameter/2>=64);
  assert.equal(disc.subtitleTop-(disc.center+finalDiameter/2),24);
  const subtitleHeight=h<=560?32.2:w<360?55.2:w<768?46:73.6;
  const actionTop=h-Math.max(32,h*.08)-52;
  assert.ok(disc.subtitleTop+subtitleHeight+16<actionTop);
 }
});
test('the title remains visible as the disc contracts in either scroll direction', () => {
 for(const p of [.82,.85,.87,.905,.94,.98,1])assert.equal(galleryEnding(p).title,1);
 const samples = Array.from({length:2001},(_,i)=>.7+i*.00015);
 for(const key of ['coreScale','title','markSettle','logo','copy','links']) {
  const values=samples.map(p=>galleryEnding(p)[key]);
  for(let i=1;i<values.length;i++)assert.ok(Math.abs(values[i]-values[i-1])<.01);
  assert.deepEqual(values.toReversed(),samples.toReversed().map(p=>galleryEnding(p)[key]));
 }
});
