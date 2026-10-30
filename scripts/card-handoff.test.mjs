import test from 'node:test';
import assert from 'node:assert/strict';
import { cardHandoff } from '../src/components/sections/card-handoff.ts';

test('the shaping beat remains dark and legible before the light transition', () => {
 const h=900,runway=h*1.6;
 const at=p=>cardHandoff(h-p*(runway+h),runway,h);
 assert.equal(at(0).intro,1);
 assert.equal(at(0).copy,0);
 assert.equal(at(.6).copy,1);
 assert.equal(at(.2).copy,0);
 assert.equal(at(.06).proof,0);
 assert.equal(at(.28).copy,0);
 assert.equal(at(.28).move,1);
 assert.ok(at(.35).copy>0 && at(.35).copy<1);
 assert.equal(at(.42).copy,1);
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

test('the middle frame merges into service media while shaping and service copy never overlap',()=>{
 for(const h of [568,844,900,1180]) for(let step=0;step<=1000;step++) {
  const p=step/1000, pose=cardHandoff(h-p*h*2.6,h*1.6,h);
  assert.ok(Math.abs(pose.intro+pose.serviceReveal-1)<1e-10);
  assert.equal(pose.copy*pose.serviceCopy,0,`text overlap at ${p}`);
  if(p<.28) assert.equal(pose.copy,0);
  if(p>.80) assert.equal(pose.rear,0);
  if(p<=.86) assert.ok(pose.serviceSides<1e-10);
 }
 const at=p=>cardHandoff(900-p*2340,1440,900);
 assert.ok(at(.78).serviceReveal>0 && at(.78).serviceReveal<1);
 assert.ok(at(.78).copy>.49 && at(.78).copy<.51);
 assert.equal(at(.84).copy,0);
 assert.equal(at(.86).serviceCopy,0);
 assert.equal(at(.78).serviceCopy,0);
 assert.equal(at(.90).serviceReveal,1);
 assert.equal(at(1).serviceCopy,1);
 assert.equal(at(1).serviceSides,1);
});

test('benefit titles hold after gathering and clear before the service-frame fit', () => {
 const at=p=>cardHandoff(900-p*2340,1440,900);
 assert.equal(at(.35).move,1);
 assert.equal(at(.28).dissolve,0);
 assert.equal(at(.35).fit,0);
 assert.equal(at(.44).copy,1);
 assert.ok(at(.38).dissolve>0 && at(.38).dissolve<1);
 assert.equal(at(.38).fit,0);
 assert.equal(at(.46).dissolve,1);
 assert.equal(at(.46).fit,0);
 assert.equal(at(.7).dissolve,1);
 assert.equal(at(.7).glass,1);
 assert.equal(at(.7).fit,1);
 assert.equal(at(.7).light,0);
});


test('the innovation statement holds later and clears before the service headings enter', () => {
 const at=p=>cardHandoff(900-p*2340,1440,900);
 assert.equal(at(.72).copy,1);
 assert.ok(at(.8).copy>0);
 assert.equal(at(.8).light,0);
 for(let p=.84;p<=1;p+=.001)assert.equal(at(p).copy,0);
 assert.ok(at(.94).serviceCopy>.5);
});


test('a coloured backing is opaque before artwork erosion starts', () => {
 const at=p=>cardHandoff(900-p*2340,1440,900);
 assert.equal(at(0).glass,0);
 for(let p=.30;p<=.9;p+=.001)assert.equal(at(p).glass,1);
 assert.equal(at(.68).dissolve,1);
 assert.ok(at(.68).intro>0 && at(.68).glass===1);
});

test('the focal sculpture survives the painted face and retires before service media settles', () => {
 const points=Array.from({length:1001},(_,i)=>i/1000);
 const at=p=>cardHandoff(900-p*2340,1440,900);
 assert.deepEqual(points.map(at).toReversed(),points.toReversed().map(at));
 assert.equal(at(0).focus,0);
 assert.equal(at(.42).focus,1);
 assert.equal(at(.46).sculpture,1);
 assert.ok(at(.7).sculpture>0 && at(.7).sculpture<1);
 assert.equal(at(.76).sculpture,0);
 for(const p of points) {
  const pose=at(p);
  if(pose.fit>0)assert.equal(pose.dissolve,1,'text never stretches with the reshaping frame');
  if(pose.dissolve>0)assert.equal(pose.glass,1,'erosion always reveals a filled surface');
 }
});
