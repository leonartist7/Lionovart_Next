"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll, splitText, stagger } from "animejs";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface Props {
  as?: Tag;
  className?: string;
  /** Split granularity. `chars` for premium character-by-character reveals, `words` for lighter staggers. */
  by?: "chars" | "words";
  /** Per-element stagger in ms. */
  step?: number;
  /** Wave origin. */
  from?: "first" | "center" | "last" | "random" | number;
  /** Delay before the first element animates (ms). */
  delay?: number;
  /** Total per-char animation duration (ms). */
  duration?: number;
  /** Initial Y offset as % of the char height. */
  yFrom?: string;
  /** Initial rotateX in degrees. */
  rotateXFrom?: number;
  /** If true, the reveal can fire each time the section re-enters view. */
  repeat?: boolean;
  children: React.ReactNode;
}

/**
 * Character-level reveal driven by anime.js `splitText` + `onScroll` observer.
 *
 * The original HTML structure (including inline accent spans like
 * `<span className="text-brand-red">…</span>`) is preserved — colors and
 * styles on parent spans still apply to the wrapped chars.
 */
export function SplitTextReveal({
  as = "h2",
  className,
  by = "chars",
  step = 18,
  from = "first",
  delay = 0,
  duration = 900,
  yFrom = "110%",
  rotateXFrom = -70,
  repeat = false,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scope = createScope({ root: el }).add(() => {
      const splitter =
        by === "chars"
          ? splitText(el, { chars: { wrap: "clip" } })
          : splitText(el, { words: { wrap: "clip" } });

      const targets = by === "chars" ? splitter.chars : splitter.words;
      if (!targets || targets.length === 0) return;

      animate(targets, {
        y: [yFrom, "0%"],
        opacity: [0, 1],
        rotateX: [rotateXFrom, 0],
        duration,
        ease: "out(3)",
        delay: stagger(step, { from, start: delay }),
        autoplay: onScroll({
          target: el,
          enter: "bottom-=10% top",
          leave: "top top",
          repeat,
        }),
      });
    });

    return () => {
      scope.revert();
    };
  }, [by, step, from, delay, duration, yFrom, rotateXFrom, repeat]);

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} className={className} style={{ perspective: 800 }}>
      {children}
    </Tag>
  );
}
