import test from 'node:test';
import assert from 'node:assert/strict';
import { doorwayZoom, serviceGalleryHandoff } from '../src/components/sections/service-gallery-handoff.ts';

test('rear services clear before one identical frame transfers and opens into the gallery', () => {
 const at = p => serviceGalleryHandoff(990 * (1 - p), 900);
 assert.ok(at(0).gather < 1e-10);
 assert.equal(at(.3).serviceCopy, 0);
 assert.equal(at(.3).title, 0);
 for(let i=0;i<=1000;i++){
   const pose=at(i/1000);
   if(pose.title>0) {
     assert.equal(pose.podiumFace,1);
     assert.equal(pose.podiumLift,1);
     assert.equal(pose.portalPass,0);
     assert.equal(pose.serviceCopy,0);
   }
 }
 assert.equal(at(.5).gather, 1);
 assert.equal(at(.5).services, 1);
 assert.ok(at(.5).gallery < 1e-10);
 assert.equal(at(.45).spread, 0);
 assert.ok(at(.65).gallery > 0 && at(.65).services > 0);
 assert.equal(at(.65).spread,0);
 assert.equal(at(.4).serviceRear,0);
 assert.equal(at(.72).services,0);
 assert.equal(at(.72).gallery,1);
 assert.equal(at(.72).spread,0);
 assert.ok(at(.85).spread>0);
 assert.equal(at(.5).title, 1);
 assert.ok(at(.64).title > 0 && at(.64).title < 1);
 assert.ok(at(.18).step>.5); assert.equal(at(.18).title,0);
 assert.equal(at(.8).title, 0);
 assert.equal(at(.38).podiumLift, 1);
 assert.ok(at(.55).portalOpen < 1e-10);
 assert.equal(at(.85).portalOpen, 1);
 assert.equal(at(1).portalPass, 1);
 assert.equal(at(1).spread, 1);
 for (let p = 0; p <= 1; p += .01) assert.ok(Math.abs(at(p).services + at(p).gallery - 1) < 1e-10);
});

test('the gather and fan stay reversible, bounded and consistent across viewport sizes', () => {
 for (const h of [568, 844, 900, 1024]) for (const p of [0, .2, .5, .7, 1]) {
  const pose = serviceGalleryHandoff(h * 1.1 * (1 - p), h);
  const reference = serviceGalleryHandoff(990 * (1 - p), 900);
  for (const key of Object.keys(pose)) assert.ok(Math.abs(pose[key] - reference[key]) < 1e-10);
 }
 for (const top of [-100000, 0, 100000]) {
  for (const value of Object.values(serviceGalleryHandoff(top, 0))) assert.ok(Number.isFinite(value) && value >= 0 && value <= 1);
 }
 const points = [0, .25, .5, .75, 1];
 assert.deepEqual(points.map(p => serviceGalleryHandoff(990 * (1 - p), 900)).reverse(), points.toReversed().map(p => serviceGalleryHandoff(990 * (1 - p), 900)));
});

// A readable doorway hold separates the floor lift from aperture travel.
test('the entrance disc faces the viewer before the aperture opens in either direction', () => {
 const at = p => serviceGalleryHandoff(990 * (1 - p), 900);
 for (const p of [0, .05, .10]) {
  assert.ok(at(p).podiumLift < 1e-10);
  assert.ok(at(p).podiumFace < 1e-10);
 }
 assert.ok(at(.38).title<1e-10);
 for (const p of [.50, .55, .58]) {
  assert.equal(at(p).podiumLift, 1);
  assert.equal(at(p).podiumFace, 1);
  assert.equal(at(p).title, 1);
  assert.ok(at(p).portalOpen < 1e-10);
  assert.equal(at(p).spread, 0);
 }
 for (const p of [.56, .64, .72]) {
  assert.equal(at(p).gather, 1);
  assert.equal(at(p).spread, 0);
  assert.ok(Math.abs(at(p).services + at(p).gallery - 1) < 1e-10);
 }
});

test('the centered entrance grows toward the viewer and opens after its reading hold', () => {
 let previous=0;
 for(let i=0;i<=1000;i++) {
  const pose=doorwayZoom(i/1000),projection=pose.size/(1-pose.z/1000);
  assert.ok(projection>=previous-1e-10);
  assert.ok(pose.z<1000);
  previous=projection;
 }
 assert.equal(doorwayZoom(0).opacity,0);
 assert.ok(Math.abs(doorwayZoom(.38).size-.8)<1e-10);
 assert.equal(doorwayZoom(.38).z,0);
 assert.equal(doorwayZoom(.38).opacity,1);
 assert.equal(doorwayZoom(.68).z,0);
 assert.equal(doorwayZoom(1).z,850);
 assert.ok(previous>5);
 const points=[0,.1,.2,.38,.5,.68,.8,.94,1];
 assert.deepEqual(points.map(doorwayZoom).reverse(),points.toReversed().map(doorwayZoom));
});

