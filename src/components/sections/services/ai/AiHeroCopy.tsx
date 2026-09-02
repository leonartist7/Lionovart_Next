"use client";

/**
 * ACT 1 — the hook.
 *
 * No ServiceCurtainHero: that is an opaque fixed video card and it would cover
 * the particle crown. SERVICE_PAGES_SPEC section 2 makes the Act 1 medium
 * per-page, and here the medium is the crown itself.
 *
 * One claim, one proof, one action. The proof and the action are the same
 * button: the visitor can test the agent we built before reading anything else.
 * This is the ONLY call to action allowed inside the hero's scroll range —
 * AiPageNav holds until the hero releases, and StickyCTA is suppressed on this
 * route entirely, so the three CTA systems can never stack here.
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
          // Hold the complete crown while the promise is being read, then let
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
            <p className="mb-6 text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--ai-gold)] md:text-[14px]">
              AI Systems · Built in-house in Calgary
            </p>
            <h1
              className="max-w-[19ch] font-semibold leading-[0.98] tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(2.6rem, 5.4vw, 5.4rem)" }}
            >
              Talk to the AI we built.{" "}
              <span className="text-[var(--ai-gold)]">Then decide if we should build yours.</span>
            </h1>
            <p className="mt-8 max-w-[52ch] text-[18px] font-light leading-[1.62] text-white/82 md:text-[21px]">
              Nova answers in five languages, knows our whole offer, and books the call.
              It&rsquo;s ours—no reseller platform underneath, no white-label wrapper. What
              you&rsquo;re about to test is the same craft we&rsquo;d put into your front desk.
            </p>
            <button
              type="button"
              onClick={() => openNova("hero", true)}
              className="mt-9 min-h-12 rounded-full bg-brand-red px-7 py-3.5 text-[17px] font-semibold tracking-[-0.01em] text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Talk to Nova
            </button>
            <p className="mt-4 max-w-[38ch] text-[17px] leading-[1.55] text-white/68">
              Runs right here. No form, no email, nothing to install.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
