"use client";

/**
 * TODO: swap brand crest SVG — placeholder heraldic lion + crown lockup.
 * Garnet → gold → ember gradient with a slow sheen sweep (dropped under
 * prefers-reduced-motion). Scales to its container via viewBox; pass width/height
 * through className/style.
 */

import { useId } from "react";
import { useReducedMotion } from "framer-motion";

const GARNET = "#7B1E22";
const GOLD = "#F0C917";
const EMBER = "#E5462A";

export default function BrandCrest({
  className,
  style,
  title = "LIONOVART crest",
}: {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  const reduce = useReducedMotion();
  const gid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 240 300"
      className={className}
      style={style}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={`crest-${gid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GARNET} />
          <stop offset="50%" stopColor={EMBER} />
          <stop offset="100%" stopColor={GOLD} />
          {!reduce && (
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from="0 0.5 0.5"
              to="360 0.5 0.5"
              dur="14s"
              repeatCount="indefinite"
            />
          )}
        </linearGradient>
      </defs>

      <g stroke={`url(#crest-${gid})`} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        {/* Crown */}
        <path
          d="M70 70 L70 44 L92 60 L120 32 L148 60 L170 44 L170 70 Z"
          fill={`url(#crest-${gid})`}
          fillOpacity="0.14"
        />
        <circle cx="70" cy="40" r="4" fill={`url(#crest-${gid})`} stroke="none" />
        <circle cx="120" cy="28" r="5" fill={`url(#crest-${gid})`} stroke="none" />
        <circle cx="170" cy="40" r="4" fill={`url(#crest-${gid})`} stroke="none" />

        {/* Shield */}
        <path
          d="M62 78 L178 78 L178 168 Q178 232 120 262 Q62 232 62 168 Z"
          fill={`url(#crest-${gid})`}
          fillOpacity="0.06"
        />

        {/* Lion mark (stylized, abstract) */}
        <path
          d="M120 104
             C104 104 96 116 96 130
             C96 138 100 144 106 148
             C98 152 92 160 92 172
             C92 192 106 206 120 214
             C134 206 148 192 148 172
             C148 160 142 152 134 148
             C140 144 144 138 144 130
             C144 116 136 104 120 104 Z"
          fill="none"
        />
        {/* mane rays */}
        <path d="M120 104 L120 90 M100 110 L90 100 M140 110 L150 100 M98 132 L84 130 M142 132 L156 130" />
        {/* eyes hint */}
        <circle cx="111" cy="134" r="2.4" fill={`url(#crest-${gid})`} stroke="none" />
        <circle cx="129" cy="134" r="2.4" fill={`url(#crest-${gid})`} stroke="none" />
      </g>
    </svg>
  );
}
