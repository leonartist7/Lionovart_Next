"use client";

import { useContext, useEffect, useRef, type CSSProperties } from "react";
import { ClosingRevealContext } from "./ClosingRibbonOrnament";
import styles from "./ClosingMediaWall.module.css";
import { SHOWCASE_IMAGES } from "./showcase-images";

// Awwwards Pack — 3D Animation 20. Original demo declares ISC.
// See docs/references/3d-animation-20 for original reference and attribution.
// CSS 3D preserves curved media planes without a second WebGL context or 49 video decoders.
const ART = SHOWCASE_IMAGES.map(src => src.replace("q_auto:best,w_1600", "q_auto:eco,w_480"));
const MOBILE_ART = ART.map(src => src.replace("w_480", "w_320"));
const PLANES = [
  [-4,8,-12],[22,2,6],[48,-4,-5],[75,3,9],[103,9,-9],
  [4,32,5],[21,29,-8],[80,27,7],[103,35,-4],
  [-5,57,-8],[15,65,9],[86,63,-7],[106,58,6],
  [1,89,8],[25,97,-5],[51,103,6],[77,95,-8],[102,88,5],
] as const;
// Eight closer planes leave the lion and reading/action lane unobstructed.
const MOBILE = [
  [16,13],[0,0],[0,0],[84,13],[0,0],
  [10,35],[0,0],[90,35],[0,0],[0,0],[5,70],[95,70],[0,0],
  [24,91],[0,0],[0,0],[76,91],[0,0],
] as const;
const DESKTOP_ONLY = new Set([1,2,4,6,8,9,12,14,15,17]);

/** Section-scoped decorative gallery; the accessible CTA remains in the DOM. */
export default function ClosingMediaWall() {
  const host = useRef<HTMLDivElement>(null);
  const progress = useContext(ClosingRevealContext);

  useEffect(() => {
    const root = host.current;
    const wall = root?.querySelector<HTMLElement>("[data-media-wall-plane]");
    const section = root?.closest("section");
    if (!root || !wall || !section) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const compact = matchMedia("(max-width: 639px)");
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    let visible = false, frame = 0, previous = 0, elapsed = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let bounds = section.getBoundingClientRect();
    const read = () => typeof progress === "number" ? progress : progress.get();
    const reveal = () => Math.max(0, Math.min(1, (read() - .58) / .2));
    const enabled = () => visible && !document.hidden && reveal() > 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      root.dataset.animationActive = "false";
    };
    const load = () => {
      root.querySelectorAll<HTMLImageElement>("img[data-src]").forEach(image => {
        if (compact.matches && image.closest("[data-desktop-only]")) return;
        const source = compact.matches ? image.dataset.mobileSrc! : image.dataset.src!;
        if (image.getAttribute("src") !== source) image.src = source;
      });
    };
    const render = (now: number) => {
      frame = 0;
      if (!enabled() || compact.matches || !fine.matches || reduced.matches || connection?.saveData) { stop(); return; }
      const delta = previous ? Math.min(64, now - previous) : 32;
      if (previous && delta < 32) { frame = requestAnimationFrame(render); return; }
      previous = now;
      elapsed += delta;
      const damping = 1 - Math.exp(-delta / 150);
      x += (targetX - x) * damping;
      y += (targetY - y) * damping;
      const drift = Math.sin(elapsed / 5000);
      const tilt = fine.matches ? 1 : .35;
      wall.style.transform = `translate3d(${(-x * 22 + drift * 5).toFixed(2)}px,${(y * 14 + Math.cos(elapsed / 6500) * 4).toFixed(2)}px,-28px) rotateX(${(-y * 5 * tilt).toFixed(3)}deg) rotateY(${(x * 9 * tilt + drift * .6).toFixed(3)}deg)`;
      frame = requestAnimationFrame(render);
    };
    const update = () => {
      root.style.setProperty("--wall-reveal", String(reveal()));
      const staticMotion = reduced.matches || connection?.saveData;
      const ambient = compact.matches || !fine.matches;
      root.dataset.motion = staticMotion ? "static" : ambient ? "ambient" : "interactive";
      if (!enabled()) { stop(); return; }
      load();
      if (reduced.matches || connection?.saveData) {
        stop();
        wall.style.transform = "none";
      } else if (ambient) {
        // One compositor animation for all phone tiles: zero gallery RAF callbacks.
        stop();
        wall.style.removeProperty("transform");
        root.dataset.animationActive = "true";
      } else if (!frame) {
        root.dataset.animationActive = "true";
        frame = requestAnimationFrame(render);
      }
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch" || !enabled()) return;
      targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    };
    const reset = () => { targetX = 0; targetY = 0; };
    const resize = () => {
      bounds = section.getBoundingClientRect();
      update();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resize();
      update();
    }, { threshold: .01 });
    const sizeObserver = new ResizeObserver(resize);
    const unsubscribe = typeof progress === "number" ? () => {} : progress.on("change", update);
    observer.observe(root);
    sizeObserver.observe(section);
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerenter", resize, { passive: true });
    section.addEventListener("pointerleave", reset);
    reduced.addEventListener("change", update);
    fine.addEventListener("change", update);
    connection?.addEventListener("change", update);
    compact.addEventListener("change", resize);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      stop();
      unsubscribe();
      observer.disconnect();
      sizeObserver.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerenter", resize);
      section.removeEventListener("pointerleave", reset);
      reduced.removeEventListener("change", update);
      fine.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
      compact.removeEventListener("change", resize);
      document.removeEventListener("visibilitychange", update);
    };
  }, [progress]);

  return <div ref={host} className={styles.root} aria-hidden="true" data-closing-media-wall data-animation-active="false">
    <div className={styles.wall} data-media-wall-plane>
      {PLANES.map(([x, y, roll], i) => {
        const curve = (x - 50) / 50;
        const style = {
          "--x": `${x}%`, "--y": `${y}%`, "--mx": `${MOBILE[i][0]}%`, "--my": `${MOBILE[i][1]}%`,
          "--depth": `${Math.round(curve * curve * 100)}px`,
          "--yaw": `${-curve * 22}deg`, "--pitch": `${(y - 50) * .14}deg`, "--roll": `${roll}deg`,
        } as CSSProperties;
        return <div key={i} className={styles.tile} style={style} data-desktop-only={DESKTOP_ONLY.has(i) ? "" : undefined}>
          {/* Decorative thumbnails are requested only when the CTA is revealed. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-src={ART[i % ART.length]} data-mobile-src={MOBILE_ART[i % ART.length]} alt="" width={480} height={300} decoding="async" loading="lazy"
            onLoad={event => { event.currentTarget.dataset.loaded = "true"; }}
            onError={event => { event.currentTarget.style.visibility = "hidden"; }} />
          <span />
        </div>;
      })}
    </div>
  </div>;
}
