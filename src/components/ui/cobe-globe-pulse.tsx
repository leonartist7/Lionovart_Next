"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Globe } from "cobe";

interface PulseMarker {
  id: string;
  location: [number, number];
  delay: number;
}

interface GlobePulseProps {
  markers?: PulseMarker[];
  className?: string;
  speed?: number;
}

const defaultMarkers: PulseMarker[] = [
  { id: "calgary", location: [51.05, -114.07], delay: 0 },
  { id: "london", location: [51.51, -0.13], delay: 0.5 },
  { id: "milan", location: [45.46, 9.19], delay: 1 },
  { id: "seoul", location: [37.57, 126.98], delay: 1.5 },
];

export function GlobePulse({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    pointerInteracting.current = { x: event.clientX, y: event.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }

    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (event.clientX - pointerInteracting.current.x) / 300,
          theta: (event.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let globe: Globe | null = null;
    let animationId = 0;
    let phi = 0;
    let lastFrame = 0;
    let isVisible = false;
    let isLoading = false;
    let isDisposed = false;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    );
    const shouldAnimate = !reduceMotion && !saveData;

    const stopAnimation = () => {
      if (animationId) cancelAnimationFrame(animationId);
      animationId = 0;
    };

    const animate = (time: number) => {
      animationId = 0;
      if (!globe || !isVisible || document.hidden) return;

      const frameInterval = isMobile ? 1000 / 30 : 0;
      if (!frameInterval || time - lastFrame >= frameInterval) {
        if (!isPausedRef.current) phi += speed;
        globe.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        lastFrame = time;
      }

      animationId = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!globe || animationId || !isVisible || document.hidden || !shouldAnimate) return;
      animationId = requestAnimationFrame(animate);
    };

    const init = async () => {
      const width = canvas.offsetWidth;
      if (width === 0 || globe || isLoading || isDisposed) return;
      isLoading = true;

      try {
        const { default: createGlobe } = await import("cobe");
        if (isDisposed) return;

        globe = createGlobe(canvas, {
          devicePixelRatio: Math.min(
            window.devicePixelRatio || 1,
            saveData ? 1 : isMobile ? 1.25 : 1.75
          ),
          width,
          height: width,
          phi: 0,
          theta: 0.2,
          dark: 1,
          diffuse: 1.5,
          mapSamples: saveData ? 3000 : isMobile ? 6000 : 14000,
          mapBrightness: 10,
          baseColor: [0.5, 0.5, 0.5],
          markerColor: [0.9, 0.1, 0.12],
          glowColor: [0.05, 0.05, 0.05],
          markerElevation: 0,
          markers: markers.map((marker) => ({
            location: marker.location,
            size: isMobile ? 0.02 : 0.025,
            id: marker.id,
          })),
          arcs: [],
          arcColor: [0.9, 0.1, 0.12],
          arcWidth: 0.5,
          arcHeight: 0.25,
          opacity: 0.7,
        });

        canvas.style.opacity = "1";
        globe.update({ phi, theta: 0.2 });
        startAnimation();
      } catch {
        // Keep the lightweight CSS fallback visible if WebGL cannot initialize.
        canvas.style.opacity = "0";
      } finally {
        isLoading = false;
      }
    };

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void init();
          preloadObserver.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);
        container.dataset.globeActive = String(isVisible);
        if (isVisible) {
          void init();
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.02 }
    );

    const resizeObserver = new ResizeObserver(() => {
      if (!globe) return;
      const width = canvas.offsetWidth;
      if (width > 0) globe.update({ width, height: width });
    });

    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    preloadObserver.observe(container);
    visibilityObserver.observe(container);
    resizeObserver.observe(container);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isDisposed = true;
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopAnimation();
      globe?.destroy();
    };
  }, [markers, speed]);

  return (
    <div
      ref={containerRef}
      data-globe-active="false"
      className={`relative aspect-square select-none ${className}`}
    >
      <style>{`
        @keyframes globe-pulse-expand {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .globe-pulse-ring { animation-play-state: paused !important; }
        [data-globe-active="true"] .globe-pulse-ring { animation-play-state: running !important; }

        @media (prefers-reduced-motion: reduce) {
          .globe-pulse-ring { animation: none !important; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-[9%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.08),transparent_42%)]" />
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        aria-label="Interactive globe showing Lionovart's international client reach"
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((marker) => (
        <div
          key={marker.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${marker.id}`,
            bottom: "anchor(center)",
            left: "anchor(center)",
            translate: "-50% 50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            opacity: `var(--cobe-visible-${marker.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${marker.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s",
          }}
        >
          <span
            className="globe-pulse-ring"
            style={{
              position: "absolute",
              inset: 0,
              border: "1px solid #E5232A",
              borderRadius: "50%",
              opacity: 0,
              animation: `globe-pulse-expand 2s ease-out infinite ${marker.delay}s`,
            }}
          />
          <span
            className="globe-pulse-ring"
            style={{
              position: "absolute",
              inset: 0,
              border: "1px solid #E5232A",
              borderRadius: "50%",
              opacity: 0,
              animation: `globe-pulse-expand 2s ease-out infinite ${marker.delay + 0.5}s`,
            }}
          />
          <span
            style={{
              width: 7,
              height: 7,
              background: "#E5232A",
              borderRadius: "50%",
              boxShadow: "0 0 0 2px #111, 0 0 0 3px #E5232A",
            }}
          />
        </div>
      ))}
    </div>
  );
}
