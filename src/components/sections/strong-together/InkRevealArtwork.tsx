"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef } from "react";

const VIEWBOX = 1000;
const PAW_ASPECT = 1536 / 1024;
const HAND_ASPECT = 1024 / 1536;

type Bloom = { cx: number; cy: number; rStart: number; rFinal: number };

const BLOOMS: Bloom[] = [
  { cx: 500, cy: 300, rStart: 2.5, rFinal: 1250 },
  { cx: 60, cy: 60, rStart: 1.5, rFinal: 235 },
  { cx: 940, cy: 60, rStart: 1.5, rFinal: 235 },
  { cx: 60, cy: 940, rStart: 1.5, rFinal: 235 },
  { cx: 940, cy: 940, rStart: 1.5, rFinal: 235 },
  { cx: 500, cy: 0, rStart: 1.2, rFinal: 130 },
  { cx: 0, cy: 500, rStart: 1.2, rFinal: 130 },
  { cx: 500, cy: 1000, rStart: 1.2, rFinal: 130 },
  { cx: 1000, cy: 500, rStart: 1.2, rFinal: 130 },
];

export type InkRevealArtworkHandle = {
  blooms: SVGCircleElement[];
  art: SVGGElement | null;
  setOriginFromClientPoint: (clientX: number, clientY: number) => void;
};

type InkRevealArtworkProps = {
  reducedMotion: boolean;
  className?: string;
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const InkRevealArtwork = forwardRef<InkRevealArtworkHandle, InkRevealArtworkProps>(
  function InkRevealArtwork({ reducedMotion, className }, ref) {
    const svgRef = useRef<SVGSVGElement>(null);
    const artRef = useRef<SVGGElement>(null);
    const pawRef = useRef<SVGImageElement>(null);
    const handRef = useRef<SVGImageElement>(null);
    const bloomRefs = useRef<(SVGCircleElement | null)[]>([]);
    const rawId = useId();
    const uid = rawId.replace(/:/g, "");
    const maskId = `ink-mask-${uid}`;
    const filterId = `ink-filter-${uid}`;

    const clientPointToViewBox = (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const scale = Math.max(rect.width, rect.height) / VIEWBOX;
      const offsetX = (rect.width - VIEWBOX * scale) / 2;
      const offsetY = (rect.height - VIEWBOX * scale) / 2;
      return {
        x: (clientX - rect.left - offsetX) / scale,
        y: (clientY - rect.top - offsetY) / scale,
      };
    };

    useIsomorphicLayoutEffect(() => {
      const svg = svgRef.current;
      const art = artRef.current;
      const paw = pawRef.current;
      const hand = handRef.current;
      if (!svg || !art || !paw || !hand) return;

      const applyGeometry = () => {
        const rect = svg.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const scale = Math.max(rect.width, rect.height) / VIEWBOX;
        const viewW = rect.width / scale;
        const viewH = rect.height / scale;
        const visibleX = (VIEWBOX - viewW) / 2;
        const visibleY = (VIEWBOX - viewH) / 2;
        const isTall = viewH / viewW > 1.3;
        const targetX = visibleX + viewW / 2;
        const targetY = visibleY + viewH * (isTall ? 0.54 : 0.5);

        // Both transparent limbs converge at the same point. Their canvases
        // deliberately continue below the visible viewport, so the red
        // marquee covers the crop instead of exposing an empty seam.
        const pawH = viewH * (isTall ? 0.64 : 0.78);
        const pawW = pawH * PAW_ASPECT;
        paw.setAttribute("x", String(targetX - pawW * 0.78));
        paw.setAttribute("y", String(targetY - pawH * 0.2));
        paw.setAttribute("width", String(pawW));
        paw.setAttribute("height", String(pawH));

        const handH = viewH * (isTall ? 0.72 : 0.9);
        const handW = handH * HAND_ASPECT;
        hand.setAttribute("x", String(targetX - handW * 0.07));
        hand.setAttribute("y", String(targetY - handH * 0.1));
        hand.setAttribute("width", String(handW));
        hand.setAttribute("height", String(handH));
      };

      applyGeometry();
      const observer = new ResizeObserver(applyGeometry);
      observer.observe(svg);
      return () => observer.disconnect();
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        get blooms() {
          return bloomRefs.current.filter((b): b is SVGCircleElement => b !== null);
        },
        get art() {
          return artRef.current;
        },
        setOriginFromClientPoint(clientX: number, clientY: number) {
          const origin = clientPointToViewBox(clientX, clientY);
          const primary = bloomRefs.current[0];
          if (!origin || !primary) return;
          primary.setAttribute("cx", String(origin.x));
          primary.setAttribute("cy", String(origin.y));
          const radius = Math.max(
            Math.hypot(origin.x, origin.y),
            Math.hypot(VIEWBOX - origin.x, origin.y),
            Math.hypot(origin.x, VIEWBOX - origin.y),
            Math.hypot(VIEWBOX - origin.x, VIEWBOX - origin.y)
          ) + 36;
          primary.dataset.rFinal = String(radius);
        },
      }),
      []
    );

    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className={className}
      >
        <defs>
          <filter
            id={filterId}
            x="-15%"
            y="-15%"
            width="130%"
            height="130%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045"
              numOctaves="2"
              seed="7"
              result="ink-noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="ink-noise"
              scale="13"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={VIEWBOX} height={VIEWBOX}>
            <rect width={VIEWBOX} height={VIEWBOX} fill="#000" />
            <g filter={`url(#${filterId})`}>
              {BLOOMS.map((bloom, i) => (
                <circle
                  key={i}
                  ref={(el) => {
                    bloomRefs.current[i] = el;
                  }}
                  cx={bloom.cx}
                  cy={bloom.cy}
                  r={reducedMotion ? bloom.rFinal : bloom.rStart}
                  fill="#fff"
                  data-r-start={bloom.rStart}
                  data-r-final={bloom.rFinal}
                />
              ))}
            </g>
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          <rect width={VIEWBOX} height={VIEWBOX} fill="#f2ede3" />
          <g ref={artRef} opacity={reducedMotion ? 1 : 0.72}>
            <image
              ref={pawRef}
              href="/images/lion-paw-transparent.webp"
              preserveAspectRatio="xMidYMid meet"
            />
            <image
              ref={handRef}
              href="/images/human-hand-transparent.webp"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </g>
      </svg>
    );
  }
);

export default InkRevealArtwork;
