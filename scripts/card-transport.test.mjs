import test from 'node:test';
import assert from 'node:assert/strict';
import {cardHandoff} from '../src/components/sections/card-handoff.ts';
import {cardTransportRect} from '../src/components/sections/card-transport.ts';
import {cardBridgeFrame} from '../src/components/sections/card-bridge.ts';
const pose=p=>cardHandoff(900-p*2340,1440,900);
const source={x:250,y:220,width:280,height:390};
const sourceCenter={...source,x:610};
const center={x:610,y:270,width:600,height:337.5};
const destination={x:280,y:235,width:500,height:281.25};
test('collection completes behind the original middle frame before reshaping begins',()=>{
 const held=cardTransportRect(source,sourceCenter,destination,center,0,false,pose(.695));
 assert.equal(held.x,sourceCenter.x);assert.equal(held.y,sourceCenter.y);
 assert.equal(held.width,sourceCenter.width);
 assert.equal(held.height,sourceCenter.height);
 const hero=cardTransportRect(sourceCenter,sourceCenter,center,center,1,true,pose(.695));
 assert.deepEqual(hero,sourceCenter);
});
test('the stack reaches its complete service aspect before any lateral expansion',()=>{
 const held=cardTransportRect(source,sourceCenter,destination,center,0,false,pose(.84));
 assert.equal(held.x,center.x);assert.equal(held.y,center.y);
 assert.ok(Math.abs(held.width/held.height-16/9)<1e-10);
});
test('transport reaches live service positions under unequal original film projection',()=>{
 for(const parentX of [.6,.85,1.2])for(const parentY of [.5,.9,1.1])for(const motionX of [-30,0,30]) {
  const base={...source,parentX,parentY,motionX,motionY:18};
  const desired=cardTransportRect(source,sourceCenter,destination,center,0,false,pose(1));
  const frame=cardBridgeFrame(base,desired,1,1,false);
  assert.deepEqual(desired,destination);
  assert.ok(Math.abs(base.x+parentX*(frame.x+frame.sx*motionX-motionX)-destination.x)<1e-8);
  assert.ok(Math.abs(base.y+parentY*(frame.y+frame.sy*18-18)-destination.y)<1e-8);
  assert.ok(Math.abs(base.width*frame.sx-destination.width)<1e-8);
  assert.ok(Math.abs(base.height*frame.sy-destination.height)<1e-8);
  assert.ok(Math.abs(parentX*frame.sx*(1/(parentX*frame.sx))-1)<1e-10,'media counter-projection preserves aspect');
 }
});
test('rapid forward and reverse input produce the same finite frames without travel overshoot',()=>{
 const points=Array.from({length:2001},(_,i)=>i/2000);
 const read=p=>cardTransportRect(source,sourceCenter,destination,center,0,false,pose(p));
 assert.deepEqual(points.map(read).toReversed(),points.toReversed().map(read));
 let previous=read(0);
 for(const p of points) {
  const next=read(p);
  for(const key of Object.keys(next))assert.ok(Number.isFinite(next[key])&&Math.abs(next[key]-previous[key])<4);
  assert.ok(next.width>0&&next.height>0);previous=next;
 }
});

