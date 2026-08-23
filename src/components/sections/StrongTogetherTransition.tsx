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
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const aloneRef = useRef<HTMLHeadingElement>(null);
  const togetherRef = useRef<HTMLHeadingElement>(null);
  const handsRef = useRef<HTMLDivElement>(null);
  const humanRef = useRef<HTMLDivElement>(null);
  const lionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const alone = aloneRef.current;
    const together = togetherRef.current;
    const hands = handsRef.current;
    const human = humanRef.current;
    const lion = lionRef.current;

    if (!section || !leftDoor || !rightDoor || !alone || !together || !hands || !human || !lion) {
      return;
    }

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set([leftDoor, rightDoor], { xPercent: 0 });
        gsap.set(alone, { opacity: 0 });
        gsap.set(together, { opacity: 1 });
        gsap.set(hands, { opacity: 1 });
        gsap.set([human, lion], { xPercent: 0 });
        return;
      }

      gsap.set(leftDoor, { xPercent: -100 });
      gsap.set(rightDoor, { xPercent: 100 });
      gsap.set(alone, { opacity: 1, y: 0 });
      gsap.set(together, { opacity: 0, y: 18 });
      gsap.set(hands, { opacity: 0 });
      gsap.set(human, { xPercent: -100 });
      gsap.set(lion, { xPercent: 100 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(leftDoor, { xPercent: 0, duration: 0.48, ease: "none" }, 0.12)
        .to(rightDoor, { xPercent: 0, duration: 0.48, ease: "none" }, 0.12)
        .to(alone, { opacity: 0, y: -18, duration: 0.16, ease: "none" }, 0.5)
        .to(hands, { opacity: 1, duration: 0.12, ease: "none" }, 0.24)
        .to(human, { xPercent: 0, duration: 0.45, ease: "power3.out" }, 0.24)
        .to(lion, { xPercent: 0, duration: 0.45, ease: "power3.out" }, 0.24)
        .to(together, { opacity: 1, y: 0, duration: 0.2, ease: "power3.out" }, 0.62);
    }, section);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="stronger-together"
      aria-labelledby="strong-together-title"
      data-art-directed="light"
      className="relative h-[210vh] overflow-hidden bg-[#0d0d0d]"
    >
      <div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden bg-[#0d0d0d]">
        <div aria-hidden className="absolute inset-0 bg-[#0d0d0d]" />

        <div className="absolute left-6 top-7 z-20 flex items-center gap-3 md:left-[6vw] md:top-10">
          <span className="h-[2px] w-7 bg-[#e5192a]" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">
            THE PARTNERSHIP
          </p>
        </div>

        <div
          ref={handsRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[34%] z-[4] h-[60%] opacity-0 md:top-[28%] md:h-[68%]"
        >
          <div ref={humanRef} className="absolute left-[-28%] top-0 h-full w-[78%] md:left-[-12%] md:w-[62%]">
            <Image
              src={HUMAN_HAND}
              alt=""
              fill
              sizes="(max-width: 768px) 78vw, 62vw"
              className="object-contain object-right mix-blend-multiply"
            />
          </div>
          <div ref={lionRef} className="absolute right-[-28%] top-0 h-full w-[78%] md:right-[-12%] md:w-[62%]">
            <Image
              src={LION_PAW}
              alt=""
              fill
              sizes="(max-width: 768px) 78vw, 62vw"
              className="object-contain object-left mix-blend-multiply"
            />
          </div>
        </div>

        <div
          ref={leftDoorRef}
          aria-hidden
          className="absolute inset-y-0 left-0 z-[3] w-1/2 overflow-hidden bg-[#f2ede3] shadow-[inset_-34px_0_70px_rgba(37,30,19,0.11)]"
        >
          <div className="absolute inset-[4vw] border border-black/[0.055]" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/[0.08] to-transparent" />
        </div>
        <div
          ref={rightDoorRef}
          aria-hidden
          className="absolute inset-y-0 right-0 z-[3] w-1/2 overflow-hidden bg-[#f2ede3] shadow-[inset_34px_0_70px_rgba(37,30,19,0.11)]"
        >
          <div className="absolute inset-[4vw] border border-black/[0.055]" />
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/[0.08] to-transparent" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[15%] z-[5] px-6 text-center md:top-[13%] md:px-12">
          <h2
            ref={aloneRef}
            aria-hidden="true"
            className="mx-auto max-w-[11ch] font-clash text-[clamp(4.4rem,11vw,10rem)] font-semibold leading-[0.78] tracking-[-0.065em] text-[#f2ede3]"
          >
            Strong alone.
          </h2>
          <h2
            id="strong-together-title"
            ref={togetherRef}
            className="absolute inset-x-0 top-0 mx-auto max-w-[11ch] px-4 font-clash text-[clamp(4.4rem,11vw,10rem)] font-semibold leading-[0.78] tracking-[-0.065em] text-[#171412]"
          >
            Stronger together.
          </h2>
        </div>

        <div className="absolute bottom-7 left-6 z-[6] md:bottom-10 md:left-[6vw]">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-white/45">
            LION + HUMAN INSTINCT
          </p>
          <p className="mt-2 max-w-[27ch] font-body text-[13px] leading-[1.5] text-white/55">
            Different strengths. One direction.
          </p>
        </div>
      </div>
    </section>
  );
}
