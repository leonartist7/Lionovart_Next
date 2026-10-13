"use client";

import { useState } from "react";
import Link from "next/link";
import HeroRibbonOrnament from "@/components/sections/hero-background/HeroRibbonOrnament";

export default function OrnamentReview() {
  const [progress, setProgress] = useState<number | undefined>(1);
  const [zoom, setZoom] = useState(1);
  const [background, setBackground] = useState("#090909");
  const [iteration, setIteration] = useState(0);
  return <main style={{ height: "100dvh", display: "grid", gridTemplateRows: "auto 1fr", background: "#171717", color: "#fff" }}>
    <nav aria-label="Ornament review" style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 12, zIndex: 1 }}>
      <button onClick={() => { setProgress(undefined); setIteration(i => i + 1); }}>Replay 9 seconds</button>
      {[0, .25, .5, .75, 1].map(p => <button key={p} onClick={() => setProgress(p)}>{p * 100}% time</button>)}
      <label>Zoom <select value={zoom} onChange={e => setZoom(Number(e.target.value))}>{[1, 4, 8].map(z => <option key={z} value={z}>{z * 100}%</option>)}</select></label>
      <label>Background <select value={background} onChange={e => setBackground(e.target.value)}><option value="#090909">Dark</option><option value="#f3eee4">Ivory</option><option value="checker">Checkerboard</option></select></label>
      <Link href="/">View hero</Link>
    </nav>
    <div style={{ overflow: "auto", background: background === "checker" ? "repeating-conic-gradient(#555 0% 25%, #999 0% 50%) 0 0 / 24px 24px" : background }}>
      <div style={{ position: "relative", width: `${zoom * 100}%`, height: `${zoom * 100}%`, minHeight: "100%" }}>
        <HeroRibbonOrnament key={iteration} progress={progress} />
      </div>
    </div>
  </main>;
}
