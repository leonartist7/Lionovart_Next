import test from 'node:test';
import assert from 'node:assert/strict';
import { cardHandoff } from '../src/components/sections/card-handoff.ts';

test('the shaping beat remains dark and legible before the light transition', () => {
 const h=900,runway=h*1.6;
 const at=p=>cardHandoff(h-p*(runway+h),runway,h);
 assert.equal(at(0).intro,1);
 assert.equal(at(0).copy,0);
 assert.equal(at(.76).copy,1);
 assert.equal(at(.35).light,0);
 assert.ok(at(.18).move>0 && at(.18).move<1);
 assert.equal(at(.7).move,1);
 assert.equal(at(1).intro,0);
 assert.equal(at(1).copy,0);
 assert.equal(at(1).light,1);
});
test('scroll reversal and viewport scaling preserve every handoff cue', () => {
 const points=[0,.1,.35,.55,.7,.85,1];
 const pose=(p,h)=>cardHandoff(h-p*h*2.6,h*1.6,h);
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

test('the opening and services dissolve together without an empty frame', async()=>{
 const { chapterOpacity }=await import('../src/components/sections/chapter-dissolve.ts');
 for(const h of [568,844,900,1180]) {
  const runway=h*1.6;
  for(let serviceTop=h;serviceTop>=0;serviceTop-=h/100) {
   const opening=cardHandoff(serviceTop-runway,runway,h).intro;
   const incoming=chapterOpacity(serviceTop,serviceTop+h*3.4,h);
   assert.ok(Math.abs(opening+incoming-1)<1e-10);
  }
 }
});

test('benefit titles hold after gathering, then dissolve during the service-frame fit', () => {
 const at=p=>cardHandoff(900-p*2340,1440,900);
 assert.equal(at(.35).move,1);
 assert.equal(at(.35).dissolve,0);
 assert.equal(at(.35).fit,0);
 assert.equal(at(.35).copy,0);
 assert.equal(at(.44).dissolve,0);
 assert.ok(at(.55).dissolve>0 && at(.55).dissolve<1);
 assert.equal(at(.55).dissolve,at(.55).fit);
 assert.equal(at(.7).dissolve,1);
 assert.equal(at(.7).glass,1);
 assert.equal(at(.7).fit,1);
 assert.equal(at(.7).light,0);
});
