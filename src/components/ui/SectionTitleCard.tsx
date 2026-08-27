"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll } from "animejs";

interface Props {
  /** The single word that defines what's coming next. Add a trailing "." for the Lacquer Red accent. */
  word: string;
  /**
   * Surrounding surface the card blends into. "light" → warm near-white
   * (`bg-bg-surface-light`) with a faded dark outline; "dark" → page dark bg
   * with a faded light outline. Default `"dark"`.
   */
  theme?: "light" | "dark";
  /** Override the blend background. Defaults to the theme's surface token. */
  bgClassName?: string;
  /** Height of the card section in CSS units. Default `38vh`. */
  height?: string;
  /** Responsive font size for the chapter word. */
  fontSize?: string;
}

/**
 * SectionTitleCard — a single decisive word that traverses the viewport
 * horizontally as the user scrolls past, like a chapter card in a film.
 *
 * The word is rendered at viewport-filling scale in Clash Display as a soft
 * faded outline (no fill), with a Lacquer Red period as closing punctuation.
 * Its horizontal translation is locked 1:1 to scroll position via
 * onScroll({ sync: 1 }). The card blends into the surrounding section surface
 * (theme) so the moment registers as a ghosted chapter break, not a hard block.
 */
export function SectionTitleCard({
  word,
  theme = "dark",
  bgClassName,
  height = "38vh",
  fontSize = "clamp(7rem, 22vw, 22rem)",
}: Props) {
  const isLight = theme === "light";
  const surface = bgClassName ?? (isLight ? "bg-bg-surface-light" : "bg-bg-dark");
  const strokeColor = isLight ? "rgba(17,17,17,0.16)" : "rgba(255,255,255,0.16)";
  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const w = wordRef.current;
    if (!root || !w) return;

    let scope: ReturnType<typeof createScope> | null = null;

    const setup = () => {
      if (scope) scope.revert();
      const ww = window.innerWidth;
      const startX = ww;
      const endX = -w.offsetWidth;

      scope = createScope({ root }).add(() => {
        animate(w, {
          translateX: [startX, endX],
          ease: "linear",
          duration: 1,
          autoplay: onScroll({
            target: root,
            enter: "end start",
            leave: "start end",
            sync: 1,
          }),
        });
      });
    };

    setup();
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      scope?.revert();
    };
  }, [word]);

  const accent = word.endsWith(".") || word.endsWith("?") ? word.slice(-1) : null;
  const body = accent ? word.slice(0, -1) : word;
  const hasSpace = body.includes(" ");

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden ${surface}`}
      style={{ height }}
      aria-hidden="true"
    >
      <h2
        ref={wordRef}
        className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap font-clash font-bold uppercase"
        style={{
          fontSize,
          lineHeight: 0.82,
          letterSpacing: "-0.045em",
          wordSpacing: hasSpace ? "0.875rem" : undefined,
          margin: 0,
          willChange: "transform",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          WebkitTextStroke: `2px ${strokeColor}`,
        }}
      >
        {body}
        {accent && (
          <span style={{ color: "#e5192a", WebkitTextFillColor: "#e5192a", WebkitTextStroke: "0" }}>{accent}</span>
        )}
      </h2>
    </div>
  );
}
