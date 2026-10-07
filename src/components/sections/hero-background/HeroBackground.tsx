"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useHeroComposition } from "./HeroComposition";
import HeroLightRays from "./HeroLightRays";
import styles from "./HeroBackground.module.css";

const BackgroundEditor = dynamic(() => import("./BackgroundEditor"), { ssr: false });
export default function HeroBackground() {
  const backdrop = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const { composition, setComposition } = useHeroComposition();
  useEffect(() => {
    const task = requestAnimationFrame(() => setEditing(new URLSearchParams(location.search).get("heroEditor") === "1"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const boundary = document.getElementById("problems");
      if (!backdrop.current || !boundary) return;
      const distance = boundary.getBoundingClientRect().top;
      // Keep the artwork behind the centered bridge; fade as the next chapter
      // reaches the top of the viewport, after the bridge has been read.
      const t = Math.max(0, Math.min(1, distance / (innerHeight * .45)));
      backdrop.current.style.opacity = String(t * t * (3 - 2 * t));
      backdrop.current.style.visibility = t === 0 ? "hidden" : "visible";
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    const host = backdrop.current?.closest("[data-lion-journey]");
    if (host) observer.observe(host);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(task); cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
    };
  }, []);
  return <>
    <div ref={backdrop} className={styles.backdrop} aria-hidden="true" data-hero-background>
      {composition.layers.map(layer => {
        if (!layer.desktop.visible && !layer.mobile.visible) return null;
        const variables: Record<string, string | number> = {};
        for (const profile of ["desktop", "mobile"] as const) {
          const p = layer[profile];
          variables[`--${profile}-x`] = `${p.x}%`;
          variables[`--${profile}-y`] = `${p.y}%`;
          variables[`--${profile}-scale`] = p.width / 100;
          variables[`--${profile}-rotation`] = `${p.rotation}deg`;
          variables[`--${profile}-opacity`] = p.visible ? p.opacity / 100 : 0;
        }
        return <div key={layer.id} className={styles.frameLayer} style={variables as CSSProperties} data-background-layer={layer.id}>
          <Image src={layer.src} alt="" fill sizes="100vw" className={styles.frame}
            loading="eager" draggable={false} data-hero-frame />
        </div>;
      })}
    </div>
    <HeroLightRays />
    {editing && <BackgroundEditor composition={composition} onChange={setComposition} />}
  </>;
}
