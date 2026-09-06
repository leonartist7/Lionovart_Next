"use client";

import { useNovaStore } from "@/lib/stores/nova-store";
import { LiquidGlass } from "./LiquidGlass";

export default function AiDecision() {
  const openNova = useNovaStore((state) => state.openNova);

  return (
    <section id="contact" className="relative flex min-h-[150svh] items-end px-6 pb-32 pt-[50svh] md:min-h-[165svh] md:pb-44 md:pt-[58svh]">
      <div className="mx-auto w-full max-w-[1040px]">
        <LiquidGlass className="px-6 py-12 text-center sm:px-10 md:px-16 md:py-16">
          <p className="text-[13px] font-medium uppercase tracking-[0.19em] text-[var(--ai-cyan)] md:text-[14px]">
            One conversation to start
          </p>
          <h2
            className="mx-auto mt-6 max-w-[13ch] font-normal leading-[0.94] tracking-[-0.05em] text-white"
            style={{ fontFamily: "var(--font-ai-display)", fontSize: "clamp(2.9rem, 7.5vw, 6.8rem)" }}
          >
            You built it. Now let it run.
          </h2>
          <p className="mx-auto mt-7 max-w-[56ch] text-[18px] font-light leading-[1.65] text-white/78 md:text-[20px]">
            Tell Nova where the work piles up. We measure it, show you the number, and tell you which part of Regent earns its place first. If the case is not there, we will say so.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => openNova("hero", true)}
              className="min-h-14 rounded-full bg-brand-red px-8 py-4 text-[17px] font-semibold text-white transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(229,25,42,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Book the systems audit
            </button>
            <p className="text-[14px] leading-[1.5] text-white/58 md:text-[15px]">
              A focused conversation. A clear next step. No tool maze.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-[760px] gap-3 border-t border-white/12 pt-7 text-[14px] text-white/62 sm:grid-cols-3 md:text-[15px]">
            <span>Your number, from your audit</span>
            <span>Built around your workflow</span>
            <span>Maintained and improved</span>
          </div>
        </LiquidGlass>
      </div>
    </section>
  );
}
