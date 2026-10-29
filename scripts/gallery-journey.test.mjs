import test from 'node:test';
import { galleryLayout, GALLERY_ENTRY_PROJECTION } from '../src/components/sections/gallery-layout.ts';
import assert from 'node:assert/strict';
import { galleryProgress, galleryTravel, galleryCardPose, galleryEnding, galleryTitlePose, galleryPairProgress, galleryRunwayScreens, galleryStepTarget, galleryNavigationDuration, galleryNavigationEase } from '../src/components/sections/gallery-journey.ts';

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
 for(const [width,height] of [[320,568],[360,640],[390,844],[390,1180],[768,1024],[1024,768]]) {
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
 assert.ok(desktop.exitX - desktop.x <= 20);
 assert.ok(desktop.x > desktop.panelWidth / 2);
 assert.equal(desktop.panelTop,47);
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
 assert.ok(galleryRunwayScreens(4) > 10);
 assert.ok(galleryRunwayScreens(4) < 12);
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
 const angle=-side*(layout.vertical?0:4+2*pose.outward)*Math.PI/180;
 const x=side*(layout.x-pose.preview*layout.previewInset-Math.max(0,pose.z+350)/2000*layout.centerGap+(layout.exitX-layout.x)*pose.outward);
 const y=side*(layout.y+(layout.exitY-layout.y)*pose.outward)+(row%2?-1:1)*(layout.vertical?0:height*.02)*pose.outward;
 const corners=[[-w/2,-h/2],[-w/2,h/2],[w/2,-h/2],[w/2,h/2]].map(([dx,dy])=>{
  const projection=1000/(1000-pose.z+Math.sin(angle)*dx);
  return {x:width/2+(x+Math.cos(angle)*dx)*projection,y:height*.48+(height*(layout.panelTop/100-.48)+y+dy)*projection};
 });
 return {left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y))};
}
test('reading pairs have clear space between their full frames on phones, tablets and desktop', () => {
 for(const [width,height] of [[320,568],[360,640],[390,844],[768,1024],[1024,768],[1365,650],[1440,740],[1365,936],[1440,900],[2560,1080]]) {
  const layout=galleryLayout(width,height,width-15), pose=galleryCardPose(0,0,4);
  const a=bounds(width,height,layout,pose,-1,0), b=bounds(width,height,layout,pose,1,0);
  assert.ok(layout.vertical ? a.bottom+32<b.top : a.right+20<b.left, `reading pair overlaps at ${width}x${height}`);
 }
});
test('upcoming rows stay visible behind the current pair without competing at full opacity', () => {
 for(let row=0;row<4;row++) {
  const p=galleryPairProgress(row,4), front=galleryCardPose(p,row,4);
  assert.equal(front.opacity,1);
  for(let next=row+1;next<4;next++) {
   const back=galleryCardPose(p,next,4);
   assert.equal(back.visible,true);
   assert.ok(back.z<front.z-1000);
   assert.ok(back.opacity>0 && back.opacity<.2);
   assert.equal(back.caption,0);
  }
 }
 for(let p=0;p<=1;p+=.0005) {
  let previous=Infinity;
  for(let row=0;row<4;row++) {
   const pose=galleryCardPose(p,row,4);
   assert.ok(pose.z<150 && pose.z<=previous);
   assert.ok(pose.opacity>=0 && pose.opacity<=1);
   previous=pose.z;
  }
 }
});

test('cards reach a substantially larger readable size before a long, continuous fade', () => {
 const start=galleryCardPose(0,0,4), large=galleryCardPose(.09,0,4), fading=galleryCardPose(.13,0,4);
 assert.ok(large.opacity>.9);
 assert.ok((1000-start.z)/(1000-large.z)>1.3);
 assert.ok(fading.opacity>0 && fading.opacity<large.opacity);
 let previous=galleryCardPose(0,0,4);
 for(let p=.00001;p<=.76;p+=.00001) {
  const next=galleryCardPose(p,0,4);
  assert.ok(Math.abs(next.opacity-previous.opacity)<.002);
  assert.ok(Math.abs(next.z-previous.z)<1);
  previous=next;
 }
});

test('desktop pairs preview closer together and reopen the logo lane before erosion', () => {
 for(const [width,height] of [[1365,936],[1440,900],[1920,1080]]) {
  const content=width-15,layout=galleryLayout(width,height,content),pose=galleryCardPose(galleryPairProgress(3,4)+.15,3,4);
  const left=bounds(content,height,layout,pose,-1,3),right=bounds(content,height,layout,pose,1,3);
  const gap=right.left-left.right;
  assert.ok(gap>=Math.min(200,content*.15));
  assert.ok(gap<content*.23);
  assert.ok(layout.exitX-layout.x<=20);
 }
});

