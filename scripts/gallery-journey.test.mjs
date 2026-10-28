import test from 'node:test';
import { galleryLayout, GALLERY_ENTRY_PROJECTION } from '../src/components/sections/gallery-layout.ts';
import assert from 'node:assert/strict';
import { galleryProgress, galleryTravel, galleryCardPose, galleryEnding, galleryPairProgress, galleryRunwayScreens, galleryStepTarget, galleryNavigationDuration, galleryNavigationEase } from '../src/components/sections/gallery-journey.ts';

test('gallery depth is reversible, visits every pair and clears the room before the ending', () => {
 for (const pairs of [1, 4, 6, 17]) {
  const progress = Array.from({ length: 101 }, (_, i) => i / 100);
  const poses = progress.map(p => galleryCardPose(p, 0, pairs));
  assert.deepEqual(poses.toReversed(), progress.toReversed().map(p => galleryCardPose(p, 0, pairs)));
  for (let pair = 0; pair < pairs; pair++) {
   const p = galleryPairProgress(pair, pairs);
   assert.ok(Math.abs(galleryCardPose(p, pair, pairs).z + 350) < 1e-8);
   assert.equal(galleryCardPose(p, pair, pairs).opacity, 1);
   assert.equal(galleryCardPose(.77, pair, pairs).visible, false);
  }
  for (let i = 1; i < progress.length; i++) assert.ok(galleryTravel(progress[i], pairs) >= galleryTravel(progress[i - 1], pairs));
 }
});
test('the logo arrives first, partnership copy follows and CTAs wait for the reading beat', () => {
 assert.equal(galleryEnding(.76).logoZ, 0);
 assert.equal(galleryEnding(.76).copy, 0);
 assert.equal(galleryEnding(.86).copy, 1);
 assert.equal(galleryEnding(.85).links, 0);
 assert.equal(galleryEnding(.92).links, 1);
 assert.equal(galleryEnding(1).copy, 1);
});
test('native gallery progress is finite and consistent across portrait and desktop viewports', () => {
 for (const viewport of [568, 844, 900, 1024]) for (const p of [0, .25, .5, .85, 1]) {
  const height = 12 * viewport;
  assert.ok(Math.abs(galleryProgress(-p * (height - viewport * .85), height, viewport) - p) < 1e-10);
 }
 for (const top of [-100000, 0, 100000]) assert.ok(Number.isFinite(galleryProgress(top, 0, 0)));
});

test('phone and tablet exhibits open vertically within the reading area; desktop stays horizontal', () => {
 for(const [width,height] of [[320,568],[390,844],[390,1180],[768,1024],[1024,768]]) {
  const layout=galleryLayout(width,height,width-15);
  assert.equal(layout.vertical,true);
  assert.equal(layout.x,0);
  assert.ok(layout.y>0);
  const halfHeight=layout.panelWidth*.75/GALLERY_ENTRY_PROJECTION/2;
  const upper=layout.gatherY-layout.y/GALLERY_ENTRY_PROJECTION;
  const lower=layout.gatherY+layout.y/GALLERY_ENTRY_PROJECTION;
  assert.ok(upper-halfHeight>72,`top media clipped at ${width}x${height}`);
  assert.ok(lower+halfHeight<height-100,`bottom media behind navigation at ${width}x${height}`);
  assert.ok(upper+halfHeight<lower-halfHeight,`vertical media overlap at ${width}x${height}`);
  assert.ok(layout.panelWidth/GALLERY_ENTRY_PROJECTION<width-15);
 }
 const desktop=galleryLayout(1440,900,1425);
 assert.equal(desktop.vertical,false);
 assert.equal(desktop.y,0);
 assert.ok(desktop.x < 1425*.33);
 assert.ok(desktop.exitX > 1425*.33);
 assert.ok(desktop.x > desktop.panelWidth / 2);
 assert.equal(desktop.panelTop,54);
});

test('the service gather matches the projected gallery center on desktop and portrait', () => {
 for (const [width, height] of [[320,568], [390,844], [768,1024], [1024,768], [1440,900], [2560,1080]]) {
  const layout = galleryLayout(width, height, width - 15);
  const vanishingY = height * .48;
  const projectedY = vanishingY + (height * layout.panelTop / 100 - vanishingY) / GALLERY_ENTRY_PROJECTION;
  assert.ok(Math.abs(layout.gatherY - projectedY) < .001, `service/gallery center mismatch at ${width}x${height}`);
 }
});


