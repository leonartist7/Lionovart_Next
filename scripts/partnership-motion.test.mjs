import test from 'node:test';
import assert from 'node:assert/strict';
import {partnershipPose} from '../src/components/sections/partnership-motion.ts';
test('cards dissolve into the centered chapter, with a complete reading hold',()=>{
 assert.equal(partnershipPose(0).introOpacity,1);
 assert.equal(partnershipPose(0).chapterOpacity,0);
 assert.equal(partnershipPose(.27).introOpacity,0);
 assert.equal(partnershipPose(.42).chapterOpacity,1);
 assert.equal(partnershipPose(.65).chapterOpacity,1);
 assert.equal(partnershipPose(1).chapterOpacity,0);
});
test('the dissolving handoff is continuous and reversible',()=>{
 let previous=partnershipPose(0);
 for(let i=1;i<=1000;i++) {const pose=partnershipPose(i/1000);assert.ok(Math.abs(pose.introOpacity-previous.introOpacity)<.01);assert.ok(Math.abs(pose.chapterOpacity-previous.chapterOpacity)<.01);previous=pose;}
 const points=[0,.13,.27,.42,.65,.85,1];assert.deepEqual(points.map(partnershipPose).reverse(),points.reverse().map(partnershipPose));
});