test('large opaque desktop cards remain within the window before their soft exit', () => {
 for(const [width,height] of [[1365,936],[1440,900],[1920,1080]]) {
  const content=width-15, layout=galleryLayout(width,height,content);
  for(let p=0;p<=.12;p+=.001) {
   const pose=galleryCardPose(p,0,4);
   if(pose.opacity<.9) continue;
   const left=bounds(content,height,layout,pose,-1,0),right=bounds(content,height,layout,pose,1,0);
   assert.ok(left.left>=0 && right.right<=content,`opaque frame cropped at ${width}x${height}, progress ${p}`);
   assert.ok(right.left-left.right<content*.23);
  }
 }
});

test('gallery title approaches during the intro, clears before rows and restores in reverse', () => {
 const samples=Array.from({length:1001},(_,i)=>i/1000),poses=samples.map(galleryTitlePose);
 assert.deepEqual(poses.toReversed(),samples.toReversed().map(galleryTitlePose));
 assert.equal(poses[0].opacity,0);
 assert.ok(galleryTitlePose(.5).opacity>.9);
 for(let i=1;i<poses.length;i++) {
  assert.ok(poses[i].z>=poses[i-1].z);
  assert.ok(poses[i].z<500);
  assert.ok(Math.abs(poses[i].z-poses[i-1].z)<3);
 }
 for(const p of [.9,.95,1]) assert.equal(galleryTitlePose(p).opacity,0);
});

test('erosion starts after the enlarged hold and reverses without frame or caption residue', () => {
 for(let row=0;row<4;row++) {
  const samples=Array.from({length:2001},(_,i)=>i/2000);
  const poses=samples.map(p=>galleryCardPose(p,row,4));
  assert.deepEqual(poses.toReversed(),samples.toReversed().map(p=>galleryCardPose(p,row,4)));
  let previous=0;
  for(const pose of poses) {
   assert.ok(pose.dissolve>=previous && pose.dissolve<=1);
   if(pose.advance<=.70) assert.equal(pose.dissolve,0);
   if(pose.advance>=.94) { assert.equal(pose.visible,false); assert.equal(pose.caption,0); assert.equal(pose.surfaceOpacity,0); }
   previous=pose.dissolve;
  }
 }
 const enlarged=galleryCardPose(.10,0,4);
 assert.ok(enlarged.z>30);
 assert.equal(enlarged.dissolve,0);
 assert.ok(enlarged.caption>.9);
});

test('future mobile rows emerge laterally and settle to the centered active pair', () => {
 for(const [width,height] of [[320,568],[390,844],[768,1024]]) {
  const layout=galleryLayout(width,height,width);
  for(let row=1;row<4;row++) {
   const pose=galleryCardPose(0,row,4);
   const worldOffset=pose.background*Math.max(1,(1000-pose.z)/1000)*layout.backgroundX;
   const projected=worldOffset*1000/(1000-pose.z);
   assert.ok(projected>=width*.2 && projected<=width*.36);
   assert.equal(pose.caption,0);
  }
  assert.equal(galleryCardPose(galleryPairProgress(1,4),1,4).background,0);
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

test('the inward preview shares the service release axis and restores the original positions', () => {
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900],[1920,1080]]) {
  const layout=galleryLayout(width,height,width-15),p=galleryCardPose(0,0,4);
  assert.equal(p.preview,1);
  assert.equal(layout.entryX,layout.x-p.preview*layout.previewInset);
  if(layout.vertical) { assert.equal(layout.previewInset,0); continue; }
  const left=bounds(width-15,height,layout,p,-1,0),right=bounds(width-15,height,layout,p,1,0);
  assert.ok(right.left-left.right>60 && right.left-left.right<160);
  const hold=galleryCardPose(.10,0,4);
  assert.ok(hold.preview>.3 && hold.preview<1);
  assert.equal(hold.dissolve,0);
  const open=galleryCardPose(.15,0,4);
  assert.equal(open.preview,0);
 }
 const samples=Array.from({length:2001},(_,i)=>i/2000),poses=samples.map(p=>galleryCardPose(p,0,4));
 assert.deepEqual(poses.toReversed(),samples.toReversed().map(p=>galleryCardPose(p,0,4)));
 for(let i=1;i<poses.length;i++)assert.ok(Math.abs(poses[i].preview-poses[i-1].preview)<.025);
});

test('erosion finishes sooner while its endpoints retire the complete frame', () => {
 const mid=galleryCardPose(.14,0,4);
 assert.ok(mid.outward>.7 && mid.dissolve>.7);
 for(const p of [.16,.17,.18]) {
  const pose=galleryCardPose(p,0,4);
  assert.equal(pose.dissolve,1);assert.equal(pose.visible,false);assert.equal(pose.surfaceOpacity,0);
 }
});
