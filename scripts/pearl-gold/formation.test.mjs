import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeRibbonGeometry,revealPath,layerProgress,formationEase,evaluate} from '../../src/lib/pearl-gold/formation.mjs';
import {editingPoints,validate} from '../../src/lib/pearl-gold/engine.mjs';

for(const profile of ['desktop','tablet','mobile']) {
 const doc=JSON.parse(fs.readFileSync(`src/lib/pearl-gold/designs/hero-${profile}.json`));
 test(`${profile}: design validates and every reveal remains a finite cubic contour`,()=>{
  assert.doesNotThrow(()=>validate(doc));
  for(const ribbon of doc.ribbons){
   const {a,b}=editingPoints(ribbon,doc.style),g=makeRibbonGeometry(a,b);
   assert.equal(revealPath(g,0),'M0 0');
   assert.deepEqual(g.a[0][0],a.at(-1));
   assert.deepEqual(g.a.at(-1)[3],a[0]);
   for(let k=1;k<=100;k++){
    const d=revealPath(g,k/100);
    assert.match(d,/^M.*Z$/);
    assert.doesNotMatch(d,/NaN|Infinity|[LQAHVS]/);
   }
   // Reversing the cubic boundaries preserves the original curve exactly.
   assert.deepEqual(evaluate(g.a[0],0),a.at(-1));
  }
 });
 test(`${profile}: all references resolve and material / shadow reveals are wired`,()=>{
  const {svg}=JSON.parse(fs.readFileSync('src/lib/pearl-gold/hero.generated.json'))[profile];
  const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const [,id] of svg.matchAll(/url\(#([^)]*)\)/g))assert.ok(ids.includes(id),id);
  for(const r of doc.ribbons)assert.ok(svg.includes(`data-reveal-ribbon="${r.id}"`));
  if(doc.ribbons.length>1&&doc.style.depth>0){
   assert.ok(svg.includes('data-shadow-caster='));
   assert.ok(svg.includes('data-receiver-ribbon='));
  }
  assert.doesNotMatch(svg,/<filter|feGaussianBlur/);
  assert.match(svg,/<mask[^>]+lower/);
  assert.doesNotMatch(svg,/<image|<polygon|data:image/);
 });
}
test('formation is monotonic, staggered, and all layers finish at nine seconds',()=>{
 for(let index=0;index<4;index++){
  assert.equal(layerProgress(0,index),0);
  assert.equal(layerProgress(9000,index),1);
  let previous=0;
  for(let ms=0;ms<=9000;ms+=25){const p=layerProgress(ms,index);assert.ok(p>=previous&&p<=1);previous=p;}
 }
 assert.ok(layerProgress(4500,0)>layerProgress(4500,3));
 assert.equal(formationEase(-1),0);assert.equal(formationEase(2),1);
});

for(const profile of ['desktop','mobile']) {
 test(`${profile}: CTA material, receivers and shadows share cubic formation and lower blend`,()=>{
  const {svg,ribbons}=JSON.parse(fs.readFileSync('src/lib/pearl-gold/closing.generated.json'))[profile];
  const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const [,id] of svg.matchAll(/url\(#([^)]*)\)/g))assert.ok(ids.includes(id),id);
  assert.match(svg,/<mask[^>]+lower/);
  for(const ribbon of ribbons) {
   assert.ok(svg.includes(`data-reveal-ribbon="${ribbon.id}"`));
   for(const p of [.01,.25,.5,.75,1])assert.doesNotMatch(revealPath(ribbon,p),/NaN|Infinity|[LQAHVS]/);
  }
  assert.ok(svg.includes('data-shadow-caster='));
  assert.ok(svg.includes('data-receiver-ribbon='));
  assert.doesNotMatch(svg,/<image|<polygon|data:image/);
 });
}
