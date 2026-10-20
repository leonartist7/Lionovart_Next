import test from 'node:test';
import assert from 'node:assert/strict';
import {usesLandscapeFilm,openingReadingPose,openingFrameCenters,inlineBenefitReadingPose,openingDocumentTop} from '../src/components/sections/lion-journey/opening-layout.ts';
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

test('inline benefits read one compact stack without a reset or second pass',()=>{
 assert.deepEqual(inlineBenefitReadingPose(840,1000,240),{progress:.84,offset:0});
 assert.deepEqual(inlineBenefitReadingPose(960,1000,240),{progress:.84,offset:120});
 assert.deepEqual(inlineBenefitReadingPose(1080,1000,240),{progress:.84,offset:240});
 assert.deepEqual(inlineBenefitReadingPose(1240,1000,240),{progress:1,offset:240});
 const points=[0,840,960,1080,1240];
 assert.deepEqual(points.map(x=>inlineBenefitReadingPose(x,1000,240)).reverse(),points.reverse().map(x=>inlineBenefitReadingPose(x,1000,240)));
});
test('one card scene settles from film and protects reading without skipping the manual partnership',()=>{
 const stops=[['hero',0],['film',360],['cards',840],['partnership',1500]].map(([id,y])=>({id,y,label:id,kind:id==='partnership'?'partnership':'opening'}));
 const scene={start:0,end:1000,timelineSpan:1000,kind:'opening',inlineBenefits:true,stops};
 const choose=(y,gestureStart,direction=1,more={})=>chooseScrollStop({mode:'settle',y,gestureStart,direction,viewport:832,scenes:[{...scene,...more}],boundaries:stops});
 assert.equal(choose(520,360)?.id,'cards');
 assert.equal(choose(600,840,-1)?.id,'film');
 assert.equal(choose(900,840),undefined,'the partnership requires manual scrolling');
 assert.equal(choose(900,840,1,{end:1240,frontReading:{start:840,end:1080}}),undefined);
 assert.equal(choose(960,1080,-1,{end:1240,frontReading:{start:840,end:1080}}),undefined);
 assert.equal(choose(1180,900,1,{end:1240,frontReading:{start:840,end:1080}}),undefined,'a reading gesture cannot also skip to the next chapter');
 assert.equal(choose(1180,1080,1,{end:1240,frontReading:{start:840,end:1080}}),undefined,'finishing a reading hold cannot automatically cross the partnership');
});

test('card anchors retain their document origin while the intro parent is sticky',()=>{
 const node=(openingY,introY,transitionY)=>({getBoundingClientRect:()=>({top:openingY}),closest:s=>({getBoundingClientRect:()=>({top:s.includes('intro')?introY:transitionY})})});
 assert.equal(openingDocumentTop(node(120,100,100),0),120);
 assert.equal(openingDocumentTop(node(-980,-1000,-4900),5000),120);
 assert.equal(openingDocumentTop({getBoundingClientRect:()=>({top:-80}),closest:()=>null},200),120);
});
