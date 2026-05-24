"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll, svg } from "animejs";

interface Props {
  /** Color of the ink. Default Lacquer Red. */
  inkColor?: string;
  /** Direction of the wipe. */
  direction?: "ltr" | "rtl";
  /**
   * Roughness — 1 is barely textured, 30 looks like a wet calligraphy brush.
   * Default 18 — bristle-grade without becoming noise.
   */
  roughness?: number;
  /** Frequency of the noise — lower = larger ink blobs, higher = finer bristles. Default 0.018. */
  baseFrequency?: number;
  /** Seed — change to get a different stroke shape from the same component. */
  seed?: number;
  /**
   * Path shape variant. Each describes a different brush gesture
   * (broad sweep, calligraphic flick, splatter trail, etc.).
   */
  variant?: "sweep" | "flick" | "double";
  /** Duration of the paint stroke in ms. Default 1400. */
  duration?: number;
  className?: string;
}

/**
 * InkRevealCurtain — a single brush stroke that paints across a region
 * as it enters the viewport. The stroke uses an SVG turbulence filter to
 * gain bristle-grade roughness without needing a raster asset.
 *
 * Composition is `mix-blend-mode: multiply` so the ink reads as pigment
 * on top of whatever lies beneath, not as a flat color block.
 */
export function InkRevealCurtain({
  inkColor = "#e5192a",
  direction = "ltr",
  roughness = 18,
  baseFrequency = 0.018,
  seed = 4,
  variant = "sweep",
  duration = 1400,
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const filterId = `ink-rough-${seed}-${roughness}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scope = createScope({ root }).add(() => {
      const path = root.querySelector<SVGPathElement>(".ink-path");
      if (!path) return;

      const drawables = svg.createDrawable([path]);
      animate(drawables, {
        draw: ["0 0", "0 1"],
        ease: "out(4)",
        duration,
        autoplay: onScroll({
          target: root,
          enter: "bottom-=20% top",
        }),
      });
    });

    return () => scope.revert();
  }, [duration]);

  // Paths are designed inside a 1600x900 viewBox; preserveAspectRatio is
  // "none" so the brush scales to whatever container size we land in.
  //
  // Each path is a horizontal stroke with intentional irregularity:
  // entry has slight thickness ramp, mid-stroke has a wobble, exit
  // tapers. The stroke-width does most of the visual work — the
  // turbulence filter handles bristle bite at the edges.
  const paths = {
    sweep: "M -100 450 C 280 360, 540 540, 880 430 S 1380 510, 1800 440",
    flick: "M -80 520 C 240 310, 720 690, 1100 420 C 1380 230, 1620 540, 1800 380",
    double:
      "M -100 380 C 320 290, 700 470, 1100 360 S 1500 420, 1800 360 M -100 560 C 320 480, 700 640, 1100 540 S 1500 600, 1800 540",
  };

  const reverse = direction === "rtl";

  return (
    <div
      ref={rootRef}
      className={`absolute inset-0 pointer-events-none ${className ?? ""}`}
      style={{ mixBlendMode: "multiply" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{ display: "block", transform: reverse ? "scaleX(-1)" : undefined }}
      >
        <defs>
          {/* Bristle roughness — fractalNoise displaces the stroke edges
              and the alpha curve introduces ink gaps for a wet-brush feel. */}
          <filter id={filterId} x="-10%" y="-30%" width="120%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves="3"
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={roughness}
              xChannelSelector="R"
              yChannelSelector="G"
              result="rough"
            />
            <feComponentTransfer in="rough">
              <feFuncA type="discrete" tableValues="0 0.7 0.95 1 1 1" />
            </feComponentTransfer>
          </filter>
        </defs>

        <path
          className="ink-path"
          d={paths[variant]}
          stroke={inkColor}
          strokeWidth={variant === "double" ? 240 : 480}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#${filterId})`}
        />
      </svg>
    </div>
  );
}
