"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import TrailAttractionTarget from "@/components/ui/TrailAttractionTarget";
import { useNovaStore } from "@/lib/stores/nova-store";
import { getWhatsAppUrl } from "@/lib/contact";

/**
 * HeroBrandScan — the hero funnel.
 *
 * Asks for a URL, not an email. A stranger hands over their website readily
 * (it's public, it isn't "theirs"), and the URL is what makes the rest of the
 * funnel autonomous. The email is asked for second, once six dimensions of real
 * measurement are already on the table.
 *
 * The call is sold by NAMING what it would decide, never by blurring data.
 * Hidden text reads as a paywall; a specific question about their own business
 * reads as expertise.
 */

type Stage = "idle" | "scanning" | "result" | "claiming" | "claimed";

interface Dimension {
  id: string;
  score: number;
  headline: string;
  findings: string[];
  lockedCount: number;
}

interface ScanResult {
  scan_id: string | null;
  business_name: string;
  url: string;
  overall: number;
  dimensions: Dimension[];
  headline: string;
  biggest_leak: { title: string; detail: string; cost: string };
  quick_wins: string[];
  withheld_count: number;
  call_agenda: Array<{ title: string; teaser: string }>;
  aeo?: { query?: string; mentioned?: boolean; namedInstead: string[]; verdict: string };
  positioning_statement?: string;
  booking_url?: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  brand: "Brand & Message",
  seo: "Search Foundations",
  aeo: "AI Visibility",
  presence: "Google Presence",
  competition: "Competitive Position",
  social: "Social Reach",
};

// Narrates work that genuinely happens — six real measurements, not a fake
// progress bar. The wait is spent showing effort rather than hiding it.
const SCAN_PHASES = [
  "Opening your homepage…",
  "Reading how you introduce yourself…",
  "Checking what search engines can see…",
  "Looking up your Google Business Profile…",
  "Pulling the businesses you compete with…",
  "Asking an AI if it recommends you…",
  "Scoring six dimensions…",
  "Finding where you're leaking…",
];

function bandColor(n: number) {
  return n < 50 ? "#e5192a" : n < 75 ? "#d98324" : "#39b57a";
}

function ScoreRing({ value, animate }: { value: number; animate: boolean }) {
  const R = 42;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-[112px] w-[112px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="7" />
        <motion.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={bandColor(value)}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: animate ? C : C * (1 - value / 100) }}
          animate={{ strokeDashoffset: C * (1 - value / 100) }}
          transition={{ duration: animate ? 1.4 : 0, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[var(--font-clash)] text-[30px] leading-none text-white">{value}</span>
        <span className="text-[10px] tracking-[0.14em] text-white/35 uppercase">/ 100</span>
      </div>
    </div>
  );
}

