"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HUMAN_HAND =
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1785658409/right_hand_sru02d.avif";
const LION_PAW =
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1785658409/left_paw_xsgfna.avif";

export default function StrongTogetherTransition() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const aloneRef = useRef<HTMLHeadingElement>(null);
  const togetherRef = useRef<HTMLHeadingElement>(null);
  const handsRef = useRef<HTMLDivElement>(null);
  const lionRef = useRef<HTMLDivElement>(null);
  const humanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !sectionRef.current ||
      !leftDoorRef.current ||
      !rightDoorRef.current ||
      !aloneRef.current ||
      !togetherRef.current ||
      !handsRef.current ||
      !lionRef.current ||
      !humanRef.current
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const doors = [leftDoorRef.current, rightDoorRef.current];

      if (reduceMotion) {
        gsap.set(doors, { xPercent: 0 });
        gsap.set(aloneRef.current, { opacity: 0, y: 0 });
        gsap.set(togetherRef.current, { opacity: 1, y: 0 });
        gsap.set(handsRef.current, { opacity: 1 });
        gsap.set([lionRef.current, humanRef.current], { xPercent: 0 });
        return;
      }

      gsap.set(leftDoorRef.current, { xPercent: -100 });
      gsap.set(rightDoorRef.current, { xPercent: 100 });
      gsap.set(aloneRef.current, { opacity: 1, y: 0 });
      gsap.set(togetherRef.current, { opacity: 0, y: 0 });
      gsap.set(handsRef.current, { opacity: 0 });
      gsap.set(lionRef.current, { xPercent: -100 });
      gsap.set(humanRef.current, { xPercent: 100 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      timeline
        .to(leftDoorRef.current, { xPercent: 0, duration: 0.45, ease: "none" }, 0.12)
        .to(rightDoorRef.current, { xPercent: 0, duration: 0.45, ease: "none" }, 0.12)
        .to(aloneRef.current, { opacity: 0, duration: 0.12, ease: "none" }, 0.52)
        .set(handsRef.current, { opacity: 1 }, 0.12)
        .to(lionRef.current, { xPercent: 0, duration: 0.45, ease: "power3.out" }, 0.12)
        .to(humanRef.current, { xPercent: 0, duration: 0.45, ease: "power3.out" }, 0.12)
        .to(togetherRef.current, { opacity: 1, duration: 0.24, ease: "power4.out" }, 0.58);
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="strong-together-title"
      className="relative h-[220vh] overflow-visible bg-[#0d0d0d]"
    >
      {/* Keep the artwork inside the transition viewport so it can never bleed through the next marquee. */}
      <div className="sticky top-0 min-h-[100dvh] overflow-hidden bg-[#f2ede3]">
        <div className="absolute inset-0 bg-[#0d0d0d]" />

        <div
          ref={handsRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[45%] z-[4] h-[70%] opacity-0 md:top-[42%] md:h-[72%]"
        >
          <div
            ref={lionRef}
            className="absolute left-[-22%] top-0 h-full w-[76%] md:left-[-8%] md:w-[58%]"
          >
            <Image
              src={LION_PAW}
              alt=""
              fill
              sizes="(max-width: 768px) 76vw, 58vw"
              className="object-contain object-right mix-blend-multiply"
            />
          </div>
          <div
            ref={humanRef}
            className="absolute right-[-22%] top-0 h-full w-[76%] md:right-[-8%] md:w-[58%]"
          >
            <Image
              src={HUMAN_HAND}
              alt=""
              fill
              sizes="(max-width: 768px) 76vw, 58vw"
              className="object-contain object-left mix-blend-multiply"
            />
          </div>
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

        <div className="pointer-events-none absolute inset-x-0 top-[15%] z-[5] px-6 text-center md:top-[14%] md:px-12">
          <h2
            ref={aloneRef}
            aria-hidden="true"
            className="mx-auto max-w-[12ch] font-clash text-[clamp(4rem,11vw,10rem)] font-semibold leading-[0.88] tracking-[-0.045em] text-[#f2ede3]"
          >
            Strong alone.
          </h2>

          <h2
            id="strong-together-title"
            ref={togetherRef}
            className="absolute inset-x-0 top-0 mx-auto max-w-[12ch] px-4 font-clash text-[clamp(3.4rem,8vw,7.5rem)] font-semibold uppercase leading-[0.88] tracking-[-0.045em] text-[#171412]"
          >
            STRONGER TOGETHER
          </h2>
        </div>
      </div>
    </section>
  );
}
