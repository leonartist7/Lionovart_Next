"use client";

import { useEffect, useState } from "react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

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
          source: "hero_audit",
          project_summary: "Requested a custom demo + brand audit from the hero.",
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
    ? "Enter your email to receive"
    : "Enter your email and we'll send you your custom demo brand audit";

  return (
    <div className="w-full max-w-[540px] mx-auto">
      {status === "done" ? (
        <div className="rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-6 py-4 text-center text-[14px] font-semibold text-white">
          Thanks — your custom demo &amp; audit is on its way. ✦
        </div>
      ) : (
        <form onSubmit={onFormSubmit} noValidate>
          {/* Glass pill */}
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md pl-5 pr-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder={placeholder}
              aria-label="Email"
              className="min-w-0 flex-1 bg-transparent text-[14px] md:text-[15px] text-white placeholder:text-white/45 outline-none"
            />
            <div className="shrink-0">
              <LiquidMetalButton
                label={status === "loading" ? "…" : "Start"}
                onClick={() => void doSubmit()}
                variant="red"
                width={120}
                noShadow
              />
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
            <span className="md:hidden">Get your custom demo &amp; brand audit</span>
            <span className="hidden md:inline">Get your custom demo — brand audit included</span>
          </>

        )}
      </p>
      {status !== "error" && status !== "done" && (
        <p className="mt-2 text-center text-[11px] tracking-widest text-white/25 uppercase">
          100% on-time delivery &nbsp;·&nbsp; 50+ brands elevated &nbsp;·&nbsp; zero guesswork
        </p>
      )}
    </div>
  );
}
