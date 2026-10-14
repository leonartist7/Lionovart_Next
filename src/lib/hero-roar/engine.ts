import * as THREE from "three/webgpu";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {RoomEnvironment} from "three/examples/jsm/environments/RoomEnvironment.js";
import model from "./model.json";
import { color, mix, positionLocal, smoothstep } from "three/tsl";

export type RoarQuality="desktop"|"mobile";
export class RoarEngine {
 private scene=new THREE.Scene();
 private word=new THREE.Group();
 private camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,20);
 private renderer?:THREE.WebGPURenderer;
 private environment?:THREE.RenderTarget;
 private disposed=false;
 private width=1;private height=1;private dpr=1;
 private lost=()=>{if(!this.disposed)this.onError();};
 constructor(private host:HTMLElement,private onError:()=>void){}
 async init(quality:RoarQuality,forceWebGL=false){
  for(const fallback of forceWebGL?[true]:[false,true]){
   const canvas=document.createElement("canvas");
   const renderer=new THREE.WebGPURenderer({canvas,alpha:true,antialias:true,forceWebGL:fallback});
   try{
    await renderer.init();
    if(this.disposed){renderer.dispose();return;}
    this.renderer=renderer;renderer.onDeviceLost=this.lost;
    canvas.addEventListener("webglcontextlost",this.lost);
    this.host.replaceChildren(canvas);this.host.dataset.backend=renderer.backend.constructor.name;
    break;
   }catch(error){renderer.dispose();if(fallback)throw error;}
  }
  if(!this.renderer||this.disposed)return;
  const renderer=this.renderer;
  this.dpr=Math.min(devicePixelRatio||1,quality==="mobile"?1.25:1.5);
  renderer.setPixelRatio(this.dpr);renderer.setClearColor(0,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
  const studio=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
  this.environment=pmrem.fromScene(studio,.025);studio.dispose();pmrem.dispose();
  this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.9;
  const key=new THREE.DirectionalLight(0xffefda,1.3);key.position.set(-3,4,3);
  const fill=new THREE.DirectionalLight(0xfffaf0,.3);fill.position.set(3,0,3);
  this.scene.add(key,fill,new THREE.HemisphereLight(0xfff4df,0x42301b,.35),this.word);
  const asset=`/models/roar/roar-${quality}.glb?v=${model.profiles[quality].sha256.slice(0,12)}`;this.host.dataset.asset=asset;
  const gltf=await new GLTFLoader().loadAsync(asset);
  if(this.disposed){this.disposeObject(gltf.scene);return;}
  gltf.scene.traverse(object=>{
   if(!(object instanceof THREE.Mesh))return;
   const source=object.material as THREE.MeshStandardMaterial;
   const gold=source.name==="Gold";
   const material=new THREE.MeshPhysicalNodeMaterial({
    name:source.name,color:gold?0x98703b:0xc8a365,
    metalness:1,roughness:gold?.28:.32,
    sheen:0,sheenRoughness:.7,
    clearcoat:gold?.1:.05,clearcoatRoughness:.35,ior:1.45,
   });
   const height=positionLocal.y.sub(model.bounds.min[1]).div(model.bounds.max[1]-model.bounds.min[1]).clamp(0,1);
   const base=mix(color(gold?"#7d5b28":"#aa8147"),color("#cda85c"),smoothstep(0,.55,height));
   material.colorNode=mix(base,color(gold?"#dec493":"#f1deb0"),smoothstep(.55,1,height));
   object.material=material;
   source.dispose();
  });
  gltf.scene.scale.z = 1.65;
  const bounds=new THREE.Box3().setFromObject(gltf.scene),center=bounds.getCenter(new THREE.Vector3());
  gltf.scene.position.copy(center).multiplyScalar(-1);this.word.add(gltf.scene);
  const cx=model.advanceEm/2-center.x,cy=model.lineCenterY-center.y;
  this.camera.position.set(cx+.12,cy+.06,5);this.camera.lookAt(cx,cy,0);
  this.resize(this.host.clientWidth,this.host.clientHeight);
  await renderer.compileAsync(this.scene,this.camera);
 }
 resize(width:number,height:number){
  if(!this.renderer||this.disposed)return;
  this.width=Math.max(1,width);this.height=Math.max(1,height);
  const aspect=this.width/this.height,vertical=Math.max(1,model.frameWidthEm/aspect);
  this.camera.left=-aspect*vertical/2;this.camera.right=aspect*vertical/2;
  this.camera.top=vertical/2;this.camera.bottom=-vertical/2;this.camera.updateProjectionMatrix();
  this.renderer.setSize(this.width,this.height,false);
 }
 render(x:number,y:number){
  if(!this.renderer||this.disposed)return;
  this.word.rotation.set(x - 3 * Math.PI / 180,y - 8 * Math.PI / 180,0);
  try{this.renderer.render(this.scene,this.camera);}
  catch{this.onError();}
  this.host.dataset.drawCalls=String(this.renderer.info.render.drawCalls);
  this.host.dataset.dpr=String(this.dpr);
 }
 async poster(width=1536){
  if(!this.renderer||this.disposed)throw Error("Renderer not ready");
  const size=[this.width,this.height],angle=[this.word.rotation.x,this.word.rotation.y];
  this.renderer.setPixelRatio(1);this.resize(width,Math.round(width/model.frameWidthEm));
  this.render(0,0);
  const blob=await new Promise<Blob>((resolve,reject)=>this.renderer!.domElement.toBlob(value=>value?resolve(value):reject(Error("Poster export failed")),"image/png"));
  this.renderer.setPixelRatio(this.dpr);this.resize(size[0],size[1]);this.render(angle[0],angle[1]);
  return blob;
 }
 private disposeObject(root:THREE.Object3D){
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
  root.traverse(object=>{if(object instanceof THREE.Mesh){geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).forEach(m=>materials.add(m));}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
 }
 dispose(){
  if(this.disposed)return;this.disposed=true;
  this.renderer?.domElement.removeEventListener("webglcontextlost",this.lost);
  this.disposeObject(this.scene);this.environment?.dispose();this.renderer?.dispose();this.host.replaceChildren();
 }
}
