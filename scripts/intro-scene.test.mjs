import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fitScene } from '../src/components/ui/intro-scene.ts';
const source=JSON.parse(fs.readFileSync(new URL('../public/animations/intro.json',import.meta.url),'utf8'));
for(const [w,h] of [[320,568],[390,844],[844,390],[768,1024],[1024,768],[1440,900],[3840,2160]]) {
 test(`${w}x${h}: centered, uncropped artwork and corner-covering wipes`,()=>{
  const original=structuredClone(source),scene=fitScene(source,w,h);
  assert.deepEqual(source,original,'resizing must not mutate shared source');
  assert.ok(Math.abs(scene.w/scene.h-w/h)<1e-9);
  assert.ok(scene.w>=800&&scene.h>=600);
  assert.deepEqual(scene.layers.find(l=>l.ind===0).ks.p.k,[(scene.w-800)/2,(scene.h-600)/2]);
  assert.deepEqual(scene.layers.find(l=>l.ind===77).shapes[0].s.k,[scene.w,scene.h]);
  for(const id of [60,62,64,66,68,70]) assert.ok(scene.layers.find(l=>l.ind===id).shapes[0].s.k[0]>=Math.hypot(scene.w,scene.h));
  assert.equal((scene.op-scene.ip)/scene.fr,5,'preserve original five-second duration');
  for(const layer of scene.layers) {
   const old=source.layers.find(l=>l.ind===layer.ind);
   for(let i=0;i<(layer.shapes||[]).length;i++) if(layer.shapes[i].c) assert.deepEqual(layer.shapes[i].c,old.shapes[i].c,'preserve original colors');
  }
 });
}
