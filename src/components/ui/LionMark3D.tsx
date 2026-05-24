"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  animate,
  createScope,
  createSpring,
  onScroll,
  stagger,
  svg,
} from "animejs";

interface Props {
  className?: string;
  /** When true, layer Z-depths and parallax are amplified for hero use. */
  hero?: boolean;
}

/**
 * LionMark3D — an "alive" heraldic lion mark inspired by animejs.com's
 * continuously-moving hero centerpiece.
 *
 *  • Multi-layer SVG (mane spokes → mane ring → head → face) with per-layer
 *    `translateZ` for true 3D parallax under CSS `perspective`.
 *  • Idle breathing: each layer loops translateY/rotate at offset phases.
 *  • Scroll-synced color shift on all strokes: cream → red → gold.
 *  • Cursor parallax (spring-damped) so the mark tracks the viewer.
 *  • Line-draw entrance via `svg.createDrawable` — strokes paint in
 *    from the center outward when the section enters view.
 */
export function LionMark3D({ className, hero = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  const spokes = useMemo(() => {
    const count = 28;
    const arr: { x1: number; y1: number; x2: number; y2: number; key: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const inner = 118 + (i % 3 === 0 ? 0 : 2);
      const outer = i % 4 === 0 ? 178 : i % 2 === 0 ? 170 : 162;
      arr.push({
        x1: 200 + Math.cos(angle) * inner,
        y1: 200 + Math.sin(angle) * inner,
        x2: 200 + Math.cos(angle) * outer,
        y2: 200 + Math.sin(angle) * outer,
        key: i,
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const scope = createScope({ root: el }).add(() => {
      const strokes = el.querySelectorAll<SVGGeometryElement>(".lion-stroke");
      const layers = Array.from(el.querySelectorAll<HTMLElement>(".lion-layer"));
      const particles = Array.from(
        el.querySelectorAll<SVGCircleElement>(".lion-particle")
      );

      // 1) Line-draw entrance, scroll-synced from center outward
      const drawables = svg.createDrawable(strokes);
      animate(drawables, {
        draw: ["0 0", "0 1"],
        ease: "inOut(2)",
        duration: 1400,
        delay: stagger(35, { from: "center" }),
        autoplay: onScroll({
          target: el,
          enter: "bottom-=10% top",
          leave: "top+=20% center",
          sync: 0.6,
        }),
      });

      // 2) Idle breathing — each layer at its own phase
      layers.forEach((layer, i) => {
        animate(layer, {
          translateY: [{ to: -6 - i * 1.2 }],
          rotate: [{ from: -0.6, to: 0.6 }],
          duration: 2400 + i * 280,
          delay: i * 140,
          loop: true,
          alternate: true,
          ease: "inOutSine",
        });
      });

      // 3) Scroll-synced color shift across the section: cream → red → gold
      animate(strokes, {
        stroke: ["#f5f0eb", "#e5192a", "#f0c917"],
        duration: 1,
        autoplay: onScroll({
          target: el,
          enter: "top bottom",
          leave: "bottom top",
          sync: 1,
        }),
      });

      // 4) Orbiting sparkles — each particle rides one of two circular paths
      //    via svg.createMotionPath, infinite linear loops with phase offsets.
      const innerOrbit = el.querySelector<SVGPathElement>("#lion-orbit-inner");
      const outerOrbit = el.querySelector<SVGPathElement>("#lion-orbit-outer");
      if (innerOrbit && outerOrbit && particles.length) {
        const innerMP = svg.createMotionPath(innerOrbit);
        const outerMP = svg.createMotionPath(outerOrbit);
        particles.forEach((p, i) => {
          const useOuter = i % 2 === 1;
          const mp = useOuter ? outerMP : innerMP;
          const baseDuration = useOuter ? 22000 : 16000;
          animate(p, {
            translateX: mp.translateX,
            translateY: mp.translateY,
            duration: baseDuration + i * 600,
            ease: "linear",
            loop: true,
            delay: -((baseDuration + i * 600) * (i / particles.length)),
          });
          // Twinkle: opacity pulse so particles fade in/out as they travel.
          animate(p, {
            opacity: [0.35, 1],
            scale: [0.8, 1.25],
            duration: 1400 + i * 180,
            loop: true,
            alternate: true,
            ease: "inOutSine",
            delay: i * 220,
          });
        });
      }

      // 5) Cursor parallax — each layer responds proportionally to its depth
      const parallaxRange = hero ? 38 : 22;
      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const cx = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const cy = (e.clientY - rect.top - rect.height / 2) / rect.height;
        layers.forEach((layer) => {
          const depth = Number(layer.dataset.depth ?? 0);
          const factor = depth / 100;
          animate(layer, {
            translateX: cx * parallaxRange * factor,
            translateY: cy * parallaxRange * factor,
            duration: 900,
            ease: createSpring({ stiffness: 70, damping: 18 }),
          });
        });
      };
      window.addEventListener("mousemove", onMove, { passive: true });

      // Cleanup function returned to scope — runs on revert()
      return () => {
        window.removeEventListener("mousemove", onMove);
      };
    });

    return () => {
      scope.revert();
    };
  }, [hero]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        perspective: hero ? "1400px" : "1000px",
        transformStyle: "preserve-3d",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        {/* Soft radial glow behind everything + hidden orbit paths */}
        <defs>
          <radialGradient id="lionGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e5192a" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#f0c917" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0d0d0d" stopOpacity="0" />
          </radialGradient>
          {/* Invisible orbit paths the sparkles ride via createMotionPath */}
          <path
            id="lion-orbit-inner"
            d="M 68 200 A 132 132 0 1 1 332 200 A 132 132 0 1 1 68 200 Z"
            fill="none"
          />
          <path
            id="lion-orbit-outer"
            d="M 22 200 A 178 178 0 1 1 378 200 A 178 178 0 1 1 22 200 Z"
            fill="none"
          />
        </defs>

        {/* L1: Halo — deepest layer */}
        <g
          className="lion-layer"
          data-depth="-90"
          style={{ transform: "translateZ(-90px)", transformOrigin: "200px 200px" }}
        >
          <circle cx="200" cy="200" r="190" fill="url(#lionGlow)" />
          <circle
            cx="200"
            cy="200"
            r="178"
            className="lion-stroke"
            stroke="#f5f0eb"
            strokeOpacity="0.18"
            strokeWidth="0.6"
            fill="none"
          />
        </g>

        {/* L2: Mane radial spokes */}
        <g
          className="lion-layer"
          data-depth="-50"
          style={{ transform: "translateZ(-50px)", transformOrigin: "200px 200px" }}
        >
          {spokes.map((s) => (
            <line
              key={s.key}
              className="lion-stroke"
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="#f5f0eb"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* L3: Inner mane ring */}
        <g
          className="lion-layer"
          data-depth="-20"
          style={{ transform: "translateZ(-20px)", transformOrigin: "200px 200px" }}
        >
          <circle
            cx="200"
            cy="200"
            r="112"
            className="lion-stroke"
            stroke="#f5f0eb"
            strokeWidth="1.8"
            fill="none"
          />
        </g>

        {/* L4: Head silhouette + ears + crown accent */}
        <g
          className="lion-layer"
          data-depth="10"
          style={{ transform: "translateZ(10px)", transformOrigin: "200px 200px" }}
        >
          {/* Crown / flame on top */}
          <path
            className="lion-stroke"
            d="M 180 118 L 190 96 L 200 115 L 210 96 L 220 118"
            stroke="#f5f0eb"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ears */}
          <path
            className="lion-stroke"
            d="M 148 155 L 158 130 L 174 148"
            stroke="#f5f0eb"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="lion-stroke"
            d="M 252 155 L 242 130 L 226 148"
            stroke="#f5f0eb"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Head — soft squircle */}
          <path
            className="lion-stroke"
            d="M 140 178
               Q 140 138 200 138
               Q 260 138 260 178
               L 260 224
               Q 260 274 200 286
               Q 140 274 140 224
               Z"
            stroke="#f5f0eb"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Orbiting sparkles — between mane ring and head; small filled
            dots that ride the hidden orbit paths via createMotionPath. */}
        <g style={{ mixBlendMode: "screen" }}>
          <circle className="lion-particle" cx="0" cy="0" r="2.2" fill="#f0c917" />
          <circle className="lion-particle" cx="0" cy="0" r="1.8" fill="#e5192a" />
          <circle className="lion-particle" cx="0" cy="0" r="2.6" fill="#f0c917" />
          <circle className="lion-particle" cx="0" cy="0" r="1.6" fill="#f5f0eb" />
          <circle className="lion-particle" cx="0" cy="0" r="2" fill="#f0c917" />
          <circle className="lion-particle" cx="0" cy="0" r="1.4" fill="#e5192a" />
        </g>

        {/* L5: Face details — frontmost layer */}
        <g
          className="lion-layer"
          data-depth="30"
          style={{ transform: "translateZ(30px)", transformOrigin: "200px 200px" }}
        >
          {/* Eyes */}
          <ellipse
            cx="178"
            cy="196"
            rx="4.5"
            ry="3.5"
            className="lion-stroke"
            stroke="#f5f0eb"
            strokeWidth="1.6"
            fill="none"
          />
          <ellipse
            cx="222"
            cy="196"
            rx="4.5"
            ry="3.5"
            className="lion-stroke"
            stroke="#f5f0eb"
            strokeWidth="1.6"
            fill="none"
          />
          {/* Snout/nose triangle */}
          <path
            className="lion-stroke"
            d="M 192 220 L 208 220 L 200 234 Z"
            stroke="#f5f0eb"
            strokeWidth="1.8"
            fill="none"
            strokeLinejoin="round"
          />
          {/* Mouth — two curves */}
          <path
            className="lion-stroke"
            d="M 200 234 L 200 250 Q 195 258 184 254"
            stroke="#f5f0eb"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="lion-stroke"
            d="M 200 250 Q 205 258 216 254"
            stroke="#f5f0eb"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          {/* Whisker accents */}
          <line
            className="lion-stroke"
            x1="158"
            y1="232"
            x2="180"
            y2="238"
            stroke="#f5f0eb"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            className="lion-stroke"
            x1="160"
            y1="242"
            x2="180"
            y2="244"
            stroke="#f5f0eb"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            className="lion-stroke"
            x1="242"
            y1="232"
            x2="220"
            y2="238"
            stroke="#f5f0eb"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            className="lion-stroke"
            x1="240"
            y1="242"
            x2="220"
            y2="244"
            stroke="#f5f0eb"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
