import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {roarProfile,pointerTilt,dampTilt,settledTilt} from '../../src/lib/hero-roar/motion.mjs';
const outlines=JSON.parse(fs.readFileSync('src/lib/hero-roar/outlines.json'));
function loadGLB(profile){
 const bytes=fs.readFileSync(`public/models/roar/roar-${profile}.glb`);
 assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
 const length=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+length).toString()),bin=bytes.subarray(28+length);
 const read=index=>{
  const a=json.accessors[index],v=json.bufferViews[a.bufferView],size={SCALAR:1,VEC3:3}[a.type],n={5126:4,5125:4,5123:2}[a.componentType],values=[];
  for(let i=0;i<a.count;i++)for(let j=0;j<size;j++){
   const offset=(v.byteOffset??0)+(a.byteOffset??0)+i*(v.byteStride??size*n)+j*n;
   values.push(a.componentType===5126?bin.readFloatLE(offset):a.componentType===5125?bin.readUInt32LE(offset):bin.readUInt16LE(offset));
  }
  return values;
 };
 return {bytes,json,read};
}
const holes=[];
for(const glyph of outlines.glyphs){
 const path=new THREE.ShapePath();
 for(const {command,args} of glyph.commands){const a=args.map((v,i)=>(v+(i%2?glyph.y:glyph.x))/outlines.units);if(command==='closePath')path.currentPath.closePath();else path[command](...a);}
 for(const shape of path.toShapes(false))for(const hole of shape.holes){const points=hole.getPoints(32);holes.push(points.reduce((p,q)=>p.add(q),new THREE.Vector2()).divideScalar(points.length));}
}
test('Playfair italic 500 input retains tracking and four open counters',()=>{
 assert.equal(outlines.family,'Playfair Display');assert.equal(outlines.weight,500);assert.equal(outlines.style,'Italic');assert.equal(outlines.trackingEm,-.04);assert.equal(holes.length,4);
});
for(const profile of ['desktop','mobile']){
 test(`${profile}: bounded asset size, two material meshes and finite geometry`,()=>{
  const {bytes,json,read}=loadGLB(profile);
  assert.ok(bytes.length<(profile==='desktop'?1050000:400000));assert.equal(json.meshes.length,2);
  assert.deepEqual(json.materials.map(m=>m.name).sort(),['Gold','Pearl']);
  for(const mesh of json.meshes)for(const p of mesh.primitives){const positions=read(p.attributes.POSITION),normals=read(p.attributes.NORMAL);assert.ok(positions.every(Number.isFinite));assert.ok(normals.every(n=>Number.isFinite(n)&&Math.abs(n)<=1.0001));assert.ok(read(p.indices).every(i=>i<positions.length/3));}
 });
 test(`${profile}: exported front faces leave R/O/A/R counter centers empty`,()=>{
  const {json,read}=loadGLB(profile),pearl=json.materials.findIndex(m=>m.name==='Pearl'),face=json.meshes.flatMap(m=>m.primitives).find(p=>p.material===pearl),positions=read(face.attributes.POSITION),normals=read(face.attributes.NORMAL),indices=read(face.indices);
  const point=i=>({x:positions[i*3],y:positions[i*3+1]}),sign=(p,a,b)=>(p.x-b.x)*(a.y-b.y)-(a.x-b.x)*(p.y-b.y);
  for(const hole of holes)for(let i=0;i<indices.length;i+=3){const [a,b,c]=indices.slice(i,i+3);if(normals[a*3+2]<.8)continue;const s=[sign(hole,point(a),point(b)),sign(hole,point(b),point(c)),sign(hole,point(c),point(a))];assert.ok(!(s.every(v=>v>1e-8)||s.every(v=>v< -1e-8)),'Counter covered by mesh face');}
 });
}
test('auto quality uses lighter geometry on narrow or coarse-pointer devices',()=>{
 assert.equal(roarProfile('auto',1440,true),'desktop');assert.equal(roarProfile('auto',390,true),'mobile');assert.equal(roarProfile('auto',1440,false),'mobile');assert.equal(roarProfile('mobile',1440,true),'mobile');
});
test('pointer motion stays bounded, approaches without overshoot and returns to neutral',()=>{
 const target=pointerTilt(99,-99);assert.ok(Math.abs(target.x-3*Math.PI/180)<1e-12);assert.ok(Math.abs(target.y-4*Math.PI/180)<1e-12);
 let pose={x:0,y:0};for(let i=0;i<180;i++){const next=dampTilt(pose,target,1/60);assert.ok(next.x>=pose.x&&next.x<=target.x);assert.ok(next.y>=pose.y&&next.y<=target.y);pose=next;}
 assert.ok(settledTilt(pose,target));for(let i=0;i<180;i++)pose=dampTilt(pose,{x:0,y:0},1/60);assert.ok(settledTilt(pose,{x:0,y:0}));
});
