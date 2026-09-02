"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import TrailAttractionTarget from "@/components/ui/TrailAttractionTarget";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";

/**
 * HeroSiteScore — glass pill URL input ("get your score"), same visual
 * language as the old HeroEmailCapture it replaces. Submitting posts the
 * URL to /api/strategist/score for an AI-generated first-impression score,
 * shown inline; the CTA under the result hands off to /audit (prefilled)
 * for the real lead capture, mirroring the rest of the funnel.
 */
export default function HeroSiteScore() {
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [result, setResult] = useState<{
    score: number;
    verdict: string;
    critique: string;
    website_url: string;
  } | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const u = () => setIsMobile(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  const doSubmit = async () => {
    if (status === "loading" || status === "done") return;
    if (!website.trim()) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/strategist/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website_url: website.trim() }),
      });
      if (!res.ok) {
        setStatus("error");
        trackFunnelEvent(FUNNEL_EVENT.HERO_SCORE_SUBMITTED, { ok: false });
        return;
      }
      const data = await res.json();
      setResult(data);
      setStatus("done");
      trackFunnelEvent(FUNNEL_EVENT.HERO_SCORE_SUBMITTED, { ok: true });
    } catch {
      setStatus("error");
      trackFunnelEvent(FUNNEL_EVENT.HERO_SCORE_SUBMITTED, { ok: false });
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void doSubmit();
  };

  const placeholder = isMobile ? "yourwebsite.com" : "Enter your website to get your score";

  if (status === "done" && result) {
    const auditHref = `/audit?website=${encodeURIComponent(result.website_url)}`;
    return (
      <div className="w-full max-w-[540px] mx-auto rounded-3xl border border-white/20 bg-[#0a0a0a]/50 px-6 py-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-8 sm:py-7">
        <div className="font-clash text-[3rem] font-semibold leading-none text-white sm:text-[3.5rem]">
          {result.score}
          <span className="text-[1.25rem] text-white/40 sm:text-[1.5rem]">/100</span>
        </div>
        <p className="mt-2 text-[15px] font-semibold text-brand-red sm:text-base">
          {result.verdict}
        </p>
        <p className="mx-auto mt-3 max-w-[42ch] text-[13px] leading-[1.6] text-white/60 sm:text-[14px]">
          {result.critique}
        </p>
        <Link
          href={auditHref}
          onClick={() => trackFunnelEvent(FUNNEL_EVENT.HERO_SCORE_CTA_CLICKED)}
          className="font-clash mt-5 inline-block rounded-full bg-brand-red px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#c9101f] active:scale-[0.98]"
        >
          Get The Full Audit
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[540px] mx-auto">
      <form onSubmit={onFormSubmit} noValidate>
        {/* Glass pill */}
        <div className="relative isolate flex items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-[#0a0a0a]/38 py-1.5 pl-5 pr-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_130%_at_8%_0%,rgba(255,255,255,0.16),transparent_56%)]" />
          <input
            id="hero-site-score-url"
            type="text"
            inputMode="url"
            required
            value={website}
            onChange={(e) => {
              setWebsite(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={placeholder}
            aria-label="Website URL"
            className="relative z-10 min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/45 md:text-[15px]"
          />
          <div className="relative z-10">
            <TrailAttractionTarget>
              <LiquidMetalButton
                label={status === "loading" ? "…" : "Score Me"}
                onClick={() => void doSubmit()}
                width={148}
                noShadow
              />
            </TrailAttractionTarget>
          </div>
        </div>
      </form>

      <p
        className={`mt-3 text-center text-[12px] md:text-[13px] tracking-wide ${
          status === "error" ? "text-brand-red" : "text-white/45"
        }`}
      >
        {status === "error" ? (
          "Enter a website URL."
        ) : (
          <>
            <span className="md:hidden">Free instant first-impression score</span>
            <span className="hidden md:inline">Free · Instant · No email required</span>
          </>
        )}
      </p>
    </div>
  );
}
