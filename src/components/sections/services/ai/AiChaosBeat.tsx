"use client";

/**
 * A short transition beat between the hook and the systems story.
 *
 * Its own section, not a sub-phase buried inside the hero's scroll — the
 * previous version blended this into ~40% of the hero's range and it read as
 * too subtle to register. Giving it a dedicated pinned scroll length is what
 * makes it a legible, deliberate event.
 *
 * The background remains continuous; this component only times its copy.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AiChaosBeat() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
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
    <div ref={wrapRef} className="relative h-[200vh]">
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
