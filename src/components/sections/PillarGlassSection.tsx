"use client";

import dynamic from "next/dynamic";

/**
 * PillarGlassSection — the reusable 3D pillar-card showcase.
 * Dynamically imported with SSR disabled so server renders never touch
 * WebGL (no hydration mismatch, no SSR crash — directive §23).
 */
const PillarScene = dynamic(() => import("@/components/three/pillars/PillarScene"), {
  ssr: false,
  loading: () => <div aria-hidden className="h-[560px] w-full animate-pulse rounded-2xl bg-white/[0.02] md:h-[480px] lg:h-[520px]" />,
});

export default function PillarGlassSection() {
  return (
    <section aria-label="LION, NOVA and ART glass pillars in 3D" className="relative bg-bg-dark">
      <div className="mx-auto max-w-[1500px] px-6 py-16 md:px-[6vw] md:py-24">
        <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#e5192a]">
          The objects, in glass
        </p>
        <h2 className="mx-auto mt-4 max-w-[20ch] text-center font-clash text-[clamp(2rem,4.5vw,3.75rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white">
          Three forces, cut from light
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-center font-body text-[14px] leading-[1.7] text-white/55 md:text-[15px]">
          Real geometry, real studio light — drag your cursor across them. LION burns gold, NOVA
          runs violet to electric blue, ART holds deep crimson.
        </p>
        <div className="mt-10 md:mt-14">
          <PillarScene />
        </div>
      </div>
    </section>
  );
}
