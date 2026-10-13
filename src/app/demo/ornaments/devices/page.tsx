"use client";
import {useState} from "react";
/** A real child viewport keeps breakpoint inspection independent of app-tab focus. */
export default function DeviceReview(){
 const [width,setWidth]=useState(1000),[view,setView]=useState("/#about");
 return <main style={{minHeight:"100dvh",background:"#171412",color:"#fff8e9",padding:16,width:"max-content",minWidth:"100%"}}>
  <nav aria-label="Responsive inspection" style={{display:"flex",gap:16,alignItems:"center",height:40}}>
   <label>Viewport width <select value={width} onChange={e=>setWidth(Number(e.target.value))}>{[390,768,999,1000,1001,1440].map(w=><option key={w} value={w}>{w}px</option>)}</select></label>
   <label>Section <select value={view} onChange={e=>setView(e.target.value)}><option value="/#about">Comparison</option><option value="/">Hero</option><option value="/#footer-compact">Footer</option><option value="/demo/ornaments/roar?roarWebGL">WebGL2 word</option><option value="/demo/ornaments/roar?roarFail">Poster fallback</option></select></label>
  </nav>
  <iframe title="Website preview" src={view} style={{display:"block",width,height:900,border:0,background:"#08080a",marginTop:12}} />
 </main>;
}
