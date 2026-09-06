"use client";

/**
 * The missing bridge between the hero and the service story.
 *
 * The same particles that draw the crown open into an immersive field, then
 * reconnect as an ecosystem on the opposite side of the copy. No second
 * canvas, opaque sphere, or shader handoff is involved.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { getConductor } from "@/lib/lion/conductor";
import { bridgePanelOffset, bridgePanelOpacity } from "@/lib/lion/chapters";

// Morph boundaries now live in the ledger (src/lib/lion/chapters.ts).
export { HERO_MORPH_END, BRIDGE_MORPH_END } from "@/lib/lion/chapters";

const CHAPTERS = [
  {
    eyebrow: "The hidden cost",
    title: "Your team is doing work your systems should handle.",
    body: "Calls wait. Leads cool down. Information gets copied between tools. The cost is not only time. It is the opportunity that disappears while everyone stays busy.",
    side: "left",
  },
  {
    eyebrow: "The turning point",
    title: "When the noise clears, the opportunity appears.",
    body: "Every conversation, task and customer signal becomes visible in one place. Intelligence starts by understanding the full picture, and knowing what should happen next.",
    side: "right",
  },
  {
    eyebrow: "The connected ecosystem",
    title: "Now the whole business moves together.",
    body: "Voice, inbox, calendar, customers, operations and payments share context as one living system that responds faster while asking less from your team.",
    side: "left",
  },
] as const;

export default function AiChaosBeat() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      panelsRef.current.forEach((panel, index) => {
        if (panel) gsap.set(panel, { opacity: index === CHAPTERS.length - 1 ? 1 : 0, y: 0 });
      });
      return;
    }

    // The panels read the same story position the particle world does, so copy
    // and camera can never drift apart. The bridge's own particle beat is the
    // `bridge` entry in the ledger.
    const unsubscribe = getConductor().subscribe(({ id, t }) => {
      if (id !== "bridge") return;
      panelsRef.current.forEach((panel, index) => {
        if (!panel) return;
        const opacity = bridgePanelOpacity(index, t);
        gsap.set(panel, {
          opacity,
          y: bridgePanelOffset(index, t),
          pointerEvents: opacity > 0.8 ? "auto" : "none",
        });
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <section ref={wrapRef} data-ai-chapter="bridge" data-lion-zone className="relative h-[240svh] motion-reduce:h-auto md:h-[260svh]">
      {CHAPTERS.map((chapter, index) => (
        <span
          key={`${chapter.eyebrow}-snap`}
          aria-hidden="true"
          data-ai-snap
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: `${[16, 50, 84][index]}%` }}
        />
      ))}
      <div className="sticky top-0 h-svh overflow-hidden px-6 motion-reduce:static motion-reduce:h-auto md:px-10 lg:px-14">
        <div className="relative mx-auto h-full w-full max-w-[1280px]">
          {CHAPTERS.map((chapter, index) => (
            <div
              key={chapter.eyebrow}
              ref={(node) => { panelsRef.current[index] = node; }}
              className={`absolute inset-0 flex items-end pb-[10svh] motion-reduce:relative motion-reduce:min-h-[90svh] motion-reduce:!opacity-100 md:items-center md:pb-0 ${
                chapter.side === "right" ? "justify-end" : "justify-start"
              }`}
              style={{ opacity: index === 0 ? 1 : 0 }}
            >
              <div className="w-full max-w-[44rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:w-[55%]">
                <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--ai-cyan)] md:text-[14px]">
                  {String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")} · {chapter.eyebrow}
                </p>
                <h2
                  className="mt-6 font-normal tracking-[-0.045em] text-white"
                  style={{
                    fontFamily: "var(--font-ai-display)",
                    fontSize: "clamp(2.8rem, 5.5vw, 5.8rem)",
                    lineHeight: 0.96,
                  }}
                >
                  {chapter.title}
                </h2>
                <p className="mt-8 max-w-[50ch] text-[18px] font-light leading-[1.62] text-white/82 md:text-[21px]">
                  {chapter.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
