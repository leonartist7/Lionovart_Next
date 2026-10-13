"use client";
import {useState, type ReactNode} from "react";
import {ClosingRevealContext} from "@/components/sections/ClosingRibbonOrnament";

/** Repaint SVG at the inspected scale; no cached bitmap enlargement. */
export default function ReviewControls({children}:{children:ReactNode}) {
 const [progress,setProgress]=useState(1),[zoom,setZoom]=useState(1),[background,setBackground]=useState("#f7f4ef");
 const [showCopy,setShowCopy]=useState(true);
 return <div style={{height:"100dvh",display:"grid",gridTemplateRows:"auto minmax(0,1fr)",background:"#181818",color:"white"}}>
  <nav aria-label="Closing ornament review" style={{display:"flex",flexWrap:"wrap",gap:12,padding:12}}>
   <label>Handoff <select value={progress} onChange={e=>setProgress(Number(e.target.value))}>{[.5,.65,.72,.82,1].map(p=><option key={p} value={p}>{Math.round(p*100)}%</option>)}</select></label>
   <label>Zoom <select value={zoom} onChange={e=>setZoom(Number(e.target.value))}>{[1,4,8].map(z=><option key={z} value={z}>{z*100}%</option>)}</select></label>
   <label>Background <select value={background} onChange={e=>setBackground(e.target.value)}><option value="#f7f4ef">Ivory</option><option value="#090909">Dark</option><option value="checker">Checkerboard</option></select></label>
   <label><input type="checkbox" checked={showCopy} onChange={e=>setShowCopy(e.target.checked)} /> Show text</label>
  </nav>
  <div style={{overflow:"auto",background:background==="checker"?"repeating-conic-gradient(#666 0% 25%, #999 0% 50%) 0 0 / 24px 24px":background}}>
   <div style={{zoom,width:"calc(100vw - 16px)"}} data-show-copy={showCopy}><ClosingRevealContext.Provider value={progress}>{children}</ClosingRevealContext.Provider></div>
  </div>
  <style>{`[data-closing-review] #closing-cta {background:transparent} [data-show-copy="false"] [data-closing-copy], [data-show-copy="false"] [data-closing-stage], [data-show-copy="false"] [data-closing-lion] {visibility:hidden}`}</style>
 </div>;
}
