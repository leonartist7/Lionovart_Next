import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseScrollStop, parseScrollMode, readyToSettle, SCROLL_MODES, scrollEase, settleDuration } from '../src/components/experience/scroll-policy.ts';

for (const viewport of [844, 900, 1024]) {
  const start = 50, span = viewport * 2.6;
  const stops = [
    { id: 'hero', y: start, kind: 'opening' },
    { id: 'film', y: start + span * .36, kind: 'opening' },
    { id: 'cards', y: start + span * .84, kind: 'opening' },
  ];
  const scenes = [{ start, end: start + span, kind: 'opening', stops }];
  const pick = (mode, p, from, direction = 1) => chooseScrollStop({ mode, y: start + span * p, gestureStart: start + span * from, direction, viewport, scenes, boundaries: [] });
  test(`${viewport}px: free flow never settles; gentle mode protects film and card holds`, () => {
    assert.equal(pick('flow', .3, .1), undefined);
    assert.equal(pick('settle', .3, .2)?.id, 'film');
    assert.equal(pick('settle', .43, .36), undefined);
    assert.equal(pick('settle', .6, .55)?.id, 'cards');
    assert.equal(pick('settle', .92, .84), undefined);
    assert.equal(pick('settle', .5, .6, -1)?.id, 'film');
  });
  test(`${viewport}px: cinematic advances one resting point, in either direction`, () => {
    assert.equal(pick('cinema', .1, 0)?.id, 'film');
    assert.equal(pick('cinema', .4, .36)?.id, 'cards');
    assert.equal(pick('cinema', .8, .84, -1)?.id, 'film');
    assert.equal(pick('cinema', .37, .36), undefined, 'tiny gestures do not advance');
    assert.equal(pick('cinema', .9, .84), undefined, 'never auto-skip Imagine');
  });
  test(`${viewport}px: reading content is free; only nearby section boundaries settle`, () => {
    const boundary = { id: 'about', y: 6000, kind: 'section' };
    const context = { mode: 'settle', gestureStart: 5500, direction: 1, viewport, scenes, boundaries: [boundary] };
    assert.equal(chooseScrollStop({ ...context, y: 5700 }), undefined);
    assert.equal(chooseScrollStop({ ...context, y: 6000 - viewport * .1 })?.id, 'about');
    assert.equal(chooseScrollStop({ ...context, y: 6000 - viewport * .1, direction: -1 }), undefined);
    assert.equal(chooseScrollStop({ ...context, y: 5990, gestureStart: 5990 }), undefined, 'programmatic scroll is not a gesture');
  });
}
test('modes and easing stay bounded and give mobile enough runway', () => {
  assert.equal(parseScrollMode('unexpected'), 'settle');
  assert.equal(parseScrollMode('cinema'), 'cinema');
  for (const profile of Object.values(SCROLL_MODES)) assert.ok(profile.mobileSpan >= profile.span);
  let previous = 0;
  for (let i = 0; i <= 100; i++) { const value = scrollEase(i / 100); assert.ok(value >= previous && value <= 1); previous = value; }
  assert.equal(scrollEase(0), 0); assert.equal(scrollEase(1), 1);
});
test('guided exit needs a fresh gesture after the card resting point', () => {
  const stops = [{ id: 'film', y: 936 }, { id: 'cards', y: 2184 }, { id: 'imagine', y: 3600 }];
  const context = { mode: 'cinema', viewport: 1000, scenes: [{ start: 0, end: 2600, extent: 3600, kind: 'opening', stops }], boundaries: [] };
  assert.equal(chooseScrollStop({ ...context, y: 2264, gestureStart: 2184, direction: 1 })?.id, 'imagine');
  assert.equal(chooseScrollStop({ ...context, y: 2184, gestureStart: 2184, direction: 1 }), undefined);
  assert.equal(chooseScrollStop({ ...context, y: 3450, gestureStart: 3600, direction: -1 })?.id, 'cards');
});
test('settling waits for a released gesture and the end of Lenis inertia', () => {
  const ready = { touching: false, quietFor: 160, velocity: .5, remaining: 5 };
  assert.equal(readyToSettle(ready), true);
  assert.equal(readyToSettle({ ...ready, touching: true }), false);
  assert.equal(readyToSettle({ ...ready, quietFor: 80 }), false);
  assert.equal(readyToSettle({ ...ready, velocity: 6 }), false);
  assert.equal(readyToSettle({ ...ready, remaining: 80 }), false);
  assert.equal(readyToSettle({ ...ready, velocity: -.5, remaining: -5 }), true);
});
test('small corrections finish faster than full journeys, in either direction', () => {
  assert.ok(settleDuration(50) < settleDuration(500));
  assert.ok(settleDuration(2000) <= 1.3);
  assert.ok(settleDuration(50) >= .55);
  assert.equal(settleDuration(500), settleDuration(-500));
  assert.ok(settleDuration(500, true) > settleDuration(500));
  assert.ok(settleDuration(10000, true) <= 1.45);
});

