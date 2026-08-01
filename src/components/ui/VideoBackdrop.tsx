"use client";

import { useEffect, useRef, useState } from "react";
import { useVideoAutoPause } from "@/hooks/useVideoAutoPause";

interface VideoBackdropProps {
  /** Video URL (mp4/webm/mov). Poster is derived by swapping the extension to .jpg. */
  src: string;
  /** Positioning/sizing classes for the layer (e.g. "absolute inset-0 z-0"). */
  className?: string;
  /** Scrim/gradient overlay classes for text contrast (e.g. "bg-black/65"). */
  overlayClassName?: string;
  /** On ≤768px, render the static poster instead of a decoding <video> (saves battery). */
  posterOnlyMobile?: boolean;
}

/**
 * Reusable looping video backdrop. Doesn't request the video at all until
 * scroll brings it near the viewport, plays only while actually in view (see
 * useVideoAutoPause), paints a Cloudinary poster instantly to avoid a black
 * flash, and can fall back to a static image on mobile.
 */
export default function VideoBackdrop({
  src,
  className = "absolute inset-0 z-0",
  overlayClassName,
  posterOnlyMobile = true,
}: VideoBackdropProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const poster = src.replace(/\.(mp4|webm|mov)$/i, ".jpg");

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Defer mounting the <video> (and its network request) until scroll
  // brings the backdrop within 800px, instead of loading it on page load.
  const [nearView, setNearView] = useState(false);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearView(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showPosterOnly = posterOnlyMobile && isMobile;
  const showVideo = nearView && !showPosterOnly;

  useVideoAutoPause(videoRef, undefined, showVideo);

  return (
    <div ref={wrapperRef} className={`${className} overflow-hidden`} aria-hidden="true">
      {showVideo ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <img src={poster} alt="" className="h-full w-full object-cover" />
      )}
      {overlayClassName && <div className={`absolute inset-0 ${overlayClassName}`} />}
    </div>
  );
}
