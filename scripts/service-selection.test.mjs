import test from 'node:test';
import assert from 'node:assert/strict';
import { createSelectionGate, nearestDialStop, dialOrbit } from '../src/components/sections/service-selection.ts';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

for (const [current, selected, expected] of [[0, 2, -1], [2, 0, 3], [-1, 0, 0], [4, 0, 3], [1.3, 2, 2]]) {
  test(`dial takes the nearest stop from ${current} to ${selected}`, () => {
    assert.equal(nearestDialStop(current, selected), expected);
  });
}
test('orbit endpoints preserve the three authored frame positions across wrapped turns', () => {
  for (let selected = -3; selected <= 6; selected++) {
    for (let index = 0; index < 3; index++) {
      const delta = ((index - selected) % 3 + 3) % 3;
      const orbit = dialOrbit(index, selected);
      assert.ok(Math.abs(orbit.x - (delta === 0 ? 0 : delta === 1 ? 1 : -1)) < 1e-12);
      assert.ok(Math.abs(orbit.depth - (delta === 0 ? 0 : 1)) < 1e-12);
      assert.ok(Math.abs(orbit.opacity - (delta === 0 ? 1 : .48)) < 1e-12);
    }
  }
});
test('a full turn remains continuous and visible', () => {
  let previous = dialOrbit(0, 0);
  for (let position = .001; position <= 3; position += .001) {
    const next = dialOrbit(0, position);
    assert.ok(Math.abs(next.x - previous.x) < .003);
    assert.ok(next.opacity >= .30 && next.opacity <= 1);
    previous = next;
  }
});
test('slow earlier preparation cannot replace the latest choice', async () => {
  const first = deferred(), last = deferred(), commits = [];
  const gate = createSelectionGate({ prepare: n => n === 0 ? first.promise : last.promise, commit: n => commits.push(n), fail: () => assert.fail(), delay: 0 });
  gate.request(0); await tick(); gate.request(5); await tick();
  assert.deepEqual(commits, []);
  last.resolve(); await tick(); first.resolve(); await tick();
  assert.deepEqual(commits, [5]); gate.cancel();
});
test('rapid choices only prepare the final requested scene', async () => {
  const prepared = [], commits = [];
  const gate = createSelectionGate({ prepare: async n => prepared.push(n), commit: n => commits.push(n), fail: () => assert.fail(), delay: 0 });
  gate.request(1); gate.request(4); gate.request(2); await tick();
  assert.deepEqual(prepared, [2]); assert.deepEqual(commits, [2]); gate.cancel();
});
test('scroll interruption/unmount cancels both pending and in-flight commits', async () => {
  const ready = deferred(), commits = [];
  const gate = createSelectionGate({ prepare: () => ready.promise, commit: n => commits.push(n), fail: () => assert.fail(), delay: 0 });
  gate.request(4); await tick(); gate.cancel(); ready.resolve(); await tick();
  gate.request(1); gate.cancel(); await tick(); assert.deepEqual(commits, []);
});
test('failed media keeps the current scene and permits a retry', async () => {
  let attempt = 0; const commits = [], failures = [];
  const gate = createSelectionGate({ prepare: async () => { if (!attempt++) throw new Error('offline'); }, commit: n => commits.push(n), fail: n => failures.push(n), delay: 0 });
  gate.request(3); await tick(); assert.deepEqual(commits, []); assert.deepEqual(failures, [3]);
  gate.request(3); await tick(); assert.deepEqual(commits, [3]); gate.cancel();
});
test('a stale media failure cannot reset the new selection', async () => {
  const old = deferred(), failures = [], commits = [];
  const gate = createSelectionGate({ prepare: n => n === 1 ? old.promise : Promise.resolve(), commit: n => commits.push(n), fail: n => failures.push(n), delay: 0 });
  gate.request(1); await tick(); gate.request(2); await tick(); old.reject(new Error('offline')); await tick();
  assert.deepEqual(commits, [2]); assert.deepEqual(failures, []); gate.cancel();
});