for (const viewport of [600, 844, 936, 1024]) {
  test(`${viewport}px: every release through the film/card handoff finishes in either direction`, () => {
    const span = viewport * 2.9;
    const stops = [{ id: 'film', y: span * .36 }, { id: 'cards', y: span * .84 }];
    const context = { mode: 'settle', viewport, scenes: [{ start: 0, end: span, kind: 'opening', stops }], boundaries: [] };
    for (let p = .50; p < .84; p += .01) {
      const y = span * p;
      assert.equal(chooseScrollStop({ ...context, y, gestureStart: y - 5, direction: 1 })?.id, 'cards');
      assert.equal(chooseScrollStop({ ...context, y, gestureStart: y + 5, direction: -1 })?.id, 'film');
    }
    assert.equal(chooseScrollStop({ ...context, y: span * .43, gestureStart: span * .40, direction: 1 }), undefined, 'intact film stays still');
    assert.equal(chooseScrollStop({ ...context, y: span * .92, gestureStart: span * .88, direction: 1 }), undefined, 'complete cards stay still');
    assert.equal(chooseScrollStop({ ...context, y: span * .6, gestureStart: span * .6, direction: 0 }), undefined, 'no move without physical intent');
  });
}

for (const viewport of [600, 844, 936, 1024]) {
  test(`${viewport}px: the new Imagine flip settles both ways and preserves reading holds`, () => {
    const span = viewport * 3.6;
    const stops = [{ id: 'film', y: span * .225, kind: 'opening' }, { id: 'cards', y: span * .525, kind: 'opening' }, { id: 'imagine', y: span * .9, kind: 'opening' }];
    const context = { mode: 'settle', viewport, scenes: [{ start: 0, end: span, kind: 'opening', stops }], boundaries: [] };
    const pick = (p, direction) => chooseScrollStop({ ...context, y: span * p, gestureStart: span * p - direction * 20, direction });
    for (let p = .31; p < .525; p += .01) { assert.equal(pick(p, 1)?.id, 'cards'); assert.equal(pick(p, -1)?.id, 'film'); }
    for (let p = .69; p < .9; p += .01) { assert.equal(pick(p, 1)?.id, 'imagine'); assert.equal(pick(p, -1)?.id, 'cards'); }
    assert.equal(pick(.27, 1), undefined, 'film hold');
    assert.equal(pick(.6, 1)?.id, 'imagine', 'a gesture finishes the next beat');
    assert.equal(pick(.94, 1), undefined, 'Imagine hold');
    assert.equal(pick(.94, -1)?.id, 'imagine', 'reverse arrives at the complete back face first');
  });
}

test('the expanded mobile Imagine stack reads naturally in both directions',()=>{
 const stops=[{id:'film',y:900,kind:'opening'},{id:'cards',y:2100,kind:'opening'},{id:'imagine',y:3600,kind:'opening'}];
 const context={mode:'settle',viewport:844,scenes:[{start:0,end:4000,extent:4700,kind:'opening',stops}],boundaries:[]};
 assert.equal(chooseScrollStop({...context,y:3800,gestureStart:3830,direction:-1}),undefined);
 assert.equal(chooseScrollStop({...context,y:4250,gestureStart:4220,direction:1}),undefined);
 assert.equal(chooseScrollStop({...context,y:3500,gestureStart:3540,direction:-1})?.id,'cards');
});

