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
 * Reusable looping video backdrop. Plays only while in view (see
 * useVideoAutoPause), paints a Cloudinary poster instantly to avoid a black
 * flash, and can fall back to a static image on mobile.
 */
export default function VideoBackdrop({
  src,
  className = "absolute inset-0 z-0",
  overlayClassName,
  posterOnlyMobile = true,
}: VideoBackdropProps) {
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

  useVideoAutoPause(videoRef);

  const showPosterOnly = posterOnlyMobile && isMobile;

  return (
    <div className={`${className} overflow-hidden`} aria-hidden="true">
      {showPosterOnly ? (
        <img src={poster} alt="" className="h-full w-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
      )}
      {overlayClassName && <div className={`absolute inset-0 ${overlayClassName}`} />}
    </div>
  );
}
