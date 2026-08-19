"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

type ProcessStep = {
  num: string;
  title: string;
  description: string;
  tag: string;
  timeline?: string;
  deliver?: string;
  gain?: string;
};

const STEPS_STATIC = [
  {
    title: "Identity",
    description:
      "A deep read of who you are — market, voice, ambition. We ask the questions most agencies skip.",
    tag: "Foundation",
    timeline: "Week 1–2",
    deliver: "A complete identity system built to be recognised at a glance.",
    gain: "A brand people recognise before they read the name.",
  },
  {
    title: "Presence",
    description:
      "We take the channels that look inherited and make them unmistakably yours.",
    tag: "Design",
    timeline: "Week 3–4",
    deliver: "A connected digital presence with a clear visual language.",
    gain: "Social that reads as authority, not activity.",
  },
  {
    title: "Systems",
    description:
      "We map where growth leaks and close the gaps with systems that run without you.",
    tag: "Execution",
    timeline: "Week 5–6",
    deliver:
      "Automated journeys, CRM wiring and reporting you can actually read.",
    gain: "Growth that runs whether or not you're watching.",
  },
  {
    title: "Confidence",
    description:
      "The full handover. Nothing gatekept, nothing locked behind us.",
    tag: "Growth",
    timeline: "Handover",
    deliver: "A documented system your team can own from day one.",
    gain: "You share your brand anywhere, without hesitating.",
  },
];

const RED = "#e5192a";
const GOLD = "#f0c917";
const INK = "#0a0a0a";
const EASE = [0.16, 1, 0.3, 1] as const;
const JOURNEY_START = 0.08;
const JOURNEY_END = 0.9;

type StepRailItemProps = {
  step: ProcessStep;
  index: number;
  count: number;
  activeIndex: number;
  completedCount: number;
  progress: MotionValue<number>;
  reduced: boolean;
};

