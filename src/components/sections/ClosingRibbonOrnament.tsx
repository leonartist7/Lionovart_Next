"use client";
import {createContext, useContext, useEffect, useId, useMemo, useRef} from "react";
import type {MotionValue} from "framer-motion";
import generated from "@/lib/pearl-gold/closing.generated.json";
import {revealPath, formationEase, type RibbonGeometry} from "@/lib/pearl-gold/formation.mjs";
import styles from "./ClosingCTA.module.css";

export const ClosingRevealContext = createContext<MotionValue<number> | number>(1);
type Props = {revealStart?: number; revealEnd?: number; stagger?: number; drift?: number};
const profiles=["desktop","mobile"] as const;

/** Material stays static; scrolling changes only exact cubic reveal clips. */
export default function ClosingRibbonOrnament({revealStart=.5,revealEnd=.92,stagger=.025,drift=12}:Props) {
 const progress=useContext(ClosingRevealContext),root=useRef<HTMLDivElement>(null);
 const id=useId().replace(/[^a-zA-Z0-9_-]/g,"");
 const artwork=useMemo(()=>["left","right"].flatMap(side=>profiles.map(profile=>({side,profile,
  html:generated[profile].svg.replaceAll("closingINSTANCE",`closing-${id}-${side}-${profile}`)
 }))),[id]);
 useEffect(()=>{
  const host=root.current;if(!host)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)"),mobile=matchMedia("(max-width: 639px)");
  const groups=artwork.map(({side,profile})=>{
   const element=host.querySelector<HTMLElement>(`[data-side="${side}"][data-profile="${profile}"]`)!;
   return {element,profile,layers:generated[profile].ribbons.map(r=>({geometry:r as unknown as RibbonGeometry,
    nodes:element.querySelectorAll<SVGPathElement>(`[data-reveal-ribbon="${r.id}"], [data-shadow-caster="${r.id}"], [data-receiver-ribbon="${r.id}"]`)}))};
  });
  let visible=false,frame=0,last=-1;
  const read=()=>typeof progress==="number"?progress:progress.get();
  const paint=()=>{
   frame=0;
   host.dataset.animationActive="false";
   const value=reduced.matches?1:Math.max(0,Math.min(1,(read()-revealStart)/Math.max(.01,revealEnd-revealStart)));
   if(value===last)return;last=value;
   for(const group of groups)group.layers.forEach((layer,index)=>{
    const delay=index*Math.min(.1,Math.max(0,stagger));
    const p=formationEase(Math.max(0,Math.min(1,(value-delay)/(1-delay))));
    layer.nodes.forEach(node=>node.setAttribute("d",revealPath(layer.geometry,p)));
   });
   host.style.setProperty("--ribbon-drift",`${(1-value)*Math.max(0,Math.min(mobile.matches?6:12,drift))}px`);
   host.dataset.reveal=String(value);host.dataset.animationActive="false";
  };
  const update=()=>{if(visible&&!document.hidden&&!frame){host.dataset.animationActive="true";frame=requestAnimationFrame(paint);}};
  const resize=()=>{last=-1;update();};
  const unsubscribe=typeof progress==="number"?()=>{}:progress.on("change",update);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)update();else{cancelAnimationFrame(frame);frame=0;host.dataset.animationActive="false";}},{threshold:.01});
  observer.observe(host);paint();
  reduced.addEventListener("change",resize);mobile.addEventListener("change",resize);document.addEventListener("visibilitychange",update);
  return ()=>{unsubscribe();observer.disconnect();cancelAnimationFrame(frame);reduced.removeEventListener("change",resize);mobile.removeEventListener("change",resize);document.removeEventListener("visibilitychange",update);};
 },[artwork,progress,revealStart,revealEnd,stagger,drift]);
 return <div ref={root} className={styles.ornament} aria-hidden="true" data-closing-ribbons>
  {artwork.map(({side,profile,html})=><div key={side+profile} data-side={side} data-profile={profile} dangerouslySetInnerHTML={{__html:html}} />)}
 </div>;
}
