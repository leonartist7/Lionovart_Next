"use client";

/**
 * ACT 1 — the hook.
 *
 * No ServiceCurtainHero: that is an opaque fixed video card and it would cover
 * the particle crown. SERVICE_PAGES_SPEC section 2 makes the Act 1 medium
 * per-page, and here the medium is the crown itself.
 *
 * The section owns the assembled crown and the first hint of its release, but
 * it no longer drives the engine directly: that beat is the `hero` entry in
 * src/lib/lion/chapters.ts, applied by the page's single conductor.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNovaStore } from "@/lib/stores/nova-store";

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
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div id="outcome" ref={wrapRef} data-ai-snap data-lion-zone className="relative h-[220svh] scroll-mt-28 motion-reduce:h-svh">
      {/* The first frame establishes the page's editorial rhythm: copy on the
          left, the living crown on the right, with the mobile composition
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
              You built it.{" "}
              <span className="text-[var(--ai-cyan)]">Regent runs it.</span>
            </h1>
            <p className="mt-8 max-w-[38ch] text-[18px] font-light leading-[1.62] text-white/82 md:max-w-[42ch] md:text-[21px]">
              A complete operating system for your business. It answers the phone,
              follows up, schedules the work, sends the invoices and reports back.
              You talk to it the way you would talk to your best operator.
              It never goes home.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-[14px] font-medium tracking-[-0.01em] text-white/72 md:text-[15px]">
              <span>Answers at every hour</span>
              <span>Built around your operation</span>
              <span>One system, not more tools</span>
            </div>
            <button
              type="button"
              onClick={() => openNova("hero", true)}
              className="mt-9 min-h-12 rounded-full bg-brand-red px-7 py-3.5 text-[17px] font-semibold tracking-[-0.01em] text-white transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(229,25,42,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Book the systems audit
            </button>
            <p className="mt-4 max-w-[38ch] text-[17px] leading-[1.55] text-white/68">
              We map where your hours actually go, then tell you which part of
              Regent to build first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
