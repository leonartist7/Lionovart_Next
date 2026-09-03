"use client";

import { useNovaStore } from "@/lib/stores/nova-store";
import { LiquidGlass } from "./LiquidGlass";

/**
 * ACT 8 — the close. Two actions, deliberately unequal: the primary is the
 * human conversation (the reader is warm by now), the secondary is the same
 * zero-friction agent the hero opened with, for anyone who still isn't.
 */
export default function AiDecision() {
  const openNova = useNovaStore((state) => state.openNova);

  return (
    <section id="contact" className="relative flex min-h-[150svh] items-end px-6 pb-32 pt-[50svh] md:min-h-[165svh] md:pb-44 md:pt-[58svh]">
      <div className="mx-auto w-full max-w-[1040px]">
        <LiquidGlass className="px-6 py-12 text-center sm:px-10 md:px-16 md:py-16">
          <p className="text-[13px] font-medium uppercase tracking-[0.19em] text-[var(--ai-gold)] md:text-[14px]">
            Your first move can be small
          </p>
          <h2
            className="mx-auto mt-6 max-w-[15ch] font-semibold leading-[1] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(2.6rem, 6.6vw, 6rem)" }}
          >
            <span className="text-[var(--ai-gold)]">A person builds it.</span> The machine
            only runs it.
          </h2>
          <p className="mx-auto mt-7 max-w-[58ch] text-[18px] font-light leading-[1.65] text-white/78 md:text-[20px]">
            Bring us the thing that keeps slipping. Not the whole roadmap—one thing. The
            calls nobody answers after six. The follow-ups nobody gets to. The report you
            rebuild by hand every Monday. We&rsquo;ll tell you whether AI is the right tool for
            it, and if it isn&rsquo;t, we&rsquo;ll tell you that too.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => openNova("call", true)}
              className="min-h-14 rounded-full bg-brand-red px-8 py-4 text-[17px] font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Book 20 minutes with Leon
            </button>
            <p className="max-w-[46ch] text-[15px] leading-[1.55] text-white/58 md:text-[16px]">
              Free, no deck, no pitch. Nova checks live availability and books it. You
              leave with a clear read on the highest-leverage move—whether or not you
              work with us.
            </p>
            <button
              type="button"
              onClick={() => openNova("orb", false)}
              className="mt-2 min-h-11 rounded-full px-4 text-[16px] font-medium text-white/72 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Not ready to talk to a person? Ask Nova first.
            </button>
          </div>
          <div className="mx-auto mt-10 grid max-w-[760px] gap-3 border-t border-white/12 pt-7 text-[14px] text-white/62 sm:grid-cols-3 md:text-[15px]">
            <span>Calgary, in-house</span>
            <span>Five languages, written separately</span>
            <span>Audit before build</span>
          </div>
        </LiquidGlass>
      </div>
    </section>
  );
}
