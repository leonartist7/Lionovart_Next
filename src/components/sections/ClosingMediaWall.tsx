"use client";

import { useContext, useEffect, useRef, type CSSProperties } from "react";
import { ClosingRevealContext } from "./ClosingRibbonOrnament";
import styles from "./ClosingMediaWall.module.css";
import { SHOWCASE_IMAGES } from "./showcase-images";

// Awwwards Pack — 3D Animation 20. Original demo declares ISC.
// See docs/references/3d-animation-20 for original reference and attribution.
// CSS 3D preserves curved media planes without a second WebGL context or 49 video decoders.
const ART = SHOWCASE_IMAGES.map(src => src.replace("q_auto:best,w_1600", "q_auto:eco,w_480"));
const PLANES = [
  [-4,8,-12],[22,2,6],[48,-4,-5],[75,3,9],[103,9,-9],
  [4,32,5],[21,29,-8],[80,27,7],[103,35,-4],
  [-5,57,-8],[15,65,9],[86,63,-7],[106,58,6],
  [1,89,8],[25,97,-5],[51,103,6],[77,95,-8],[102,88,5],
] as const;
const MOBILE = [
  [-7,8],[36,1],[70,-8],[99,9],[116,24],
  [-8,31],[13,38],[91,36],[111,47],[-17,60],[0,70],[102,68],[119,79],
  [-3,94],[30,103],[63,105],[100,95],[118,105],
] as const;
const DESKTOP_ONLY = new Set([2,4,8,9,12,17]);

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
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false, loaded = false, frame = 0, previous = 0, elapsed = 0;
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
      if (loaded) return;
      loaded = true;
      root.querySelectorAll<HTMLImageElement>("img[data-src]").forEach(image => {
        if (compact.matches && image.closest("[data-desktop-only]")) return;
        image.src = image.dataset.src!;
      });
    };
    const render = (now: number) => {
      frame = 0;
      if (!enabled() || reduced.matches || connection?.saveData) { stop(); return; }
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
      root.dataset.motion = reduced.matches || connection?.saveData ? "static" : "interactive";
      if (!enabled()) { stop(); return; }
      load();
      if (reduced.matches || connection?.saveData) {
        stop();
        wall.style.transform = "none";
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
      if (loaded && !compact.matches) root.querySelectorAll<HTMLImageElement>("img[data-src]").forEach(image => {
        if (!image.getAttribute("src")) image.src = image.dataset.src!;
      });
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
    fine.addEventListener("change", reset);
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
      fine.removeEventListener("change", reset);
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
          <img data-src={ART[i % ART.length]} alt="" width={480} height={300} decoding="async" loading="lazy"
            onLoad={event => { event.currentTarget.dataset.loaded = "true"; }}
            onError={event => { event.currentTarget.style.visibility = "hidden"; }} />
          <span />
        </div>;
      })}
    </div>
  </div>;
}
