"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InkRevealArtwork, {
  type InkRevealArtworkHandle,
} from "@/components/sections/strong-together/InkRevealArtwork";

gsap.registerPlugin(ScrollTrigger);

type TransitionMode = "ink" | "doors";

const isDev = process.env.NODE_ENV !== "production";

export default function StrongTogetherTransition() {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<TransitionMode>("ink");
  const sectionRef = useRef<HTMLElement>(null);
  const artHandleRef = useRef<InkRevealArtworkHandle>(null);
  const leftHalfRef = useRef<HTMLDivElement>(null);
  const rightHalfRef = useRef<HTMLDivElement>(null);
  const aloneRef = useRef<HTMLHeadingElement>(null);
  const strongRef = useRef<HTMLSpanElement>(null);
  const aloneORef = useRef<HTMLSpanElement>(null);
  const togetherRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !aloneRef.current || !togetherRef.current) return;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        if (mode === "ink" && artHandleRef.current?.blooms.length && artHandleRef.current.art) {
          gsap.set(artHandleRef.current.blooms, { attr: { r: (_, el) => Number(el.dataset.rFinal) } });
          gsap.set(artHandleRef.current.art, { opacity: 1 });
        } else if (mode === "doors" && leftHalfRef.current && rightHalfRef.current) {
          gsap.set([leftHalfRef.current, rightHalfRef.current], { xPercent: 0, yPercent: 0 });
        }
        gsap.set(aloneRef.current, { opacity: 0, y: 0 });
        gsap.set(togetherRef.current, { opacity: 1, y: 0 });
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 1 },
      });

      if (mode === "ink") {
        const handle = artHandleRef.current;
        if (!handle || handle.blooms.length === 0 || !handle.art) return;
        const blooms = handle.blooms;
        const art = handle.art;
        const [primary, ...secondaries] = blooms;

        gsap.set(art, { opacity: 0.75 });
        gsap.set(aloneRef.current, { opacity: 1, y: 0 });
        gsap.set(togetherRef.current, { opacity: 0, y: 0 });

        timeline
          .to(primary, { attr: { r: () => Number(primary.dataset.rFinal) }, duration: 0.42, ease: "power2.inOut" }, 0.12)
          .to(secondaries, { attr: { r: (_, el) => Number(el.dataset.rFinal) }, duration: 0.42, ease: "power2.inOut", stagger: 0.035 }, 0.15)
          .to(art, { opacity: 1, duration: 0.3, ease: "none" }, 0.2)
          .to(aloneRef.current, { opacity: 0, duration: 0.12, ease: "none" }, 0.48)
          .to(togetherRef.current, { opacity: 1, duration: 0.24, ease: "power4.out" }, 0.58);
      } else {
        const left = leftHalfRef.current;
        const right = rightHalfRef.current;
        if (!left || !right) return;

        gsap.set(left, { xPercent: -30, yPercent: 130 });
        gsap.set(right, { xPercent: 30, yPercent: 130 });
        gsap.set(aloneRef.current, { opacity: 1, y: 0 });
        gsap.set(togetherRef.current, { opacity: 0, y: 0 });

        timeline
          .to(left, { xPercent: 0, yPercent: 0, duration: 0.46, ease: "power3.out" }, 0.12)
          .to(right, { xPercent: 0, yPercent: 0, duration: 0.46, ease: "power3.out" }, 0.12)
          .to(aloneRef.current, { opacity: 0, duration: 0.12, ease: "none" }, 0.52)
          .to(togetherRef.current, { opacity: 1, duration: 0.24, ease: "power4.out" }, 0.58);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion, mode]);

  return (
    <section
      ref={sectionRef}
      id="stronger-together"
      aria-labelledby="strong-together-title"
      data-art-directed="light"
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#0a0a0a]"
    >
      <div className="sticky top-0 min-h-[100dvh] overflow-hidden bg-[#0d0d0d]">
        {mode === "ink" ? (
          <div className="pointer-events-none absolute inset-0 z-[4]" aria-hidden="true">
            <InkRevealArtwork
              ref={artHandleRef}
              reducedMotion={!!reduceMotion}
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 z-[4]" aria-hidden="true">
            <div
              ref={leftHalfRef}
              className="absolute left-0 top-0 z-[1] h-full w-1/2 overflow-hidden bg-[#f2ede3]"
            >
              <div className="absolute inset-0">
                <Image
                  src="/images/pawnl.png"
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-contain object-right mix-blend-multiply"
                />
              </div>
            </div>
            <div
              ref={rightHalfRef}
              className="absolute top-0 z-[2] h-full w-1/2 overflow-hidden bg-[#f2ede3] left-[calc(50%-5px)]"
            >
              <div className="absolute inset-0">
                <Image
                  src="/images/handr.png"
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-contain object-left mix-blend-multiply"
                />
              </div>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-[15%] z-[5] px-6 text-center md:top-[13%] md:px-12">
          <h2
            ref={aloneRef}
            aria-hidden="true"
            className="mx-auto max-w-[11ch] font-clash text-[clamp(4.4rem,11vw,10rem)] font-semibold leading-[0.78] tracking-[-0.065em] text-[#f2ede3]"
          >
            <span ref={strongRef} className="block">Strong</span>
            <span className="block">
              al<span ref={aloneORef}>o</span>ne.
            </span>
          </h2>
          <h2
            id="strong-together-title"
            ref={togetherRef}
            className="absolute inset-x-0 top-0 mx-auto max-w-[11ch] px-4 font-clash text-[clamp(4.4rem,11vw,10rem)] font-semibold uppercase leading-[0.78] tracking-[-0.065em] text-[#171412]"
          >
            Stronger together.
          </h2>
        </div>

        {isDev && (
          <button
            type="button"
            onClick={() => setMode((m) => (m === "ink" ? "doors" : "ink"))}
            className="absolute right-3 top-3 z-[100] flex items-center gap-1.5 rounded-full border border-[#f2ede3]/30 bg-[#171412]/90 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#f2ede3] shadow-lg backdrop-blur-sm transition-colors hover:bg-[#171412]"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-brand-red" />
            {mode}
          </button>
        )}
      </div>
    </section>
  );
}
