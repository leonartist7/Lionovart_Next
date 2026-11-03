import test from 'node:test';
import assert from 'node:assert/strict';
import { cardHandoff } from '../src/components/sections/card-handoff.ts';
const at = (p,h=900) => cardHandoff(h-p*h*2.6,h*1.6,h);

test('the statement starts with the cards, then gives the brand its own hold',()=>{
 assert.ok(at(.04).lead>0);
 assert.equal(at(.04).main,0); assert.equal(at(.16).necessity,0);
 for(const p of [.3,.4,.46]) for(const key of ['lead','main','necessity']) assert.equal(at(p)[key],1);
 assert.equal(at(.59).copy,0); assert.equal(at(.78).wordmark,1);
 assert.equal(at(.76).brand,0); assert.equal(at(.76).expertise,0);
 assert.ok(at(.94).expertise>.5); assert.equal(at(.94).serviceCopy,0);
 assert.equal(at(1).serviceCopy,1);
});
test('the same frames gather, reshape while stacked, reveal media and then spread',()=>{
 assert.equal(at(.50).gather,0);
 assert.equal(at(.695).gather,1);
 assert.equal(at(.69).reshape,0);
 assert.equal(at(.80).reshape,1);
 assert.equal(at(.80).serviceReveal,0);
 assert.equal(at(.92).serviceReveal,1);
 assert.equal(at(.845).spread,0);
 assert.equal(at(.97).spread,1);
 for(let i=0;i<=1000;i++) {
  const pose=at(i/1000);
  assert.equal(pose.intro,1,'the source frames never disappear');
  if(pose.reshape>0)assert.equal(pose.gather,1);
  if(pose.serviceReveal>0)assert.equal(pose.reshape,1);
  if(pose.spread>0)assert.ok(pose.white>.99);
  assert.equal(pose.copy*pose.serviceCopy,0);
  assert.equal(pose.brand*pose.expertise,0);
 }
});
test('pointer tilt and corner sculptures clear before the incoming artwork',()=>{
 assert.equal(at(.46).pointer,1);
 assert.equal(at(.59).pointer,0);
 assert.equal(at(.12).sculpture,1); assert.equal(at(.59).sculpture,0);
 assert.equal(at(.54).light,0); assert.equal(at(.93).light,1);
});
test('every cue is reversible, bounded and independent of viewport scale',()=>{
 const points=Array.from({length:1001},(_,i)=>i/1000);
 assert.deepEqual(points.map(p=>at(p)).toReversed(),points.toReversed().map(p=>at(p)));
 for(const h of [568,744,844,1180]) for(const p of [0,.1,.35,.55,.7,.85,1]) {
  for(const [key,value] of Object.entries(at(p,h))) assert.ok(Math.abs(value-at(p)[key])<1e-10);
 }
 for(const [top,height] of [[10000,1400],[-10000,1400],[0,0]]) {
  for(const value of Object.values(cardHandoff(top,height,900))) assert.ok(Number.isFinite(value)&&value>=0&&value<=1);
 }
});

