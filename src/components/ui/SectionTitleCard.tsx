"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, onScroll } from "animejs";

interface Props {
  /** The single word that defines what's coming next. Add a trailing "." for the Lacquer Red accent. */
  word: string;
  /**
   * Surrounding surface the card blends into. "light" → warm near-white
   * (\`bg-bg-surface-light\`) with a faded dark outline; "dark" → page dark bg
   * with a faded light outline. Default "dark".
   */
  theme?: "light" | "dark";
  /** Override the blend background. Defaults to the theme's surface token. */
  bgClassName?: string;
  /** Height of the compact background strip. */
  height?: string;
}

/**
 * SectionTitleCard — a compact chapter strip whose outline title traverses
 * the viewport horizontally as the user scrolls past. It blends into the
 * surrounding surface instead of reading as a standalone section.
 */
export function SectionTitleCard({
  word,
  theme = "dark",
  bgClassName,
  height = "clamp(6.5rem, 16vh, 11rem)",
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

  const body = word.endsWith(".") ? word.slice(0, -1) : word;
  const hasPeriod = word.endsWith(".");

  return (
    <div
      ref={rootRef}
      className={\`relative w-full overflow-hidden \${surface}\`}
      style={{ height }}
      aria-hidden="true"
    >
      <h2
        ref={wordRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap px-0 font-clash font-bold uppercase"
        style={{
          fontSize: "clamp(4rem, 11vw, 9rem)",
          lineHeight: 1,
          letterSpacing: "-0.045em",
          margin: 0,
          paddingBlock: "0.08em",
          willChange: "transform",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          WebkitTextStroke: \`1.5px \${strokeColor}\`,
        }}
      >
        {body}
        {hasPeriod && (
          <span style={{ color: "#e5192a", WebkitTextFillColor: "#e5192a", WebkitTextStroke: "0" }}>.</span>
        )}
      </h2>
    </div>
  );
}
