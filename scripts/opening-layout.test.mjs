import test from 'node:test';
import assert from 'node:assert/strict';
import {usesLandscapeFilm,openingReadingPose,openingFrameCenters} from '../src/components/sections/lion-journey/opening-layout.ts';
import {chooseScrollStop} from '../src/components/experience/scroll-policy.ts';

test('medium laptop/tablet and landscape phone get the horizontal film',()=>{
 for(const [w,h] of [[862,682],[962,682],[820,1180],[1024,768],[844,393],[640,400]]) assert.equal(usesLandscapeFilm(w,h),true,`${w}×${h}`);
 for(const [w,h] of [[393,844],[430,932],[600,900]]) assert.equal(usesLandscapeFilm(w,h),false,`${w}×${h}`);
});
test('a tall stack does not push the film below its visible reading area',()=>{
 const pose=openingFrameCenters(520,963,88,828,122,22);
 assert.equal(pose.filmCenter,519);
 assert.equal(pose.cardCenter-963/2,232);
 assert.equal(pose.filmCenter-574/2,232);
 assert.equal(pose.filmCenter+574/2,806);
 const desktop=openingFrameCenters(570,519,88,920,130,8);
 assert.equal(desktop.cardCenter,desktop.filmCenter,'a fitting row retains its fixed center');
});
test('each full card stack is readable before and after its flip',()=>{
 const span=1000,extra=400;
 assert.deepEqual(openingReadingPose(525,span,extra,extra),{progress:.525,offset:0});
 assert.deepEqual(openingReadingPose(725,span,extra,extra),{progress:.525,offset:200});
 assert.deepEqual(openingReadingPose(925,span,extra,extra),{progress:.525,offset:400});
 assert.deepEqual(openingReadingPose(1300,span,extra,extra),{progress:.9,offset:0});
 assert.deepEqual(openingReadingPose(1600,span,extra,extra),{progress:1,offset:200});
 const points=[0,525,725,925,1100,1300,1600,1800];
 assert.deepEqual(points.map(x=>openingReadingPose(x,span,extra,extra)).reverse(),points.reverse().map(x=>openingReadingPose(x,span,extra,extra)));
});
test('auto settling reads the front stack before carrying it into Imagine',()=>{
 const stops=[['film',225],['cards',525],['imagine',1300]].map(([id,y])=>({id,y,kind:'opening',label:id}));
 const scene={start:0,end:1400,extent:1800,timelineSpan:1000,frontReading:{start:525,end:925},kind:'opening',stops};
 const choose=(mode,y,gestureStart,direction=1)=>chooseScrollStop({mode,y,gestureStart,direction,viewport:844,scenes:[scene],boundaries:stops});
 for(const mode of ['settle','cinema']) {
  assert.equal(choose(mode,650,525),undefined);
  assert.equal(choose(mode,700,850,-1),undefined);
 }
 assert.equal(choose('settle',1010,925)?.id,'imagine');
 assert.equal(choose('cinema',1010,925)?.id,'imagine');
 assert.equal(choose('settle',1500,1300),undefined,'read back faces before the next chapter');
});
