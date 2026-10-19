import assert from 'node:assert/strict';
import test from 'node:test';
import { worldLight, fitDistance } from '../src/components/sections/service-world/world-state.ts';

test('the room remains black before the card exit and reaches ivory within the partnership runway', () => {
  assert.equal(worldLight(100, 6000), 0);
  assert.equal(worldLight(0, 6000), 0);
  assert.equal(worldLight(-1320, 6000), 1);
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
