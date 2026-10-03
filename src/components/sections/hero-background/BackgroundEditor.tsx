"use client";
import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_COMPOSITION, STORAGE_KEY, parseComposition, type Composition, type Placement } from "./config";
import styles from "./HeroBackground.module.css";

type Props = { composition: Composition; onChange: (value: Composition) => void };
const controls = [
  ["x", "Horizontal position", -100, 200, "%"], ["y", "Vertical position", -100, 200, "%"],
  ["width", "Size", 20, 400, "vw"], ["rotation", "Rotation", -180, 180, "°"], ["opacity", "Opacity", 0, 100, "%"],
] as const;
export default function BackgroundEditor({ composition, onChange }: Props) {
  const [selected, setSelected] = useState("5");
  const [profile, setProfile] = useState<"desktop" | "mobile">("desktop");
  const [open, setOpen] = useState(true);
  const [moving, setMoving] = useState(false);
  const [status, setStatus] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const layer = composition.layers.find(item => item.id === selected)!;
  const p = layer[profile];

  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const sync = () => setProfile(media.matches ? "mobile" : "desktop");
    const frame = requestAnimationFrame(() => {
      sync();
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? parseComposition(JSON.parse(saved)) : null;
        if (parsed) { onChange(parsed); setStatus("Loaded your saved composition."); }
      } catch { setStatus("Local storage unavailable. You can still export your layout."); }
    });
    media.addEventListener("change", sync);
    return () => { cancelAnimationFrame(frame); media.removeEventListener("change", sync); };
  }, [onChange]);

  const patch = (value: Partial<Placement>) => onChange({
    ...composition,
    layers: composition.layers.map(item => item.id === selected ? { ...item, [profile]: { ...item[profile], ...value } } : item),
  });
  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(composition)); setStatus("Saved in this browser. The live website is unchanged."); }
    catch { setStatus("Could not save in this browser. Use Export layout instead."); }
  };
  const exportLayout = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(composition, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "lionovart-hero-layout.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Layout exported. Send it back to apply your chosen placement.");
  };
  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    drag.current = { x: p.x, y: p.y, startX: event.clientX, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    patch({
      x: Math.max(-100, Math.min(200, Math.round(drag.current.x + (event.clientX - drag.current.startX) / innerWidth * 100))),
      y: Math.max(-100, Math.min(200, Math.round(drag.current.y + (event.clientY - drag.current.startY) / innerHeight * 100))),
    });
  };
  const nudge = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 5 : 1;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    patch({ x: Math.max(-100, Math.min(200, p.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0))),
      y: Math.max(-100, Math.min(200, p.y + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0))) });
  };

  return createPortal(<>
    {moving && p.visible && <button className={styles.handle} style={{ left: `${p.x}%`, top: `${p.y}%` }}
      aria-label="Move selected image. Drag or use arrow keys." title="Drag to move. Arrow keys to nudge."
      onPointerDown={startDrag} onPointerMove={move} onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} onKeyDown={nudge}>↔</button>}
    {open ? <aside className={styles.panel} aria-label="Hero background editor" data-lenis-prevent>
      <h2>Compose the background</h2>
      <p>{profile === "mobile" ? "Mobile" : "Desktop"} placement · resize the browser to edit the other layout.</p>
      <label htmlFor="hero-background-layer">Image</label>
      <select id="hero-background-layer" value={selected} onChange={event => { setSelected(event.target.value); setMoving(false); }}>
        {composition.layers.map(item => <option key={item.id} value={item.id}>{item.name}{item[profile].visible ? " · visible" : ""}</option>)}
      </select>
      <label>Show this image<input type="checkbox" checked={p.visible} onChange={event => patch({ visible: event.target.checked })} /></label>
      {controls.map(([key, label, min, max, unit]) => <div key={key}>
        <label htmlFor={`hero-background-${key}`}>{label}<output>{p[key]}{unit}</output></label>
        <input id={`hero-background-${key}`} type="range" min={min} max={max} step="1" value={p[key]}
          onChange={event => patch({ [key]: Number(event.target.value) })} />
      </div>)}
      <div className={styles.actions}>
        <button onClick={() => { patch({ visible: true }); setMoving(true); setOpen(false); }}>{moving ? "Stop moving" : "Move on canvas"}</button>
        <button onClick={() => { setOpen(false); setMoving(false); }}>Preview</button>
        <button onClick={save}>Save in browser</button><button onClick={exportLayout}>Export layout</button>
        <button onClick={() => fileInput.current?.click()}>Import layout</button>
        <button onClick={() => { onChange(DEFAULT_COMPOSITION); setMoving(false); setStatus("Default restored. Save to replace your saved layout."); }}>Reset all</button>
      </div>
      <input ref={fileInput} hidden type="file" accept=".json,application/json" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = "";
        if (!file) return;
        if (file.size > 100_000) { setStatus("Choose a layout JSON under 100 KB."); return; }
        try {
          const parsed = parseComposition(JSON.parse(await file.text()));
          if (!parsed) throw new Error("Invalid layout");
          onChange(parsed); setStatus("Layout imported. Save it to keep it in this browser.");
        } catch { setStatus("This file is not a valid hero layout."); }
      }} />
      <div className={styles.status} role="status">{status || "Changes are local to this editor. Export when you find a composition you like."}</div>
    </aside> : <button className={styles.launcher} onClick={() => { setOpen(true); setMoving(false); }}>{moving ? "Done moving" : "Edit background"}</button>}
  </>, document.body);
}
