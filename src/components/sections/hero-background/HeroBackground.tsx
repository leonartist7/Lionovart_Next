"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useHeroComposition } from "./HeroComposition";
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
      const boundary = document.getElementById("stronger-together");
      if (!backdrop.current || !boundary) return;
      const distance = boundary.getBoundingClientRect().top - innerHeight;
      // Finish the fade before the light chapter enters the viewport.
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
          variables[`--${profile}-width`] = `${p.width}vw`;
          variables[`--${profile}-rotation`] = `${p.rotation}deg`;
          variables[`--${profile}-opacity`] = p.visible ? p.opacity / 100 : 0;
        }
        const ribbon = layer.id === "4" || layer.id === "5";
        return <div key={layer.id} className={styles.layer} style={variables as CSSProperties} data-background-layer={layer.id}>
          <Image src={layer.src} alt="" width={ribbon ? 1672 : 1254} height={ribbon ? 941 : 1254}
            sizes="150vw" draggable={false} />
        </div>;
      })}
    </div>
    {editing && <BackgroundEditor composition={composition} onChange={setComposition} />}
  </>;
}
