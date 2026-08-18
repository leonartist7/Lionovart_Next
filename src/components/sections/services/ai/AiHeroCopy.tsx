"use client";

/**
 * ACT 1 — the hook.
 *
 * No ServiceCurtainHero: that is an opaque fixed video card and it would cover
 * the lion. SERVICE_PAGES_SPEC section 2 makes the Act 1 medium per-page, and
 * here the medium is the lion itself.
 *
 * The section owns only the start of the transformation — the lion stays
 * assembled, just beginning a slow pre-rotation (PARTICLE_VERT's `preRot`
 * term). It hands off to `AiChaosBeat`, which stretches those same particles
 * into the central energy current. Both sections drive the SAME `uMorph`
 * scalar (see AiChaosBeat.tsx's `HERO_END`),
 * just different slices of its 0-1 range, so all of the camera/bloom/DOF
 * choreography that keys off `m` stays synchronized without new render loops.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLionStage } from "@/lib/lion/stage-ref";
import { HERO_MORPH_END } from "./AiChaosBeat";

gsap.registerPlugin(ScrollTrigger);

export default function AiHeroCopy() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(copyRef.current, {
        opacity: 0,
        y: -70,
        filter: "blur(10px)",
        ease: "power2.in",
        scrollTrigger: { trigger: wrap, start: "top top", end: "40% top", scrub: true },
      });

      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => getLionStage()?.setMorph(self.progress * HERO_MORPH_END),
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} data-lion-zone className="relative h-[280vh]">
      {/*
        The lion occupies the upper half of the canvas, so the copy sits in the
        lower third rather than centred. Nothing overlaps the face, and the
        headline is sized to be read under the mark, not to compete with it.
      */}
      <div className="sticky top-0 flex h-screen flex-col justify-end px-6 pb-[9vh]">
        <div ref={copyRef} className="mx-auto w-full max-w-[54rem] text-center">
          <p className="mb-5 text-[10px] uppercase tracking-[0.45em] text-[var(--ai-blue)]/80 md:text-[12px]">
            Smart Systems &amp; AI
          </p>
          <h1
            className="font-medium leading-[0.95] tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(2.4rem, 6vw, 5.6rem)", fontFamily: "var(--font-ai-display)" }}
          >
            Your business,{" "}
            <span className="text-[var(--ai-cyan)]">always on.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] text-[14px] leading-relaxed text-white/50 md:text-[15px]">
            A voice agent that answers in three seconds, qualifies the lead, and
            puts the call on your calendar. At 2am, on a Sunday, while you sleep.
          </p>
        </div>
      </div>
    </div>
  );
}
