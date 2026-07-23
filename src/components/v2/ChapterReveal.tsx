"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import V2Silk from "@/components/v2/V2Silk";

gsap.registerPlugin(ScrollTrigger);

/* ─── Chapter 4 — The Reveal (dark -> cream) ──────────────────────────
   The only GSAP chapter, and the page's one designed threshold: a
   cream circle expands from the story line's origin and floods light
   over the dark stage. The outer section is tall (220vh); the inner
   frame is CSS `position: sticky` rather than a GSAP pin (this app's
   Lenis provider scrolls the real document, so native sticky behaves
   normally here, and it's cheaper than GSAP's pin). GSAP/ScrollTrigger
   only drives the clip-path scrub value.
   ─────────────────────────────────────────────────────────────────── */

const PROMISE_LINE = "Not just an agency. A partnership building your legacy.";

const promiseClass =
  "v2-serif relative z-10 mx-auto max-w-[20ch] px-6 text-center text-[clamp(2rem,4.5vw,3.75rem)] font-medium leading-[1.1]";

function StoryLine() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
      style={{
        background: "linear-gradient(to bottom, transparent 15%, #e5192a 50%, transparent 85%)",
      }}
    />
  );
}

function StaticReveal() {
  return (
    <section
      className="relative flex min-h-[80vh] items-start justify-center overflow-hidden pt-[18vh] md:pt-[22vh]"
      style={{
        background: "linear-gradient(180deg, #0d0d0d 0%, #0d0d0d 35%, var(--v2-cream) 65%)",
      }}
    >
      <h2 className={`${promiseClass} text-[#f2ede3]`}>{PROMISE_LINE}</h2>
    </section>
  );
}

export default function ChapterReveal() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const creamRef = useRef<HTMLDivElement>(null);

  // useReducedMotion() resolves differently on the server (no window)
  // than on the client, and this chapter's reduced-motion fallback is a
  // structurally different tree (StaticReveal), not just different prop
  // values on the same DOM shape like the other chapters use. Branching
  // on reduceMotion directly on the first render would make the client's
  // initial render disagree with the server's, which is a hard hydration
  // mismatch (caught wiring this chapter up: React threw and force-
  // remounted the whole subtree for reduced-motion users). Gate the
  // structural swap behind a mounted flag so the server and the first
  // client pass always agree, and only swap after hydration completes.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || reduceMotion || !sectionRef.current || !creamRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(creamRef.current, {
        clipPath: "circle(150% at 50% 55%)",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted, reduceMotion]);

  if (mounted && reduceMotion) return <StaticReveal />;

  return (
    <section ref={sectionRef} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden">
        {/* Dark layer — the stage before the light floods in.
            `isolate` is load-bearing: without it, this layer's h2 (z-10)
            has no local stacking context to stay contained in, so its
            z-index escapes upward and paints above the cream layer
            sibling regardless of DOM order. Since that h2 is cream-
            colored text (#f2ede3, identical to the cream layer's own
            background), the bleed-through was invisible except at
            anti-aliased glyph edges — it read as a ghostly text outline
            once the cream layer became visible. Caught verifying the
            scrub at 75%/100%, not obvious from 0%/25%. */}
        <div className="absolute inset-0 isolate flex items-center justify-center bg-[#0d0d0d]">
          <V2Silk className="absolute inset-0" />
          <div aria-hidden className="absolute inset-0 bg-[#0d0d0d]/45" />

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className={`${promiseClass} text-[#f2ede3]`}
          >
            {PROMISE_LINE}
          </motion.h2>

          <StoryLine />
        </div>

        {/* Cream layer — revealed by the scrubbed clip-path circle */}
        <div
          ref={creamRef}
          className="absolute inset-0 isolate flex items-center justify-center bg-[#f2ede3]"
          style={{ clipPath: "circle(0% at 50% 55%)" }}
        >
          <h2 className={`${promiseClass} text-[#171412]`}>{PROMISE_LINE}</h2>

          <StoryLine />
        </div>
      </div>
    </section>
  );
}
