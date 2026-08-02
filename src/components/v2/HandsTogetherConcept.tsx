≠rá^—f•ñÿ¶{ç¨y 'v√Æ∂õ≠"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reversible concept preview for the Strong alone / Stronger together beat.
 * The supplied composite is intentionally kept as one image so it can be
 * tested as a full-width composition before investing in a video sequence.
 */
export default function HandsTogetherConcept() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const aloneRef = useRef<HTMLHeadingElement>(null);
  const togetherRef = useRef<HTMLHeadingElement>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (
      !sectionRef.current ||
      !leftDoorRef.current ||
      !rightDoorRef.current ||
      !aloneRef.current ||
      !togetherRef.current ||
      !supportRef.current ||
      !imageRef.current ||
      !lineRef.current
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const doors = [leftDoorRef.current, rightDoorRef.current];
      const finalState = {
        xPercent: 0,
        opacity: 1,
      };

      if (reduceMotion) {
        gsap.set(doors, finalState);
        gsap.set(aloneRef.current, { opacity: 0, y: -24 });
        gsap.set(togetherRef.current, { opacity: 1, y: 0 });
        gsap.set(supportRef.current, { opacity: 1, y: 0 });
        gsap.set(imageRef.current, { opacity: 1, scale: 1 });
        gsap.set(lineRef.current, { scaleY: 1 });
        return;
      }

      gsap.set(leftDoorRef.current, { xPercent: -100 });
      gsap.set(rightDoorRef.current, { xPercent: 100 });
      gsap.set([togetherRef.current, supportRef.current, imageRef.current], {
        opacity: 0,
      });
      gsap.set([togetherRef.current, supportRef.current], { y: 28 });
      gsap.set(imageRef.current, { scale: 1.04 });
      gsap.set(lineRef.current, { scaleY: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      timeline
        .to(aloneRef.current, { opacity: 0, y: -34, ease: "none" }, 0.04)
        .to(leftDoorRef.current, { xPercent: 0, ease: "none" }, 0.16)
        .to(rightDoorRef.current, { xPercent: 0, ease: "none" }, 0.16)
        .to(lineRef.current, { scaleY: 1, ease: "none" }, 0.43)
        .to(imageRef.current, { opacity: 1, scale: 1, ease: "none" }, 0.55)
        .to(togetherRef.current, { opacity: 1, y: 0, ease: "power4.out" }, 0.61)
        .to(supportRef.current, { opacity: 1, y: 0, ease: "power4.out" }, 0.68);
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hands-together-title"
      className="relative h-[220vh] overflow-clip bg-[#0d0d0d]"
    >
      <div className="sticky top-0 min-h-[100dvh] overflow-hidden bg-[#f2ede3]">
        <div className="absolute inset-0 bg-[#0d0d0d]" />

        <div
          ref={imageRef}
          aria-hidden
          className="absolute inset-0 z-[4] opacity-0 md:inset-x-0 md:bottom-0 md:top-[43%]"
        >
          <Image
            src="/images/v2/concepts/hands-together.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-contain object-center md:object-cover md:object-[center_58%]"
          />
          <div className="absolute inset-0 bg-[#f2ede3]/[0.08]" />
        </div>

        <div
          ref={leftDoorRef}
          aria-hidden
          className="absolute inset-y-0 left-0 z-[3] w-1/2 bg-[#f2ede3]"
        />
        <div
          ref={rightDoorRef}
          aria-hidden
          className="absolute inset-y-0 right-0 z-[3] w-1/2 bg-[#f2ede3]"
        />

        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-6 text-center md:px-12">
          <h1
            ref={aloneRef}
            className="v2-serif max-w-[12ch] text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.96] text-[#f2ede3]"
          >
            Strong alone.
          </h1>

          <div className="absolute inset-x-0 top-[15%] flex flex-col items-center px-6 text-[#171412] md:top-[16%]">
            <h2
              id="hands-together-title"
              ref={togetherRef}
              className="v2-serif max-w-[13ch] text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98]"
            >
              Stronger together.
            </h2>
            <p
              ref={supportRef}
              className="mt-5 max-w-[34ch] text-center text-sm leading-[1.6] text-[#171412]/65 md:text-base"
            >
              One vision becomes more powerful when it has the right force beside it.
            </p>
          </div>

          <div
            ref={lineRef}
            aria-hidden
            className="absolute bottom-[12%] left-1/2 h-20 w-px origin-top -translate-x-1/2 bg-[#e5192a] md:bottom-[10%] md:h-28"
          />
        </div>

        <div className="absolute bottom-5 left-1/2 z-[5] -translate-x-1/2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#171412]/45">
          Concept preview
        </div>
      </div>
    </section>
  );
}
