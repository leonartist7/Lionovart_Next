import assert from 'node:assert/strict';
import test from 'node:test';
import { HONEYCOMB_LIFT_START, HONEYCOMB_PASS_END, honeycombPose, nearestProject, tileCenter, tileProject } from '../src/components/sections/selected-work/honeycomb-journey.ts';

test('the lattice shares its edges and repeats in both directions', () => {
  assert.deepEqual(tileCenter(0, 0), { x: 0, y: 0 });
  assert.ok(Math.abs(Math.hypot(tileCenter(1, 0).x, tileCenter(1, 0).y) - Math.sqrt(3)) < 1e-10);
  for (let count = 1; count <= 10; count++) {
    for (let index = 0; index < count; index++) {
      const { x, y } = nearestProject(-183.4, 41.2, index, count);
      const column = Math.round(x / 1.5);
      const row = Math.round(y / Math.sqrt(3) - (column & 1) * .5);
      assert.equal(tileProject(column, row, count), index);
      assert.equal(tileProject(column - count, row, count), index);
    }
  }
});

test('browse lifts into the final exhibit, then the original ending takes over', () => {
  const end = .67;
  const start = honeycombPose(0, end);
  const browse = honeycombPose(.2, end);
  const lift = honeycombPose(.46, end);
  const handoff = honeycombPose(HONEYCOMB_PASS_END, end);
  assert.equal(start.tunnelOpacity, 1);
  assert.equal(browse.opacity, 1);
  assert.equal(browse.browsing, true);
  assert.equal(honeycombPose(HONEYCOMB_LIFT_START, end).browsing, false);
  assert.ok(lift.lift > .7);
  assert.equal(handoff.opacity, 0);
  assert.equal(handoff.tunnel, end);
  assert.equal(honeycombPose(.85, end).tunnel, .85);
  let previous = 0;
  for (let tick = 0; tick <= 1000; tick++) {
    const pose = honeycombPose(tick / 1000, end);
    assert.ok(pose.tunnel >= previous);
    assert.equal(pose.opacity + pose.tunnelOpacity, 1);
    previous = pose.tunnel;
  }
});