test('each reading stop gets a longer hold and is C1 continuous through forward and reverse travel', () => {
 const pairs = 4, epsilon = 1e-6;
 for (let pair = 1; pair < pairs; pair++) {
  const p = galleryPairProgress(pair, pairs);
  const before = (galleryTravel(p, pairs) - galleryTravel(p - epsilon, pairs)) / epsilon;
  const after = (galleryTravel(p + epsilon, pairs) - galleryTravel(p, pairs)) / epsilon;
  const between = (galleryTravel(p + .095 + epsilon, pairs) - galleryTravel(p + .095, pairs)) / epsilon;
  assert.ok(Math.abs(before - after) < .01);
  assert.ok(between > before * 5);
  const pose = galleryCardPose(p, pair, pairs);
  assert.equal(pose.outward, 0); assert.equal(pose.caption, 1);
 }
 assert.ok(galleryRunwayScreens(4) > 8);
 assert.ok(galleryRunwayScreens(4) < 9);
});
test('the dock, arrows and centred title are gone before the logo-only beat and restore in reverse', () => {
 for (const p of [.72, .74, .76, .85, 1]) {
  const ending = galleryEnding(p);
  assert.equal(ending.dock, 0); assert.equal(ending.navigation, 0); assert.equal(ending.header, 0);
 }
 assert.equal(galleryEnding(.6).dock, 1);
 assert.equal(galleryEnding(.6).navigation, 1);
 assert.equal(galleryEnding(.6).header, 1);
});
test('rapid arrows accumulate a bounded target and reverse from the pending destination', () => {
 assert.equal(galleryStepTarget(0, null, 1, 4), 1);
 assert.equal(galleryStepTarget(0, 1, 1, 4), 2);
 assert.equal(galleryStepTarget(0, 2, -1, 4), 1);
 assert.equal(galleryStepTarget(0, 4, 1, 4), 4);
 assert.equal(galleryStepTarget(0, 0, -1, 4), 0);
 // A native gesture clears the pending request; the next arrow uses the actual row.
 assert.equal(galleryStepTarget(2, null, -1, 4), 1);
});
test('arrow curves carry forward velocity, settle without overshoot and stay distance-scaled', () => {
 for (const [distance, velocity] of [[1200,0],[1200,500],[-1200,-500],[1200,10000],[-1200,500],[0,0]]) {
  const duration = galleryNavigationDuration(distance, 900);
  assert.ok(duration >= 1.05 && duration <= 1.6);
  const ease = galleryNavigationEase(velocity, distance, duration);
  assert.equal(ease(0),0); assert.equal(ease(1),1);
  let previous=0;
  for(let step=0;step<=1000;step++) {
   const value=ease(step/1000);
   assert.ok(value>=previous-1e-12 && value<=1+1e-12); previous=value;
  }
  assert.ok((1-ease(1-1e-6))/1e-6<.00001);
  if(Math.abs(velocity)===500 && Math.sign(velocity)===Math.sign(distance)) {
   const initialVelocity=ease(1e-7)/1e-7*distance/duration;
   assert.ok(Math.abs(initialVelocity-velocity)<.001);
  }
 }
});

// Project the four corners, including rotation, rather than comparing unprojected CSS boxes.
function bounds(width, height, layout, pose, side, row) {
 const w=layout.panelWidth, h=w*(layout.vertical?.75:11/16);
 const angle=-side*(layout.vertical?0:4+12*pose.outward)*Math.PI/180;
 const x=side*(layout.x+(layout.exitX-layout.x)*pose.outward);
 const y=side*(layout.y+(layout.exitY-layout.y)*pose.outward)+(row%2?-1:1)*(layout.vertical?0:height*.02)*pose.outward;
 const corners=[[-w/2,-h/2],[-w/2,h/2],[w/2,-h/2],[w/2,h/2]].map(([dx,dy])=>{
  const projection=1000/(1000-pose.z+Math.sin(angle)*dx);
  return {x:width/2+(x+Math.cos(angle)*dx)*projection,y:height*.48+(height*(layout.panelTop/100-.48)+y+dy)*projection};
 });
 return {left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y))};
}
test('reading pairs have clear space between their full frames on phones, tablets and desktop', () => {
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1365,650],[1440,740],[1365,936],[1440,900],[2560,1080]]) {
  const layout=galleryLayout(width,height,width-15), pose=galleryCardPose(0,0,4);
  const a=bounds(width,height,layout,pose,-1,0), b=bounds(width,height,layout,pose,1,0);
  assert.ok(layout.vertical ? a.bottom+32<b.top : a.right+20<b.left, `reading pair overlaps at ${width}x${height}`);
 }
});
test('successive rows do not visibly pile on top of one another during outward travel', () => {
 for(const [width,height] of [[390,844],[768,1024],[1365,650],[1440,740],[1365,936],[1440,900],[2560,1080]]) {
  const layout=galleryLayout(width,height,width-15);
  for(let p=0;p<.76;p+=.0005) {
   for(let row=0;row<3;row++) {
    const outgoing=galleryCardPose(p,row,4), incoming=galleryCardPose(p,row+1,4);
    if(outgoing.opacity<.1 || incoming.opacity<.1) continue;
    for(const side of [-1,1]) {
     const a=bounds(width,height,layout,outgoing,side,row), b=bounds(width,height,layout,incoming,side,row+1);
     const overlapX=Math.min(a.right,b.right)-Math.max(a.left,b.left);
     const overlapY=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
     assert.ok(overlapX<=0 || overlapY<=0, `rows overlap at ${width}x${height}, progress ${p}`);
    }
   }
  }
 }
});


test('short desktop windows reserve space for titles, captions and navigation', () => {
 for (const [width,height] of [[1365,650],[1440,740]]) {
  const layout=galleryLayout(width,height,width-15), pose=galleryCardPose(0,0,4);
  assert.equal(layout.compact,true);
  const frame=bounds(width,height,layout,pose,-1,0);
  assert.ok(frame.top>120);
  assert.ok(frame.bottom+55<height-80-44);
 }
});
