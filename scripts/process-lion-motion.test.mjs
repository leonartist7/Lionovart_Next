import test from 'node:test';
import assert from 'node:assert/strict';
import { processLionPose, stepPassIntensity, stepRingRotation } from '../src/components/sections/process-lion-motion.ts';

for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
  const geometry = {
    viewportHeight: height, progress: 0, dockTop: height * .75,
    dockSize: 180, dockX: width / 2, originX: width * .15,
    originY: height * .56, railSize: width < 640 ? 78 : 300,
  };
  const pose = progress => processLionPose({ ...geometry, progress });

  test(`${width}px: step four has a complete hold before the lion departs`, () => {
    for (const progress of [0, .08, .15, .16]) {
      const held = pose(progress);
      assert.equal(held.x, geometry.originX);
      assert.equal(held.y, geometry.originY);
      assert.equal(held.processOpacity, 1);
      assert.equal(stepPassIntensity(geometry.originY, held.y, height * .36), 1);
      assert.equal(held.chapterOpacity, 0);
      assert.equal(held.reveal, 0);
    }
  });

  test(`${width}px: chapter appears with a centered, forward-facing lion before the CTA`, () => {
    const chapter = pose(.5);
    assert.equal(chapter.x, width / 2);
    assert.equal(chapter.turn, 0);
    assert.equal(chapter.chapterOpacity, 1);
    assert.equal(chapter.reveal, 0);
    const docked = pose(.84);
    assert.equal(docked.y, geometry.dockTop + geometry.dockSize / 2);
    assert.equal(docked.chapterOpacity, 0);
    assert.equal(docked.reveal, 0);
    assert.equal(pose(1).reveal, 1);
  });

  test(`${width}px: scroll route remains continuous and reversible`, () => {
    let previous = pose(0);
    for (let i = 1; i <= 1000; i++) {
      const next = pose(i / 1000);
      assert.ok(Math.hypot(next.x - previous.x, next.y - previous.y) < 8);
      assert.ok(next.turn <= previous.turn);
      previous = next;
    }
    const samples = [0, .1, .3, .5, .7, 1];
    assert.deepEqual(samples.map(pose).reverse(), samples.reverse().map(pose));
  });
}

test('rings rotate on approach and departure but hold during the strong highlight', () => {
  assert.ok(stepRingRotation(600, 400, 260) < 0);
  assert.ok(stepRingRotation(200, 400, 260) > 0);
  for (const y of [365, 400, 435]) {
    assert.ok(stepPassIntensity(y, 400, 260) >= .8);
    assert.equal(stepRingRotation(y, 400, 260), 0);
  }
});
