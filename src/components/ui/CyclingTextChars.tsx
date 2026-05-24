"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, splitText, stagger } from "animejs";

interface Props {
  text: string;
  style?: React.CSSProperties;
}

/**
 * CyclingTextChars — renders a string with a per-character "shred" reveal
 * via anime.js `text.splitText` + staggered `animate()`. Each mount plays
 * the full entrance (designed for use inside an AnimatePresence parent
 * where the component re-mounts each cycle).
 */
export function CyclingTextChars({ text, style }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scope = createScope({ root: el }).add(() => {
      const splitter = splitText(el, { chars: { wrap: "clip" } });
      const chars = splitter.chars;
      if (!chars || chars.length === 0) return;

      // Layered on top of the parent motion.div's y-slide: chars unfurl in 3D
      // (rotateX + scale) without compounding the slide.
      animate(chars, {
        opacity: [0, 1],
        rotateX: [-95, 0],
        scale: [0.7, 1],
        duration: 720,
        ease: "out(3)",
        delay: stagger(26, { from: "center" }),
      });
    });

    return () => {
      scope.revert();
    };
  }, [text]);

  return (
    <span ref={ref} style={{ ...style, perspective: 800, display: "inline-block" }}>
      {text}
    </span>
  );
}