for (const viewport of [600, 844, 936]) {
 test(`${viewport}px: one fresh gesture leaves the film or cards, then stops for reading`, () => {
  const span=viewport*3.6;
  const stops=[{id:'film',y:span*.225,kind:'opening'},{id:'cards',y:span*.525,kind:'opening'},{id:'imagine',y:span*.9,kind:'opening'}];
  const context={mode:'settle',viewport,scenes:[{start:0,end:span,kind:'opening',stops}],boundaries:[]};
  for(const [index,direction,next] of [[0,1,'cards'],[1,1,'imagine'],[1,-1,'film'],[2,-1,'cards']]) {
   const start=stops[index].y;
   assert.equal(chooseScrollStop({...context,y:start+direction*60,gestureStart:start,direction})?.id,next);
   assert.equal(chooseScrollStop({...context,y:start,gestureStart:start,direction}),undefined);
  }
 });
}

test('the partnership never advances automatically in any mode or direction',()=>{
 for (const viewport of [600,844,936,1024]) {
  const span=viewport*6;
  const stops=[{id:'partnership',y:span*.76,kind:'partnership'},{id:'services',y:span-64,kind:'section'}];
  for (const mode of ['flow','settle','cinema']) for (const direction of [-1,1]) for (const p of [0,.1,.3,.45,.6,.76,.9,1]) {
   const y=span*p;
   const context={mode,viewport,scenes:[{start:0,end:span,kind:'partnership',stops}],boundaries:stops};
   assert.equal(chooseScrollStop({...context,y,gestureStart:y-direction*90,direction}),undefined);
  }
 }
});

test('Imagine cannot automatically skip to the end of the partnership',()=>{
 const viewport=936,span=viewport*3;
 const stops=[{id:'film',y:span*.225,kind:'opening'},{id:'cards',y:span*.525,kind:'opening'},{id:'imagine',y:span*.9,kind:'opening'},{id:'partnership',y:span+viewport*.756,kind:'partnership'}];
 const context={mode:'settle',viewport,scenes:[{start:0,end:span,kind:'opening',stops}],boundaries:[]};
 const start=stops[2].y;
 assert.equal(chooseScrollStop({...context,y:start+60,gestureStart:start,direction:1}),undefined);
 assert.equal(chooseScrollStop({...context,y:start,gestureStart:start,direction:1}),undefined);
});

test('boundary settling cannot cross the manual partnership in either direction',()=>{
 const viewport=1000, scenes=[{start:1000,end:4000,kind:'partnership',stops:[]}];
 const pick=(y,target,direction)=>chooseScrollStop({mode:'settle',viewport,y,gestureStart:y-direction*100,direction,scenes,boundaries:[{id:'services',y:target,kind:'section'}]});
 assert.equal(pick(960,1070,1),undefined);
 assert.equal(pick(4030,3990,-1),undefined);
 assert.equal(pick(4010,4050,1)?.id,'services','unrelated sections retain settling');
});

test('free flow only aligns nearby cards in the direction of a released gesture', () => {
 const stops = [
  { id: 'film', y: 360, kind: 'opening', label: 'Film' },
  { id: 'cards', y: 840, kind: 'opening', label: 'Cards' },
  { id: 'services', y: 1400, kind: 'section', label: 'Services' },
 ];
 const scene = { start: 0, end: 1000, timelineSpan: 1000, inlineBenefits: true, kind: 'opening', stops };
 const choose = (y, start, direction = 1, extra = {}) => chooseScrollStop({ mode: 'flow', y, gestureStart: start, direction, viewport: 844, scenes: [{ ...scene, ...extra }], boundaries: stops });
 assert.equal(choose(800, 760)?.id, 'cards');
 assert.equal(choose(880, 920, -1)?.id, 'cards');
 assert.equal(choose(800, 850, -1), undefined, 'never pulls against the gesture');
 assert.equal(choose(700, 650), undefined, 'never travels farther than the local alignment radius');
 assert.equal(choose(800, 795), undefined, 'ignores tiny gestures');
 assert.equal(choose(360, 320), undefined, 'film stays manual');
 assert.equal(choose(1380, 1320), undefined, 'services stay manual');
 assert.equal(choose(800, 760, 1, { frontReading: { start: 750, end: 900 } }), undefined, 'never interrupts reading');
});
