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
  { name: "CLARIFY", line: "Find what matters.", micro: "Audience · Context · Opportunity" },
  { name: "ELEVATE", line: "Give the vision direction.", micro: "Positioning · Narrative · Architecture" },
  { name: "CREATE", line: "Turn strategy into reality.", micro: "Identity · Digital · Motion" },
  { name: "AMPLIFY", line: "Launch. Learn. Optimize. Rise.", micro: "Measure · Refine · Compound" },
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
      <div className="pointer-events-none absolute -right-[28vw] top-24 w-[112vw] max-w-[680px] opacity-[0.07]">
        <svg viewBox="0 0 512 512" className="h-auto w-full" aria-hidden="true">
          <path d={L_PATH} fill="none" stroke={GOLD} strokeWidth="3" />
          <path d={N_PATH} fill="none" stroke={GOLD} strokeWidth="3" />
          <path d={CROWN_PATH} fill="none" stroke={GOLD} strokeWidth="3" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-xl">
        <div className="flex items-center gap-3">
          <span className="h-[2px] w-7" style={{ backgroundColor: RED }} />
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">{eyebrow}</p>
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
                initial={reduced ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] top-[7px] h-[11px] w-[11px] rounded-full border-2"
                  style={{ borderColor: GOLD, backgroundColor: SLAB }}
                />
                <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-clash text-[2rem] font-semibold uppercase leading-none tracking-[-0.035em] text-white">{stage.name}</h3>
                <p className="mt-3 max-w-[34ch] font-body text-[14px] leading-[1.65] text-white/55">{stepCopy[index] || stage.line}</p>
                <p className="mt-4 font-body text-[9px] uppercase tracking-[0.16em] text-[#c7a86a]/55">{stage.micro}</p>
              </motion.article>
            ))}
          </div>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: reduced ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
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
          <p className="font-clash text-[clamp(2rem,9vw,3rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white">Everything connects.</p>
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

  const cameraScale = useTransform(scrollYProgress, [0, 0.22, 0.48, 0.74, 0.9, 1], [1.38, 1.52, 1.42, 1.5, 1.08, 1]);
  const cameraX = useTransform(scrollYProgress, [0, 0.22, 0.48, 0.74, 0.9, 1], ["10vw", "5vw", "-4vw", "3vw", "0vw", "0vw"]);
  const cameraY = useTransform(scrollYProgress, [0, 0.22, 0.48, 0.74, 0.9, 1], ["8vh", "-2vh", "3vh", "-3vh", "0vh", "0vh"]);
  const cameraRotate = useTransform(scrollYProgress, [0, 0.28, 0.55, 0.8, 1], [-1.1, 0.6, -0.8, 0.5, 0]);

  const introOpacity = useTransform(scrollYProgress, [0, 0.12, 0.24], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.24], [0, -24]);

  const foundationLength = useTransform(scrollYProgress, [0.01, 0.18], [0, 1]);
  const elevateLength = useTransform(scrollYProgress, [0.13, 0.4], [0, 1]);
  const createLength = useTransform(scrollYProgress, [0.34, 0.7], [0, 1]);
  const crownLength = useTransform(scrollYProgress, [0.64, 0.84], [0, 1]);
  const finalLogoOpacity = useTransform(scrollYProgress, [0.84, 0.93], [0, 1]);
  const outlineOpacity = useTransform(scrollYProgress, [0, 0.8, 0.92], [0.18, 0.18, 0]);

  const clarityOpacity = useTransform(scrollYProgress, [0, 0.02, 0.2, 0.32], [0.15, 1, 1, 0]);
  const elevateOpacity = useTransform(scrollYProgress, [0.18, 0.29, 0.43, 0.56], [0, 1, 1, 0]);
  const createOpacity = useTransform(scrollYProgress, [0.42, 0.53, 0.68, 0.79], [0, 1, 1, 0]);
  const amplifyOpacity = useTransform(scrollYProgress, [0.68, 0.78, 0.91, 0.97], [0, 1, 1, 0]);
  const finalCopyOpacity = useTransform(scrollYProgress, [0.86, 0.94], [0, 1]);
  const finalCopyY = useTransform(scrollYProgress, [0.86, 0.94], [18, 0]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const nextStage = value < 0.25 ? 0 : value < 0.5 ? 1 : value < 0.75 ? 2 : 3;
    setActiveStage((current) => (current === nextStage ? current : nextStage));
  });

  const shownStage = reduced ? 3 : activeStage;

  return (
    <section
      ref={sectionRef}
      id="process"
      data-art-directed="dark"
      data-process-direction="logo"
      className={`relative isolate bg-[#0b0b0b] text-white ${reduced ? "lg:min-h-[100svh]" : "lg:h-[300vh]"}`}
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
              "radial-gradient(circle at 48% 48%, rgba(199,168,106,.09), transparent 35%), radial-gradient(circle at 85% 12%, rgba(229,25,42,.065), transparent 30%), linear-gradient(180deg,#0b0b0b 0%,#090909 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)",
            backgroundSize: "88px 88px",
            maskImage: "radial-gradient(circle at center, black, transparent 78%)",
            WebkitMaskImage: "radial-gradient(circle at center, black, transparent 78%)",
          }}
        />

        <motion.div
          className="pointer-events-none absolute left-[7vw] top-[12vh] z-30 max-w-[610px]"
          style={{ opacity: reduced ? 1 : introOpacity, y: reduced ? 0 : introY }}
        >
          <div className="flex items-center gap-4">
            <span className="h-[2px] w-8" style={{ backgroundColor: RED }} />
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-white/45 xl:text-[11px]">{eyebrow}</p>
          </div>
          <h2 className="mt-6 font-clash text-[clamp(3.3rem,6vw,7rem)] font-bold uppercase leading-[0.82] tracking-[-0.055em]">
            <span className="text-white">{heading} </span>
            <span style={{ color: RED }}>{headingAccent}</span>
          </h2>
          <p className="mt-7 max-w-[37ch] font-body text-[14px] leading-[1.65] text-white/48">Follow the idea as it becomes direction, execution and a system built to compound.</p>
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative aspect-square w-[min(56vw,720px)]">
            <motion.div
              className="absolute inset-0 will-change-transform"
              style={reduced ? { scale: 1, x: 0, y: 0, rotateZ: 0 } : { scale: cameraScale, x: cameraX, y: cameraY, rotateZ: cameraRotate }}
            >
              <svg viewBox="0 0 512 512" className="h-full w-full overflow-visible" aria-hidden="true">
                <defs>
                  <filter id="processGoldGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.6" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                <motion.g style={{ opacity: reduced ? 0.12 : outlineOpacity }}>
                  <path d={L_PATH} fill="none" stroke={GOLD} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <path d={N_PATH} fill="none" stroke={GOLD} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <path d={CROWN_PATH} fill="none" stroke={GOLD} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </motion.g>

                <motion.path d="M84 432H321" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="square" vectorEffect="non-scaling-stroke" filter="url(#processGoldGlow)" style={{ pathLength: reduced ? 1 : foundationLength }} />
                <motion.path d="M84 432V92H192V357H270L321 432" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" filter="url(#processGoldGlow)" style={{ pathLength: reduced ? 1 : elevateLength }} />
                <motion.path d={N_PATH} fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" filter="url(#processGoldGlow)" style={{ pathLength: reduced ? 1 : createLength }} />
                <motion.path d={CROWN_PATH} fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" filter="url(#processGoldGlow)" style={{ pathLength: reduced ? 1 : crownLength }} />

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

        <motion.div className="pointer-events-none absolute bottom-[15vh] left-[7vw] z-20 max-w-[390px]" style={{ opacity: reduced ? 0 : clarityOpacity }}>
          <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-[#c7a86a]/75">01 · CLARIFY</p>
          <p className="mt-3 font-clash text-[clamp(2rem,3.6vw,4rem)] font-medium uppercase leading-[0.88] tracking-[-0.045em] text-white">Strip away the noise.</p>
          <p className="mt-5 font-body text-[9px] uppercase tracking-[0.18em] text-white/34">Audience · Context · Opportunity</p>
        </motion.div>

        <motion.div className="pointer-events-none absolute right-[7vw] top-[19vh] z-20 w-[min(30vw,410px)]" style={{ opacity: reduced ? 0 : elevateOpacity }}>
          <div className="flex items-center justify-between border-t border-[#c7a86a]/30 pt-4">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-[#c7a86a]/75">02 · ELEVATE</p>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RED }} />
          </div>
          <p className="mt-5 font-clash text-[clamp(2.1rem,3.5vw,3.9rem)] font-medium uppercase leading-[0.88] tracking-[-0.045em] text-white">Make the ambition visible.</p>
          <p className="mt-5 font-body text-[9px] uppercase tracking-[0.18em] text-white/34">Positioning · Narrative · Architecture</p>
        </motion.div>

        <motion.div className="pointer-events-none absolute left-[7vw] top-[18vh] z-20 w-[min(34vw,470px)]" style={{ opacity: reduced ? 0 : createOpacity }}>
          <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-[#c7a86a]/75">03 · CREATE</p>
          <p className="mt-4 font-clash text-[clamp(2.1rem,3.6vw,4rem)] font-medium uppercase leading-[0.88] tracking-[-0.045em] text-white">Turn direction into a world.</p>
          <div className="mt-6 grid grid-cols-3 gap-2 font-body text-[8px] uppercase tracking-[0.15em] text-white/42">
            <span className="border border-white/10 px-3 py-3">Identity</span>
            <span className="border border-white/10 px-3 py-3">Digital</span>
            <span className="border border-white/10 px-3 py-3">Motion</span>
          </div>
        </motion.div>

        <motion.div className="pointer-events-none absolute bottom-[15vh] right-[7vw] z-20 max-w-[430px] text-right" style={{ opacity: reduced ? 0 : amplifyOpacity }}>
          <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-[#c7a86a]/75">04 · AMPLIFY</p>
          <p className="mt-4 font-clash text-[clamp(2rem,3.5vw,3.9rem)] font-medium uppercase leading-[0.88] tracking-[-0.045em] text-white">Launch. Learn. Compound.</p>
          <p className="mt-5 font-body text-[9px] uppercase tracking-[0.18em] text-white/34">Measure · Refine · Optimize · Rise ↗</p>
        </motion.div>

        <div className="pointer-events-none absolute bottom-8 left-8 z-30 flex items-baseline gap-4 xl:left-12">
          <span className="font-clash text-[1.7rem] font-semibold tabular-nums" style={{ color: RED }}>{String(shownStage + 1).padStart(2, "0")}</span>
          <div>
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-white/65">{STAGES[shownStage].name}</p>
            <p className="mt-1 font-body text-[10px] text-white/30">{STAGES[shownStage].line}</p>
          </div>
        </div>

        <div className="pointer-events-none absolute right-8 top-1/2 z-30 -translate-y-1/2 xl:right-12">
          <div className="flex flex-col items-center gap-3">
            {STAGES.map((stage, index) => (
              <span key={stage.name} className="block rounded-full transition-all duration-300" style={{ width: index === shownStage ? 7 : 4, height: index === shownStage ? 7 : 4, backgroundColor: index === shownStage ? RED : "rgba(255,255,255,.22)", boxShadow: index === shownStage ? "0 0 18px rgba(229,25,42,.38)" : "none" }} />
            ))}
          </div>
        </div>

        <motion.div className="pointer-events-none absolute inset-x-0 bottom-[8vh] z-40 flex flex-col items-center text-center" style={{ opacity: reduced ? 1 : finalCopyOpacity, y: reduced ? 0 : finalCopyY }}>
          <p className="font-clash text-[clamp(2.6rem,5.3vw,6rem)] font-semibold uppercase leading-[0.82] tracking-[-0.055em] text-white">Everything connects.</p>
          <p className="mt-4 font-body text-[10px] uppercase tracking-[0.22em] text-white/38">One idea. One system. One unmistakable brand.</p>
          <a href="#closing-cta" className="pointer-events-auto mt-7 inline-flex items-center gap-3 rounded-full px-8 py-4 font-clash text-[11px] font-bold uppercase tracking-[0.15em] outline-none transition-transform duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white/70" style={{ backgroundColor: PAPER, color: INK }}>
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </a>
          <p className="mt-3 font-body text-[11px] text-white/38">{ctaSub}</p>
        </motion.div>
      </div>
    </section>
  );
}
