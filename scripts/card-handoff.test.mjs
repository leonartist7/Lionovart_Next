import test from 'node:test';
import assert from 'node:assert/strict';
import { cardHandoff } from '../src/components/sections/card-handoff.ts';

test('the shaping beat remains dark and legible before the light transition', () => {
 const h=900,runway=h*1.6;
 const at=p=>cardHandoff(h-p*runway,runway,h);
 assert.equal(at(0).intro,1);
 assert.equal(at(0).copy,0);
 assert.equal(at(.42).copy,1);
 assert.equal(at(.35).light,0);
 assert.ok(at(.35).move>0 && at(.35).move<1);
 assert.equal(at(.7).move,1);
 assert.equal(at(1).intro,0);
 assert.equal(at(1).copy,0);
 assert.equal(at(1).light,1);
});
test('scroll reversal and viewport scaling preserve every handoff cue', () => {
 const points=[0,.1,.35,.55,.7,.85,1];
 const pose=(p,h)=>cardHandoff(h-p*h*1.6,h*1.6,h);
 assert.deepEqual(points.map(p=>pose(p,900)).reverse(),points.toReversed().map(p=>pose(p,900)));
 for(const h of [568,744,844,1180]) for(const p of points) {
  const a=pose(p,h),b=pose(p,900);
  for(const key of Object.keys(a)) assert.ok(Math.abs(a[key]-b[key])<1e-10);
 }
});
test('deep links and invalid runway lengths remain bounded',()=>{
 for(const [top,height] of [[10000,1400],[-10000,1400],[0,0]]) {
  for(const value of Object.values(cardHandoff(top,height,900))) assert.ok(Number.isFinite(value)&&value>=0&&value<=1);
 }
});
