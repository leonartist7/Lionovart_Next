import test from 'node:test';
import assert from 'node:assert/strict';
import {cardLettering,cardTailOpacity} from '../src/components/sections/card-lettering.ts';
import {cardReadingStack,cardTransportRect} from '../src/components/sections/card-transport.ts';
import {cardHandoff} from '../src/components/sections/card-handoff.ts';

test('actual segment advances join exactly on a centered baseline at every card width',()=>{
 for(const width of [140,230,360,720]) for(const units of [[1.8,2.1,1.9],[1.7,2,1.8]]) {
  const poses=units.map((_,i)=>cardLettering(width,width*9/16,units,i,1));
  for(let i=1;i<3;i++)assert.ok(Math.abs(poses[i].x-(poses[i-1].x+units[i-1]*poses[i-1].size))<1e-9);
  const left=poses[0].x,right=poses[2].x+units[2]*poses[2].size;
  assert.ok(Math.abs((left+right)/2-width/2)<1e-9);
  assert.equal(poses[0].y,poses[2].y);
  assert.ok(left>0&&right<width);
 }
});
test('portrait reading fits above the statement and gathers at the live service anchor',()=>{
 for(const [w,h,statement] of [[320,568,446],[390,844,707],[532,776,640]]) {
  const sources=[0,1,2].map(i=>({x:w/2,y:170+i*220,width:w*.84,height:195}));
  const fit=cardReadingStack(sources,statement,w);
  assert.ok(fit[0].y-fit[0].height/2>=72-1e-8);
  assert.ok(fit[2].y+fit[2].height/2<=statement-24+1e-8);
  for(let i=0;i<3;i++)assert.ok(Math.abs(fit[i].width/fit[i].height-sources[i].width/sources[i].height)<1e-9);
  const pose=cardHandoff(h-.695*h*3.3,h*2.3,h);
  const center={x:w/2,y:h*.32,width:w*.72,height:w*.72*9/16};
  const gathered=fit.map((r,i)=>cardTransportRect(r,fit[0],center,center,i,i===0,pose));
  for(const r of gathered)assert.deepEqual(r,{...fit[0],x:center.x,y:center.y});
 }
});
test('white covers the original face before material ownership starts changing',()=>{
 const at=p=>cardHandoff(900-p*2970,2070,900);
 assert.equal(at(.53).white,0);
 assert.ok(at(.58).white>0&&at(.58).white<1);
 assert.equal(at(.64).white,1);
 assert.ok(at(.675).assembly<1);
 assert.equal(at(.71).assembly,1);
 assert.equal(at(.695).material,0);
 for(let i=0;i<=1000;i++)if(at(i/1000).material<1)assert.ok(at(i/1000).white>.999,'No face thins before white has covered it');
 for(const p of [.4,.53,.64,.78])assert.equal(at(p).identity,1);
});
test('names start in the image area and duplicate N/A glyphs survive until they meet',()=>{
 const units=[1.8,2.1,1.9];
 for(const width of [140,260,600,900]) {
  const reading=cardLettering(width,width*.7,units,0,0);
  assert.ok(reading.y<width*.7*.25);
  assert.ok(reading.size<=72);
  assert.equal(cardTailOpacity(0,reading.size,.7),1);
  assert.equal(cardTailOpacity(20,reading.size,1),1);
  assert.equal(cardTailOpacity(0,reading.size,1),0);
  let previous=0;
  for(let gap=0;gap<=20;gap+=.1) {
   const opacity=cardTailOpacity(gap,reading.size,1);
   assert.ok(opacity>=previous&&opacity<=1);previous=opacity;
  }
 }
});

