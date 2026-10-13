"use client";
import {useCallback,useState} from "react";
import HeroRoar3D from "@/components/sections/hero-background/HeroRoar3D";
export default function RoarReview(){
 const [zoom,setZoom]=useState(1),[request,setRequest]=useState(0),[poster,setPoster]=useState("");
 const onPoster=useCallback((blob:Blob)=>{const reader=new FileReader();reader.onload=()=>setPoster(String(reader.result));reader.readAsDataURL(blob);},[]);
 return <main style={{minHeight:"100dvh",background:"#151210",color:"#fff8e9",padding:24}}>
  <nav aria-label="3D word inspection" style={{display:"flex",gap:16,alignItems:"center"}}>
   <label>Zoom <select value={zoom} onChange={e=>setZoom(Number(e.target.value))}><option value="1">100%</option><option value="4">400%</option></select></label>
   <button onClick={()=>setRequest(n=>n+1)}>Export neutral poster</button>
  </nav>
  <div style={{overflow:"auto",marginTop:60}}><div style={{fontSize:180*zoom,width:"max-content",lineHeight:1}}><HeroRoar3D exportRequest={request} onPoster={onPoster} /></div></div>
  {poster&&<><p>Rendered neutral poster</p>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={poster} alt="Rendered ROAR poster" style={{width:"min(100%,800px)"}} />
  </>}
 </main>;
}
