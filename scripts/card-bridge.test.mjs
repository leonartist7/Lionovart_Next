import test from 'node:test';
import assert from 'node:assert/strict';
import {cardBridgeFrame} from '../src/components/sections/card-bridge.ts';
import {cardHandoff} from '../src/components/sections/card-handoff.ts';

function project(base,frame) {
 const angle=frame.angle*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
 const x=c*frame.sx*base.motionX-s*frame.sy*base.motionY;
 const y=s*frame.sx*base.motionX+c*frame.sy*base.motionY;
 return {
  x:base.x+base.parentX*(frame.x+x-base.motionX),
  y:base.y+base.parentY*(frame.y+y-base.motionY),
  width:base.parentX*(Math.abs(c)*frame.sx*base.width/base.parentX+Math.abs(s)*frame.sy*base.height/base.parentY),
  height:base.parentY*(Math.abs(s)*frame.sx*base.width/base.parentX+Math.abs(c)*frame.sy*base.height/base.parentY),
 };
}
test('desktop panels land exactly on a centred foreground and two level elevated rear frames',()=>{
 const targets=[{x:278,y:196,width:503,height:283},{x:674,y:243,width:598,height:336},{x:1070,y:196,width:503,height:283}];
 const landed=targets.map((target,i)=>{
  const base={x:310+i*365,y:380,width:341,height:576,parentX:1,parentY:1,motionX:(i-1)*35.5,motionY:0};
  const frame=cardBridgeFrame(base,target,1,1,false);
  assert.equal(frame.angle,0);
  const result=project(base,frame);
  for(const key of Object.keys(target))assert.ok(Math.abs(result[key]-target[key])<1e-8,`${i}: ${key}`);
  return result;
 });
 assert.equal(landed[0].y,landed[2].y);
 assert.ok(landed[0].y<landed[1].y);
});
test('portrait turns preserve their final target even with split offsets and unequal parent projection',()=>{
 for(const parentX of [.72,.95,1])for(const parentY of [.78,.93,1])for(const side of [-1,0,1]) {
  const base={x:195,y:300+side*160,width:320*parentX,height:190*parentY,parentX,parentY,motionX:0,motionY:side*24};
  const target={x:195+side*90,y:200,width:260,height:146.25};
  const frame=cardBridgeFrame(base,target,1,1,true);
  const result=project(base,frame);
  assert.equal(frame.angle,90);
  for(const key of Object.keys(target))assert.ok(Math.abs(result[key]-target[key])<1e-8,`${side}: ${key}`);
 }
});
test('the transport reverses continuously without a desktop rotation or scale jump',()=>{
 const base={x:300,y:380,width:341,height:576,parentX:1,parentY:1,motionX:-35.5,motionY:0};
 const target={x:278,y:196,width:503,height:283};
 const samples=Array.from({length:1001},(_,i)=>i/1000);
 const frames=samples.map(p=>cardBridgeFrame(base,target,p,p,false));
 assert.deepEqual(frames.toReversed(),samples.toReversed().map(p=>cardBridgeFrame(base,target,p,p,false)));
 assert.deepEqual(project(base,frames[0]),{x:base.x,y:base.y,width:base.width,height:base.height});
 for(let i=1;i<frames.length;i++) {
  assert.equal(frames[i].angle,0);
  assert.ok(Math.abs(frames[i].x-frames[i-1].x)<1);
  assert.ok(Math.abs(frames[i].y-frames[i-1].y)<1);
  assert.ok(frames[i].sx>0 && frames[i].sy>0);
 }
});

test('desktop card tops stay inside the reading area throughout the reshape',()=>{
 const base={x:310,y:380,width:341,height:576,parentX:1,parentY:1,motionX:-35.5,motionY:0};
 for(const target of [{x:278,y:196,width:503,height:283},{x:674,y:243,width:598,height:336}]) {
  for(let p=0;p<=1;p+=.001) {
   const pose=cardHandoff(900-p*2340,1440,900);
   const frame=cardBridgeFrame(base,target,pose.move,pose.fit,false,0,0,pose.fit);
   const rect=project(base,frame),top=rect.y-rect.height/2;
   assert.ok(top>=54-1e-8 && top<=92+1e-8,`top ${top} at ${p}`);
   assert.equal(frame.angle,0);
  }
 }
});
