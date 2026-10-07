"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import type { WorkEntry } from "./catalog";
import styles from "./Work.module.css";

export default function WorkMedia({ entry, playable = false, supporting = false, supportIndex = 0, eager = false, previewPlayback }: { entry: WorkEntry; playable?: boolean; supporting?: boolean; supportIndex?: number; eager?: boolean; previewPlayback?: boolean }) {
  const [failed, setFailed] = useState(false);
  const reduceMotion = useHydratedReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const autoPlayback = playable ? !reduceMotion : previewPlayback ?? !reduceMotion;
  const hasFilm = Boolean(entry.video && !supporting && !failed);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasFilm) return;
    const observer = new IntersectionObserver(([item]) => setVisible(item.intersectionRatio >= .15), { threshold: .15 });
    observer.observe(container);
    return () => observer.disconnect();
  }, [hasFilm]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    function syncPlayback() {
      video!.autoplay = visible && autoPlayback;
      if (visible && autoPlayback && !document.hidden) {
        // Assign preview sources on first entry into view; preserve the buffer when paused.
        if (!video!.getAttribute("src") && entry.video) video!.src = entry.video;
        void video!.play().catch(() => { /* Native controls and poster remain available if autoplay is blocked. */ });
      } else video!.pause();
    }
    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => { document.removeEventListener("visibilitychange", syncPlayback); video.pause(); };
  }, [visible, autoPlayback, entry.video]);
  const poster = supporting ? entry.supportingPosters?.[supportIndex] : entry.poster;
  const alt = supporting ? `Still ${supportIndex + 1} from the ${entry.name} showcase film` : entry.posterAlt ?? `Reference artwork for ${entry.name}; illustrative placement only`;
  return <div ref={containerRef} className={styles.media} data-treatment={Number(entry.number) % 3}>
    {poster ? <Image src={poster} alt={alt} fill loading={eager || playable ? "eager" : "lazy"} sizes={playable ? "(min-width: 1384px) 1320px, 100vw" : "(max-width: 700px) 100vw, 50vw"} className={`${styles.image} ${entry.video && playable ? styles.filmPoster : ""}`} /> :
      <div className={styles.mediaPlaceholder} aria-label={supporting ? "Supporting image placeholder" : "Project image placeholder"} role="img">
        <span className={styles.mediaIndex}>{entry.number} / {supporting ? "APPLICATION" : "VISUAL"}</span>
        <div className={styles.mockComposition} aria-hidden="true"><i /><i /><i /></div>
        <span className={styles.mediaNote}>{supporting ? "Supporting image" : "Artwork placement"}</span>
      </div>}
    {hasFilm && <video ref={videoRef} key={entry.video} className={styles.video} src={playable ? entry.video : undefined} poster={entry.poster} controls={playable} muted loop playsInline preload="none" tabIndex={playable ? undefined : -1} aria-hidden={playable ? undefined : true} onError={() => setFailed(true)} aria-label={`${entry.name} showcase film`}>Your browser cannot play this film.</video>}
    {failed && <span className={styles.videoBadge} role="status">Film unavailable · poster shown</span>}
  </div>;
}
