import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyPose,journeyProgress,journeyRoute,routePoint,streamEnd} from '../src/components/sections/lion-journey/motion.ts';
function fixture(w) {
 const mobile=w<1024,heroHeight=mobile?510:680;
 return {hero:{left:0,top:40,width:w,height:heroHeight},copy:{left:w*.48,top:172,width:w*.45,height:160},slot:{left:w*.05,top:172,width:w*.39,height:mobile?Math.min(w*.45,256):500},intro:{left:20,top:heroHeight+100,width:w-40,height:270},video:{left:w*.08,top:heroHeight+520,width:w*.84,height:mobile?420:400},videoSection:{left:0,top:heroHeight+400,width:w,height:2400},proof:{left:0,top:heroHeight+2800,width:w,height:160},bridge:{left:0,top:heroHeight+2960,width:w,height:360},reveal:{left:0,top:heroHeight+3320,width:w,height:1100},end:heroHeight+400,mobile};
}
for(const w of [320,390,430,768,1024,1440,1920]) test(`${w}px: connected, reversible lion route and bounded full stream`,()=>{
 const a=fixture(w),route=journeyRoute(a);
 assert.equal(route.at(-1).y,streamEnd(a));
 assert.ok(a.bridge.top-streamEnd(a)>=64);
 let previous=journeyPose(0,a);
 for(let i=0;i<=1000;i++) {
  const p=i/1000,pose=journeyPose(p,a);
  assert.ok(Math.hypot(pose.x-previous.x,pose.y-previous.y)<12);
  assert.deepEqual({x:pose.x,y:pose.y},routePoint(route,p*2/(route.length-1)));
  assert.deepEqual(pose,journeyPose(p,a));
  if(p<.72) assert.equal(pose.size,journeyPose(0,a).size);
  previous=pose;
 }
 let y=0;
 for(let i=0;i<=1000;i++) { const p=routePoint(route,i/1000); assert.ok(p.x>=0&&p.x<=w); assert.ok(p.y>=y); y=p.y; }
 const end=journeyPose(1,a),half=end.size/2;
 assert.ok(end.x-half>=a.video.left&&end.x+half<=a.video.left+a.video.width);
 assert.ok(end.y-half>=a.video.top&&end.y+half<=a.video.top+a.video.height);
 assert.ok(end.x>journeyPose(0,a).x);
 assert.equal(journeyProgress(a.end,a),1); assert.equal(journeyProgress(-100,a),0);
});
test('layout refresh keeps the finish before translated partnership copy',()=>{
 const a=fixture(390),b={...a,bridge:{...a.bridge,top:a.bridge.top+300,height:660},reveal:{...a.reveal,top:a.reveal.top+600}};
 assert.equal(journeyPose(0,a).x,journeyPose(0,b).x);
 assert.ok(journeyRoute(b).at(-1).y>journeyRoute(a).at(-1).y);
});

test('lion follows the right-to-left-to-front orientation journey',()=>{
 const a=fixture(1440);
 const hero=journeyPose(0,a),title=journeyPose(.48,a),video=journeyPose(1,a);
 assert.ok(hero.turn>.35,'hero begins facing right');
 assert.ok(title.turn<-.4,'lion faces left alongside the second title');
 assert.ok(Math.abs(video.turn)<.001,'lion faces front at the video');
 assert.ok((video.pitch ?? 0)<-.12,'lion subtly looks upward before disappearing');
});

test('stream tangents stay continuous at chapter joins',()=>{
 const route=journeyRoute(fixture(1440)),e=1e-6;
 for(let i=1;i<route.length-1;i++) {
  const t=i/(route.length-1),a=routePoint(route,t-e),b=routePoint(route,t),c=routePoint(route,t+e);
  assert.ok(Math.hypot((c.x-2*b.x+a.x)/e,(c.y-2*b.y+a.y)/e)<2);
 }
});
