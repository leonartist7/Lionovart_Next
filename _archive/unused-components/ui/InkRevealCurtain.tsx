"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { animate, createScope, onScroll, svg } from "animejs";

interface Props {
  /** Color of the ink. Default Lacquer Red. (Ignored when textureSrc is set.) */
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
  /**
   * Optional path to a transparent-background brush PNG/WebP. When provided,
   * the component switches from procedural SVG ink to a clip-revealed raster
   * stroke — photographic bristles, real paint feel. The image's own colour
   * is used as-is (set blendMode if you want it to tint into the background).
   */
  textureSrc?: string;
  /** mix-blend-mode for the raster texture. Default "multiply" for inky paint feel. */
  blendMode?: "multiply" | "normal" | "screen" | "overlay" | "darken";
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
  textureSrc,
  blendMode = "multiply",
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const filterId = `ink-rough-${seed}-${roughness}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scope = createScope({ root }).add(() => {
      // RASTER MODE — soft-edge mask wipe.
      // We animate a linear-gradient mask whose transition zone is ~14% wide.
      // That feathered edge is what makes the stroke look *painted* rather
      // than unveiled — no hard vertical cut crossing the bristles.
      // Animating the `--reveal` CSS variable (rather than the whole mask
      // string) is far cheaper: only one declaration recalculates per frame.
      if (textureSrc) {
        const img = root.querySelector<HTMLElement>(".ink-texture");
        if (!img) return;
        animate(img, {
          // anime.js v4 accepts plain object property animations on HTMLElements
          // including custom CSS properties via the `--name` key.
          "--reveal": ["-14%", "114%"],
          ease: "out(3)",
          duration,
          autoplay: onScroll({
            target: root,
            enter: "bottom-=20% top",
          }),
        } as Parameters<typeof animate>[1]);
        return;
      }

      // SVG MODE — original procedural stroke draws itself in.
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
  }, [duration, textureSrc]);

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

  // Raster mode — single <img>, soft-edge mask reveal driven by --reveal.
  // The mask is a gradient: opaque up to --reveal, then a 14% feathered
  // taper to transparent. As --reveal animates from -14% → 114% the
  // taper sweeps across the stroke and the painterly bristles stay intact.
  if (textureSrc) {
    return (
      <div
        ref={rootRef}
        className={`absolute inset-0 pointer-events-none ${className ?? ""}`}
        aria-hidden="true"
      >
        <img
          src={textureSrc}
          alt=""
          className="ink-texture absolute inset-0 w-full h-full object-contain select-none"
          style={
            {
              mixBlendMode: blendMode,
              transform: reverse ? "scaleX(-1)" : undefined,
              // Start fully hidden, then anime.js animates --reveal across.
              ["--reveal" as string]: "-14%",
              WebkitMaskImage:
                "linear-gradient(90deg, black 0%, black var(--reveal), transparent calc(var(--reveal) + 14%))",
              maskImage:
                "linear-gradient(90deg, black 0%, black var(--reveal), transparent calc(var(--reveal) + 14%))",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            } as CSSProperties
          }
        />
      </div>
    );
  }

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
