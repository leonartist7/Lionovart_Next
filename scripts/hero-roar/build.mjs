import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import {mergeGeometries,mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
const doc=JSON.parse(fs.readFileSync('src/lib/hero-roar/outlines.json','utf8'));
const recipe=JSON.parse(fs.readFileSync('src/lib/pearl-gold/material-recipe.json','utf8')).materials;
// Exporter's browser FileReader API, backed by Node's built-in Blob.
globalThis.FileReader=class {
 readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();});}
 readAsDataURL(blob){blob.arrayBuffer().then(value=>{this.result='data:'+blob.type+';base64,'+Buffer.from(value).toString('base64');this.onloadend?.();});}
};
export function shapes(glyph,tolerance=.0003){
 const path=new THREE.ShapePath(),n=doc.units;
 for(const {command,args} of glyph.commands){
  const a=args.map((value,index)=>(value+(index%2?glyph.y:glyph.x))/n);
  if(command==='moveTo')path.moveTo(...a);
  else if(command==='lineTo')path.lineTo(...a);
  else if(command==='quadraticCurveTo')path.quadraticCurveTo(...a);
  else if(command==='bezierCurveTo')path.bezierCurveTo(...a);
  else if(command==='closePath')path.currentPath.closePath();
 }
 // Adaptive tessellation spends vertices on curvature, not short straight spans.
 const sampled=new THREE.ShapePath();
 const distance=(point,a,b)=>{
  const delta=b.clone().sub(a),length=delta.lengthSq();
  const t=length?THREE.MathUtils.clamp(point.clone().sub(a).dot(delta)/length,0,1):0;
  return point.distanceTo(a.clone().addScaledVector(delta,t));
 };
 for(const contour of path.subPaths){
  const first=contour.curves[0].getPoint(0);sampled.moveTo(first.x,first.y);
  for(const curve of contour.curves){
   const divide=(lo,hi,depth)=>{
    const a=curve.getPoint(lo),b=curve.getPoint(hi);
    const error=Math.max(...[.25,.5,.75].map(t=>distance(curve.getPoint(lo+(hi-lo)*t),a,b)));
    if(error<=tolerance||depth>=12)sampled.lineTo(b.x,b.y);
    else {const middle=(lo+hi)/2;divide(lo,middle,depth+1);divide(middle,hi,depth+1);}
   };
   divide(0,1,0);
  }
  sampled.currentPath.closePath();
 }
 return sampled.toShapes(false);
}
function groupGeometry(geometry,group){
 const result=new THREE.BufferGeometry();
 for(const [name,attribute] of Object.entries(geometry.attributes)){
  result.setAttribute(name,new THREE.BufferAttribute(attribute.array.slice(group.start*attribute.itemSize,(group.start+group.count)*attribute.itemSize),attribute.itemSize));
 }
 return result;
}
fs.mkdirSync('public/models/roar',{recursive:true});
const materials=[new THREE.MeshStandardMaterial({name:'Pearl',color:recipe.pearl.base[2],roughness:.43,metalness:.04}),new THREE.MeshStandardMaterial({name:'Gold',color:recipe.gold.base[2],roughness:.24,metalness:1})];
const stats={};let bounds;
for(const [profile,tolerance,bevel] of [['desktop',.0003,4],['mobile',.0008,2]]){
 const parts=[[],[]];let holes=0;
 for(const glyph of doc.glyphs){
  const contours=shapes(glyph,tolerance);holes+=contours.reduce((n,shape)=>n+shape.holes.length,0);
  const geometry=new THREE.ExtrudeGeometry(contours,{depth:.03,bevelEnabled:true,bevelThickness:.008,bevelSize:.009,bevelSegments:bevel,curveSegments:1,steps:1,material:0,extrudeMaterial:1});
  geometry.computeBoundingBox();
  const box=geometry.boundingBox,positions=geometry.attributes.position,normals=geometry.attributes.normal;
  const w=box.max.x-box.min.x,h=box.max.y-box.min.y,amplitude=.012;
  // A shallow crown bends face and edging together, producing broad satin light.
  for(let i=0;i<positions.count;i++){
   const x=(positions.getX(i)-box.min.x)/w*Math.PI,y=(positions.getY(i)-box.min.y)/h*Math.PI;
   positions.setZ(i,positions.getZ(i)+amplitude*Math.sin(x)*Math.sin(y));
   const dx=amplitude*Math.PI/w*Math.cos(x)*Math.sin(y),dy=amplitude*Math.PI/h*Math.sin(x)*Math.cos(y),nz=normals.getZ(i);
   const normal=new THREE.Vector3(normals.getX(i)-dx*nz,normals.getY(i)-dy*nz,nz).normalize();
   normals.setXYZ(i,normal.x,normal.y,normal.z);
  }
  geometry.deleteAttribute('uv');geometry.normalizeNormals();
  for(const group of geometry.groups)parts[group.materialIndex].push(groupGeometry(geometry,group));
  geometry.dispose();
 }
 if(holes!==4)throw Error('The four R/O/A/R counters must remain open. Found '+holes);
 const root=new THREE.Group();root.name='ROAR';
 let triangles=0;
 parts.forEach((geometries,index)=>{
  const merged=mergeGeometries(geometries,false),geometry=mergeVertices(merged,1e-5);
  merged.dispose();geometries.forEach(g=>g.dispose());
  const mesh=new THREE.Mesh(geometry,materials[index]);mesh.name=index?'Gold':'Pearl';root.add(mesh);
  triangles+=geometry.index.count/3;
 });
 bounds=new THREE.Box3().setFromObject(root);
 const bytes=await new GLTFExporter().parseAsync(root,{binary:true});
 fs.writeFileSync(`public/models/roar/roar-${profile}.glb`,Buffer.from(bytes));
 stats[profile]={triangles,bytes:bytes.byteLength,meshes:root.children.length,counters:holes,sha256:crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex')};
 root.children.forEach(mesh=>mesh.geometry.dispose());
}
const metadata={version:1,family:doc.family,style:doc.style,weight:doc.weight,advanceEm:doc.advanceEm,frameWidthEm:doc.advanceEm+.12,lineCenterY:doc.lineCenterY,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},profiles:stats};
fs.writeFileSync('src/lib/hero-roar/model.json',JSON.stringify(metadata,null,2)+'\n');
// An exact-outline vector placeholder remains usable before the rendered poster exists.
const number=v=>Number(v.toFixed(3));
const pathFor=glyph=>glyph.commands.map(({command,args})=>{
 const a=args.map((v,i)=>number(v+(i%2?glyph.y:glyph.x)));
 return ({moveTo:'M',lineTo:'L',quadraticCurveTo:'Q',bezierCurveTo:'C',closePath:'Z'}[command])+a.join(' ');
}).join('');
const stops=(colors)=>colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('');
const paths=doc.glyphs.map(g=>`<path d="${pathFor(g)}"/>`).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 ${-(doc.lineCenterY+.5)*doc.units} ${(doc.advanceEm+.12)*doc.units} ${doc.units}" aria-label="ROAR"><defs><linearGradient id="pearl" x2=".3" y2="1">${stops(recipe.pearl.base)}</linearGradient><linearGradient id="gold" x2=".8" y2="1">${stops(recipe.gold.edge)}</linearGradient></defs><g transform="scale(1,-1)"><g transform="translate(0,-10)" fill="#795329">${paths}</g><g fill="url(#pearl)" stroke="url(#gold)" stroke-width="10" stroke-linejoin="round">${paths}</g></g></svg>`;
fs.writeFileSync('public/models/roar/roar-placeholder.svg',svg);
console.log(JSON.stringify(metadata.profiles,null,2));
