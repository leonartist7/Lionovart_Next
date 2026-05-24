"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll, splitText, stagger } from "animejs";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface Props {
  as?: Tag;
  className?: string;
  /** Split granularity. `chars` for character-by-character reveals, `words` for lighter, more editorial staggers. */
  by?: "chars" | "words";
  /** Per-element stagger in ms. Default 50 — deliberate, not frantic. */
  step?: number;
  /** Wave origin. */
  from?: "first" | "center" | "last" | "random" | number;
  /** Delay before the first element animates (ms). */
  delay?: number;
  /** Per-element animation duration (ms). Default 1100 — exponential ease-out wants room to breathe. */
  duration?: number;
  /** Initial Y offset (percentage of element height). Use a clean 100% — no overshoot. */
  yFrom?: string;
  /** If true, the reveal can fire each time the section re-enters view. */
  repeat?: boolean;
  children: React.ReactNode;
}

/**
 * Editorial text reveal driven by anime.js `splitText` + `onScroll`.
 *
 * Motion is deliberate exponential ease-out per the brand vocabulary —
 * no rotateX, no scale bounce, no elastic. Each element rises cleanly
 * into place from below its clip mask, like type being set, not animated.
 *
 * The original HTML structure (inline accent spans like
 * `<span className="text-brand-red">…</span>`) is preserved so highlight
 * colors still apply per character.
 */
export function SplitTextReveal({
  as = "h2",
  className,
  by = "chars",
  step = 50,
  from = "first",
  delay = 0,
  duration = 1100,
  yFrom = "100%",
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
        duration,
        ease: "out(5)",
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
  }, [by, step, from, delay, duration, yFrom, repeat]);

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
