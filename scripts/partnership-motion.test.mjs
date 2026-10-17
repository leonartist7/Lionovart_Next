import test from 'node:test';
import assert from 'node:assert/strict';
import {partnershipPose, PARTNERSHIP_SCROLL_LENGTH, PARTNERSHIP_TIMING} from '../src/components/sections/partnership-motion.ts';
test('cards dissolve into the centered chapter, with a complete reading hold',()=>{
 assert.equal(partnershipPose(0).introOpacity,1);
 assert.equal(partnershipPose(0).chapterOpacity,0);
 assert.equal(partnershipPose(PARTNERSHIP_TIMING.introEnd).introOpacity,0);
 for (const progress of [.15, .25, .45, .65, .80]) assert.equal(partnershipPose(progress).chapterOpacity,1);
 assert.equal(partnershipPose(1).chapterOpacity,0);
});
test('the dissolving handoff is continuous and reversible',()=>{
 let previous=partnershipPose(0);
 for(let i=1;i<=2000;i++) {const pose=partnershipPose(i/2000);assert.ok(Math.abs(pose.introOpacity-previous.introOpacity)<.01);assert.ok(Math.abs(pose.chapterOpacity-previous.chapterOpacity)<.01);previous=pose;}
 const points=[0,.13,.27,.42,.65,.85,1];assert.deepEqual(points.map(partnershipPose).reverse(),points.reverse().map(partnershipPose));
});
test('the text gets a full reading interval before images begin moving',()=>{
 assert.ok(PARTNERSHIP_SCROLL_LENGTH * (PARTNERSHIP_TIMING.tilesStart - PARTNERSHIP_TIMING.headlineInEnd) >= .9);
 assert.ok(PARTNERSHIP_SCROLL_LENGTH * (PARTNERSHIP_TIMING.headlineOutStart - PARTNERSHIP_TIMING.tileFadeEnd) >= .7);
});
