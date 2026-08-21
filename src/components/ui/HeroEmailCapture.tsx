"use client";

import { useEffect, useState } from "react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import TrailAttractionTarget from "@/components/ui/TrailAttractionTarget";
import { useNovaStore } from "@/lib/stores/nova-store";

/**
 * HeroEmailCapture — glass (transparent) pill with a simple light border, an
 * email input, and the real liquid-metal "Start" button. Saves the lead to
 * /api/strategist/lead.
 */
export default function HeroEmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const openNova = useNovaStore((s) => s.openNova);

  // Responsive placeholder (swapped post-mount → no hydration mismatch).
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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await fetch("/api/strategist/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email,
          contact: email,
          contact_type: "email",
          source: "hero_founder_blueprint",
          project_summary: `Requested a complimentary Brand & Growth Blueprint from the hero (${document.documentElement.dataset.founderMarket ?? "global"} market).`,
        }),
      });
      setStatus("done");
    } catch {
      setStatus("done");
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void doSubmit();
  };

  const placeholder = isMobile
    ? "Enter your email to receive yours"
    : "Enter your email to receive your complimentary Brand & Growth Blueprint";

  return (
    <div className="w-full max-w-[540px] mx-auto">
      {status === "done" ? (
        <div className="rounded-full border border-white/20 bg-white/[0.08] px-6 py-4 text-center text-[14px] font-semibold text-white shadow-[0_12px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.42)] backdrop-blur-xl">
          Thanks — your custom demo &amp; audit is on its way. ✦
          <button
            type="button"
            onClick={() => openNova("hero", true)}
            className="ml-2 font-semibold text-brand-red underline underline-offset-2 hover:text-white transition-colors"
          >
            Talk to Nova now →
          </button>
        </div>
      ) : (
        <form onSubmit={onFormSubmit} noValidate>
          {/* Glass pill */}
          <div className="relative isolate flex items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-[#0a0a0a]/38 py-1.5 pl-5 pr-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_130%_at_8%_0%,rgba(255,255,255,0.16),transparent_56%)]" />
            <input
              id="hero-blueprint-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder={placeholder}
              aria-label="Email"
              className="relative z-10 min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/45 md:text-[15px]"
            />
            <div className="relative z-10">
            <TrailAttractionTarget>
              <LiquidMetalButton
                label={status === "loading" ? "…" : "Start"}
                onClick={() => void doSubmit()}
                width={148}
                noShadow
              />
            </TrailAttractionTarget>
            </div>
          </div>
        </form>
      )}

      <p
        className={`mt-3 text-center text-[12px] md:text-[13px] tracking-wide ${
          status === "error" ? "text-brand-red" : "text-white/45"
        }`}
      >
        {status === "error" ? (
          "Please enter a valid email."
        ) : (
          <>
            <span className="md:hidden">Get your complimentary blueprint</span>
            <span className="hidden md:inline">Complimentary · Personalized · No pressure</span>
          </>
        )}
      </p>
    </div>
  );
}
