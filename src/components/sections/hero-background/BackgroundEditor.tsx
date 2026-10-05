"use client";
import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { DEFAULT_COMPOSITION, STORAGE_KEY, parseComposition, type Composition, type Placement } from "./config";
import styles from "./HeroBackground.module.css";

type Props = { composition: Composition; onChange: (value: Composition) => void };
type Profile = "desktop" | "mobile";
const controls = [
  ["width", "Size", 20, 400, "vw"], ["rotation", "Rotation", -180, 180, "°"], ["opacity", "Opacity", 0, 100, "%"],
] as const;

// Older saved layouts can contain several visible layers. Preview one candidate per viewport.
function singleImagePreview(config: Composition): Composition {
  const candidates = config.layers.filter(item => item.inCycle !== false);
  const available = candidates.length ? candidates : config.layers;
  const desktop = available.find(item => item.desktop.visible) ?? available[0];
  const mobile = available.find(item => item.mobile.visible) ?? available[0];
  return { ...config, layers: config.layers.map(item => ({
    ...item, inCycle: candidates.length ? item.inCycle !== false : true,
    desktop: { ...item.desktop, visible: item.id === desktop.id },
    mobile: { ...item.mobile, visible: item.id === mobile.id },
  })) };
}

export default function BackgroundEditor({ composition, onChange }: Props) {
  const [profile, setProfile] = useState<Profile>("desktop");
  const [open, setOpen] = useState(false);
  const [moving, setMoving] = useState(false);
  const [status, setStatus] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const candidates = composition.layers.filter(item => item.inCycle !== false);
  const layer = candidates.find(item => item[profile].visible) ?? candidates[0] ?? composition.layers[0];
  const selected = layer.id;
  const p = layer[profile];
  const currentIndex = candidates.findIndex(item => item.id === selected);

  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const sync = () => { drag.current = null; setProfile(media.matches ? "mobile" : "desktop"); };
    const frame = requestAnimationFrame(() => {
      sync();
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? parseComposition(JSON.parse(saved)) : null;
        onChange(singleImagePreview(parsed ?? DEFAULT_COMPOSITION));
        if (parsed) setStatus("Loaded your saved images and settings.");
      } catch { setStatus("Local storage unavailable. You can still export your layout."); }
    });
    media.addEventListener("change", sync);
    return () => { cancelAnimationFrame(frame); media.removeEventListener("change", sync); };
  }, [onChange]);

  useEffect(() => {
    if (open) closeButton.current?.focus();
  }, [open]);

  const closeSettings = () => { setOpen(false); settingsButton.current?.focus(); };
  const choose = (id: string) => {
    drag.current = null;
    onChange({ ...composition, layers: composition.layers.map(item => ({
      ...item, [profile]: { ...item[profile], visible: item.id === id },
    })) });
  };
  const cycle = (direction: number) => {
    if (candidates.length < 2) return;
    choose(candidates[(currentIndex + direction + candidates.length) % candidates.length].id);
  };
  const include = (id: string, checked: boolean) => {
    if (!checked && candidates.length === 1) {
      setStatus("Keep at least one image in the cycle.");
      return;
    }
    onChange(singleImagePreview({ ...composition, layers: composition.layers.map(item =>
      item.id === id ? { ...item, inCycle: checked } : item) }));
    setStatus(checked ? "Image added to the cycle." : "Image skipped. You can add it back anytime.");
  };
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
    {moving && p.visible && <button className={styles.handle} style={{ left: `${Math.max(4, Math.min(96, p.x))}%`, top: `${Math.max(5, Math.min(88, p.y))}%` }}
      aria-label="Move selected image. Drag or use arrow keys." title="Drag to move. Arrow keys to nudge."
      onPointerDown={startDrag} onPointerMove={move} onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} onKeyDown={nudge}>↔</button>}

    <div className={styles.pill} role="group" aria-label="Hero background preview" data-lenis-prevent>
      <button onClick={() => cycle(-1)} disabled={candidates.length < 2} aria-label="Previous background image" title="Previous image">‹</button>
      <div className={styles.currentImage} aria-live="polite" aria-atomic="true">
        <span>{layer.name}</span><small>{currentIndex + 1} / {candidates.length}</small>
      </div>
      <button onClick={() => cycle(1)} disabled={candidates.length < 2} aria-label="Next background image" title="Next image">›</button>
      <button onClick={() => { setMoving(value => !value); setOpen(false); }} aria-pressed={moving}
        aria-label={moving ? "Stop moving image" : "Move image on canvas"} title={moving ? "Stop moving" : "Move on canvas"}>↔</button>
      <button ref={settingsButton} onClick={() => { setOpen(value => !value); setMoving(false); }}
        aria-label="Background settings" aria-expanded={open} aria-controls="hero-background-settings" title="Settings">⚙</button>
    </div>

    {open && <aside id="hero-background-settings" className={styles.panel} aria-label="Hero background settings" data-lenis-prevent
      onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); closeSettings(); } }}>
      <div className={styles.panelHeading}><h2>Background settings</h2>
        <button ref={closeButton} onClick={closeSettings} aria-label="Close background settings">×</button>
      </div>
      <p>{profile === "mobile" ? "Mobile" : "Desktop"} placement · drag on canvas to reposition.</p>
      <fieldset className={styles.imageControls}>
        <legend>Images in your cycle</legend>
        <p>Click an image to preview. Uncheck it to skip it.</p>
        <div className={styles.imageList}>
          {composition.layers.map(item => <div key={item.id} className={styles.imageRow} data-selected={item.id === selected}
            data-excluded={item.inCycle === false}>
            <button className={styles.imageChoice} disabled={item.inCycle === false} aria-pressed={item.id === selected}
              onClick={() => choose(item.id)} aria-label={`Preview ${item.name}`}>
              <Image src={item.src} alt="" width={36} height={36} sizes="36px" />
              <span>{item.name}</span>
            </button>
            <input type="checkbox" checked={item.inCycle !== false} aria-label={`Include ${item.name} in cycle`}
              onChange={event => include(item.id, event.target.checked)} />
          </div>)}
        </div>
      </fieldset>
      <fieldset className={styles.imageControls}>
        <legend>{layer.name}</legend>
        {controls.map(([key, label, min, max, unit]) => <div key={key}>
          <label htmlFor={`hero-background-${key}`}>{label}<output>{p[key]}{unit}</output></label>
          <input id={`hero-background-${key}`} type="range" min={min} max={max} step="1" value={p[key]}
            onChange={event => patch({ [key]: Number(event.target.value) })} />
        </div>)}
        <button className={styles.moveButton} onClick={() => { setMoving(true); setOpen(false); }}>Move on canvas</button>
      </fieldset>
      <fieldset className={styles.sceneControls}>
        <legend>Hero scene</legend>
        <label>Show 3D lion<input type="checkbox" checked={composition.scene.lionVisible}
          onChange={event => onChange({ ...composition, scene: { ...composition.scene, lionVisible: event.target.checked } })} /></label>
        <label htmlFor="hero-rays-color">Ray color<output>{composition.scene.raysColor}</output></label>
        <input id="hero-rays-color" type="color" value={composition.scene.raysColor}
          onChange={event => onChange({ ...composition, scene: { ...composition.scene, raysColor: event.target.value } })} />
        <label htmlFor="hero-rays-origin">Rays come from</label>
        <select id="hero-rays-origin" value={composition.scene.raysOrigin}
          onChange={event => onChange({ ...composition, scene: { ...composition.scene, raysOrigin: event.target.value as "top-center" | "bottom-center" } })}>
          <option value="top-center">Top</option><option value="bottom-center">Bottom</option>
        </select>
      </fieldset>
      <div className={styles.actions}>
        <button onClick={save}>Save in browser</button><button onClick={exportLayout}>Export layout</button>
        <button onClick={() => fileInput.current?.click()}>Import layout</button>
        <button onClick={() => { onChange(singleImagePreview(DEFAULT_COMPOSITION)); setMoving(false); setStatus("Default restored. Save to replace your saved layout."); }}>Reset all</button>
      </div>
      <div className={styles.status}>{status || "Changes stay in this editor. Save to keep your shortlist and settings."}</div>
    </aside>}
    <input ref={fileInput} hidden type="file" accept=".json,application/json" onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = "";
      if (!file) return;
      if (file.size > 100_000) { setStatus("Choose a layout JSON under 100 KB."); return; }
      try {
        const parsed = parseComposition(JSON.parse(await file.text()));
        if (!parsed) throw new Error("Invalid layout");
        onChange(singleImagePreview(parsed)); setStatus("Layout imported. Save it to keep it in this browser.");
      } catch { setStatus("This file is not a valid hero layout."); }
    }} />
    <span className={styles.srOnly} role="status">{status}</span>
  </>, document.body);
}
