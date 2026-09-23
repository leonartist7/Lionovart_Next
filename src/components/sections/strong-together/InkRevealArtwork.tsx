"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef } from "react";

const VIEWBOX = 1000;
const IMAGE_ASPECT = 1672 / 941;
const STRONGER_TOGETHER_IMAGE =
  "/images/lion-paw-human-high-five.webp";

type Bloom = { cx: number; cy: number; rStart: number; rFinal: number };

const BLOOMS: Bloom[] = [
  { cx: 500, cy: 300, rStart: 0, rFinal: 1250 },
];

export type InkRevealArtworkHandle = {
  blooms: SVGCircleElement[];
  art: SVGImageElement | null;
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
    const artRef = useRef<SVGImageElement>(null);
    const bloomRefs = useRef<(SVGCircleElement | null)[]>([]);
    const rawId = useId();
    const uid = rawId.replace(/:/g, "");
    const maskId = `ink-mask-${uid}`;
    const filterId = `ink-filter-${uid}`;
    const artFadeId = `ink-art-fade-${uid}`;
    const artFadeGradientId = `ink-art-fade-gradient-${uid}`;

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
      if (!svg || !art) return;

      const applyGeometry = () => {
        const rect = svg.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const scale = Math.max(rect.width, rect.height) / VIEWBOX;
        const marqueeEl = document.getElementById("stronger-work-showcase");
        const ribbonSvg = marqueeEl?.querySelector("svg");
        const curve = ribbonSvg?.querySelector<SVGPathElement>("[data-ribbon-curve]");
        const heading = document.getElementById("strong-together-title");
        if (!marqueeEl || !ribbonSvg || !curve || !heading) return;

        // Measure the arc itself instead of reserving the entire marquee box:
        // its top is far above the box's lower edge, especially on phones.
        const ribbonRect = ribbonSvg.getBoundingClientRect();
        const ribbonViewBox = ribbonSvg.viewBox.baseVal;
        const apex = curve.getPointAtLength(curve.getTotalLength() / 2);
        const apexY = ribbonRect.top + (apex.y - ribbonViewBox.y) * ribbonRect.height / ribbonViewBox.height;
        const headingBottom = heading.getBoundingClientRect().bottom;
        const available = Math.max(0, apexY - headingBottom);
        const ribbonThickness = Math.max(48, Math.min(68, ribbonRect.width * 0.061));
        const artBottom = apexY + ribbonThickness * 0.42;
        const titleGap = Math.min(24, Math.max(8, available * 0.08));
        const artHeightPx = Math.max(48, Math.min(320, rect.width * 0.52, artBottom - headingBottom - titleGap));
        const artWidthPx = artHeightPx * IMAGE_ASPECT;
        const visibleY = (VIEWBOX - rect.height / scale) / 2;

        art.setAttribute("x", String((VIEWBOX - artWidthPx / scale) / 2));
        art.setAttribute("y", String(visibleY + (artBottom - artHeightPx - rect.top) / scale));
        art.setAttribute("width", String(artWidthPx / scale));
        art.setAttribute("height", String(artHeightPx / scale));
      };

      applyGeometry();
      const observer = new ResizeObserver(applyGeometry);
      observer.observe(svg);
      const marqueeEl = document.getElementById("stronger-work-showcase");
      if (marqueeEl) observer.observe(marqueeEl);
      const heading = document.getElementById("strong-together-title");
      if (heading) observer.observe(heading);
      const curve = marqueeEl?.querySelector("[data-ribbon-curve]");
      const curveObserver = new MutationObserver(applyGeometry);
      if (curve) curveObserver.observe(curve, { attributes: true, attributeFilter: ["d"] });
      document.fonts?.ready.then(applyGeometry);
      return () => { observer.disconnect(); curveObserver.disconnect(); };
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
          <linearGradient id={artFadeGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="82%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
          <mask id={artFadeId} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
            <rect x="0" y="0" width="1" height="1" fill={`url(#${artFadeGradientId})`} />
          </mask>
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
          <image
            ref={artRef}
            href={STRONGER_TOGETHER_IMAGE}
            preserveAspectRatio="xMidYMid meet"
            mask={`url(#${artFadeId})`}
            opacity={reducedMotion ? 1 : 0.72}
          />
        </g>
      </svg>
    );
  }
);

export default InkRevealArtwork;
