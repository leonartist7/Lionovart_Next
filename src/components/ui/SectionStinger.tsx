"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll, svg } from "animejs";

interface Props {
  className?: string;
  /** Stroke color of the line. */
  color?: string;
  /** Stroke thickness in px. */
  thickness?: number;
  /** Outer container height in px (controls vertical breathing room). */
  height?: number;
  /** Show a glowing spark riding the leading edge of the draw. */
  spark?: boolean;
}

/**
 * SectionStinger — a thin horizontal line that draws across the viewport
 * as the user scrolls past it. Built with anime.js `svg.createDrawable` and
 * `onScroll({ sync: 1 })` so progress is locked 1:1 to scroll position.
 *
 * Drop one between major sections as a premium-feeling visual punctuation:
 *
 *   <ProblemsSolvedSection />
 *   <SectionStinger className="bg-bg-dark" />
 *   <Services />
 */
export function SectionStinger({
  className,
  color = "#e5192a",
  thickness = 1.5,
  height = 80,
  spark = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const scope = createScope({ root: el }).add(() => {
      const line = el.querySelector<SVGPathElement>(".stinger-line");
      const sparkEl = el.querySelector<SVGCircleElement>(".stinger-spark");
      if (!line) return;

      const drawable = svg.createDrawable(line);
      animate(drawable, {
        draw: ["0 0", "0 1"],
        ease: "linear",
        duration: 1,
        autoplay: onScroll({
          target: el,
          enter: "end start",
          leave: "start end",
          sync: 1,
        }),
      });

      if (sparkEl) {
        const mp = svg.createMotionPath(line);
        animate(sparkEl, {
          translateX: mp.translateX,
          translateY: mp.translateY,
          ease: "linear",
          duration: 1,
          autoplay: onScroll({
            target: el,
            enter: "end start",
            leave: "start end",
            sync: 1,
          }),
        });
      }
    });

    return () => {
      scope.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ height: `${height}px`, width: "100%", overflow: "visible" }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 1000 ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <path
          className="stinger-line"
          d={`M 0 ${height / 2} L 1000 ${height / 2}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {spark && (
          <circle
            className="stinger-spark"
            cx="0"
            cy={height / 2}
            r="3.5"
            fill={color}
            style={{ filter: `drop-shadow(0 0 10px ${color})` }}
          />
        )}
      </svg>
    </div>
  );
}
