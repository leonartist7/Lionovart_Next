import test from 'node:test';
import { galleryLayout, galleryRingDiameter, galleryRingCenterOffset, galleryFocusDepth, GALLERY_ENTRY_PROJECTION } from '../src/components/sections/gallery-layout.ts';
import assert from 'node:assert/strict';
import { galleryWithCarry, galleryProgress, galleryTravel, galleryCardPose, galleryEnding, galleryProjectProgress, galleryRunwayScreens, galleryStepTarget, galleryNavigationDuration, galleryNavigationEase } from '../src/components/sections/gallery-journey.ts';

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

// Project the four corners, including rotation, rather than comparing unprojected CSS boxes.
function bounds(width, height, layout, pose, side, row) {
 const w=layout.panelWidth, h=w*(layout.vertical?.75:11/16);
 const angle=-side*(layout.vertical?0:4+2*pose.outward)*Math.PI/180;
 const x=side*(layout.x-pose.preview*layout.previewInset*(1000-pose.z)/1350-Math.max(0,pose.z+350)/2000*layout.centerGap+(layout.exitX-layout.x)*pose.outward);
 const y=side*(layout.y+(layout.exitY-layout.y)*pose.outward)+(row%2?-1:1)*(layout.vertical?0:height*.02)*pose.outward;
 const corners=[[-w/2,-h/2],[-w/2,h/2],[w/2,-h/2],[w/2,h/2]].map(([dx,dy])=>{
  const projection=1000/(1000-pose.z+Math.sin(angle)*dx);
  return {x:width/2+(x+Math.cos(angle)*dx)*projection,y:height*.48+(height*(layout.panelTop/100-.48)+y+dy)*projection};
 });
 return {left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y))};
}

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


test('one project is visible at a time throughout the trip in either direction', () => {
  for (const count of [1, 3, 10]) {
    const seen = new Set();
    for (let tick = 0; tick <= 2000; tick++) {
      const p = tick / 2000;
      const shown = Array.from({length: count}, (_, i) => galleryCardPose(p, i, count).visible);
      assert.ok(shown.filter(Boolean).length <= 1);
      shown.forEach((visible, i) => { if (visible) seen.add(i); });
    }
    assert.equal(seen.size, count);
    for (let i = 0; i < count; i++) {
      const p = galleryProjectProgress(i, count);
      const pose = galleryCardPose(p, i, count);
      assert.ok(Math.abs(pose.advance - .26) < 1e-8);
      assert.equal(pose.opacity, 1);
      assert.equal(pose.caption, 1);
      assert.equal(pose.outward, 0);
      assert.ok(galleryEnding(p).navigation > .99);
    }
    assert.equal(galleryCardPose(.76, count-1, count).visible, false);
  }
});

test('departure starts after the reading hold and accelerates toward the edge', () => {
  const at = advance => {
    let lo = 0, hi = .76;
    for (let i = 0; i < 45; i++) {
      const mid = (lo + hi) / 2;
      if (galleryTravel(mid, 10) / 1600 < advance) lo = mid; else hi = mid;
    }
    return galleryCardPose((lo + hi) / 2, 0, 10);
  };
  const a = at(.40), b = at(.52), c = at(.64), d = at(.76);
  assert.ok(b.outward-a.outward < c.outward-b.outward);
  assert.ok(c.outward-b.outward < d.outward-c.outward);
  assert.equal(at(.57).caption, 0);
  assert.equal(at(.83).visible, false);
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
