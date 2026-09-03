"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import TrailAttractionTarget from "@/components/ui/TrailAttractionTarget";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";

/**
 * HeroSitePeek — glass pill URL input, same visual language as the old
 * HeroEmailCapture it replaces. Submitting posts the URL to
 * /api/strategist/peek, where Nova reacts to it the same way she does mid-
 * conversation (nova-brain/prompts/en.js Stage 3: "I had a peek - I love
 * that you lead with X. I noticed Y."), shown as a Nova message rather than
 * a scored "62/100" audit card - she never scores or hands out a verdict,
 * on the site or in the hero. The CTA hands off to /audit (prefilled) for
 * the real lead capture, mirroring the rest of the funnel.
 */
export default function HeroSitePeek() {
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [result, setResult] = useState<{
    message: string;
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
      const res = await fetch("/api/strategist/peek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website_url: website.trim() }),
      });
      if (!res.ok) {
        setStatus("error");
        trackFunnelEvent(FUNNEL_EVENT.HERO_PEEK_SUBMITTED, { ok: false });
        return;
      }
      const data = await res.json();
      setResult(data);
      setStatus("done");
      trackFunnelEvent(FUNNEL_EVENT.HERO_PEEK_SUBMITTED, { ok: true });
    } catch {
      setStatus("error");
      trackFunnelEvent(FUNNEL_EVENT.HERO_PEEK_SUBMITTED, { ok: false });
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void doSubmit();
  };

  const placeholder = isMobile ? "yourwebsite.com" : "Drop your website - Nova will take a look";

  if (status === "done" && result) {
    const auditHref = `/audit?website=${encodeURIComponent(result.website_url)}`;
    return (
      <div className="w-full max-w-[540px] mx-auto rounded-2xl border border-white/[0.1] bg-black/70 px-6 py-6 text-center backdrop-blur-md sm:px-8 sm:py-7">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-brand-red shadow-[0_0_10px_rgba(229,25,42,0.8)] motion-reduce:animate-none" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Nova
          </span>
        </div>
        <p className="mx-auto max-w-[46ch] text-[16px] leading-[1.6] text-white sm:text-[17px]">
          {result.message}
        </p>
        <Link
          href={auditHref}
          onClick={() => trackFunnelEvent(FUNNEL_EVENT.HERO_PEEK_CTA_CLICKED)}
          className="font-clash mt-6 inline-block rounded-full bg-brand-red px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#c9101f] active:scale-[0.98]"
        >
          See The Full Picture
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
            id="hero-site-peek-url"
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
                label={status === "loading" ? "…" : "Have A Look"}
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
            <span className="md:hidden">Get a quick read from Nova.</span>
            <span className="hidden md:inline">Free, instant, no email required.</span>
          </>
        )}
      </p>
    </div>
  );
}
