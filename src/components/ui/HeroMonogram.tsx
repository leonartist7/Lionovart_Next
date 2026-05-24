"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll, svg } from "animejs";

interface Props {
  className?: string;
}

/**
 * HeroMonogram — the brand reduced to a single architectural "L".
 *
 * One continuous stroke: vertical bar, right-angle corner, horizontal
 * baseline. Etched into view via svg.createDrawable on scroll enter,
 * then a small Lacquer Red period appears under the baseline — a single
 * piece of punctuation that closes the statement.
 *
 * The geometry is heraldic, not anatomical. Restrained to the point of
 * inevitability.
 */
export function HeroMonogram({ className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scope = createScope({ root }).add(() => {
      const mainPath = root.querySelector<SVGPathElement>(".hm-main");
      const accentPath = root.querySelector<SVGPathElement>(".hm-accent");
      const period = root.querySelector<SVGCircleElement>(".hm-period");
      if (!mainPath) return;

      // 1) Etch the L itself — top → corner → right baseline.
      const drawables = svg.createDrawable([mainPath]);
      const mainAnim = animate(drawables, {
        draw: ["0 0", "0 1"],
        ease: "out(5)",
        duration: 1900,
        autoplay: onScroll({
          target: root,
          enter: "bottom-=10% top",

        }),
      });

      // 2) Accent crown bar etches in after the L is set.
      if (accentPath) {
        const accentDrawable = svg.createDrawable([accentPath]);
        animate(accentDrawable, {
          draw: ["0.5 0.5", "0 1"],
          ease: "out(5)",
          duration: 900,
          delay: 1700,
          autoplay: onScroll({
            target: root,
            enter: "bottom-=10% top",

          }),
        });
      }

      // 3) The period — a small red dot — appears last as closing punctuation.
      if (period) {
        animate(period, {
          scale: [0, 1],
          opacity: [0, 1],
          ease: "out(5)",
          duration: 700,
          delay: 2400,
          autoplay: onScroll({
            target: root,
            enter: "bottom-=10% top",

          }),
        });
      }

      // Force-link revert so all three stay in lock-step on tear-down.
      void mainAnim;
    });

    return () => {
      scope.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative w-full flex items-center justify-center ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 460 540"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "min(60vw, 540px)",
          height: "auto",
          overflow: "visible",
        }}
        aria-hidden="true"
      >
        {/* Crown accent — a short horizontal cap above the vertical, like
            the bar of a serif. Etched in after the main L. */}
        <path
          className="hm-accent"
          d="M 40 70 L 160 70"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="square"
          fill="none"
        />

        {/* Main L — one continuous stroke: vertical → corner → baseline. */}
        <path
          className="hm-main"
          d="M 100 90 L 100 430 L 420 430"
          stroke="#ffffff"
          strokeWidth="44"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />

        {/* Period — closing punctuation in Lacquer Red. */}
        <circle
          className="hm-period"
          cx="450"
          cy="430"
          r="14"
          fill="#e5192a"
          style={{ transformOrigin: "450px 430px" }}
        />
      </svg>
    </div>
  );
}
