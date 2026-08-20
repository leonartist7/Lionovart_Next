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
        filter: "blur(8px)",
        ease: "power2.in",
        scrollTrigger: { trigger: wrap, start: "32% top", end: "76% top", scrub: true },
      });

      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const stage = getLionStage();
          stage?.setMorph(self.progress * HERO_MORPH_END);
          stage?.setLayout(0.42);
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} data-lion-zone className="relative h-[190vh]">
      {/* The first frame establishes the page's editorial rhythm: copy on the
          left, the living lion on the right, with the mobile composition
          returning both toward centre. */}
      <div className="sticky top-0 h-screen px-6 md:px-10 lg:px-14">
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-end pb-[8vh] md:items-center md:pb-0">
          <div ref={copyRef} className="w-full max-w-[42rem] md:w-[52%]">
            <p className="mb-6 text-[10px] uppercase tracking-[0.42em] text-[var(--ai-blue)] md:text-[12px]">
              AI Systems &amp; Consulting
            </p>
            <h1
              className="font-normal leading-[0.88] tracking-[-0.05em] text-white"
              style={{ fontSize: "clamp(3.25rem, 7.2vw, 7.2rem)", fontFamily: "var(--font-ai-display)" }}
            >
              Your business,{" "}
              <span className="text-[var(--ai-cyan)]">always on.</span>
            </h1>
            <p className="mt-8 max-w-[43ch] text-[16px] font-light leading-[1.55] text-white/62 md:text-[18px]">
              One connected AI operating system that answers customers, converts
              opportunities, coordinates repetitive work, and shows you where to grow.
            </p>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[9px] uppercase tracking-[0.2em] text-white/38 md:text-[10px]">
              <span>24/7 response</span>
              <span>5+ hours returned weekly</span>
              <span>Always optimized</span>
            </div>
            <button
              type="button"
              onClick={() => openNova("hero", true)}
              className="mt-9 rounded-full bg-[var(--ai-blue)] px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.17em] text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-[11px]"
            >
              Find your highest-ROI system
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
