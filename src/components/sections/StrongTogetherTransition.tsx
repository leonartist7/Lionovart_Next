"use client";

import { useLayoutEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InkRevealArtwork, {
  type InkRevealArtworkHandle,
} from "@/components/sections/strong-together/InkRevealArtwork";
import { useLionJourney } from "./lion-journey/LionJourney";
import Image from "next/image";
import { SHOWCASE_IMAGES } from "./showcase-images";

gsap.registerPlugin(ScrollTrigger);

export default function StrongTogetherTransition() {
  const journey = useLionJourney();
  const setReveal = journey?.setReveal;
  const setRevealSection = journey?.setRevealSection;
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const attachSection = useCallback((node: HTMLElement | null) => { sectionRef.current = node; setRevealSection?.(node); }, [setRevealSection]);
  const artHandleRef = useRef<InkRevealArtworkHandle>(null);
  const aloneRef = useRef<HTMLHeadingElement>(null);
  const aloneORef = useRef<HTMLSpanElement>(null);
  const togetherRef = useRef<HTMLHeadingElement>(null);
  const workRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const alone = aloneRef.current;
    const aloneO = aloneORef.current;
    const together = togetherRef.current;
    const handle = artHandleRef.current;
    const work = workRef.current;

    if (!work || !section || !alone || !aloneO || !together || !handle?.art || !handle.blooms.length) {
      return;
    }

    const placeBloomOnO = () => {
      const oRect = aloneO.getBoundingClientRect();
      handle.setOriginFromClientPoint(
        oRect.left + oRect.width / 2,
        oRect.top + oRect.height / 2
      );
    };

    let cancelled = false;
    let frame: number | null = null;

    const scheduleBloomPlacement = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = null;
        if (!cancelled) placeBloomOnO();
      });
    };

    // Measure after the heading has committed, then measure again on the next
    // frame so late font/layout changes cannot leave the bloom offset from the
    // actual center of the rendered “o”.
    placeBloomOnO();
    scheduleBloomPlacement();

    const fontReady = document.fonts?.ready;
    fontReady?.then(() => {
      if (cancelled) return;
      placeBloomOnO();
      ScrollTrigger.refresh();
    });

    const resizeObserver = new ResizeObserver(scheduleBloomPlacement);
    resizeObserver.observe(aloneO);
    resizeObserver.observe(section);

    const ctx = gsap.context(() => {
      const blooms = handle.blooms;
      const art = handle.art;
      if (!art) return;

      if (reduceMotion) {
        gsap.set(blooms, {
          attr: { r: (_, el) => Number(el.dataset.rFinal) },
        });
        gsap.set(art, { opacity: 1 });
        gsap.set(work, { autoAlpha: 1, y: 0 });
        gsap.set(alone, { opacity: 0 });
        gsap.set(together, { opacity: 1, y: 0 });
        setReveal?.(1);
        return;
      }

      const [primary, ...secondaries] = blooms;
      gsap.set(blooms, {
        attr: { r: (_, el) => Number(el.dataset.rStart) },
      });
      gsap.set(art, { opacity: 0.72 });
      gsap.set(alone, { opacity: 1, y: 0 });
      gsap.set(together, { opacity: 0, y: 0 });
      gsap.set(work, { autoAlpha: 0, y: 16 });

      setReveal?.(0);
      const coverage = { value: 0 };
      const timeline = gsap.timeline({
        onUpdate: () => setReveal?.(coverage.value),
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefreshInit: placeBloomOnO,
          onRefresh: placeBloomOnO,
        },
      });

      timeline.to(coverage, { value: 1, duration: 0.58, ease: "power2.inOut" }, 0.04)
        .to(
          primary,
          {
            attr: { r: () => Number(primary.dataset.rFinal) },
            duration: 0.58,
            ease: "power2.inOut",
          },
          0.04
        )
        .to(
          secondaries,
          {
            attr: { r: (_, el) => Number(el.dataset.rFinal) },
            duration: 0.42,
            ease: "power2.inOut",
            stagger: 0.025,
          },
          0.16
        )
        .to(art, { opacity: 1, duration: 0.3, ease: "none" }, 0.18)
        .to(alone, { opacity: 0, y: -10, duration: 0.14, ease: "none" }, 0.38)
        .to(together, { opacity: 1, duration: 0.24, ease: "power4.out" }, 0.42)
        // The white bloom finishes at 0.62; reveal the work only after it.
        .to(work, { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.68)
        .to({}, { duration: 0.14 }, 0.86);
    }, section);

    window.addEventListener("resize", scheduleBloomPlacement, { passive: true });
    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleBloomPlacement);
      if (frame !== null) cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, [reduceMotion, setReveal]);

  return (
    <section
      ref={attachSection}
      id="stronger-together"
      aria-labelledby="strong-together-title"
      data-art-directed="light"
      className="lion-reveal relative h-[160svh] overflow-clip bg-bg-dark"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#0d0d0d]">
        <div className="pointer-events-none absolute inset-0 z-[4]" aria-hidden="true">
          <InkRevealArtwork
            ref={artHandleRef}
            reducedMotion={reduceMotion}
            className="h-full w-full"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[32%] z-[5] -translate-y-1/2 px-5 text-center md:px-12">
          <h2
            ref={aloneRef}
            aria-hidden="true"
            className="mx-auto max-w-[11ch] font-clash text-[clamp(2.5rem,10vw,10rem)] font-semibold leading-[0.78] tracking-[-0.065em] text-[#f2ede3]"
          >
            <span className="block">Strong</span>
            <span className="block">
              al<span ref={aloneORef} className="relative inline-block">o</span>ne.
            </span>
          </h2>
          <h2
            id="strong-together-title"
            ref={togetherRef}
            className="absolute inset-x-0 top-0 mx-auto max-w-[11ch] px-4 font-clash text-[clamp(2.5rem,10vw,10rem)] font-semibold uppercase leading-[0.78] tracking-[-0.065em] text-[#171412]"
          >
            <span className="block">STRONGER</span>
            <span className="block">TOGETHER</span>
          </h2>
        </div>

        <div ref={workRef} id="stronger-work-strip" style={{ opacity: 0, visibility: "hidden" }} className="absolute inset-x-0 bottom-0 z-[6] bg-[#f2ede3] pb-3 pt-3 sm:pb-5">
          <div aria-label="Selected brand and website work" tabIndex={0} className="flex gap-3 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-[#171412] sm:gap-4 sm:px-6">
            {SHOWCASE_IMAGES.map((src, index) => (
              <div key={src} className="relative h-[clamp(100px,20svh,200px)] w-[clamp(160px,25vw,340px)] shrink-0 overflow-hidden rounded-lg bg-white">
                <Image src={src} alt={`Selected Lionovart project ${index + 1}`} fill sizes="(max-width: 640px) 180px, (max-width: 1360px) 25vw, 340px" loading="lazy" decoding="async" className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
