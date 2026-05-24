"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createScope, splitText, stagger } from "animejs";

interface Props {
  /** Words to cycle through, in order. Repeats indefinitely. */
  words?: string[];
  /** Hold time per word in ms before transitioning to the next. */
  holdMs?: number;
  className?: string;
}

/**
 * HeroDecree — a single decree-grade word at viewport-filling scale that
 * rotates through a small vocabulary of brand statements.
 *
 * Each word transition is a deliberate exchange: outgoing chars rise out
 * of the top, incoming chars rise in from below — staggered from the
 * first letter, exponential ease-out. No bounce, no rotate, no scale.
 * Reads as one statement being replaced by the next, like a kinetic
 * title sequence.
 */
export function HeroDecree({
  words = ["ROAR.", "REIGN.", "UNDENIABLE.", "SOVEREIGN."],
  holdMs = 3200,
  className,
}: Props) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);

  // Rotation timer — pauses when the tab is hidden.
  useEffect(() => {
    if (words.length <= 1) return;
    let paused = document.hidden;
    const onVis = () => {
      paused = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    const id = window.setInterval(() => {
      if (!paused) setIndex((i) => (i + 1) % words.length);
    }, holdMs);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [words.length, holdMs]);

  // Drive the per-character reveal each time the word changes.
  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;

    const scope = createScope({ root: el }).add(() => {
      const splitter = splitText(el, { chars: { wrap: "clip" } });
      const chars = splitter.chars as HTMLElement[];
      if (!chars || chars.length === 0) return;

      animate(chars, {
        y: ["110%", "0%"],
        opacity: [0, 1],
        duration: 1100,
        ease: "out(5)",
        delay: stagger(48, { from: "first" }),
      });
    });

    return () => {
      scope.revert();
    };
  }, [index]);

  const word = words[index] ?? "";

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
    >
      <h1
        key={index}
        ref={wordRef}
        className="font-clash font-black uppercase text-white text-center mx-auto whitespace-nowrap"
        style={{
          fontSize: "clamp(3.5rem, 18vw, 20rem)",
          lineHeight: 0.85,
          letterSpacing: "-0.045em",
          margin: 0,
        }}
      >
        {/* Render with a colored final period if it ends with one. */}
        {word.endsWith(".") ? (
          <>
            {word.slice(0, -1)}
            <span style={{ color: "#e5192a" }}>.</span>
          </>
        ) : (
          word
        )}
      </h1>
    </div>
  );
}
