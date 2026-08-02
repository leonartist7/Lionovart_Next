"use client";

/**
 * Inverse mouse parallax + ambient drift, shared across all layers via one
 * pointermove listener and one rAF loop (registry pattern — never one listener
 * per layer). Every layer translates OPPOSITE the cursor, scaled by `depth`.
 *
 * Two nested elements on purpose:
 *   - outer  → positioning + GSAP scroll-out target (forwarded ref / className)
 *   - inner  → receives the mouse/drift transform
 * So GSAP (scroll) and parallax (mouse) write to different nodes and never fight.
 *
 * Reduced-motion: provider runs no listener/rAF, layers render static.
 */

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

type LayerMeta = { depth: number; phase: number; amp: number; period: number };

interface ParallaxAPI {
  register: (el: HTMLElement, meta: LayerMeta) => () => void;
}

const ParallaxContext = createContext<ParallaxAPI | null>(null);

const MAX_SHIFT = 40; // px at depth=1, full cursor deflection
const LERP = 0.08;

export function ParallaxProvider({ children }: { children: React.ReactNode }) {
  const layers = useRef<Map<HTMLElement, LayerMeta>>(new Map());

  const api = useMemo<ParallaxAPI>(
    () => ({
      register(el, meta) {
        layers.current.set(el, meta);
        return () => {
          layers.current.delete(el);
        };
      },
    }),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    // normalized target cursor offset from center, -1..1
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      cur.x += (target.x - cur.x) * LERP;
      cur.y += (target.y - cur.y) * LERP;
      const t = (now - start) / 1000;
      layers.current.forEach((m, el) => {
        // inverse parallax (opposite cursor) + slow ambient sine drift
        const px = -cur.x * MAX_SHIFT * m.depth;
        const py = -cur.y * MAX_SHIFT * m.depth;
        const dx = Math.sin(t / m.period + m.phase) * m.amp;
        const dy = Math.cos(t / (m.period * 1.3) + m.phase) * m.amp * 0.6;
        el.style.transform = `translate3d(${px + dx}px, ${py + dy}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <ParallaxContext.Provider value={api}>{children}</ParallaxContext.Provider>;
}

interface ParallaxLayerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0 = static background, 1 = strongest foreground parallax */
  depth?: number;
}

/** Forwarded ref points at the OUTER node (GSAP scroll-out target). */
export const ParallaxLayer = forwardRef<HTMLDivElement, ParallaxLayerProps>(
  function ParallaxLayer({ depth = 0.5, children, ...rest }, ref) {
    const api = useContext(ParallaxContext);
    const innerRef = useRef<HTMLDivElement>(null);

    // stable per-layer drift signature (no Math.random in render path beyond mount)
    const meta = useRef<LayerMeta>({
      depth,
      phase: depth * 6.283, // spread phases by depth so layers don't drift in lockstep
      amp: 2 + depth * 4, // 2–6px
      period: 18 + depth * 12, // 18–30s loops
    });
    useEffect(() => {
      if (!api || !innerRef.current) return;
      return api.register(innerRef.current, meta.current);
    }, [api]);

    return (
      <div ref={ref} {...rest}>
        <div ref={innerRef} style={{ willChange: "transform" }}>
          {children}
        </div>
      </div>
    );
  },
);
