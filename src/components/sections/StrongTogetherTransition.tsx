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
  const supportRef = useRef<HTMLParagraphElement>(null);
  const handsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !sectionRef.current ||
      !leftDoorRef.current ||
      !rightDoorRef.current ||
      !aloneRef.current ||
      !togetherRef.current ||
      !supportRef.current ||
      !handsRef.current ||
      !lineRef.current
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const doors = [leftDoorRef.current, rightDoorRef.current];

      if (reduceMotion) {
        gsap.set(doors, { xPercent: 0 });
        gsap.set(aloneRef.current, { opacity: 0, y: -24 });
        gsap.set(togetherRef.current, { opacity: 1, y: 0 });
        gsap.set(supportRef.current, { opacity: 1, y: 0 });
        gsap.set(handsRef.current, { opacity: 1, scale: 1 });
        gsap.set(lineRef.current, { scaleY: 1 });
        return;
      }

      gsap.set(leftDoorRef.current, { xPercent: -100 });
      gsap.set(rightDoorRef.current, { xPercent: 100 });
      gsap.set(aloneRef.current, { opacity: 1, y: 0 });
      gsap.set([togetherRef.current, supportRef.current], { opacity: 0, y: 28 });
      gsap.set(handsRef.current, { opacity: 0, scale: 1.04 });
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
        .to(leftDoorRef.current, { xPercent: 0, ease: "none" }, 0.15)
        .to(rightDoorRef.current, { xPercent: 0, ease: "none" }, 0.15)
        .to(lineRef.current, { scaleY: 1, ease: "none" }, 0.38)
        .to(handsRef.current, { opacity: 1, scale: 1, ease: "none" }, 0.46)
        .to(togetherRef.current, { opacity: 1, y: 0, ease: "power4.out" }, 0.58)
        .to(supportRef.current, { opacity: 1, y: 0, ease: "power4.out" }, 0.66);
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="strong-together-title"
      className="relative h-[220vh] overflow-clip bg-[#0d0d0d]"
    >
      <div className="sticky top-0 min-h-[100dvh] overflow-hidden bg-[#f2ede3]">
        <div className="absolute inset-0 bg-[#0d0d0d]" />

        <div
          ref={handsRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[32%] z-[4] h-[54%] opacity-0 md:top-[30%] md:h-[62%]"
        >
          <div className="absolute left-[-22%] top-0 h-full w-[76%] md:left-[-8%] md:w-[58%]">
            <Image
              src={LION_PAW}
              alt=""
              fill
              sizes="(max-width: 768px) 76vw, 58vw"
              className="object-contain object-right mix-blend-multiply"
            />
          </div>
          <div className="absolute right-[-22%] top-0 h-full w-[76%] md:right-[-8%] md:w-[58%]">
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

        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-6 text-center md:px-12">
          <h2
            ref={aloneRef}
            className="max-w-[12ch] font-clash text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.88] tracking-[-0.045em] text-[#f2ede3]"
          >
            Strong alone.
          </h2>

          <div className="absolute inset-x-0 top-[12%] flex flex-col items-center px-6 text-[#171412] md:top-[13%]">
            <h2
              id="strong-together-title"
              ref={togetherRef}
              className="max-w-[13ch] font-clash text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[0.9] tracking-[-0.045em]"
            >
              Stronger together.
            </h2>
            <p
              ref={supportRef}
              className="mt-5 max-w-[34ch] text-center font-clash text-sm leading-[1.6] text-[#171412]/65 md:text-base"
            >
              One vision becomes more powerful when it has the right force beside it.
            </p>
          </div>

          <div
            ref={lineRef}
            aria-hidden
            className="absolute bottom-[10%] left-1/2 h-20 w-px origin-top -translate-x-1/2 bg-[#e5192a] md:bottom-[8%] md:h-28"
          />
        </div>

        <div className="absolute bottom-5 left-1/2 z-[5] -translate-x-1/2 text-center font-clash text-[10px] font-semibold uppercase tracking-[0.18em] text-[#171412]/45">
          Strong alone / stronger together
        </div>
      </div>
    </section>
  );
}

