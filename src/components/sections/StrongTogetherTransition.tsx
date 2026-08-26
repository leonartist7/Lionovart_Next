"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InkRevealArtwork, {
  type InkRevealArtworkHandle,
} from "@/components/sections/strong-together/InkRevealArtwork";

gsap.registerPlugin(ScrollTrigger);

export default function StrongTogetherTransition() {
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const artHandleRef = useRef<InkRevealArtworkHandle>(null);
  const aloneRef = useRef<HTMLHeadingElement>(null);
  const aloneORef = useRef<HTMLSpanElement>(null);
  const togetherRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const alone = aloneRef.current;
    const aloneO = aloneORef.current;
    const together = togetherRef.current;
    const handle = artHandleRef.current;

    if (!section || !alone || !aloneO || !together || !handle?.art || !handle.blooms.length) {
      return;
    }

    const placeBloomOnO = () => {
      const oRect = aloneO.getBoundingClientRect();
      handle.setOriginFromClientPoint(
        oRect.left + oRect.width / 2,
        oRect.top + oRect.height / 2
      );
    };

    placeBloomOnO();
    document.fonts?.ready.then(() => {
      placeBloomOnO();
      ScrollTrigger.refresh();
    });

    const ctx = gsap.context(() => {
      const blooms = handle.blooms;
      const art = handle.art;
      if (!art) return;

      if (reduceMotion) {
        gsap.set(blooms, {
          attr: { r: (_, el) => Number(el.dataset.rFinal) },
        });
        gsap.set(art, { opacity: 1 });
        gsap.set(alone, { opacity: 0 });
        gsap.set(together, { opacity: 1, y: 0 });
        return;
      }

      const [primary, ...secondaries] = blooms;
      gsap.set(blooms, {
        attr: { r: (_, el) => Number(el.dataset.rStart) },
      });
      gsap.set(art, { opacity: 0.72 });
      gsap.set(alone, { opacity: 1, y: 0 });
      gsap.set(together, { opacity: 0, y: 14 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefresh: placeBloomOnO,
        },
      });

      timeline
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
        .to(alone, { opacity: 0, y: -10, duration: 0.14, ease: "none" }, 0.48)
        .to(together, { opacity: 1, y: 0, duration: 0.24, ease: "power4.out" }, 0.58);
    }, section);

    window.addEventListener("resize", placeBloomOnO, { passive: true });
    return () => {
      window.removeEventListener("resize", placeBloomOnO);
      ctx.revert();
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="stronger-together"
      aria-labelledby="strong-together-title"
      data-art-directed="light"
      className="relative h-[145svh] overflow-clip bg-bg-dark"
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden bg-[#0d0d0d]">
        <div className="pointer-events-none absolute inset-0 z-[4]" aria-hidden="true">
          <InkRevealArtwork
            ref={artHandleRef}
            reducedMotion={reduceMotion}
            className="h-full w-full"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[11%] z-[5] px-5 text-center sm:top-[12%] md:top-[11%] md:px-12">
          <h2
            ref={aloneRef}
            aria-hidden="true"
            className="mx-auto max-w-[11ch] font-clash text-[clamp(4rem,11vw,10rem)] font-semibold leading-[0.78] tracking-[-0.065em] text-[#f2ede3]"
          >
            <span className="block">Strong</span>
            <span className="block">
              al<span ref={aloneORef} className="relative inline-block">o</span>ne.
            </span>
          </h2>
          <h2
            id="strong-together-title"
            ref={togetherRef}
            className="absolute inset-x-0 top-0 mx-auto max-w-[11ch] px-4 font-clash text-[clamp(4rem,11vw,10rem)] font-semibold uppercase leading-[0.78] tracking-[-0.065em] text-[#171412]"
          >
            <span className="block">STRONGER</span>
            <span className="block">TOGETHER</span>
          </h2>
        </div>
      </div>
    </section>
  );
}
