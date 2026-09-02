"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const RED = "#e5192a";
const GOLD = "#c7a86a";
const SLAB = "#0b0b0b";
const PAPER = "#f7f4ef";
const INK = "#111111";

const L_PATH = "M84 92H192V357H270L321 432H84Z";
const N_PATH = "M192 92L330 299V151H428V432H320L192 241Z";
const CROWN_PATH = "M328 79L360 98L378 79L397 98L428 79V138H328Z";

const STAGES = [
  { name: "CLARIFY", line: "Find what matters." },
  { name: "ELEVATE", line: "Give the vision direction." },
  { name: "CREATE", line: "Turn strategy into reality." },
  { name: "AMPLIFY", line: "Launch. Learn. Optimize. Rise." },
] as const;

function MobileJourney({
  eyebrow,
  heading,
  headingAccent,
  ctaLabel,
  ctaSub,
  stepCopy,
  reduced,
}: {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  ctaLabel: string;
  ctaSub: string;
  stepCopy: string[];
  reduced: boolean;
}) {
  return (
    <div className="relative overflow-hidden px-5 pb-20 pt-24 sm:px-7 lg:hidden">
      <div className="pointer-events-none absolute -right-[34vw] top-24 w-[118vw] max-w-[680px] opacity-[0.055]">
        <svg viewBox="0 0 512 512" className="h-auto w-full" aria-hidden="true">
          <path d={L_PATH} fill="none" stroke={GOLD} strokeWidth="3" />
          <path d={N_PATH} fill="none" stroke={GOLD} strokeWidth="3" />
          <path d={CROWN_PATH} fill="none" stroke={GOLD} strokeWidth="3" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-xl">
        <div className="flex items-center gap-3">
          <span className="h-[2px] w-7" style={{ backgroundColor: RED }} />
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
            {eyebrow}
          </p>
        </div>

        <h2 className="mt-5 font-clash text-[clamp(2.75rem,12vw,4.25rem)] font-bold uppercase leading-[0.84] tracking-[-0.05em]">
          <span className="text-white">{heading} </span>
          <span style={{ color: RED }}>{headingAccent}</span>
        </h2>

        <div className="relative mt-16 pl-8">
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-[5px] top-2 w-px"
            style={{ background: `linear-gradient(to bottom, ${GOLD}, rgba(199,168,106,.08))` }}
          />

          <div className="space-y-16">
            {STAGES.map((stage, index) => (
              <motion.article
                key={stage.name}
                initial={reduced ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: reduced ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] top-[7px] h-[11px] w-[11px] rounded-full border-2"
                  style={{ borderColor: GOLD, backgroundColor: SLAB }}
                />
                <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-clash text-[2rem] font-semibold uppercase leading-none tracking-[-0.035em] text-white">
                  {stage.name}
                </h3>
                <p className="mt-3 max-w-[34ch] font-body text-[14px] leading-[1.65] text-white/55">
                  {stepCopy[index] || stage.line}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduced ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-20 w-[min(72vw,320px)]"
        >
          <svg viewBox="0 0 512 512" className="h-auto w-full" role="img" aria-label="LIONOVART mark">
            <rect width="512" height="512" fill="#F51B2C" />
            <path d={L_PATH} fill="#FFFFFF" />
            <path d={N_PATH} fill="#000000" />
            <path d={CROWN_PATH} fill="#FFFFFF" />
          </svg>
        </motion.div>

        <div className="mt-9 text-center">
          <p className="font-clash text-[clamp(2rem,9vw,3rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white">
            Everything connects.
          </p>
          <a
            href="#closing-cta"
            className="mt-8 inline-flex min-h-[44px] items-center gap-3 rounded-full px-7 py-4 font-clash text-[11px] font-bold uppercase tracking-[0.15em]"
            style={{ backgroundColor: PAPER, color: INK }}
          >
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </a>
          <p className="mt-4 font-body text-[12px] text-white/45">{ctaSub}</p>
        </div>
      </div>
    </div>
  );
}

export default function LogoProcessJourney(props: any) {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [activeStage, setActiveStage] = useState(0);
  const [finalReveal, setFinalReveal] = useState(false);

  const eyebrow = props.eyebrow || t.process.eyebrow;
  const heading = props.heading || t.process.heading;
  const headingAccent = props.headingAccent || t.process.headingAccent;
  const ctaLabel = t.process.cta;
  const ctaSub = t.process.ctaSub;

  const stepCopy = STAGES.map((stage, index) =>
    t.process.steps?.[index]?.gain || t.process.steps?.[index]?.description || stage.line,
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const cameraScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.43, 0.7, 0.86, 0.95, 1],
    [4.9, 4.55, 3.9, 3.15, 3.7, 0.86, 0.82],
  );
  const cameraX = useTransform(
    scrollYProgress,
    [0, 0.2, 0.43, 0.7, 0.86, 0.95, 1],
    ["29vw", "27vw", "14vw", "-4vw", "-26vw", "0vw", "0vw"],
  );
  const cameraY = useTransform(
    scrollYProgress,
    [0, 0.2, 0.43, 0.7, 0.86, 0.95, 1],
    ["-28vh", "4vh", "8vh", "7vh", "31vh", "0vh", "0vh"],
  );
  const cameraRotate = useTransform(
    scrollYProgress,
    [0, 0.25, 0.48, 0.72, 0.9, 1],
    [-1.5, -0.4, 1.3, -1, 0.5, 0],
  );

  const introOpacity = useTransform(scrollYProgress, [0, 0.08, 0.2], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.2], [0, -32]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.83, 0.94], [0.16, 0.13, 0]);
  const foundationLength = useTransform(scrollYProgress, [0.02, 0.18], [0, 1]);
  const elevateLength = useTransform(scrollYProgress, [0.18, 0.45], [0, 1]);
  const createLength = useTransform(scrollYProgress, [0.42, 0.76], [0, 1]);
  const crownLength = useTransform(scrollYProgress, [0.73, 0.89], [0, 1]);
  const finalLogoOpacity = useTransform(scrollYProgress, [0.9, 0.97], [0, 1]);
  const finalCopyOpacity = useTransform(scrollYProgress, [0.93, 0.985], [0, 1]);
  const finalCopyY = useTransform(scrollYProgress, [0.93, 0.985], [22, 0]);

  const clarityOpacity = useTransform(scrollYProgress, [0, 0.04, 0.16, 0.26], [0, 1, 1, 0]);
  const elevateOpacity = useTransform(scrollYProgress, [0.19, 0.28, 0.4, 0.5], [0, 1, 1, 0]);
  const createOpacity = useTransform(scrollYProgress, [0.43, 0.52, 0.68, 0.78], [0, 1, 1, 0]);
  const amplifyOpacity = useTransform(scrollYProgress, [0.7, 0.78, 0.88, 0.94], [0, 1, 1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const nextStage = value < 0.25 ? 0 : value < 0.5 ? 1 : value < 0.76 ? 2 : 3;
    setActiveStage((current) => (current === nextStage ? current : nextStage));
    const nextFinal = value >= 0.91;
    setFinalReveal((current) => (current === nextFinal ? current : nextFinal));
  });

  const shownStage = reduced ? 3 : activeStage;

  return (
    <section
      ref={sectionRef}
      id="process"
      data-art-directed="dark"
      data-process-direction="logo"
      className="relative isolate overflow-hidden bg-[#0b0b0b] text-white lg:h-[390vh]"
      aria-label={eyebrow}
    >
      <MobileJourney
        eyebrow={eyebrow}
        heading={heading}
        headingAccent={headingAccent}
        ctaLabel={ctaLabel}
        ctaSub={ctaSub}
        stepCopy={stepCopy}
        reduced={reduced}
      />

      <div className="sticky top-0 hidden h-[100svh] overflow-hidden lg:block">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(199,168,106,.055), transparent 30%), radial-gradient(circle at 84% 16%, rgba(229,25,42,.045), transparent 24%), #0b0b0b",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)",
            backgroundSize: "88px 88px",
            maskImage: "radial-gradient(circle at center, black, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle at center, black, transparent 72%)",
          }}
        />

        <motion.div
          className="pointer-events-none absolute left-[7vw] top-[14vh] z-30 max-w-[620px]"
          style={{ opacity: reduced ? 1 : introOpacity, y: reduced ? 0 : introY }}
        >
          <div className="flex items-center gap-4">
            <span className="h-[2px] w-8" style={{ backgroundColor: RED }} />
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-white/45 xl:text-[11px]">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-6 font-clash text-[clamp(3.3rem,6vw,7.4rem)] font-bold uppercase leading-[0.82] tracking-[-0.055em]">
            <span className="text-white">{heading} </span>
            <span style={{ color: RED }}>{headingAccent}</span>
          </h2>
          <p className="mt-7 max-w-[36ch] font-body text-[14px] leading-[1.65] text-white/48">
            Follow the idea as it becomes direction, execution and a system built to compound.
          </p>
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative aspect-square w-[min(72vw,880px)]">
            <motion.div
              className="absolute inset-0 will-change-transform"
              style={
                reduced
                  ? { scale: 1, x: 0, y: 0, rotateZ: 0 }
                  : { scale: cameraScale, x: cameraX, y: cameraY, rotateZ: cameraRotate }
              }
            >
              <svg viewBox="0 0 512 512" className="h-full w-full overflow-visible" aria-hidden="true">
                <defs>
                  <filter id="processGoldGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <motion.g style={{ opacity: reduced ? 0.1 : ghostOpacity }}>
                  <path d={L_PATH} fill="none" stroke={GOLD} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                  <path d={N_PATH} fill="none" stroke={GOLD} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                  <path d={CROWN_PATH} fill="none" stroke={GOLD} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                </motion.g>

                <motion.path
                  d="M84 432H321"
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="2.2"
                  strokeLinecap="square"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : foundationLength }}
                />
                <motion.path
                  d="M84 432V92H192V357H270L321 432"
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="2.2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : elevateLength }}
                />
                <motion.path
                  d={N_PATH}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="2.2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : createLength }}
                />
                <motion.path
                  d={CROWN_PATH}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="2.2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : crownLength }}
                />

                <motion.g style={{ opacity: reduced ? 1 : finalLogoOpacity }}>
                  <rect width="512" height="512" fill="#F51B2C" />
                  <path d={L_PATH} fill="#FFFFFF" />
                  <path d={N_PATH} fill="#000000" />
                  <path d={CROWN_PATH} fill="#FFFFFF" />
                </motion.g>
              </svg>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="pointer-events-none absolute bottom-[17vh] left-[8vw] z-20 max-w-[330px] border-l border-[#c7a86a]/35 pl-5"
          style={{ opacity: reduced ? 0 : clarityOpacity }}
        >
          <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-[#c7a86a]/75">INSIGHT</p>
          <p className="mt-3 font-clash text-[clamp(2rem,3.2vw,3.6rem)] font-medium uppercase leading-[0.9] tracking-[-0.04em] text-white">
            Strip away the noise.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-body text-[9px] uppercase tracking-[0.18em] text-white/35">
            <span>Audience</span><span>Context</span><span>Opportunity</span>
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute right-[8vw] top-[21vh] z-20 w-[min(30vw,390px)]"
          style={{ opacity: reduced ? 0 : elevateOpacity }}
        >
          <div className="flex items-center justify-between border-t border-white/15 pt-4">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-[#c7a86a]/75">DIRECTION</p>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RED }} />
          </div>
          <p className="mt-5 font-clash text-[clamp(2.1rem,3.6vw,4rem)] font-medium uppercase leading-[0.88] tracking-[-0.045em] text-white">
            Make the ambition visible.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center font-body text-[8px] uppercase tracking-[0.15em] text-white/28">
            <span className="border border-white/10 py-3">Position</span>
            <span className="border border-white/10 py-3">Narrative</span>
            <span className="border border-white/10 py-3">System</span>
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-[7vw] top-[18vh] z-20 flex w-[min(38vw,520px)] items-end gap-8"
          style={{ opacity: reduced ? 0 : createOpacity }}
        >
          <div className="min-w-[150px] flex-1">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-[#c7a86a]/75">IDENTITY</p>
            <p className="mt-3 font-clash text-[clamp(4rem,7vw,7.6rem)] font-medium leading-none tracking-[-0.055em] text-white">Aa</p>
            <div className="mt-5 flex h-5 gap-2">
              <span className="w-1/4" style={{ backgroundColor: RED }} />
              <span className="w-1/4 bg-white" />
              <span className="w-1/4" style={{ backgroundColor: GOLD }} />
              <span className="w-1/4 border border-white/15 bg-[#111]" />
            </div>
          </div>
          <div className="w-[44%] border border-white/12 p-4">
            <div className="h-2 w-1/3 bg-white/18" />
            <div className="mt-4 grid grid-cols-[28%_1fr] gap-3">
              <div className="space-y-2"><span className="block h-2 bg-white/10" /><span className="block h-2 bg-white/10" /><span className="block h-2 bg-white/10" /></div>
              <div className="aspect-[4/3] border border-white/12" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-[16vh] right-[7vw] z-20 max-w-[420px] text-right"
          style={{ opacity: reduced ? 0 : amplifyOpacity }}
        >
          <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-[#c7a86a]/75">AMPLIFICATION</p>
          <p className="mt-4 font-clash text-[clamp(2rem,3.5vw,3.9rem)] font-medium uppercase leading-[0.88] tracking-[-0.045em] text-white">
            Launch. Learn. Compound.
          </p>
          <div className="mt-6 flex items-center justify-end gap-3 font-body text-[9px] uppercase tracking-[0.18em] text-white/30">
            <span>Measure</span><span className="h-px w-9 bg-[#c7a86a]/40" /><span>Optimize</span><span className="text-[#e5192a]">↗</span>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute bottom-8 left-8 z-30 flex items-baseline gap-4 xl:left-12">
          <span className="font-clash text-[1.7rem] font-semibold tabular-nums" style={{ color: RED }}>
            {String(shownStage + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-white/65">{STAGES[shownStage].name}</p>
            <p className="mt-1 font-body text-[10px] text-white/30">{STAGES[shownStage].line}</p>
          </div>
        </div>

        <div className="pointer-events-none absolute right-8 top-1/2 z-30 -translate-y-1/2 xl:right-12">
          <div className="flex flex-col items-center gap-3">
            {STAGES.map((stage, index) => (
              <span
                key={stage.name}
                className="block rounded-full transition-all duration-300"
                style={{
                  width: index === shownStage ? 7 : 4,
                  height: index === shownStage ? 7 : 4,
                  backgroundColor: index === shownStage ? RED : "rgba(255,255,255,.22)",
                  boxShadow: index === shownStage ? "0 0 18px rgba(229,25,42,.38)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-[9vh] z-40 flex flex-col items-center text-center"
          style={{ opacity: reduced ? 1 : finalCopyOpacity, y: reduced ? 0 : finalCopyY }}
        >
          <p className="font-clash text-[clamp(2.6rem,5.5vw,6.4rem)] font-semibold uppercase leading-[0.82] tracking-[-0.055em] text-white">
            Everything connects.
          </p>
          <p className="mt-4 font-body text-[10px] uppercase tracking-[0.22em] text-white/38">
            One idea. One system. One unmistakable brand.
          </p>
          <a
            href="#closing-cta"
            className="pointer-events-auto mt-7 inline-flex items-center gap-3 rounded-full px-8 py-4 font-clash text-[11px] font-bold uppercase tracking-[0.15em] outline-none transition-transform duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white/70"
            style={{ backgroundColor: PAPER, color: INK }}
          >
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </a>
          <p className="mt-3 font-body text-[11px] text-white/38">{ctaSub}</p>
        </motion.div>

        {finalReveal && <span className="sr-only">The complete LIONOVART mark is revealed.</span>}
      </div>
    </section>
  );
}