function StepRailItem({
  step,
  index,
  count,
  activeIndex,
  completedCount,
  progress,
  reduced,
}: StepRailItemProps) {
  const segment = (JOURNEY_END - JOURNEY_START) / count;
  const start = JOURNEY_START + segment * index;
  const end = start + segment;
  const fill = useTransform(progress, [start, end], ["0%", "100%"]);
  const complete = completedCount > index;
  const active = activeIndex === index && !complete;

  return (
    <li
      className="group relative grid grid-cols-[38px_1fr_auto] items-center gap-x-4 border-t py-4 last:border-b"
      style={{ borderColor: "rgba(255,255,255,0.14)" }}
    >
      <motion.span
        className="relative z-10 grid h-[34px] w-[34px] place-items-center rounded-full border font-clash text-[11px] font-black tabular-nums"
        animate={{
          backgroundColor: complete
            ? GOLD
            : active
              ? RED
              : "rgba(255,255,255,0)",
          borderColor: complete
            ? GOLD
            : active
              ? RED
              : "rgba(255,255,255,0.22)",
          color: complete ? INK : "#ffffff",
          scale: active ? 1.06 : 1,
        }}
        transition={reduced ? { duration: 0 } : { duration: 0.35, ease: EASE }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {complete ? (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -35 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
            >
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
            </motion.span>
          ) : (
            <motion.span
              key="number"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {String(index + 1).padStart(2, "0")}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>

      <div className="min-w-0">
        <div className="flex items-baseline gap-3">
          <h3
            className="font-clash text-[15px] font-bold uppercase tracking-[0.02em] transition-colors duration-300 xl:text-[17px]"
            style={{
              color: active || complete ? "#ffffff" : "rgba(255,255,255,0.42)",
            }}
          >
            {step.title}
          </h3>
          <span
            className="hidden text-[9px] font-bold uppercase tracking-[0.2em] xl:inline"
            style={{
              color: active ? RED : complete ? GOLD : "rgba(255,255,255,0.28)",
            }}
          >
            {step.tag}
          </span>
        </div>
        <div className="relative mt-2 h-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-y-0 left-0 block"
            style={{
              width: reduced && complete ? "100%" : fill,
              backgroundColor: complete ? GOLD : RED,
            }}
          />
        </div>
      </div>

      <span
        className="max-w-[10ch] text-right font-body text-[10px] font-medium uppercase leading-tight tracking-[0.12em] transition-colors duration-300"
        style={{
          color:
            active || complete
              ? "rgba(255,255,255,0.66)"
              : "rgba(255,255,255,0.25)",
        }}
      >
        {step.timeline}
      </span>
    </li>
  );
}

function RewardCard({
  step,
  index,
  gainLabel,
  deliverLabel,
}: {
  step: ProcessStep;
  index: number;
  gainLabel: string;
  deliverLabel: string;
}) {
  return (
    <motion.article
      className="relative z-10 min-h-[390px] overflow-hidden rounded-[27px] bg-[#0d0f12] p-7 sm:p-9 xl:min-h-[430px] xl:p-11"
      style={{
        boxShadow:
          "0 34px 90px rgba(0,0,0,0.68), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 70px rgba(229,25,42,0.08)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 100% 100%, rgba(229,25,42,0.2), transparent 42%), radial-gradient(circle at 0% 0%, rgba(240,201,23,0.08), transparent 35%)",
        }}
      />

      <div className="relative flex h-full min-h-[334px] flex-col xl:min-h-[342px]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.26em]"
              style={{ color: GOLD }}
            >
              {step.tag}
            </p>
            <p className="mt-3 font-clash text-[clamp(3.8rem,7vw,6.2rem)] font-bold leading-none tracking-[-0.07em] text-white">
              {String(index + 1).padStart(2, "0")}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: RED }}
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
              {step.timeline}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <h3 className="font-clash text-[clamp(1.9rem,3.4vw,3.25rem)] font-bold uppercase leading-[0.9] tracking-[-0.035em] text-white">
            {step.title}
          </h3>
          <p className="mt-5 max-w-[46ch] font-body text-[14px] leading-[1.65] text-white/60 xl:text-[15px]">
            {step.description}
          </p>

          {step.deliver && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">
                {deliverLabel}
              </p>
              <p className="mt-2 font-body text-[13px] leading-relaxed text-white/72">
                {step.deliver}
              </p>
            </div>
          )}

          {step.gain && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f0c917]/20 bg-[#f0c917]/[0.06] px-4 py-3.5">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: GOLD }}
                strokeWidth={3}
                aria-hidden
              />
              <p className="font-body text-[12px] leading-relaxed text-white/80">
                <span
                  className="mr-2 font-bold uppercase tracking-[0.12em]"
                  style={{ color: GOLD }}
                >
                  {gainLabel}
                </span>
                {step.gain}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function ActiveRewardCard({
  steps,
  activeIndex,
  gainLabel,
  deliverLabel,
  reduced,
}: {
  steps: ProcessStep[];
  activeIndex: number;
  gainLabel: string;
  deliverLabel: string;
  reduced: boolean;
}) {
  const step = steps[activeIndex];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step.num}
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -18 }}
        transition={{ duration: reduced ? 0 : 0.38, ease: EASE }}
        className="h-full w-full"
      >
        <RewardCard
          step={step}
          index={activeIndex}
          gainLabel={gainLabel}
          deliverLabel={deliverLabel}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function CompletionCard({
  ctaLabel,
  ctaSub,
  reduced,
}: {
  ctaLabel: string;
  ctaSub: string;
  reduced: boolean;
}) {
  return (
    <motion.article
      key="complete"
      initial={reduced ? false : { opacity: 0, scale: 0.94, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.55, ease: EASE }}
      className="relative z-10 flex min-h-[390px] flex-col items-center justify-center overflow-hidden rounded-[27px] bg-[#0d0f12] px-8 py-10 text-center xl:min-h-[430px]"
      style={{
        boxShadow:
          "0 34px 100px rgba(0,0,0,0.7), 0 0 90px rgba(240,201,23,0.1)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(240,201,23,0.15), transparent 45%)",
        }}
      />
      <motion.span
        className="relative grid h-16 w-16 place-items-center rounded-full"
        style={{ backgroundColor: GOLD, color: INK }}
        initial={reduced ? false : { scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 360,
          damping: 20,
          delay: reduced ? 0 : 0.16,
        }}
      >
        <Check className="h-7 w-7" strokeWidth={3} aria-hidden />
      </motion.span>
      <p
        className="relative mt-7 text-[10px] font-bold uppercase tracking-[0.28em]"
        style={{ color: GOLD }}
      >
        Not artificial.
      </p>
      <h3 className="relative mt-3 font-clash text-[clamp(2.2rem,4vw,3.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-white">
        Artistic <span style={{ color: GOLD }}>Intelligence</span>
      </h3>
      <a
        href="#closing-cta"
        className="relative mt-8 inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-clash text-[11px] font-bold uppercase tracking-[0.15em] outline-none transition-transform duration-300 hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        style={{ backgroundColor: GOLD, color: INK }}
      >
        {ctaLabel}
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </a>
      <p className="relative mt-4 font-body text-[12px] text-white/50">
        {ctaSub}
      </p>
    </motion.article>
  );
}

export default function Process(props: any) {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const eyebrow = props.eyebrow || t.process.eyebrow;
  const heading = props.heading || t.process.heading;
  const headingAccent = props.headingAccent || t.process.headingAccent;
  const {
    scrollHint,
    cta: ctaLabel,
    ctaSub,
    deliverLabel,
    gainLabel,
  } = t.process;

  const steps: ProcessStep[] =
    props.steps && props.steps.length > 0
      ? props.steps.map((step: ProcessStep, index: number) => ({
          ...step,
          num: String(index + 1),
        }))
      : (t.process.steps?.length ? t.process.steps : STEPS_STATIC).map(
          (step: Omit<ProcessStep, "num">, index: number) => ({
            ...step,
            num: String(index + 1),
          }),
        );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (prefersReducedMotion) {
      setActiveIndex(Math.max(0, steps.length - 1));
      setCompletedCount(steps.length);
      return;
    }

    const journey = Math.min(
      1,
      Math.max(0, (latest - JOURNEY_START) / (JOURNEY_END - JOURNEY_START)),
    );
    const nextCompleted = Math.min(
      steps.length,
      Math.floor(journey * steps.length),
    );
    const nextActive = Math.min(steps.length - 1, nextCompleted);

    setCompletedCount((current) =>
      current === nextCompleted ? current : nextCompleted,
    );
    setActiveIndex((current) =>
      current === nextActive ? current : nextActive,
    );
  });

  const allComplete = completedCount === steps.length;
  return (
    <section
      ref={sectionRef}
      id="process"
      data-art-directed="dark"
      className="relative isolate bg-black lg:h-[350vh]"
      aria-label={eyebrow}
    >
      {/* Desktop: a pinned viewport turns physical scroll into visible progress. */}
      <div className="sticky top-0 hidden h-[100svh] overflow-visible bg-[#f7f4ef] lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-[15svh] bottom-0 z-0 bg-[#f7f4ef] bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/images/process-impasto-transition.webp')",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[19%] bg-gradient-to-b from-[#f7f4ef] via-[#f7f4ef]/80 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[23%] bg-gradient-to-t from-black via-black/80 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "linear-gradient(to right, transparent, black 48%, black)",
          }}
        />

        <motion.div
          className="relative z-10 mx-auto grid h-full w-full max-w-[1480px] grid-cols-[minmax(0,0.94fr)_minmax(400px,1.06fr)] items-center gap-12 px-8 py-16 xl:gap-20 xl:px-14"
        >
          <div className="min-w-0">
            <div className="mb-7 flex items-center gap-4">
              <span className="h-[2px] w-8" style={{ backgroundColor: RED }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/54 xl:text-[11px]">
                {eyebrow}
              </p>
            </div>

            <SplitTextReveal
              as="h2"
              className="max-w-[12ch] text-[clamp(2.45rem,4.15vw,4.65rem)] font-bold uppercase leading-[0.88] tracking-[-0.045em] text-white"
              step={24}
              delay={80}
              from="first"
            >
              {heading} <span style={{ color: RED }}>{headingAccent}</span>
            </SplitTextReveal>

            <ol className="mt-9 xl:mt-11">
              {steps.map((step, index) => (
                <StepRailItem
                  key={step.num}
                  step={step}
                  index={index}
                  count={steps.length}
                  activeIndex={activeIndex}
                  completedCount={completedCount}
                  progress={scrollYProgress}
                  reduced={prefersReducedMotion}
                />
              ))}
            </ol>

            <div className="mt-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-white/35">
                <ArrowDown className="h-4 w-4" aria-hidden />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                  {scrollHint}
                </span>
              </div>
              <span className="font-clash text-[10px] font-bold tabular-nums text-white/35">
                {String(Math.min(completedCount + 1, steps.length)).padStart(
                  2,
                  "0",
                )}{" "}
                / {String(steps.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="relative mx-auto h-[430px] w-full max-w-[650px] xl:h-[470px]">
            <div
              className="relative h-full rounded-[29px] p-px"
              style={{
                background:
                  "linear-gradient(135deg, rgba(240,201,23,.7), rgba(229,25,42,.65) 52%, rgba(255,255,255,.12))",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {allComplete ? (
                  <CompletionCard
                    ctaLabel={ctaLabel}
                    ctaSub={ctaSub}
                    reduced={prefersReducedMotion}
                  />
                ) : (
                  <ActiveRewardCard
                    steps={steps}
                    activeIndex={activeIndex}
                    gainLabel={gainLabel}
                    deliverLabel={deliverLabel}
                    reduced={prefersReducedMotion}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile/tablet: the portrait transition overlaps the preceding light
          chapter, then resolves completely into black before Process copy begins. */}
      <div className="relative overflow-visible bg-black px-5 pb-24 pt-[55svh] lg:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-[15svh] z-0 h-[91svh] bg-[#f7f4ef] bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/images/monochrome_diagonal_impasto_swirl.webp')",
            backgroundSize: "100% 100%",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[30svh] bg-gradient-to-b from-[#f7f4ef] via-[#f7f4ef]/95 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[44svh] z-[1] h-[32svh] bg-gradient-to-b from-transparent via-black/45 to-black"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[34svh] z-[2] h-[42svh] opacity-[0.04]"
          style={{
            background:
              "radial-gradient(circle at 90% 72%, rgba(229,25,42,.7), transparent 32%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-xl">
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-7" style={{ backgroundColor: RED }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-5 text-[clamp(2.45rem,12vw,4.2rem)] font-bold uppercase leading-[0.88] tracking-[-0.045em] text-white">
            {heading} <span style={{ color: RED }}>{headingAccent}</span>
          </h2>

          <ol className="relative mt-14 space-y-8 before:absolute before:bottom-6 before:left-[19px] before:top-5 before:w-px before:bg-white/15">
            {steps.map((step, index) => (
              <li key={step.num} className="relative pl-14">
                <span
                  className="absolute left-0 top-1 z-10 grid h-10 w-10 place-items-center rounded-full border bg-black font-clash text-[11px] font-black text-white"
                  style={{
                    borderColor: index === 0 ? RED : "rgba(255,255,255,.24)",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="rounded-3xl border border-white/10 bg-[#0d0f12] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p
                      className="text-[9px] font-bold uppercase tracking-[0.22em]"
                      style={{ color: index === 0 ? RED : GOLD }}
                    >
                      {step.tag}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                      {step.timeline}
                    </p>
                  </div>
                  <h3 className="mt-3 font-clash text-[1.65rem] font-bold uppercase leading-none text-white">
                    {step.title}
                  </h3>
                  <p className="mt-4 font-body text-[13px] leading-relaxed text-white/58">
                    {step.description}
                  </p>
                  {step.gain && (
                    <div className="mt-5 flex items-start gap-3 border-t border-white/10 pt-4">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: GOLD }}
                        strokeWidth={3}
                        aria-hidden
                      />
                      <p className="font-body text-[12px] leading-relaxed text-white/76">
                        {step.gain}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 text-center">
            <a
              href="#closing-cta"
              className="inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-clash text-[11px] font-bold uppercase tracking-[0.15em]"
              style={{ backgroundColor: GOLD, color: INK }}
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </a>
            <p className="mt-4 font-body text-[12px] text-white/45">{ctaSub}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
