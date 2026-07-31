"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLandingFlow } from "@/contexts/LandingFlowContext";

gsap.registerPlugin(ScrollTrigger);

/* â”€â”€â”€ Brand assets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PORTRAIT_SRC = "/images/Leon-Studioshot.avif";
const PAINT_SRC    = "/images/paintco.avif";

/* â”€â”€â”€ Editable copy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const FOUNDER_NAME = "Leonardo";

const ABOUT_STATS = [
  { value: "15+",  label: "Years combined experience" },
  { value: "10+",  label: "Industries expertise" },
  { value: "100%", label: "On-Time Delivery" },
];

const RED_WORDS = new Set(["necessity."]);

const CAPTION_MASK = "radial-gradient(130% 100% at 50% 100%, #000 0%, #000 30%, transparent 72%)";
const CAPTION_GLOW = "radial-gradient(130% 100% at 50% 100%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 38%, transparent 72%)";

const mobileHeadlineContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const mobileHeadlineWord = {
  hidden:  { y: "110%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

/* â”€â”€â”€ Credibility metrics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CredStrip() {
  return (
    <>
      {ABOUT_STATS.map((s, i) => (
        <div
          key={s.label}
          className={`px-3 text-center ${i > 0 ? "border-l border-black/10" : ""}`}
        >
          <p className="font-display text-[clamp(1.375rem,3.2vw,2.5rem)] font-bold leading-none text-black">
            {s.value}
          </p>
          <p className="mt-1.5 text-[clamp(0.625rem,0.9vw,0.75rem)] leading-snug text-[#666]">
            {s.label}
          </p>
        </div>
      ))}
    </>
  );
}

/* â”€â”€â”€ Portrait card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PortraitFrame({
  frameClassName,
  revealClass = "",
  founderRole,
}: {
  frameClassName: string;
  revealClass?: string;
  founderRole: string;
}) {
  return (
    <div className={`relative ${frameClassName}`}>
      <div
        className={`relative z-[1] h-full w-full overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] ${revealClass}`}
      >
        <Image
          src={PORTRAIT_SRC}
          alt={`${FOUNDER_NAME} â€” ${founderRole}`}
          fill
          sizes="(max-width: 1024px) 85vw, clamp(260px,28vw,400px)"
          className="object-cover"
        />
        {/* Radial-faded blur + glow caption */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-[48%]">
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ WebkitMaskImage: CAPTION_MASK, maskImage: CAPTION_MASK }}
          />
          <div className="absolute inset-0" style={{ background: CAPTION_GLOW }} />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
            <p className="font-display text-[clamp(1rem,1.4vw,1.375rem)] font-bold leading-tight text-white">
              {FOUNDER_NAME}
            </p>
            <p className="mt-0.5 text-[0.8125rem] text-white/70">{founderRole}</p>
          </div>
        </div>
      </div>

      {/* PAINTCO â€” fixed bottom-right corner, on top of the photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PAINT_SRC}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 z-30 w-[65%] select-none"
      />
    </div>
  );
}

/* â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function AboutUsHalf(props: any) {
  const flow = useLandingFlow();
  const sectionRef = useRef<HTMLElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const headlineTop: string = props.headlineTop || t.about.line1;
  const bodyText: string    = props.bodyText    || t.about.line2;
  const founderRole: string = props.founderRole || t.about.founderRole;

  const words = headlineTop.split(" ");

  /* â”€â”€ GSAP â€” desktop pinned scroll sequence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const wordEls = gsap.utils.toArray<HTMLElement>(".about-word-inner");

        gsap.timeline({
          scrollTrigger: {
            trigger: desktopRef.current,
            start: "top 60%",
            end: "top top",
            scrub: 1.2,
          },
        })
          .fromTo(
            wordEls,
            { yPercent: flow === "inverse" ? 0 : 110 },
            { yPercent: flow === "inverse" ? 110 : 0, duration: 1, stagger: 0.08, ease: "power3.out" },
            0.05,
          );

        gsap.timeline({
          scrollTrigger: {
            trigger: desktopRef.current,
            start: "top top",
            end: "+=80%",
            pin: true,
            scrub: 1.5,
            pinSpacing: true,
          },
        })
          .fromTo(
            ".about-body",
            flow === "inverse" ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
            flow === "inverse"
              ? { opacity: 0, y: 20, duration: 0.5, stagger: 0.12, ease: "power2.out" }
              : { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out" },
            0,
          )
          .fromTo(
            ".about-image",
            flow === "inverse" ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 30 },
            flow === "inverse"
              ? { opacity: 0, scale: 0.92, y: 30, duration: 0.7, ease: "power2.out" }
              : { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "power2.out" },
            0.3,
          );
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [flow] }
  );

  return (
    <section ref={sectionRef} className="relative bg-bg-surface-light">

      {/* â”€â”€ DESKTOP: Pinned two-column magazine layout â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        ref={desktopRef}
        className="hidden lg:block relative h-screen overflow-hidden"
      >
        {/*
          items-center â†’ grid auto-height centered in 100vh, zero dead bands.
          items-start on grid â†’ both cols top-align; portrait extends below text naturally.
        */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-[clamp(4rem,7vh,6rem)] pb-[clamp(1.5rem,3vh,3rem)] gap-[clamp(1.5rem,3vh,2.5rem)] z-[1]">

          {/* ROW 1 â€” Line 0 spans full width above the grid */}
          <div className="w-full max-w-[1400px] px-[max(3rem,6vw)]">
            <p className="font-display text-black leading-[1.05] tracking-tight text-[clamp(2rem,3.5vw,5rem)] whitespace-nowrap">
              <span className="inline-block overflow-hidden align-bottom mr-[0.22em]">
                <span className="about-word-inner inline-block">&ldquo;</span>
              </span>
              {headlineTop.split('\n')[0].split(' ').filter(Boolean).map((word, wi) => (
                <span key={wi} className="inline-block overflow-hidden align-bottom mr-[0.22em]">
                  <span className="about-word-inner inline-block">{word}</span>
                </span>
              ))}
            </p>
          </div>

          {/* ROW 2 â€” 2-col grid */}
          <div className="w-full max-w-[1400px] px-[max(3rem,6vw)] grid grid-cols-[1fr_34%] gap-[clamp(2rem,4vw,5rem)] items-start">

            {/* LEFT COLUMN â€” line 2, divider, body, stats */}
            <div className="flex flex-col items-start w-full">
              <h2 className="font-display text-black leading-[1.05] tracking-tight text-[clamp(2rem,3.5vw,5rem)]">
                {(headlineTop.split('\n')[1] ?? '').split(' ').filter(Boolean).map((word, wi) => (
                  <span key={wi} className="inline-block overflow-hidden align-bottom mr-[0.22em]">
                    <span className={`about-word-inner inline-block${RED_WORDS.has(word) ? ' text-[#e5192a]' : ''}`}>
                      {word}
                    </span>
                  </span>
                ))}
                <span className="inline-block overflow-hidden align-bottom">
                  <span className="about-word-inner inline-block">&rdquo;</span>
                </span>
              </h2>

              <div className="w-14 h-px bg-black/15 mt-[clamp(1rem,2vh,1.75rem)] mb-[clamp(1.25rem,2.5vh,2rem)]" aria-hidden="true" />

              <p
                className="about-body font-display text-[clamp(1rem,1.3vw,1.375rem)] leading-[1.6] text-[#333] max-w-[clamp(300px,34vw,480px)] opacity-0"
                style={{ textAlign: 'justify' }}
              >
                {bodyText}
              </p>

              <div className="about-body mt-[clamp(1.5rem,2.5vh,2rem)] grid w-full max-w-[clamp(300px,34vw,480px)] grid-cols-3 opacity-0">
                <CredStrip />
              </div>
            </div>

            {/* RIGHT COLUMN â€” portrait, top-anchored */}
            <div className="flex justify-center items-start">
              <PortraitFrame
                frameClassName="w-full aspect-[3/4] max-h-[clamp(60vh,78vh,90vh)]"
                revealClass="about-image opacity-0"
                founderRole={founderRole}
              />
            </div>
          </div>

        </div>
      </div>

      {/* â”€â”€ MOBILE / TABLET: Stacked layout (portrait below text) â”€â”€ */}
      <div className="lg:hidden pt-[clamp(1.5rem,4vw,2.5rem)] pb-[clamp(2.5rem,6vw,4rem)] px-[max(1.25rem,4vw)]">
        <div className="text-center">
          <motion.h2
            variants={mobileHeadlineContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="font-display text-black leading-[1.2] mb-6 text-[clamp(1.5rem,5.5vw,2.25rem)]"
          >
            <span className="inline-block overflow-hidden align-bottom mr-[0.2em]">
              <motion.span variants={mobileHeadlineWord} className="inline-block">&ldquo;</motion.span>
            </span>
            {words.map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden align-bottom mr-[0.2em] last:mr-0"
              >
                <motion.span
                  variants={mobileHeadlineWord}
                  className={`inline-block${RED_WORDS.has(word) ? " text-[#e5192a]" : ""}`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
            <span className="inline-block overflow-hidden align-bottom">
              <motion.span variants={mobileHeadlineWord} className="inline-block">&rdquo;</motion.span>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-display text-[0.9375rem] md:text-[1.0625rem] leading-[1.7] text-[#333] max-w-[min(480px,90vw)] mx-auto text-justify"
          >
            {bodyText}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-9 mx-auto grid w-full max-w-[min(360px,90vw)] grid-cols-3"
          >
            <CredStrip />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-10 mx-auto w-full max-w-[min(360px,85vw)]"
        >
          <PortraitFrame
            frameClassName="w-full aspect-[3/4]"
            founderRole={founderRole}
          />
        </motion.div>
      </div>
    </section>
  );
}
