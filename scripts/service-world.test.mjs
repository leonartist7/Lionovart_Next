import assert from 'node:assert/strict';
import test from 'node:test';
import { worldLight, fitDistance } from '../src/components/sections/service-world/world-state.ts';

test('the room remains black before the card exit and reaches ivory within the partnership runway', () => {
  assert.equal(worldLight(100, 6000), 0);
  assert.equal(worldLight(0, 6000), 0);
  assert.equal(worldLight(-720, 6000), 0);
  assert.equal(worldLight(-1920, 6000), 1);
  const forward = Array.from({length: 101}, (_, i) => worldLight(-i * 60, 6000));
  assert.deepEqual(forward.slice().reverse(), Array.from({length: 101}, (_, i) => worldLight(-(100-i)*60, 6000)));
  assert.ok(forward.every((v, i) => v >= 0 && v <= 1 && (i === 0 || v >= forward[i-1])));
});
for (const [w,h] of [[320,568],[390,844],[768,1024],[1440,900],[2560,1080],[844,390]]) {
  test(`all exhibit silhouettes fit the assigned viewport at ${w}x${h}`, () => {
    const sw = Math.min(w*.92,1024), sh = Math.max(192,Math.min(h*.33,512));
    const d = fitDistance(sw,sh,w,h);
    const viewHeight = 2*d*Math.tan(35*Math.PI/360);
    assert.ok(5.6/viewHeight*h <= sh+.001, 'vertical envelope fits');
    assert.ok(9.6/viewHeight*h <= sw+.001, 'horizontal envelope fits');
    assert.ok(Number.isFinite(d) && d > .1 && d < 150);
  });
}

// Project images can be portrait, square, ultra-wide or invalid; never crop or stretch them.
const { fitArtwork } = await import('../src/components/sections/service-world/world-state.ts');
for (const aspect of [.25, .5, 1, 1.5, 16 / 9, 3, 5]) {
  test(`gallery contains ${aspect.toFixed(2)} aspect art at full scale without distortion`, () => {
    for (const [width, height] of [[6.6, 3.71], [1.1, 2.5]]) {
      const [w, h] = fitArtwork(aspect, width, height);
      assert.ok(w <= width + 1e-9 && h <= height + 1e-9);
      assert.ok(Math.abs(w / h - aspect) < 1e-9);
      assert.ok(Math.abs(w - width) < 1e-9 || Math.abs(h - height) < 1e-9);
    }
  });
}
test('invalid image dimensions have a finite widescreen fallback', () => {
  for (const aspect of [NaN, Infinity, 0, -1]) {
    const [w, h] = fitArtwork(aspect);
    assert.ok(Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0);
  }
});

const { FrameBudget } = await import('../src/components/sections/service-world/frame-budget.ts');
test('demand rendering and invalid samples cannot trigger a quality downgrade', () => {
  const budget = new FrameBudget();
  for (let i = 0; i < 500; i++) { budget.record(null); budget.record(NaN); budget.record(0); }
  assert.equal(budget.downgraded, false);
  assert.deepEqual(budget.summary(), { samples: 0, p50: null, p95: null });
});
test('sustained slow animation lowers quality, but startup and isolated stalls do not', () => {
  const budget = new FrameBudget();
  for (let i = 0; i < 90; i++) budget.record(50);
  assert.equal(budget.downgraded, false);
  for (let i = 0; i < 120; i++) { budget.record(40); budget.record(16); }
  assert.equal(budget.downgraded, false);
  for (let i = 0; i < 101; i++) budget.record(40);
  assert.equal(budget.downgraded, true);
  assert.equal(budget.summary().samples, 180);
  assert.equal(budget.summary().p95, 40);
});

const { exhibitPlacement } = await import('../src/components/sections/service-world/world-state.ts');
test('scrolling a foreground exhibit changes its placement without changing scale or camera framing', () => {
  for (const [w, h] of [[390, 844], [768, 1024], [1440, 900], [844, 390]]) {
    const rect = { left: w * .04, top: 80, width: w * .92, height: h * .4 };
    const start = exhibitPlacement(rect, w, h);
    const scrolled = exhibitPlacement({ ...rect, top: rect.top - 300 }, w, h);
    assert.equal(start.scale, scrolled.scale);
    assert.equal(start.x, scrolled.x);
    assert.ok(scrolled.y > start.y);
    assert.ok(Object.values(start).every(Number.isFinite));
  }
});
