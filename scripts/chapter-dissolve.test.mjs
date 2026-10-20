import test from 'node:test';
import assert from 'node:assert/strict';
import { chapterOpacity } from '../src/components/sections/chapter-dissolve.ts';
for (const h of [568, 844, 900, 1024]) {
  test(`chapter dissolve at ${h}px has invisible boundaries, a readable hold and reversible entry`, () => {
    assert.equal(chapterOpacity(h, 4*h, h), 0);
    assert.equal(chapterOpacity(0, 3*h, h), 1);
    assert.equal(chapterOpacity(-2*h, h, h), 1);
    assert.equal(chapterOpacity(-3*h, 0, h), 0);
    const steps = Array.from({length:101}, (_, i)=>chapterOpacity(h-i*h/100,4*h-i*h/100,h));
    assert.ok(steps.every((v,i)=>v>=0&&v<=1&&(i===0||v>=steps[i-1])));
    assert.deepEqual([...steps].reverse(),Array.from({length:101}, (_,i)=>chapterOpacity(h-(100-i)*h/100,4*h-(100-i)*h/100,h)));
  });
}

test('adjacent chapters always share a complementary dissolve at every viewport size', () => {
  for (const h of [568, 844, 900, 1024]) {
    for (let i = 0; i <= 100; i++) {
      const boundary = h * i / 100;
      const outgoing = chapterOpacity(boundary - h * 3, boundary, h);
      const incoming = chapterOpacity(boundary, boundary + h * 3, h);
      assert.ok(Math.abs(outgoing + incoming - 1) < 1e-12, `empty transition at ${h}px / ${i}%`);
      assert.ok(!(outgoing > .5 && incoming > .5), 'two chapters must not own input together');
    }
  }
});
