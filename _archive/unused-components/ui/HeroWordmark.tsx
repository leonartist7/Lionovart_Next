"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll, splitText, stagger } from "animejs";

interface Props {
  text?: string;
  className?: string;
}

/**
 * HeroWordmark — the brand wordmark as monumental typography.
 *
 * Each letter is masked, then rises into view on an exponential ease-out
 * in a deliberate L→I→O→N→O→V→A→R→T sequence (~150ms apart). After the
 * wordmark sets, a single horizontal light sweep crosses it once. The
 * center "O" briefly drops into Sovereign Gold and returns — the Gold
 * Reserve Rule, lived.
 *
 * No mascot. No sparkles. No parallax. The wordmark IS the lion.
 */
export function HeroWordmark({
  text = "LIONOVART",
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const wordEl = root.querySelector<HTMLElement>(".hw-word");
    if (!wordEl) return;

    const scope = createScope({ root }).add(() => {
      const splitter = splitText(wordEl, { chars: { wrap: "clip" } });
      const chars = splitter.chars as HTMLElement[];
      if (!chars || chars.length === 0) return;

      // 1) Editorial set: each letter rises cleanly into its clip mask.
      const perChar = 150;
      animate(chars, {
        y: ["100%", "0%"],
        opacity: [0, 1],
        duration: 1200,
        ease: "out(5)",
        delay: stagger(perChar, { from: "first" }),
        autoplay: onScroll({
          target: root,
          enter: "bottom-=10% top",

        }),
      });

      // 2) Single horizontal light sweep once the wordmark has set.
      const sweep = root.querySelector<HTMLElement>(".hw-sweep");
      if (sweep) {
        animate(sweep, {
          translateX: ["-110%", "110%"],
          opacity: [0, 0.55, 0],
          duration: 1600,
          ease: "out(3)",
          delay: chars.length * perChar + 250,
          autoplay: onScroll({
            target: root,
            enter: "bottom-=10% top",

          }),
        });
      }

      // 3) The center "O" (index 4 in "LIONOVART") inherits Sovereign Gold
      //    for exactly one moment, then returns. Held in reserve.
      const centerIdx = (() => {
        // Find the second "O" — the structural center of the wordmark.
        let count = 0;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === "O") {
            count++;
            if (count === 2) return i;
          }
        }
        return Math.floor(text.length / 2);
      })();
      const oChar = chars[centerIdx];
      if (oChar) {
        animate(oChar, {
          color: ["#ffffff", "#f0c917", "#f0c917", "#ffffff"],
          duration: 1400,
          ease: "inOutQuad",
          delay: chars.length * perChar + 1100,
          autoplay: onScroll({
            target: root,
            enter: "bottom-=10% top",

          }),
        });
      }
    });

    return () => {
      scope.revert();
    };
  }, [text]);

  return (
    <div ref={rootRef} className={`relative w-full ${className ?? ""}`}>
      <h1
        className="hw-word font-clash font-black uppercase text-white text-center mx-auto whitespace-nowrap"
        style={{
          fontSize: "clamp(2.6rem, 14.5vw, 16rem)",
          lineHeight: 0.85,
          letterSpacing: "-0.04em",
          margin: 0,
        }}
      >
        {text}
      </h1>

      {/* Light sweep — narrow gradient band that crosses the wordmark once. */}
      <div
        className="hw-sweep pointer-events-none absolute inset-y-0 left-0 w-[35%]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
          mixBlendMode: "overlay",
          transform: "translateX(-110%)",
          opacity: 0,
        }}
      />
    </div>
  );
}
