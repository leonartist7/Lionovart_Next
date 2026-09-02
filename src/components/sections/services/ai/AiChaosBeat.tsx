"use client";

/**
 * ACT 2 — the tension.
 *
 * The same particles that draw the crown open into an immersive field, then
 * reconnect as an ecosystem on the opposite side of the copy. No second
 * canvas, opaque sphere, or shader handoff is involved.
 *
 * The three beats name the three things that actually go wrong after a demo:
 * generic output, output that doesn't know the business, and a vendor who
 * can't explain what they built. Scanned in sequence, the three titles carry
 * the argument without the body copy.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLionStage } from "@/lib/lion/stage-ref";

gsap.registerPlugin(ScrollTrigger);

export const HERO_MORPH_END = 0.06;
export const BRIDGE_MORPH_END = 0.44;

const CHAPTERS = [
  {
    eyebrow: "The sameness",
    title: "It writes like everyone else.",
    body: "Every vendor's demo works—it is built to. What the demo doesn't show is the same model everyone else is using, in its factory voice, producing the paragraph your competitor published last Tuesday. Customers can't name what's wrong with it. They just trust it a little less, and they never tell you why.",
    side: "left",
  },
  {
    eyebrow: "The improvising",
    title: "It doesn't know your business.",
    body: "Nobody taught it your service names, your deposit policy, the thing you never say to a customer or the thing you always say. So it fills the gap on its own. Confidently. In front of the people you spent money to reach.",
    side: "right",
  },
  {
    eyebrow: "The handoff",
    title: "Nobody can explain what they built.",
    body: "You ask how it works and you get a screenshot of boxes joined by lines. Then a supplier changes a form, it breaks, and the person who set it up is on someone else's retainer. You didn't buy an AI problem. You bought a maintenance problem with a subscription attached.",
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

        const centers = [0.16, 0.50, 0.84];
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
          const distance = progress - centers[index];
          // A real reading hold: reach full opacity, stay there, then leave.
          // The former triangular curve was only completely clear for a
          // single scroll instant.
          const opacity = distance < 0
            ? gsap.utils.clamp(0, 1, 1 + distance / 0.13)
            : distance <= 0.09
              ? 1
              : gsap.utils.clamp(0, 1, 1 - (distance - 0.09) / 0.13);
          gsap.set(panel, {
            opacity,
            y: (centers[index] - progress) * 70,
            pointerEvents: opacity > 0.8 ? "auto" : "none",
          });
        });
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section ref={wrapRef} data-lion-zone className="relative h-[390svh] motion-reduce:h-auto md:h-[420svh]">
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
                <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--ai-gold)] md:text-[14px]">
                  {String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")} · {chapter.eyebrow}
                </p>
                <h2
                  className="mt-6 max-w-[16ch] font-semibold tracking-[-0.02em] text-white"
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 5rem)",
                    lineHeight: 1,
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
