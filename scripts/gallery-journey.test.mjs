import test from 'node:test';
import { galleryLayout, galleryRingDiameter, galleryRingCenterOffset, galleryFocusDepth, GALLERY_ENTRY_PROJECTION } from '../src/components/sections/gallery-layout.ts';
import assert from 'node:assert/strict';
import { galleryWithCarry, galleryProgress, galleryTravel, galleryCardPose, galleryRingPose, galleryEnding, galleryProjectProgress, galleryRunwayScreens, galleryStepTarget, galleryNavigationDuration, galleryNavigationEase } from '../src/components/sections/gallery-journey.ts';

test('the logo is a forward-moving exhibit that clears before early partnership copy',()=>{
 assert.equal(galleryEnding(.70).core,0);
 const first=galleryEnding(.716),middle=galleryEnding(.725),front=galleryEnding(.75);
 assert.ok(first.core>0);assert.equal(first.logo,1);
 assert.ok(first.z<middle.z&&middle.z<front.z);
 for(const p of [.75,.78,.84,.98]){const pose=galleryEnding(p);assert.equal(pose.logo,0);assert.equal(pose.title,1);assert.ok(pose.copy>.5);}
 assert.equal(galleryEnding(.84).core,0);
 for(let i=0;i<=2000;i++){
  const p=i/2000,pose=galleryEnding(p);
  if(pose.title>0)assert.equal(pose.logo,0,'The partnership headline never shares its beat with the logo');
  assert.ok(pose.z<1000&&pose.core>=0&&pose.core<=1);
 }
});

test('native gallery progress is finite and consistent across portrait and desktop viewports', () => {
 for (const viewport of [568, 844, 900, 1024]) for (const p of [0, .25, .5, .85, 1]) {
  const height = 12 * viewport;
  assert.ok(Math.abs(galleryProgress(-p * (height - viewport * .85), height, viewport) - p) < 1e-10);
 }
 for (const top of [-100000, 0, 100000]) assert.ok(Number.isFinite(galleryProgress(top, 0, 0)));
});


test('the service gather matches the projected gallery center on desktop and portrait', () => {
 for (const [width, height] of [[320,568], [390,844], [768,1024], [1024,768], [1440,900], [2560,1080]]) {
  const layout = galleryLayout(width, height, width - 15);
  const vanishingY = height * .48;
  const projectedY = vanishingY + (height * layout.panelTop / 100 - vanishingY) / GALLERY_ENTRY_PROJECTION;
  assert.ok(Math.abs(layout.gatherY - projectedY) < .001, `service/gallery center mismatch at ${width}x${height}`);
 }
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

test('the carried artwork leads ten unique project stops', () => {
 const projects=Array.from({length:12},(_,i)=>({slug:`work-${i}`}));
 for(const carry of [projects[0],projects[5],{slug:'transparent-led-concept'}]) {
  const composed=galleryWithCarry(projects,carry);
  assert.equal(composed[0],carry);
  assert.equal(composed.length,10);
  assert.equal(new Set(composed.map(work=>work.slug)).size,10);
  assert.deepEqual(composed.slice(1),projects.filter(work=>work.slug!==carry.slug).slice(0,9));
 }
 assert.equal(projects.length,12);
});


test('only the departing project and its next project are visible in either direction', () => {
  for (const count of [1, 3, 10]) {
    const seen = new Set();
    for (let tick = 0; tick <= 2000; tick++) {
      const p = tick / 2000;
      const shown = Array.from({length: count}, (_, i) => galleryCardPose(p, i, count).visible);
      assert.ok(shown.filter(Boolean).length <= 2);
      shown.forEach((visible, i) => { if (visible) seen.add(i); });
    }
    assert.equal(seen.size, count);
    for (let i = 0; i < count; i++) {
      const p = galleryProjectProgress(i, count);
      const pose = galleryCardPose(p, i, count);
      assert.ok(Math.abs(pose.advance - .26) < 1e-8);
      assert.equal(pose.opacity, 1);
      assert.equal(pose.caption, 1);
      assert.ok(Math.abs(pose.forward)<1e-10);
      assert.ok(galleryEnding(p).navigation > .99);
    }
    assert.equal(galleryCardPose(.76, count-1, count).visible, false);
  }
});

test('departure starts after the reading hold and accelerates through the viewing plane', () => {
  const at = advance => {
    let lo = 0, hi = .76;
    for (let i = 0; i < 45; i++) {
      const mid = (lo + hi) / 2;
      if (galleryTravel(mid, 10) / 1600 < advance) lo = mid; else hi = mid;
    }
    return galleryCardPose((lo + hi) / 2, 0, 10);
  };
  const a = at(.40), b = at(.52), c = at(.64), d = at(.76);
  assert.ok(b.forward-a.forward < c.forward-b.forward);
  assert.ok(c.forward-b.forward < d.forward-c.forward);
  assert.equal(at(.57).caption, 0);
  assert.equal(at(.85).visible, true);
  assert.equal(at(.36).dissolve,0);
  assert.equal(at(.72).dissolve,0);
  assert.ok(at(.8).dissolve>0&&at(.8).dissolve<.2);
  assert.ok(at(.98).dissolve>0);
  assert.ok(at(.96).z>850);
  assert.ok(at(.85).z>at(.65).z);
  assert.ok(galleryRunwayScreens(10) < 17);
});

test('a single circle encloses artwork and metadata on each screen size', () => {
  for (const [w,h] of [[320,568],[390,844],[768,1024],[1366,520],[1440,900],[2560,1440]]) {
    const layout = galleryLayout(w,h,w-15,16);
    const total = layout.panelWidth*(layout.vertical?.75:11/16)+layout.captionAllowance+layout.captionGap;
    const diameter = galleryRingDiameter(layout);
    assert.ok(diameter > Math.hypot(layout.panelWidth, total));
    assert.ok(diameter <= Math.min(w-15,h));
    assert.equal(galleryRingCenterOffset(layout),(layout.captionAllowance+layout.captionGap)/2);
    assert.ok(Number.isFinite(galleryFocusDepth(layout,w,h,16)));
  }
});

test('rings surround the reading position, remain ahead in depth, and pass beyond the frame', () => {
 for(const count of [1,3,10]) for(let index=0;index<count;index++) {
  const p=galleryProjectProgress(index,count), card=galleryCardPose(p,index,count);
  assert.ok(Math.abs(galleryRingPose(p,index,count).z-card.z)<1e-9);
  if(index+1<count) {
   const next=galleryRingPose(p,index+1,count);
   assert.ok(next.z<card.z-1000);
   assert.ok(next.visible);
  }
 }
 const points=Array.from({length:1001},(_,i)=>i/1000);
 const poses=p=>[galleryCardPose(p,4,10),galleryRingPose(p,4,10),galleryEnding(p)];
 assert.deepEqual(points.map(poses).reverse(),points.toReversed().map(poses));
 for(const p of points) {
  for(const pose of poses(p)) for(const value of Object.values(pose)) if(typeof value==='number')assert.ok(Number.isFinite(value));
  assert.ok(galleryRingPose(p,4,10).z<=900);
 }
});


