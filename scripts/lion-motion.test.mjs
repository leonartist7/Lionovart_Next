import test from 'node:test';
import assert from 'node:assert/strict';
import { goldRoute, journeyPose, journeyProgress, journeyRoute, openingPose, routePoint } from '../src/components/sections/lion-journey/motion.ts';

function fixture(width) {
  const mobile = width < 1024, height = mobile ? 760 : 720;
  const hero = {left: 0, top: 40, width, height};
  const slot = {left: width * (mobile ? .02 : .15), top: 125,
    width: mobile ? width * .38 : Math.min(330, width * .22),
    height: mobile ? Math.min(width * .44, 275) : Math.min(345, width * .24)};
  const cta = {left: width * (mobile ? .05 : .49), top: mobile ? 515 : 500, width: mobile ? width * .8 : 230, height: 48};
  const video = {left: width * .1, top: 150, width: width * .8, height: mobile ? 330 : 360};
  return {hero, slot, cta, copy: {...cta, height: 170}, video,
    videoSection: hero, proof: {...hero, top: 650, height: 80},
    bridge: {...hero, top: 1750, height: 300}, reveal: {...hero, top: 2050, height: 900},
    end: 520, mobile};
}

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`${width}px: lion travels directly toward the film and faces forward`, () => {
    const anchors = fixture(width);
    const route = journeyRoute(anchors);
    assert.equal(route.length, 3, 'no intermediate title waypoint');
    const first = journeyPose(0, anchors), last = journeyPose(1, anchors);
    assert.ok(first.size <= (anchors.mobile ? 260 : 300), 'lion remains secondary to the headline');
    assert.ok(first.turn > .35 && Math.abs(last.turn) < .001);
    assert.ok(last.size < first.size);
    assert.ok(Math.abs(last.x - anchors.video.left - anchors.video.width / 2) < .001);
    let previous = first;
    for (let i = 1; i <= 1000; i++) {
      const pose = journeyPose(i / 1000, anchors);
      assert.ok(Math.hypot(pose.x - previous.x, pose.y - previous.y) < 8);
      assert.ok(pose.turn <= previous.turn + 1e-9);
      assert.ok(pose.x >= 0 && pose.x <= width);
      previous = pose;
    }
    assert.equal(journeyProgress(anchors.end, anchors), 1);
  });

  test(`${width}px: gold strands orbit the head and clear the invitation`, () => {
    const anchors = fixture(width), route = goldRoute(anchors);
    const lion = journeyPose(0, anchors);
    assert.equal(route.length, 17);
    assert.ok(Math.hypot(route[0].x - route.at(-1).x, route[0].y - route.at(-1).y) < .001);
    for (let i = 0; i <= 100; i++) {
      const p = routePoint(route, i / 100);
      assert.ok(p.x >= 0 && p.x <= width, `x=${p.x}`);
      assert.ok(p.y >= anchors.hero.top && p.y <= anchors.hero.top + anchors.hero.height);
      assert.ok(Math.abs(p.x - lion.x) <= lion.size * .7);
      assert.ok(Math.abs(p.y - lion.y) <= lion.size * .52);
      assert.ok(p.x < anchors.cta.left || p.x > anchors.cta.left + anchors.cta.width || p.y < anchors.cta.top || p.y > anchors.cta.top + anchors.cta.height,
        'orbit does not cross the CTA');
    }
  });
}

test('sticky motion reverses along the same screen path', () => {
  const anchors = fixture(1440);
  const opening = {left: 0, top: 40, width: 1440, height: 1692};
  const stageHeight = 720, runway = opening.height - stageHeight;
  const samples = [0, .12, .25, .49, .7, 1].map(t => opening.top + runway * t);
  for (const scroll of samples) {
    const a = openingPose(scroll, anchors, opening, stageHeight);
    const b = openingPose(scroll, anchors, opening, stageHeight);
    assert.deepEqual(a, b);
    assert.ok(a.turn >= -1e-9 && a.turn <= .4 + 1e-9);
  }
  assert.ok(Math.abs(openingPose(samples[3], anchors, opening, stageHeight).turn) < .001);
});
