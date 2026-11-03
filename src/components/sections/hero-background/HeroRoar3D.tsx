"use client";
import {useEffect,useRef,useSyncExternalStore,type CSSProperties} from "react";
import {useIntroLifecycle} from "@/components/ui/IntroLifecycle";
import model from "@/lib/hero-roar/model.json";
import {roarProfile,pointerTilt,dampTilt,settledTilt} from "@/lib/hero-roar/motion.mjs";
import type {RoarEngine} from "@/lib/hero-roar/engine";
import styles from "./HeroRoar3D.module.css";

type Props={quality?:"auto"|"desktop"|"mobile";maxTiltX?:number;maxTiltY?:number;responseMs?:number;/** Inspection only: export the neutral transparent frame. */exportRequest?:number;onPoster?:(blob:Blob)=>void};
const desktopQuery = "(min-width: 768px) and (hover: hover) and (pointer: fine)";
const subscribeDesktop = (notify: () => void) => {
 const media = matchMedia(desktopQuery); media.addEventListener("change", notify);
 return () => media.removeEventListener("change", notify);
};
export default function HeroRoar3D(props: Props) {
 const desktop = useSyncExternalStore(subscribeDesktop, () => matchMedia(desktopQuery).matches, () => false);
 return desktop && props.quality !== "mobile" ? <DesktopRoar {...props} /> : <span className="lion-roar-text" data-roar-flat>ROAR</span>;
}
function DesktopRoar({quality="auto",maxTiltX=7,maxTiltY=12,responseMs=240,exportRequest=0,onPoster}:Props){
 const root=useRef<HTMLSpanElement>(null),surface=useRef<HTMLSpanElement>(null),engineRef=useRef<RoarEngine|undefined>(undefined);
 const exported=useRef(0);const {released}=useIntroLifecycle();
 useEffect(()=>{
  const host=root.current,canvas=surface.current;if(!host||!canvas)return;
  const fine=matchMedia("(hover: hover) and (pointer: fine)"),reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
  let disposed=false,visible=false,ready=false,loading=false,failed=false,frame=0,last=0,lastPaint=0,generation=0;
  let profile=roarProfile(quality,innerWidth,fine.matches),tilt={x:0,y:0},target={x:0,y:0};
  const allowed=()=>visible&&!document.hidden&&!host.closest("[data-opening-hero]")?.hasAttribute("inert");
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;lastPaint=0;host.dataset.animationActive="false";};
  const fail=()=>{failed=true;ready=false;stop();host.dataset.ready="false";host.dataset.mode="poster";engineRef.current?.dispose();engineRef.current=undefined;wake();};
  const paint=(now:number)=>{
   frame=0;if(!allowed()){stop();return;}
   if(lastPaint&&now-lastPaint<1000/(profile==="mobile"?30:60)-1){frame=requestAnimationFrame(paint);return;}
   lastPaint=now;
   const seconds=last?(now-last)/1000:1/60;last=now;
   tilt=reduced.matches||!fine.matches||profile==="mobile"?{x:0,y:0}:dampTilt(tilt,target,seconds,responseMs);
   if(settledTilt(tilt,target))tilt={...target};
   if(ready&&engineRef.current){engineRef.current.render(tilt.x,tilt.y);host.dataset.ready=String(ready);}
   if(!ready){host.style.setProperty("--roar-x",`${tilt.x*180/Math.PI}deg`);host.style.setProperty("--roar-y",`${tilt.y*180/Math.PI}deg`);}
   host.dataset.tiltX=String(tilt.x*180/Math.PI);host.dataset.tiltY=String(tilt.y*180/Math.PI);
   if(!reduced.matches&&fine.matches&&profile==="desktop"&&!settledTilt(tilt,target)){host.dataset.animationActive="true";frame=requestAnimationFrame(paint);}
   else stop();
  };
  const wake=()=>{if(allowed()&&!frame){host.dataset.animationActive="true";frame=requestAnimationFrame(paint);}};
  async function load(){
   if(disposed||failed||ready||loading||!released||!allowed()||profile==="mobile"||reduced.matches||connection?.saveData)return;
   loading=true;const token=++generation;
   host!.dataset.initCount=String(Number(host!.dataset.initCount||0)+1);
   try{
    const {RoarEngine}=await import("@/lib/hero-roar/engine");
    if(disposed||token!==generation)return;
    const next=new RoarEngine(canvas!,()=>{if(token===generation&&!disposed)fail();});engineRef.current=next;
    const debug=process.env.NODE_ENV!=="production"?new URLSearchParams(location.search):null;
    if(debug?.has("roarFail"))throw Error("Inspection fallback");
    await next.init(profile,debug?.has("roarWebGL")??false);
    if(disposed||failed||token!==generation){next.dispose();return;}
    ready=true;host!.dataset.mode="3d";host!.dataset.quality=profile;wake();
   }catch{if(token===generation&&!disposed)fail();}
   finally{if(token===generation)loading=false;}
  }
  const resize=()=>{
   const nextProfile=roarProfile(quality,innerWidth,fine.matches);
   if(profile!==nextProfile){generation++;loading=false;ready=false;profile=nextProfile;tilt={x:0,y:0};target={x:0,y:0};stop();engineRef.current?.dispose();engineRef.current=undefined;host.dataset.ready="false";void load();}
   else{engineRef.current?.resize(canvas.clientWidth,canvas.clientHeight);wake();}
  };
  const move=(event:PointerEvent)=>{
   if(event.pointerType!=="mouse"||!fine.matches||reduced.matches||profile==="mobile")return;
   const bounds=pointerHost.getBoundingClientRect();
   target=pointerTilt((event.clientX-bounds.left)/bounds.width*2-1,(event.clientY-bounds.top)/bounds.height*2-1,maxTiltX,maxTiltY);wake();
  };
  const neutral=()=>{target={x:0,y:0};if(profile==="desktop"&&!settledTilt(tilt,target))wake();};
  const media=()=>{tilt={x:0,y:0};target={x:0,y:0};resize();};
  const visibility=()=>{if(!allowed())stop();else{void load();wake();}};
  const scrollVisibility=()=>{if(!allowed())stop();else{void load();if(!settledTilt(tilt,target))wake();}};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visibility();},{threshold:.01});observer.observe(host);
  const sizes=new ResizeObserver(resize);sizes.observe(host);
  const pointerHost=host.closest<HTMLElement>(".lion-hero")??host;
  pointerHost.addEventListener("pointermove",move,{passive:true});pointerHost.addEventListener("pointerleave",neutral);
  fine.addEventListener("change",media);reduced.addEventListener("change",media);
  document.addEventListener("visibilitychange",visibility);window.addEventListener("scroll",scrollVisibility,{passive:true});
  window.addEventListener("resize",resize);
  host.dataset.ready="false";host.dataset.animationActive="false";host.dataset.mode="poster";
  return ()=>{disposed=true;generation++;stop();observer.disconnect();sizes.disconnect();pointerHost.removeEventListener("pointermove",move);pointerHost.removeEventListener("pointerleave",neutral);fine.removeEventListener("change",media);reduced.removeEventListener("change",media);document.removeEventListener("visibilitychange",visibility);window.removeEventListener("scroll",scrollVisibility);window.removeEventListener("resize",resize);engineRef.current?.dispose();engineRef.current=undefined;};
 },[released,quality,maxTiltX,maxTiltY,responseMs]);
 useEffect(()=>{
  if(!exportRequest||exportRequest===exported.current||!engineRef.current)return;
  exported.current=exportRequest;let cancelled=false;
  void engineRef.current.poster().then(blob=>{if(!cancelled)onPoster?.(blob);}).catch(()=>{});
  return ()=>{cancelled=true;};
 },[exportRequest,onPoster]);
 return <span ref={root} className={`lion-roar-text ${styles.word}`} style={{"--roar-width":model.frameWidthEm,"--roar-line-center":model.lineCenterY} as CSSProperties} data-roar-3d data-ready="false">
  <span className={styles.semantic}>ROAR</span>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img className={styles.poster} src="/models/roar/roar-placeholder.svg" alt="" aria-hidden="true" width={1536} height={575} />
  <span ref={surface} className={styles.surface} aria-hidden="true" />
 </span>;
}