export default function HeroBrandScan() {
  const [stage, setStage] = useState<Stage>("idle");
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  const openNova = useNovaStore((s) => s.openNova);
  const reduceMotion = useReducedMotion();
  const liveRef = useRef(true);

  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (stage !== "scanning") return;
    const t = setInterval(() => setPhase((p) => Math.min(p + 1, SCAN_PHASES.length - 1)), 3200);
    return () => clearInterval(t);
  }, [stage]);

  const runScan = useCallback(async () => {
    const value = site.trim();
    if (!value || !/\.[a-z]{2,}/i.test(value)) {
      setError("Enter your website — like yourbusiness.com");
      return;
    }
    setError(null);
    setPhase(0);
    setStage("scanning");

    try {
      const res = await fetch("/api/brand-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();
      if (!liveRef.current) return;
      if (!res.ok) {
        setError(data.message ?? "That scan didn't go through. Try again in a moment.");
        setStage("idle");
        return;
      }
      setResult(data as ScanResult);
      setStage("result");
    } catch {
      if (!liveRef.current) return;
      setError("Couldn't reach the scanner. Check your connection and try again.");
      setStage("idle");
    }
  }, [site]);

  const claim = useCallback(async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email so we can send the report.");
      return;
    }
    setError(null);
    setStage("claiming");
    try {
      const res = await fetch("/api/brand-score/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan_id: result?.scan_id, email }),
      });
      const data = await res.json();
      if (!liveRef.current) return;
      setPortalUrl(data.portal_url ?? null);
      if (data.full) setResult((prev) => (prev ? { ...prev, ...data.full } : prev));
      setStage("claimed");
    } catch {
      if (!liveRef.current) return;
      // The scan already exists server-side; a failed claim shouldn't strand
      // them on a spinner. The emailed report is still the fallback.
      setStage("claimed");
    }
  }, [email, result]);

  /* ── Stage: the ask ─────────────────────────────────────────────── */
  if (stage === "idle" || stage === "scanning") {
    const scanning = stage === "scanning";
    return (
      <div className="mx-auto w-full max-w-[540px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!scanning) void runScan();
          }}
          noValidate
        >
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pr-1.5 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
            <span className="hidden text-[14px] text-white/25 select-none sm:inline">https://</span>
            <input
              type="text"
              inputMode="url"
              autoComplete="url"
              value={site}
              disabled={scanning}
              onChange={(e) => {
                setSite(e.target.value);
                if (error) setError(null);
              }}
              placeholder="yourbusiness.com"
              aria-label="Your website address"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/45 disabled:opacity-50 md:text-[15px]"
            />
            <TrailAttractionTarget>
              <LiquidMetalButton
                label={scanning ? "Scanning…" : "Score my brand"}
                onClick={() => !scanning && void runScan()}
                variant="red"
                width={168}
                noShadow
              />
            </TrailAttractionTarget>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
              <div className="h-px w-full overflow-hidden bg-white/10">
                <motion.div
                  className="h-px bg-brand-red"
                  initial={{ width: "0%" }}
                  animate={{ width: "92%" }}
                  transition={{ duration: reduceMotion ? 0 : 28, ease: "easeOut" }}
                />
              </div>
              <p aria-live="polite" className="mt-3 text-center text-[12px] tracking-wide text-white/50 md:text-[13px]">
                {SCAN_PHASES[phase]}
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`mt-3 text-center text-[12px] tracking-wide md:text-[13px] ${error ? "text-brand-red" : "text-white/45"}`}
            >
              {error ?? "Free · 6 dimensions · No signup to see your score"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ── Stage: the report ──────────────────────────────────────────── */
  const r = result!;
  const unlocked = stage === "claimed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-[560px] rounded-2xl border border-white/12 bg-white/[0.04] p-5 text-left backdrop-blur-md md:p-6"
    >
      <div className="flex items-start gap-4">
        <ScoreRing value={r.overall} animate={!reduceMotion} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] tracking-[0.14em] text-white/35 uppercase">{r.business_name}</p>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-white/85 md:text-[15px]">{r.headline}</p>
        </div>
      </div>

      {/* Six dimensions */}
      <div className="mt-5 space-y-2.5">
        {(r.dimensions ?? []).map((d, i) => (
          <div key={d.id} className="flex items-center gap-3">
            <span className="w-[112px] shrink-0 truncate text-[11px] tracking-wide text-white/45 uppercase">
              {DIMENSION_LABELS[d.id] ?? d.id}
            </span>
            <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ background: bandColor(d.score) }}
                initial={{ width: 0 }}
                animate={{ width: `${d.score}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="w-[26px] shrink-0 text-right text-[12px] tabular-nums text-white/60">{d.score}</span>
          </div>
        ))}
      </div>

      {/* The AI-visibility result — the finding people screenshot. */}
      {r.aeo?.verdict && (
        <div className="mt-5 rounded-xl border border-white/12 bg-black/25 p-4">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-white/35 uppercase">We asked an AI about you</p>
          {r.aeo.query && <p className="mt-2 text-[13px] text-white/50 italic">“{r.aeo.query}”</p>}
          <p className={`mt-2 text-[14px] leading-[1.6] ${r.aeo.mentioned ? "text-emerald-400" : "text-white"}`}>
            {r.aeo.mentioned ? "You were named in the answer." : "You weren't in the answer."}
          </p>
          {!r.aeo.mentioned && r.aeo.namedInstead.length > 0 && (
            <p className="mt-1.5 text-[13px] leading-[1.6] text-white/55">
              It recommended {r.aeo.namedInstead.slice(0, 3).join(", ")} instead.
            </p>
          )}
        </div>
      )}

      {/* The hook — always visible, always specific */}
      <div className="mt-5 border-l-2 border-brand-red pl-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-brand-red uppercase">Your biggest leak</p>
        <p className="mt-1.5 text-[15px] font-semibold text-white">{r.biggest_leak.title}</p>
        <p className="mt-1.5 text-[13px] leading-[1.65] text-white/65">{r.biggest_leak.detail}</p>
      </div>

      {!unlocked ? (
        <>
          {/* The gate names what's behind it per dimension — a count of real
              measurements, not a blur over invented text. */}
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-white/35 uppercase">
              {r.withheld_count} more findings, measured not guessed
            </p>
            <div className="mt-3 space-y-1.5">
              {(r.dimensions ?? [])
                .filter((d) => d.lockedCount > 0)
                .map((d) => (
                  <div key={d.id} className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="truncate text-white/60">{DIMENSION_LABELS[d.id] ?? d.id}</span>
                    <span className="shrink-0 text-white/30">
                      {d.lockedCount} finding{d.lockedCount === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (stage === "result") void claim();
            }}
            noValidate
          >
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pr-1.5 pl-5">
              <input
                type="email"
                value={email}
                disabled={stage === "claiming"}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Where should we send it?"
                aria-label="Your email address"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/45 disabled:opacity-50"
              />
              <TrailAttractionTarget>
                <LiquidMetalButton
                  label={stage === "claiming" ? "Sending…" : "Unlock"}
                  onClick={() => stage === "result" && void claim()}
                  variant="red"
                  width={124}
                  noShadow
                />
              </TrailAttractionTarget>
            </div>
            <p className={`mt-2.5 text-center text-[12px] ${error ? "text-brand-red" : "text-white/40"}`}>
              {error ?? "The full report, once. No list, no drip."}
            </p>
          </form>
        </>
      ) : (
        <>
          {r.quick_wins?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.5 }} className="mt-5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/35 uppercase">Fix these this week</p>
              <ol className="mt-2 space-y-1.5">
                {r.quick_wins.map((w, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-[1.6] text-white/70">
                    <span className="text-brand-red tabular-nums">{i + 1}</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          <p className="mt-5 text-[13px] leading-[1.6] text-white/55">
            Your full report — all {r.withheld_count} findings — is on its way to{" "}
            <span className="text-white/80">{email}</span>.
          </p>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => openNova("hero", true, r.scan_id)}
              className="group flex items-center justify-between rounded-xl border border-brand-red/45 bg-brand-red/10 px-4 py-3 text-left transition-colors hover:bg-brand-red/20"
            >
              <span>
                <span className="block text-[14px] font-semibold text-white">Talk it through with Nova</span>
                <span className="block text-[12px] text-white/55">She's already read your scan — 2 minutes</span>
              </span>
              <span className="text-brand-red transition-transform group-hover:translate-x-0.5">→</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {portalUrl && (
                <a
                  href={portalUrl}
                  className="rounded-xl border border-white/12 px-4 py-3 text-center text-[13px] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  View full report
                </a>
              )}
              <a
                href={getWhatsAppUrl(
                  `Hi Leon — I just scored ${r.overall}/100 on the Brand Score for ${r.url}. The biggest leak it flagged was "${r.biggest_leak.title}". I'd like to talk about it.`,
                )}
                target="_blank"
                rel="noreferrer"
                className={`rounded-xl border border-white/12 px-4 py-3 text-center text-[13px] text-white/70 transition-colors hover:bg-white/5 hover:text-white ${portalUrl ? "" : "col-span-2"}`}
              >
                Message Leon
              </a>
            </div>
          </div>
        </>
      )}

      {/* The call, sold by naming what it decides. Visible at every tier —
          this is the pull, and hiding it would defeat the point. */}
      {r.call_agenda?.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-white/35 uppercase">
            What a 20-minute call would settle
          </p>
          <p className="mt-1.5 text-[12px] leading-[1.6] text-white/40">
            These aren&apos;t in the report. They&apos;re judgement calls about your business.
          </p>
          <ul className="mt-3 space-y-2.5">
            {r.call_agenda.slice(0, 4).map((item, i) => (
              <li key={i}>
                <p className="text-[13px] font-semibold text-white/90">{item.title}</p>
                <p className="mt-0.5 text-[12px] leading-[1.55] text-white/45">{item.teaser}</p>
              </li>
            ))}
          </ul>
          {r.booking_url && (
            <a
              href={r.booking_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-full bg-brand-red px-5 py-3 text-center text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Book the 20 minutes →
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}
