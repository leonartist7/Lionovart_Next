"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll } from "animejs";

interface Props {
  /** The single word that defines what's coming next. Add a trailing "." for the Lacquer Red accent. */
  word: string;
  /** Background color of the title card section. Defaults to absolute Void. */
  bgClassName?: string;
  /** Height of the card section in CSS units. Default `38vh`. */
  height?: string;
}

/**
 * SectionTitleCard — a single decisive word that traverses the viewport
 * horizontally as the user scrolls past, like a chapter card in a film.
 *
 * The word is rendered at viewport-filling scale in Clash Display, white,
 * with a Lacquer Red period as closing punctuation. Its horizontal
 * translation is locked 1:1 to scroll position via onScroll({ sync: 1 }).
 * The card section provides its own breathing room — a Void background
 * by default so the moment registers as a chapter break, not decoration.
 */
export function SectionTitleCard({
  word,
  bgClassName = "bg-[#000000]",
  height = "38vh",
}: Props) {
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
      const wordW = w.offsetWidth;
      const startX = ww;
      const endX = -wordW;

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

  const body = word.endsWith(".") ? word.slice(0, -1) : word;
  const hasPeriod = word.endsWith(".");

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden ${bgClassName}`}
      style={{ height }}
      aria-hidden="true"
    >
      <h2
        ref={wordRef}
        className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap font-clash font-black uppercase text-white"
        style={{
          fontSize: "clamp(7rem, 22vw, 22rem)",
          lineHeight: 0.82,
          letterSpacing: "-0.045em",
          margin: 0,
          willChange: "transform",
        }}
      >
        {body}
        {hasPeriod && <span style={{ color: "#e5192a" }}>.</span>}
      </h2>
    </div>
  );
}
