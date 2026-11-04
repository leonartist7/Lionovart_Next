import test from 'node:test';
import assert from 'node:assert/strict';
import { cardHandoff } from '../src/components/sections/card-handoff.ts';
import { cardTransportRect } from '../src/components/sections/card-transport.ts';
import { galleryCardPose, galleryTravel, galleryProjectProgress, galleryEnding } from '../src/components/sections/gallery-journey.ts';
const at = p => cardHandoff(900-p*2970,2070,900);
test('reading holds fully opaque before white assembly, and the white wordmark has its own hold',()=>{
  for(const p of [.3,.4,.5,.53]) for(const key of ['lead','main','necessity']) assert.equal(at(p)[key],1);
  assert.equal(at(.78).copy,1);
  for(const p of [.755,.78,.81]) { const pose=at(p); assert.equal(pose.white,1);assert.equal(pose.assembly,1);assert.equal(pose.spread,0);assert.equal(pose.serviceReveal,0); }
  assert.equal(at(1).serviceCopy,1);
});
test('all three original frames share one outline during the hold and reach their service positions',()=>{
  const center={x:600,y:400,width:420,height:236.25};
  for(let i=0;i<3;i++) {
    const source={x:200+i*400,y:300,width:240,height:340};
    const target={...center,x:200+i*400};
    assert.deepEqual(cardTransportRect(source,source, target,center,i,i===1,at(.78)),center);
    assert.deepEqual(cardTransportRect(source,source, target,center,i,i===1,at(1)),target);
  }
});
test('the artwork remains intact through departure, then dissolves gradually',()=>{
  const poseAt = advance => { let low=0,high=.76;for(let i=0;i<50;i++){const mid=(low+high)/2;if(galleryTravel(mid,10)/1600<advance)low=mid;else high=mid;}return galleryCardPose((low+high)/2,0,10); };
  assert.equal(poseAt(.72).dissolve,0);assert.ok(poseAt(.8).dissolve>0&&poseAt(.8).dissolve<.2);
  assert.ok(poseAt(.9).dissolve>.2&&poseAt(.9).dissolve<.6);
  assert.ok(poseAt(.82).z>300);
  for(let i=0;i<10;i++){const pose=galleryCardPose(galleryProjectProgress(i,10),i,10);assert.equal(pose.caption,1);assert.equal(pose.dissolve,0);}
  assert.equal(galleryEnding(.84).logo,1);assert.equal(galleryEnding(.84).copy,1);
});
test('scroll state is finite, bounded and exactly reversible',()=>{
  const points=Array.from({length:1001},(_,i)=>i/1000);
  assert.deepEqual(points.map(at).toReversed(),points.toReversed().map(at));
  for(const p of points)for(const value of Object.values(at(p)))assert.ok(Number.isFinite(value)&&value>=0&&value<=1);
});

