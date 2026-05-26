"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

interface Props {
  className?: string;
  size?: number;
}

/**
 * Two stacked `<line>` strokes that form a `+` at rest and rotate into a `−`
 * when the nearest ancestor's `aria-expanded` flips to `true`. The horizontal
 * stroke stays fixed; the second stroke rotates between -90deg (vertical) and
 * 0deg (horizontal) so the geometry stays perfectly symmetric in both states.
 *
 * Drop-in for chevron icons inside accessible accordion / disclosure triggers.
 */
export function MorphPlusMinus({ className, size = 20 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rotatingRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    const line = rotatingRef.current;
    if (!svgEl || !line) return;

    const trigger = svgEl.closest("[aria-expanded]");
    if (!trigger) return;

    const update = () => {
      const open = trigger.getAttribute("aria-expanded") === "true";
      animate(line, {
        rotate: open ? 0 : -90,
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
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        ref={rotatingRef}
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
      />
    </svg>
  );
}
