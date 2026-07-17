"use client";

import { useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   WIREFRAME DEMO — red Problems-section treatment
   Two options to compare:
     A) Full-bleed rupture   — red breaks edge-to-edge, no contained box
     B) Hero-matched panel   — contained red, symmetric corners = hero card
   Grey blocks = placeholder content. Visit /red-demo to compare.
   This page is throwaway; delete once a direction is chosen.
─────────────────────────────────────────────────────────────────────────── */

const RED = "#e5192a";

/* Placeholder content row inside the red section (problem/solution card) */
function WireCard() {
  return (
    <div className="flex w-full overflow-hidden rounded-[20px] bg-white/95 ring-1 ring-black/10 min-h-[150px] md:min-h-[180px]">
      <div className="w-[34%] bg-black/10" />
      <div className="flex-1 flex flex-col justify-center gap-3 p-5 md:p-8">
        <div className="h-3 w-2/3 rounded bg-black/15" />
        <div className="h-2 w-full rounded bg-black/10" />
        <div className="h-2 w-5/6 rounded bg-black/10" />
        <div className="mt-3 flex gap-6">
          <div className="h-6 w-12 rounded bg-black/15" />
          <div className="h-6 w-12 rounded bg-black/15" />
        </div>
      </div>
    </div>
  );
}

/* White neighbour band (stands in for About above / Services below) */
function WhiteBand({ label }: { label: string }) {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="mb-8 text-[11px] uppercase tracking-[0.3em] text-black/40">
          {label}
        </p>
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-black/10" />
          <div className="h-3 w-full rounded bg-black/[0.06]" />
          <div className="h-3 w-4/5 rounded bg-black/[0.06]" />
        </div>
      </div>
    </section>
  );
}

function RedHeading() {
  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <p className="mb-3 text-[12px] uppercase tracking-[0.2em] text-white/80">
        The Reality
      </p>
      <div className="h-[clamp(34px,6vw,68px)] w-[min(90%,640px)] rounded bg-white/25" />
    </div>
  );
}

/* ── OPTION A — full-bleed rupture ───────────────────────────────────────── */
function OptionA() {
  return (
    <>
      <WhiteBand label="About (white) — above" />

      {/* Red breaks the full viewport width. No container, no dome.
          Soft top corners only, to feel like you 'enter' the red space. */}
      <section
        className="relative w-full px-6 pt-20 pb-24 md:pt-28 md:pb-32"
        style={{
          backgroundColor: RED,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          marginTop: -24, // slight overlap so white tucks under the red lip
          boxShadow: "0 -20px 50px -20px rgba(229,25,42,0.5)",
        }}
      >
        <div className="mx-auto max-w-[1100px]">
          <RedHeading />
          <div className="flex flex-col gap-6">
            <WireCard />
            <WireCard />
          </div>
        </div>
      </section>

      <WhiteBand label="Services (light) — below" />
    </>
  );
}

/* ── OPTION B — hero-matched contained panel ─────────────────────────────── */
function OptionB() {
  return (
    <>
      <WhiteBand label="About (white) — above" />

      {/* Red stays a contained panel inside white, but with SYMMETRIC corners
          matching the hero video card radius (22 / 30px). Reads as the same
          'object' as the opening curtain — deliberate, not a peel. */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div
            className="overflow-hidden rounded-[22px] px-6 py-16 md:rounded-[30px] md:px-10 md:py-20"
            style={{
              backgroundColor: RED,
              boxShadow: "0 30px 60px -15px rgba(229,25,42,0.45)",
            }}
          >
            <div className="mx-auto max-w-[1000px]">
              <RedHeading />
              <div className="flex flex-col gap-6">
                <WireCard />
                <WireCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhiteBand label="Services (light) — below" />
    </>
  );
}

export default function RedDemoPage() {
  const [opt, setOpt] = useState<"A" | "B">("A");

  return (
    <main className="bg-white pt-[52px]">
      {/* Toggle — fixed so it's always visible while scrolling */}
      <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 border-b border-black/10 bg-white/90 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur">
        <span className="text-[11px] uppercase tracking-[0.2em] text-black/40">
          Red treatment:
        </span>
        {(["A", "B"] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOpt(o)}
            className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${
              opt === o
                ? "bg-black text-white"
                : "bg-black/5 text-black/60 hover:bg-black/10"
            }`}
          >
            {o === "A" ? "A · Full-bleed rupture" : "B · Hero-matched panel"}
          </button>
        ))}
      </div>

      {opt === "A" ? <OptionA /> : <OptionB />}
    </main>
  );
}
