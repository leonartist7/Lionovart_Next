"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const GOLD = "#c7a86a";
const GOLD_BRIGHT = "#f0d59b";

const L_PATH = "M84 92H192V357H270L321 432H84Z";
const N_PATH = "M192 92L330 299V151H428V432H320L192 241Z";
const CROWN_PATH = "M328 79L360 98L378 79L397 98L428 79V138H328Z";

const STAGES = [
  {
    name: "CLARIFY",
    line: "Find what matters.",
    micro: "Audience · Context · Opportunity",
  },
  {
    name: "ELEVATE",
    line: "Give the vision direction.",
    micro: "Positioning · Narrative · Architecture",
  },
  {
    name: "CREATE",
    line: "Turn strategy into reality.",
    micro: "Identity · Digital · Motion",
  },
  {
    name: "RISE & OPTIMIZE",
    line: "Refine what works. Raise the standard.",
    micro: "Measure · Refine · Compound",
  },
] as const;

function GoldOutlineMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <path d={L_PATH} fill="none" stroke={GOLD} strokeWidth="2.2" />
      <path d={N_PATH} fill="none" stroke={GOLD} strokeWidth="2.2" />
      <path d={CROWN_PATH} fill="none" stroke={GOLD_BRIGHT} strokeWidth="2.6" />
    </svg>
  );
}

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
    <div className="relative overflow-hidden bg-[#090909] px-5 pb-24 pt-24 sm:px-7 lg:hidden">
      <div className="relative mx-auto max-w-xl">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-[#c7a86a]" />
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#c7a86a]/70">
            {eyebrow}
          </p>
        </div>

        <h2 className="mt-5 max-w-[12ch] font-clash text-[clamp(2.7rem,12vw,4.15rem)] font-bold uppercase leading-[0.84] tracking-[-0.05em] text-white">
          {heading} <span className="text-[#c7a86a]">{headingAccent}</span>
        </h2>

        <div className="relative mt-16 pl-8">
          <span
            aria-hidden="true"
            className="absolute bottom-1 left-[5px] top-1 w-px"
            style={{ background: `linear-gradient(to bottom, ${GOLD}, rgba(199,168,106,.07))` }}
          />

          <div className="space-y-16">
            {STAGES.map((stage, index) => (
              <motion.article
                key={stage.name}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.38 }}
                transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] top-[7px] h-[11px] w-[11px] rounded-full border-2 border-[#c7a86a] bg-[#090909]"
                />
                <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-[#c7a86a]/60">
                  {String(index + 1).padStart(2, "0")} / 04
                </p>
                <h3 className="mt-2 font-clash text-[clamp(1.8rem,8vw,2.35rem)] font-semibold uppercase leading-none tracking-[-0.035em] text-white">
                  {stage.name}
                </h3>
                <p className="mt-3 max-w-[35ch] font-body text-[14px] leading-[1.65] text-white/55">
                  {stepCopy[index] || stage.line}
                </p>
                <p className="mt-4 font-body text-[9px] uppercase tracking-[0.16em] text-[#c7a86a]/50">
                  {stage.micro}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: reduced ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-20 w-[min(58vw,250px)]"
        >
          <GoldOutlineMark className="h-auto w-full drop-shadow-[0_0_24px_rgba(199,168,106,.16)]" />
        </motion.div>

        <div className="mt-10 text-center">
          <p className="font-clash text-[clamp(1.9rem,9vw,2.8rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white">
            Everything connects.
          </p>
          <a
            href="#closing-cta"
            className="mt-8 inline-flex min-h-[44px] items-center gap-3 rounded-full bg-[#f7f4ef] px-7 py-4 font-clash text-[11px] font-bold uppercase tracking-[0.15em] text-[#111]"
          >
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </a>
          <p className="mt-4 font-body text-[12px] text-white/[0.38]">{ctaSub}</p>
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

  // The mark is intentionally stationary. Scroll only reveals new geometry.
  const foundationLength = useTransform(scrollYProgress, [0.02, 0.21], [0, 1]);
  const elevateLength = useTransform(scrollYProgress, [0.2, 0.46], [0, 1]);
  const createPrimaryLength = useTransform(scrollYProgress, [0.44, 0.64], [0, 1]);
  const createSecondaryLength = useTransform(scrollYProgress, [0.52, 0.72], [0, 1]);
  const amplifyLength = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const crownLength = useTransform(scrollYProgress, [0.87, 0.98], [0, 1]);
  const exactOutlineOpacity = useTransform(scrollYProgress, [0.79, 0.93, 1], [0, 0.06, 0.2]);
  const crownGlowOpacity = useTransform(scrollYProgress, [0.86, 0.94, 1], [0, 0.42, 0.8]);
  const startDotOpacity = useTransform(scrollYProgress, [0, 0.05, 0.2], [0.9, 1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const nextStage = value < 0.23 ? 0 : value < 0.49 ? 1 : value < 0.74 ? 2 : 3;
    setActiveStage((current) => (current === nextStage ? current : nextStage));
  });

  const shownStage = reduced ? 3 : activeStage;
  const active = STAGES[shownStage];
  const activeCopy = stepCopy[shownStage] || active.line;

  return (
    <section
      ref={sectionRef}
      id="process"
      data-art-directed="dark"
      data-process-direction="logo"
      className={`relative isolate bg-[#090909] text-white ${reduced ? "lg:min-h-[100svh]" : "lg:h-[280vh]"}`}
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

      <div
        className={
          reduced
            ? "relative hidden min-h-[100svh] overflow-hidden lg:block"
            : "sticky top-0 hidden h-[100svh] overflow-hidden lg:block"
        }
        style={{ contain: "paint" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 72% 49%, rgba(199,168,106,.075), transparent 31%), linear-gradient(180deg,#090909 0%,#070707 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px)",
            backgroundSize: "96px 96px",
            maskImage: "radial-gradient(circle at 72% 50%, black, transparent 65%)",
            WebkitMaskImage: "radial-gradient(circle at 72% 50%, black, transparent 65%)",
          }}
        />

        <div className="relative z-20 mx-auto grid h-full max-w-[1500px] grid-cols-[minmax(0,0.96fr)_minmax(430px,0.78fr)] gap-[clamp(3rem,7vw,8rem)] px-[clamp(3rem,7vw,7rem)]">
          <div className="relative flex h-full min-w-0 flex-col">
            <header className="pt-[clamp(4rem,9vh,7rem)]">
              <div className="flex items-center gap-4">
                <span className="h-px w-9 bg-[#c7a86a]" />
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-[#c7a86a]/70 xl:text-[11px]">
                  {eyebrow}
                </p>
              </div>

              <h2 className="mt-6 max-w-[720px] font-clash text-[clamp(3rem,4.7vw,5.8rem)] font-bold uppercase leading-[0.84] tracking-[-0.055em] text-white">
                {heading} <span className="text-[#c7a86a]">{headingAccent}</span>
              </h2>
              <p className="mt-6 max-w-[38ch] font-body text-[13px] leading-[1.7] text-white/[0.42] xl:text-[14px]">
                A clear path from first signal to a system built to keep getting stronger.
              </p>
            </header>

            <div className="mb-[clamp(3.5rem,9vh,7rem)] mt-auto max-w-[660px]">
              <div className="min-h-[220px]" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={shownStage}
                    initial={reduced ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: reduced ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center gap-3 font-body text-[9px] font-bold uppercase tracking-[0.24em] text-[#c7a86a]/70">
                      <span>{String(shownStage + 1).padStart(2, "0")}</span>
                      <span className="h-px w-7 bg-[#c7a86a]/40" />
                      <span>04</span>
                    </div>

                    <h3 className="mt-4 max-w-[12ch] font-clash text-[clamp(2.7rem,4vw,4.9rem)] font-semibold uppercase leading-[0.86] tracking-[-0.045em] text-white">
                      {active.name}
                    </h3>
                    <p className="mt-4 font-clash text-[clamp(1rem,1.45vw,1.35rem)] font-medium text-[#d9c69d]">
                      {active.line}
                    </p>
                    <p className="mt-4 max-w-[44ch] font-body text-[13px] leading-[1.7] text-white/[0.48] xl:text-[14px]">
                      {activeCopy}
                    </p>
                    <p className="mt-5 font-body text-[9px] uppercase tracking-[0.19em] text-[#c7a86a]/50">
                      {active.micro}
                    </p>

                    {shownStage === 3 ? (
                      <div className="mt-7 flex items-center gap-5">
                        <a
                          href="#closing-cta"
                          className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-[#f7f4ef] px-7 py-3.5 font-clash text-[10px] font-bold uppercase tracking-[0.14em] text-[#111] outline-none transition-transform duration-300 hover:scale-[1.025] focus-visible:ring-2 focus-visible:ring-[#c7a86a]/70"
                        >
                          {ctaLabel}
                          <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                        </a>
                        <span className="font-body text-[11px] text-white/[0.28]">{ctaSub}</span>
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-8 border-t border-white/[0.09] pt-4">
                <div className="grid grid-cols-4 gap-4">
                  {STAGES.map((stage, index) => {
                    const current = index === shownStage;
                    return (
                      <div key={stage.name} className={current ? "opacity-100" : "opacity-[0.28]"}>
                        <p className="font-body text-[8px] font-bold tracking-[0.18em] text-[#c7a86a]">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-1 min-h-[2rem] font-body text-[8px] font-bold uppercase leading-[1.35] tracking-[0.11em] text-white">
                          {stage.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 h-px overflow-hidden bg-white/[0.08]">
                  <motion.div
                    className="h-full origin-left bg-[#c7a86a]/70"
                    style={{ scaleX: reduced ? 1 : scrollYProgress }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex h-full items-center justify-center">
            <div className="relative w-[min(31vw,460px)] translate-y-[2vh]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c7a86a]/[0.045] blur-[70px]"
              />

              <svg
                viewBox="0 0 512 512"
                className="relative h-auto w-full overflow-visible"
                role="img"
                aria-label="LIONOVART process geometry drawn progressively"
              >
                <defs>
                  <filter id="processGoldGlow" x="-70%" y="-70%" width="240%" height="240%">
                    <feGaussianBlur stdDeviation="2.1" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="processCrownGlow" x="-120%" y="-120%" width="340%" height="340%">
                    <feGaussianBlur stdDeviation="8" />
                  </filter>
                </defs>

                <motion.g style={{ opacity: reduced ? 0.18 : exactOutlineOpacity }}>
                  <path d={L_PATH} fill="none" stroke={GOLD} strokeWidth="1.15" vectorEffect="non-scaling-stroke" />
                  <path d={N_PATH} fill="none" stroke={GOLD} strokeWidth="1.15" vectorEffect="non-scaling-stroke" />
                  <path d={CROWN_PATH} fill="none" stroke={GOLD} strokeWidth="1.15" vectorEffect="non-scaling-stroke" />
                </motion.g>

                <motion.circle
                  cx="321"
                  cy="432"
                  r="3.7"
                  fill={GOLD_BRIGHT}
                  style={{ opacity: reduced ? 0 : startDotOpacity }}
                  filter="url(#processGoldGlow)"
                />

                <motion.path
                  d="M321 432H84"
                  fill="none"
                  stroke={GOLD_BRIGHT}
                  strokeWidth="2.25"
                  strokeLinecap="square"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : foundationLength }}
                />

                <motion.path
                  d="M84 432V92H192"
                  fill="none"
                  stroke={GOLD_BRIGHT}
                  strokeWidth="2.25"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : elevateLength }}
                />

                <motion.path
                  d="M192 92L330 299"
                  fill="none"
                  stroke={GOLD_BRIGHT}
                  strokeWidth="2.25"
                  strokeLinecap="square"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : createPrimaryLength }}
                />
                <motion.path
                  d="M192 241L320 432"
                  fill="none"
                  stroke={GOLD_BRIGHT}
                  strokeWidth="2.25"
                  strokeLinecap="square"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : createSecondaryLength }}
                />

                <motion.path
                  d="M320 432H428V151H330V299"
                  fill="none"
                  stroke={GOLD_BRIGHT}
                  strokeWidth="2.25"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : amplifyLength }}
                />

                <motion.path
                  d={CROWN_PATH}
                  fill="none"
                  stroke={GOLD_BRIGHT}
                  strokeWidth="10"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processCrownGlow)"
                  style={{ opacity: reduced ? 0.55 : crownGlowOpacity }}
                />
                <motion.path
                  d={CROWN_PATH}
                  fill="none"
                  stroke={GOLD_BRIGHT}
                  strokeWidth="2.6"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#processGoldGlow)"
                  style={{ pathLength: reduced ? 1 : crownLength }}
                />
              </svg>

              <div className="mt-7 flex items-center justify-center gap-3 font-body text-[8px] uppercase tracking-[0.22em] text-white/[0.22]">
                <span>Clarity</span>
                <span className="h-px w-8 bg-[#c7a86a]/30" />
                <span>Direction</span>
                <span className="h-px w-8 bg-[#c7a86a]/30" />
                <span>Growth</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
