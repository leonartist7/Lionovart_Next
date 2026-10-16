"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { PARTNERSHIP_TILE_MEDIA, PARTNERSHIP_TILE_SETTINGS } from "./partnership-tile-config";
import { partnershipTilePose, type TileStage } from "./partnership-tiles-motion";
import styles from "./PartnershipTiles.module.css";

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };

function ProjectLoop({ src, progress, paused, onPlaying }: {
  src: string; progress: MotionValue<number>; paused: boolean; onPlaying: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const media = matchMedia("(min-width: 768px) and (hover: hover) and (prefers-reduced-motion: no-preference)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let visible = false, pending = false, disposed = false, failed = false;
    const active = () => !disposed && !paused && !failed && visible && !document.hidden
      && media.matches && !connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType ?? "")
      && progress.get() > 0.1 && progress.get() < 0.60;
    const sync = () => {
      if (!active()) { video.pause(); delete video.dataset.playing; return; }
      if (!video.getAttribute("src")) video.src = src;
      if (video.paused && !pending) {
        pending = true;
        void video.play().then(() => {
          pending = false;
          if (!active()) { video.pause(); return; }
          video.dataset.playing = "true";
          onPlaying();
        }).catch(() => { pending = false; failed = true; delete video.dataset.playing; });
      }
    };
    const error = () => { failed = true; delete video.dataset.playing; };
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; sync(); });
    observer.observe(video);
    const unsubscribe = progress.on("change", sync);
    media.addEventListener("change", sync);
    connection?.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    video.addEventListener("error", error);
    sync();
    return () => {
      disposed = true; unsubscribe(); observer.disconnect();
      media.removeEventListener("change", sync);
      connection?.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      video.removeEventListener("error", error);
      video.pause(); video.removeAttribute("src"); video.load();
    };
  }, [src, progress, paused, onPlaying]);
  return <video ref={ref} className={styles.video} autoPlay loop muted playsInline
    preload="none" disablePictureInPicture aria-hidden="true" tabIndex={-1} />;
}

/** Uses the existing chapter progress: no nested pin, scroll listener or WebGL. */
export default function PartnershipTiles({ progress, staticScene }: {
  progress: MotionValue<number>; staticScene: boolean;
}) {
  const tr = usePublicCopy();
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const markPlaying = useCallback(() => setHasVideo(true), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); }
    }, { rootMargin: "600px 0px" });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current, grid = gridRef.current;
    if (!root || !grid || staticScene) return;
    let frame = 0, previous = 0, current = progress.get(), target = current;
    let stage: TileStage = { width: 1, height: 1, gridWidth: 1, gap: 1 };
    const draw = () => {
      root.dataset.moving = String(current > 0.04 && current < 0.62);
      root.dataset.videoWindow = String(current > 0.13 && current < 0.60);
      tiles.current.forEach((tile, index) => {
        if (!tile) return;
        const pose = partnershipTilePose(current, index, stage);
        tile.style.transform = `translate3d(${pose.x.toFixed(2)}px,${pose.y.toFixed(2)}px,0) scale(${pose.scale.toFixed(4)})`;
        tile.style.opacity = String(pose.opacity);
      });
    };
    const tick = (time: number) => {
      const delta = previous ? Math.min(64, time - previous) : 16.67;
      previous = time;
      // Reach 95% of the scroll target within the selected 0.31-second scrub.
      current += (target - current) * (1 - Math.exp(-3 * delta / (PARTNERSHIP_TILE_SETTINGS.scrub * 1000)));
      if (Math.abs(target - current) < 0.0001) current = target;
      draw();
      frame = current === target ? 0 : requestAnimationFrame(tick);
    };
    const sync = () => {
      target = progress.get();
      if (document.hidden) { current = target; draw(); return; }
      if (!frame) { previous = 0; frame = requestAnimationFrame(tick); }
    };
    const measure = () => {
      stage = { width: root.clientWidth, height: root.clientHeight, gridWidth: grid.clientWidth,
        gap: parseFloat(getComputedStyle(grid).columnGap) || PARTNERSHIP_TILE_SETTINGS.gap };
      draw();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root); observer.observe(grid);
    const unsubscribe = progress.on("change", sync);
    document.addEventListener("visibilitychange", sync);
    measure(); sync();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); unsubscribe();
      document.removeEventListener("visibilitychange", sync);
      tiles.current.forEach(tile => { tile?.style.removeProperty("transform"); tile?.style.removeProperty("opacity"); });
      delete root.dataset.moving; delete root.dataset.videoWindow;
    };
  }, [progress, staticScene]);

  return <div ref={rootRef} className={styles.viewport} data-partnership-tiles data-static={staticScene}>
    <div ref={gridRef} className={styles.grid} aria-hidden="true">
      {PARTNERSHIP_TILE_MEDIA.map((item, index) => <div key={item.id} className={styles.tile}
        ref={node => { tiles.current[index] = node; }} data-partnership-tile={item.id}>
        {ready && <>
          {/* Already-sized Cloudinary derivatives; decorative portfolio imagery. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.poster} srcSet={item.srcSet}
            sizes="(max-width: 767px) 60vw, 550px" alt="" loading="eager" decoding="async" fetchPriority="low" />
          {!staticScene && item.video && <ProjectLoop src={item.video} progress={progress} paused={paused} onPlaying={markPlaying} />}
        </>}
      </div>)}
    </div>
    {hasVideo && !staticScene && <button type="button" className={styles.controls} aria-pressed={paused}
      aria-label={tr(paused ? "Play project videos" : "Pause project videos")} onClick={() => setPaused(value => !value)}>
      {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      <span>{tr(paused ? "Play videos" : "Pause videos")}</span>
    </button>}
  </div>;
}
