"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StrongTogetherShader from "@/components/sections/StrongTogetherShader";

gsap.registerPlugin(ScrollTrigger);

const HUMAN_HAND =
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1787029611/Isolated_Raised_Open_Hand_Cutout_jtpnok.webp";
const LION_PAW =
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1787029610/image-gen-1_20260813-044553_1_fgzpye.webp";

export default function StrongTogetherTransition() {
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const aloneRef = useRef<HTMLHeadingElement>(null);
  const strongRef = useRef<HTMLSpanElement>(null);
  const aloneORef = useRef<HTMLSpanElement>(null);
  const togetherRef = useRef<HTMLHeadingElement>(null);
  const handsRef = useRef<HTMLDivElement>(null);
  const humanRef = useRef<HTMLDivElement>(null);
  const lionRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const shaderLayerRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const alone = aloneRef.current;
    const strong = strongRef.current;
    const aloneO = aloneORef.current;
    const together = togetherRef.current;
    const hands = handsRef.current;
    const human = humanRef.current;
    const lion = lionRef.current;
    const bloom = bloomRef.current;
    const shaderLayer = shaderLayerRef.current;
    const caption = captionRef.current;

    if (!section || !alone || !strong || !aloneO || !together || !hands || !human || !lion || !bloom || !shaderLayer || !caption) {
      return;
    }

    const ctx = gsap.context(() => {
      const placeBloomOrigin = () => {
        const sectionBox = section.getBoundingClientRect();
        const letterBox = aloneO.getBoundingClientRect();
        gsap.set(bloom, {
          x: letterBox.left - sectionBox.left + letterBox.width / 2,
          y: letterBox.top - sectionBox.top + letterBox.height / 2,
          xPercent: -50,
          yPercent: -50,
        });
      };

      const bloomScale = () => {
        const sectionBox = section.getBoundingClientRect();
        const letterBox = aloneO.getBoundingClientRect();
        const originX = letterBox.left - sectionBox.left + letterBox.width / 2;
        const originY = letterBox.top - sectionBox.top + letterBox.height / 2;
        const furthestCorner = Math.max(
          Math.hypot(originX, originY),
          Math.hypot(sectionBox.width - originX, originY),
          Math.hypot(originX, sectionBox.height - originY),
          Math.hypot(sectionBox.width - originX, sectionBox.height - originY),
        );

        return furthestCorner / 20 + 1;
      };

      placeBloomOrigin();

      if (reduceMotion) {
        gsap.set(alone, { opacity: 0 });
        gsap.set(together, { opacity: 1 });
        gsap.set(hands, { opacity: 1 });
        gsap.set([human, lion], { xPercent: 0 });
        gsap.set(bloom, { scale: bloomScale() });
        gsap.set(shaderLayer, { opacity: 1 });
        gsap.set(caption, { opacity: 1 });
        return;
      }

      gsap.set(alone, { opacity: 1, y: 0 });
      gsap.set(together, { opacity: 0, y: 18 });
      gsap.set(hands, { opacity: 0 });
      gsap.set(human, { xPercent: 100 });
      gsap.set(lion, { xPercent: -100 });
      gsap.set(bloom, { scale: 0 });
      gsap.set(shaderLayer, { opacity: 0 });
      gsap.set(caption, { opacity: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: strong,
          // The bloom begins when the visible "Strong" line itself reaches
          // the vertical center of the viewport, held just below center.
          start: "center 52%",
          endTrigger: section,
          end: "top top",
          scrub: 1.1,
          invalidateOnRefresh: true,
          onRefreshInit: placeBloomOrigin,
        },
      });

      timeline
        .to(bloom, { scale: bloomScale, duration: 0.56, ease: "none" }, 0.12)
        .to(alone, { opacity: 0, y: -18, duration: 0.16, ease: "none" }, 0.48)
        .to(hands, { opacity: 1, duration: 0.12, ease: "none" }, 0.24)
        .to(human, { xPercent: 0, duration: 0.45, ease: "power3.out" }, 0.24)
        .to(lion, { xPercent: 0, duration: 0.45, ease: "power3.out" }, 0.24)
        .to(shaderLayer, { opacity: 1, duration: 0.22, ease: "power2.out" }, 0.5)
        .to(together, { opacity: 1, y: 0, duration: 0.2, ease: "power3.out" }, 0.62)
        // The caption is inked for the cream end-state, so it can only appear
        // once the bloom has actually landed — and it reads better as a
        // footnote to the resolution than as a label on the setup.
        .to(caption, { opacity: 1, duration: 0.18, ease: "power2.out" }, 0.7);
    }, section);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="stronger-together"
      aria-labelledby="strong-together-title"
      data-art-directed="light"
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#0a0a0a]"
    >
      <div className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#0a0a0a]">

        <div
          ref={bloomRef}
          aria-hidden
          className="pointer-events-none absolute z-[2] h-10 w-10 rounded-full bg-[#f4efe6]"
        />

        <div
          ref={handsRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[44%] z-[4] h-[60%] opacity-0 md:top-[38%] md:h-[68%]"
        >
          <div ref={lionRef} className="absolute left-[-28%] top-0 h-full w-[78%] md:left-[-12%] md:w-[62%]">
            <Image
              src={LION_PAW}
              alt=""
              fill
              sizes="(max-width: 768px) 78vw, 62vw"
              className="object-contain object-right mix-blend-multiply"
            />
          </div>
          <div ref={humanRef} className="absolute right-[-28%] top-0 h-full w-[78%] md:right-[-12%] md:w-[62%]">
            <Image
              src={HUMAN_HAND}
              alt=""
              fill
              sizes="(max-width: 768px) 78vw, 62vw"
              className="object-contain object-left mix-blend-multiply"
            />
          </div>
        </div>

        <div ref={shaderLayerRef} className="absolute inset-0 z-[3] opacity-0">
          <StrongTogetherShader />
        </div>

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

        <div ref={captionRef} className="absolute bottom-7 left-6 z-[6] opacity-0 md:bottom-10 md:left-[6vw]">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#171412]/55">
            LION + HUMAN INSTINCT
          </p>
          <p className="mt-2 max-w-[27ch] font-body text-[13px] leading-[1.5] text-[#171412]/75">
            Different strengths. One direction.
          </p>
        </div>

      </div>
    </section>
  );
}
