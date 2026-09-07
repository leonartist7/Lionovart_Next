"use client";

import dynamic from "next/dynamic";
import SplitShowcase from "@/components/three/pillars-v2/SplitShowcase";

/**
 * PillarsDemo — the standalone v2 pillar lab.
 *
 * The WebGPU showcase is client-only (ssr:false): server renders never touch
 * GPU code, so there is no hydration mismatch and no SSR crash (§23). The
 * split section SSRs fine (its canvases hydrate empty and fill on effect),
 * matching the homepage's own pattern.
 */
const PillarsShowcase = dynamic(() => import("@/components/three/pillars-v2/PillarsShowcase"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="h-[86vh] min-h-[600px] w-full animate-pulse rounded-2xl bg-white/[0.02] lg:h-[560px] lg:min-h-0"
    />
  ),
});

const SPLIT_VIDEO =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1440,c_limit,f_auto,q_auto/v1779845634/Footage_07_o3rfbu.mp4";

const CARDS = [
  {
    code: "LION",
    title: "Lead with confidence",
    body: "Brand worlds, positioning and growth strategy with a point of view.",
  },
  {
    code: "NOVA",
    title: "Move with innovation",
    body: "AI OS, voice agents and automation that give time back.",
  },
  {
    code: "ART",
    title: "Direct the emotion",
    body: "Identity, film, content, web and apps built as one world.",
  },
];

export default function PillarsDemo() {
  return (
    <main className="min-h-screen bg-bg-dark text-white">
      {/* ── Hero: the three objects, floating in the void ─────────────── */}
      <section className="relative" aria-label="LION, NOVA and ART glass pillars in WebGPU">
        <div className="mx-auto max-w-[1500px] px-6 pb-4 pt-28 md:px-[6vw] md:pt-36">
          <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#e5192a]">
            Pillar lab — WebGPU first
          </p>
          <h1 className="mx-auto mt-5 max-w-[16ch] text-center font-clash text-[clamp(2.6rem,6vw,5.5rem)] font-semibold uppercase leading-[0.85] tracking-[-0.05em]">
            Three forces, cut from light
          </h1>
          <p className="mx-auto mt-5 max-w-[52ch] text-center font-body text-[14px] leading-[1.7] text-white/55 md:text-[15px]">
            Real thick glass, real studio light. Transmission, fresnel rims, specular flares, silk
            trails and dust — one TSL shader graph, compiled to WebGPU or WebGL2 depending on what
            your machine brings. Move your cursor across the cards.
          </p>
        </div>
        <div className="mx-auto max-w-[1600px] px-2 md:px-[3vw]">
          <PillarsShowcase />
        </div>
      </section>

      {/* ── Bridge ────────────────────────────────────────────────────── */}
      <section aria-label="From footage to objects" className="relative">
        <div className="mx-auto max-w-[1500px] px-6 py-24 text-center md:px-[6vw] md:py-32">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
            The split, rebuilt
          </p>
          <h2 className="mx-auto mt-4 max-w-[18ch] font-clash text-[clamp(1.9rem,4vw,3.4rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
            One film becomes three instruments
          </h2>
          <p className="mx-auto mt-4 max-w-[50ch] font-body text-[14px] leading-[1.7] text-white/50">
            Scroll. The footage separates and each pane turns over — the same v2 glass, fitted to
            the pane, lit by the scroll itself.
          </p>
        </div>
      </section>

      {/* ── The split-and-flip, v2 ────────────────────────────────────── */}
      <SplitShowcase cards={CARDS} video={SPLIT_VIDEO} />

      {/* ── Outro ─────────────────────────────────────────────────────── */}
      <section aria-label="Notes" className="relative">
        <div className="mx-auto max-w-[820px] px-6 py-24 text-center md:py-32">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
            Engineering notes
          </p>
          <p className="mt-5 font-body text-[13px] leading-[1.8] text-white/45 md:text-[14px]">
            One renderer for the showcase, one per pane. Bloom is threshold-selective so only rims
            and flares lift. Rendering pauses off-screen, DPR is clamped per device tier, and
            reduced-motion visitors receive the settled composition. If every GPU path fails, the
            DOM carries the section alone.
          </p>
        </div>
      </section>
    </main>
  );
}
