"use client";

/**
 * ACT 1 — the hook.
 *
 * No ServiceCurtainHero: that is an opaque fixed video card and it would cover
 * the lion. SERVICE_PAGES_SPEC section 2 makes the Act 1 medium per-page, and
 * here the medium is the lion itself.
 *
 * The section owns the assembled lion and the first hint of its release. It
 * hands the same particle population to AiChaosBeat for the immersive bridge.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLionStage } from "@/lib/lion/stage-ref";
import { useNovaStore } from "@/lib/stores/nova-store";
import { HERO_MORPH_END } from "./AiChaosBeat";

gsap.registerPlugin(ScrollTrigger);

export default function AiHeroCopy() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const openNova = useNovaStore((state) => state.openNova);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(copyRef.current, {
        opacity: 0,
        y: -52,
        ease: "power2.in",
        scrollTrigger: { trigger: wrap, start: "44% top", end: "88% top", scrub: true },
      });

      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const stage = getLionStage();
          // Hold the complete lion while the promise is being read, then let
          // it begin opening only as the copy prepares to leave.
          const release = gsap.utils.clamp(0, 1, (self.progress - 0.34) / 0.66);
          stage?.setMorph(release * HERO_MORPH_END);
          stage?.setLayout(0.46);
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} data-ai-snap data-lion-zone className="relative h-[220svh] motion-reduce:h-svh">
      {/* The first frame establishes the page's editorial rhythm: copy on the
          left, the living lion on the right, with the mobile composition
          returning both toward centre. */}
      <div className="sticky top-0 h-svh px-6 md:px-10 lg:px-14">
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-end pb-[8svh] md:items-center md:pb-0">
          <div
            ref={copyRef}
            className="w-full max-w-[45rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:w-[55%]"
          >
            <p className="mb-6 text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--ai-cyan)] md:text-[14px]">
              AI Systems &amp; Consulting
            </p>
            <h1
              className="max-w-[14ch] font-normal leading-[0.91] tracking-[-0.05em] text-white"
              style={{ fontSize: "clamp(3.15rem, 6.8vw, 7rem)", fontFamily: "var(--font-ai-display)" }}
            >
              Your business keeps moving.{" "}
              <span className="text-[var(--ai-cyan)]">Even when you stop.</span>
            </h1>
            <p className="mt-8 max-w-[52ch] text-[18px] font-light leading-[1.62] text-white/82 md:text-[21px]">
              We design and manage one connected AI operating system that answers,
              follows up, coordinates and reports 24/7—so your team gets hours back
              and growth no longer depends on constant manual effort.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-[14px] font-medium tracking-[-0.01em] text-white/72 md:text-[15px]">
              <span>24/7 response</span>
              <span>10+ hours weekly target</span>
              <span>Continuously optimized</span>
            </div>
            <button
              type="button"
              onClick={() => openNova("hero", true)}
              className="mt-9 min-h-12 rounded-full bg-brand-red px-7 py-3.5 text-[16px] font-semibold tracking-[-0.01em] text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Find Your Highest-ROI System
            </button>
            <p className="mt-4 max-w-[38ch] text-[16px] leading-[1.55] text-white/68">
              Start with a focused audit. Leave with a clear automation roadmap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
