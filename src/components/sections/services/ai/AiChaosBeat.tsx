"use client";

/**
 * The chaos-to-circle story beat: the load of operational work flying apart,
 * then converging into the same orbiting disk that backs the rest of the page.
 *
 * Its own section, not a sub-phase buried inside the hero's scroll — the
 * previous version blended this into ~40% of the hero's range and it read as
 * too subtle to register. Giving it a dedicated pinned scroll length is what
 * makes it a legible, deliberate event.
 *
 * Drives the SAME `uMorph` scalar the hero starts (see stage-ref.ts's own
 * doc comment: each act owns a ScrollTrigger over its own section and pushes
 * its own progress into the engine). `uMorph` isn't only read for particle
 * position — camera push-in, bloom strength, DOF, god-rays, and the lens-warp
 * grade pass in LionExperience.tick() all key off it — so reusing it here
 * keeps that entire tuned choreography correct with no new uniforms, rather
 * than needing a second uChaos value composed alongside it everywhere.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLionStage } from "@/lib/lion/stage-ref";

gsap.registerPlugin(ScrollTrigger);

/**
 * Where the hero hands off. Below this, the lion is still assembled (a small
 * pre-rotation only); above it, this section owns the scatter and the
 * converge-to-disk. AiHeroCopy imports this so the two sections can never
 * drift out of sync with each other.
 */
export const HERO_MORPH_END = 0.12;

export default function AiChaosBeat() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) =>
          getLionStage()?.setMorph(HERO_MORPH_END + self.progress * (1 - HERO_MORPH_END)),
      });

      // Lands once the disk has actually re-formed here (this section owns
      // the whole settleT window in PARTICLE_VERT now, not the hero).
      gsap.fromTo(
        centerRef.current,
        { opacity: 0, y: 16, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power2.out",
          scrollTrigger: { trigger: wrap, start: "78% top", end: "92% top", scrub: true },
        },
      );
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} data-lion-zone className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center px-6">
        <div ref={centerRef} className="pointer-events-none text-center opacity-0">
          <p
            className="font-medium text-white"
            style={{ fontSize: "clamp(1.5rem, 3.6vw, 2.75rem)", fontFamily: "var(--font-ai-display)" }}
          >
            All of it. <span className="text-[var(--ai-cyan)]">One system.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
