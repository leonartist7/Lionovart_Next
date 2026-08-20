"use client";

/**
 * The missing bridge between the hero and the service story.
 *
 * The same particles that draw the lion open into an immersive field, then
 * reconnect as an ecosystem on the opposite side of the copy. No second
 * canvas, opaque sphere, or shader handoff is involved.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLionStage } from "@/lib/lion/stage-ref";

gsap.registerPlugin(ScrollTrigger);

export const HERO_MORPH_END = 0.06;
export const BRIDGE_MORPH_END = 0.58;

const CHAPTERS = [
  {
    eyebrow: "The gap between tools",
    title: "More software created more work.",
    body: "Calls in one place. Leads in another. Operations living in somebody's head. The problem was never a lack of tools—it was the space between them.",
    side: "left",
  },
  {
    eyebrow: "The turning point",
    title: "Step inside the signal.",
    body: "Every loose particle is a conversation, decision, or opportunity. Intelligence starts by seeing the whole field at once.",
    side: "right",
  },
  {
    eyebrow: "The connected ecosystem",
    title: "Now every system speaks.",
    body: "Voice, inbox, calendar, customers, operations, and payments become one living network—sharing context instead of creating more work.",
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

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: ({ progress }) => {
        const stage = getLionStage();
        stage?.setMorph(HERO_MORPH_END + progress * (BRIDGE_MORPH_END - HERO_MORPH_END));

        const centers = [0.14, 0.50, 0.84];
        const layouts = [0.42, -0.42, 0.42];
        const leg = progress <= centers[1] ? 0 : 1;
        const layoutProgress = gsap.utils.clamp(
          0,
          1,
          (progress - centers[leg]) / (centers[leg + 1] - centers[leg]),
        );
        stage?.setLayout(gsap.utils.interpolate(layouts[leg], layouts[leg + 1], layoutProgress));

        panelsRef.current.forEach((panel, index) => {
          if (!panel) return;
          const distance = Math.abs(progress - centers[index]);
          const opacity = gsap.utils.clamp(0, 1, 1 - distance / 0.19);
          gsap.set(panel, {
            opacity,
            y: (centers[index] - progress) * 70,
            filter: `blur(${(1 - opacity) * 8}px)`,
            pointerEvents: opacity > 0.8 ? "auto" : "none",
          });
        });
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section ref={wrapRef} data-lion-zone className="relative h-[340vh]">
      <div className="sticky top-0 h-screen overflow-hidden px-6 md:px-10 lg:px-14">
        <div className="relative mx-auto h-full w-full max-w-[1280px]">
          {CHAPTERS.map((chapter, index) => (
            <div
              key={chapter.eyebrow}
              ref={(node) => { panelsRef.current[index] = node; }}
              className={`absolute inset-0 flex items-end pb-[9vh] md:items-center md:pb-0 ${
                chapter.side === "right" ? "justify-end" : "justify-start"
              }`}
              style={{ opacity: index === 0 ? 1 : 0 }}
            >
              <div className="w-full max-w-[40rem] md:w-[52%]">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--ai-cyan)] md:text-[11px]">
                  {String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")} · {chapter.eyebrow}
                </p>
                <h2
                  className="mt-6 font-normal tracking-[-0.045em] text-white"
                  style={{
                    fontFamily: "var(--font-ai-display)",
                    fontSize: "clamp(2.75rem, 5.6vw, 5.8rem)",
                    lineHeight: 0.94,
                  }}
                >
                  {chapter.title}
                </h2>
                <p className="mt-8 max-w-[42ch] text-[16px] font-light leading-[1.55] text-white/60 md:text-[18px]">
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
