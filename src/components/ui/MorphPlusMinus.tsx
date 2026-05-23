"use client";

import { useEffect, useRef } from "react";
import { animate, svg } from "animejs";

const PLUS_D = "M 4 12 L 20 12 M 12 4 L 12 20";
const MINUS_D = "M 4 12 L 20 12 M 12 12 L 12 12";

interface Props {
  className?: string;
  size?: number;
}

/**
 * A single SVG path that morphs between `+` and `−` glyphs as the nearest
 * ancestor's `aria-expanded` attribute changes. Uses anime.js `svg.morphTo`.
 *
 * Designed as a drop-in replacement for chevron icons inside accessible
 * accordion / disclosure components — colors via `currentColor`.
 */
export function MorphPlusMinus({ className, size = 20 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const visiblePathRef = useRef<SVGPathElement>(null);
  const plusRef = useRef<SVGPathElement>(null);
  const minusRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    const path = visiblePathRef.current;
    if (!svgEl || !path) return;

    const trigger = svgEl.closest("[aria-expanded]");
    if (!trigger) return;

    const update = () => {
      const open = trigger.getAttribute("aria-expanded") === "true";
      const targetEl = open ? minusRef.current : plusRef.current;
      if (!targetEl) return;
      animate(path, {
        d: svg.morphTo(targetEl),
        duration: 320,
        ease: "out(2)",
      });
    };

    update();
    const mo = new MutationObserver(update);
    mo.observe(trigger, {
      attributes: true,
      attributeFilter: ["aria-expanded"],
    });
    return () => {
      mo.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      data-slot="accordion-trigger-icon"
    >
      <defs>
        <path ref={plusRef} d={PLUS_D} />
        <path ref={minusRef} d={MINUS_D} />
      </defs>
      <path
        ref={visiblePathRef}
        d={PLUS_D}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
