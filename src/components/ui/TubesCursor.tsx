"use client";

import { useEffect, useRef } from "react";

type TubesCursorProps = {
  initialColors?: string[];
  lightColors?: string[];
  lightIntensity?: number;
  enableRandomizeOnClick?: boolean;
  className?: string;
};

type TubesApp = {
  tubes?: {
    setColors?: (colors: string[]) => void;
    setLightsColors?: (colors: string[]) => void;
  };
  dispose?: () => void;
};

type TubesCursorConstructor = (
  canvas: HTMLCanvasElement,
  options: unknown,
) => TubesApp;

const TUBES_CURSOR_MODULE_URL =
  "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

/**
 * Full-viewport pointer canvas for the interactive Tubes cursor effect.
 * The canvas never captures input, so the site's existing links and controls
 * remain fully interactive underneath it.
 */
export default function TubesCursor({
  initialColors = ["#e5192a", "#f0c917", "#ffffff"],
  lightColors = ["#e5192a", "#f0c917", "#ffffff", "#60aed5"],
  lightIntensity = 160,
  enableRandomizeOnClick = true,
  className = "",
}: TubesCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<TubesApp | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let removeClick: (() => void) | null = null;
    let destroyed = false;

    void (async () => {
      try {
        // The Tubes runtime is intentionally loaded by the browser from a CDN.
        // Keeping the URL in a variable prevents the TypeScript compiler from
        // treating it as a local module that must have a declaration file.
        const mod = await import(
          /* webpackIgnore: true */
          TUBES_CURSOR_MODULE_URL
        );
        const TubesCursorCtor =
          (mod as { default?: TubesCursorConstructor }).default ??
          (mod as unknown as TubesCursorConstructor);

        if (!canvasRef.current || destroyed || typeof TubesCursorCtor !== "function") return;

        const app = TubesCursorCtor(canvasRef.current, {
          tubes: {
            colors: initialColors,
            lights: { intensity: lightIntensity, colors: lightColors },
          },
        });
        appRef.current = app;

        if (enableRandomizeOnClick) {
          const handleClick = () => {
            app.tubes?.setColors?.(randomColors(initialColors.length));
            app.tubes?.setLightsColors?.(randomColors(lightColors.length));
          };
          document.addEventListener("click", handleClick, { passive: true });
          removeClick = () => document.removeEventListener("click", handleClick);
        }
      } catch {
        // The visual enhancement is optional; the normal site cursor remains available.
      }
    })();

    return () => {
      destroyed = true;
      removeClick?.();
      try {
        appRef.current?.dispose?.();
      } catch {
        // Ignore disposal errors from an already-detached WebGL context.
      }
      appRef.current = null;
    };
  }, [initialColors, lightColors, lightIntensity, enableRandomizeOnClick]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9997] overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

function randomColors(count: number) {
  return Array.from({ length: count }, () =>
    `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`
  );
}
