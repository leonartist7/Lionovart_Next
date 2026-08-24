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
import { ArrowUpRight } from "lucide-react";
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
    title: "Clarity",
    description:
      "We go through what you actually sell, who is buying, and what is stopping the rest. No assumptions carried in.",
    tag: "Discovery",
    timeline: "Week 1–2",
    deliver:
      "Positioning, audience map, brand audit, the honest version of where you stand.",
    gain: "You can say what you do in one sentence, and it lands.",
  },
  {
    title: "Vision",
    description:
      "We set the direction — how the brand looks, sounds and behaves once it stops apologising for itself.",
    tag: "Direction",
    timeline: "Week 3–4",
    deliver: "Identity system, typography, colour, voice, the full brand book.",
    gain: "A brand people recognise before they read the name.",
  },
  {
    title: "Execution",
    description:
      "We build it. Site, channels, funnels — the systems that keep running when nobody is watching them.",
    tag: "Build",
    timeline: "Week 5–8",
    deliver: "Website, content architecture, automation, CRM wiring, reporting.",
    gain: "The work goes live and starts earning, not just looking good.",
  },
  {
    title: "Optimisation",
    description:
      "We read the numbers, cut what does not work, and push harder on what does. Every month it gets sharper.",
    tag: "Compound",
    timeline: "Ongoing",
    deliver:
      "Monthly reporting, iteration cycles, the full asset library, team training.",
    gain: "Growth that compounds instead of resetting.",
  },
];

/* The stage is the painting itself — dark, immersive, no flat paper patches.
   Text sits in white directly over it. PAPER/INK survive only as the one
   light CTA pill that needs to pop against the dark surface. Red is spent
   twice only: the heading accent word and the active step's fill bar. No
   gold anywhere in this section. */
const PAPER = "#f7f4ef";
const INK = "#111111";
const INK_SOFT = "#5a5550";
const INK_RULE = "rgba(17,17,17,0.16)";
const TEXT = "#ffffff";
const TEXT_DIM = "rgba(255,255,255,0.38)";
const TEXT_LABEL = "rgba(255,255,255,0.45)";
const HAIRLINE = "rgba(255,255,255,0.14)";
const SLAB = "#0b0b0b";
const RED = "#e5192a";

const EASE = [0.16, 1, 0.3, 1] as const;
const JOURNEY_START = 0.04;
const JOURNEY_END = 0.92;

type LedgerRowProps = {
  step: ProcessStep;
  index: number;
  count: number;
  activeIndex: number;
  completedCount: number;
  progress: MotionValue<number>;
  reduced: boolean;
};

/** One line of the ledger. State is carried by weight and the fill bar — no
 *  badges, no icons. */
function LedgerRow({
  step,
  index,
  count,
  activeIndex,
  completedCount,
  progress,
  reduced,
}: LedgerRowProps) {
  const segment = (JOURNEY_END - JOURNEY_START) / count;
  const start = JOURNEY_START + segment * index;
  const fill = useTransform(progress, [start, start + segment], ["0%", "100%"]);
  const complete = completedCount > index;
  const active = activeIndex === index && !complete;
  const reached = active || complete;

  return (
    <li
      /* Each row's fill bar doubles as the rule below it, so only the first
         row needs a top border — otherwise every seam stacks two lines. */
      className="relative grid grid-cols-[3.25rem_1fr_auto] items-baseline gap-x-4 pb-4 pt-5 first:border-t"
      style={{ borderColor: HAIRLINE }}
    >
      <span
        className="font-clash text-[1.75rem] font-bold leading-none tabular-nums transition-colors duration-300 xl:text-[2rem]"
        style={{ color: reached ? TEXT : TEXT_DIM }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <h3
        className="font-clash text-[1.35rem] font-bold uppercase leading-none tracking-[-0.02em] transition-colors duration-300 xl:text-[1.6rem]"
        style={{
          color: reached ? TEXT : TEXT_DIM,
          opacity: complete ? 0.55 : 1,
        }}
      >
        {step.title}
      </h3>

      <div className="flex items-baseline gap-6">
        <span
          className="hidden font-body text-[10px] font-bold uppercase tracking-[0.22em] xl:inline"
          style={{ color: TEXT_LABEL }}
        >
          {step.tag}
        </span>
        <span
          className="min-w-[7.5ch] text-right font-body text-[10px] font-bold uppercase tracking-[0.14em] tabular-nums"
          style={{ color: TEXT_LABEL }}
        >
          {step.timeline}
        </span>
      </div>

      {/* The row's own rule doubles as its progress bar. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 block h-[2px]"
        style={{ backgroundColor: HAIRLINE }}
      >
        <motion.span
          className="absolute inset-y-0 left-0 block"
          style={{
            width: reduced ? (reached ? "100%" : "0%") : fill,
            backgroundColor: complete ? TEXT : RED,
          }}
        />
      </span>
    </li>
  );
}

/** The one dark object in the composition. */
function Slab({
  step,
  index,
  count,
  gainLabel,
  deliverLabel,
}: {
  step: ProcessStep;
  index: number;
  count: number;
  gainLabel: string;
  deliverLabel: string;
}) {
  return (
    <article
      className="flex h-full flex-col rounded-[6px] p-8 xl:p-10"
      style={{
        backgroundColor: SLAB,
        boxShadow: "0 40px 80px -32px rgba(17,17,17,0.35)",
      }}
    >
      <div className="flex items-baseline justify-between border-b border-white/12 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] tabular-nums text-white/45">
        <span>
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>
        <span>{step.timeline}</span>
      </div>

      <h3 className="mt-7 font-clash text-[clamp(2.4rem,3.6vw,3.6rem)] font-bold uppercase leading-[0.86] tracking-[-0.04em] text-white">
        {step.title}
      </h3>
      <p className="mt-5 max-w-[42ch] font-body text-[15px] leading-[1.6] text-white/62">
        {step.description}
      </p>

      <div className="mt-auto grid grid-cols-2 gap-6 border-t border-white/12 pt-6">
        <div>
          <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">
            {deliverLabel}
          </p>
          <p className="mt-2.5 font-body text-[13px] leading-relaxed text-white/78">
            {step.deliver}
          </p>
        </div>
        <div className="border-l border-white/12 pl-6">
          <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">
            {gainLabel}
          </p>
          <p className="mt-2.5 font-body text-[13px] leading-relaxed text-white/78">
            {step.gain}
          </p>
        </div>
      </div>
    </article>
  );
}

/** One mobile step. Three elements only: the number, the name, and the one
 *  line that says what the client walks away with. The `tone` prop is what
 *  makes the descent read — steps sitting on the paper half are set in ink,
 *  steps below the paint stroke are set in white, because the surface under
 *  them physically changed. */
function DescentStep({
  step,
  index,
  tone,
  reduced,
}: {
  step: ProcessStep;
  index: number;
  tone: "paper" | "slab";
  reduced: boolean;
}) {
  const onSlab = tone === "slab";
  const heading = onSlab ? TEXT : INK;
  const body = onSlab ? "rgba(255,255,255,0.7)" : INK_SOFT;
  const rule = onSlab ? HAIRLINE : INK_RULE;

  return (
    <motion.li
      className="border-t pt-5"
      style={{ borderColor: rule }}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: reduced ? 0 : 0.55, ease: EASE }}
    >
      <div className="flex items-baseline gap-4">
        <span
          className="font-clash text-[1.6rem] font-bold leading-none tabular-nums"
          style={{ color: heading }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3
          className="font-clash text-[1.5rem] font-bold uppercase leading-none tracking-[-0.02em]"
          style={{ color: heading }}
        >
          {step.title}
        </h3>
      </div>
      <p
        className="mt-3 max-w-[34ch] font-body text-[14px] leading-[1.55]"
        style={{ color: body }}
      >
        {step.gain ?? step.description}
      </p>
    </motion.li>
  );
}

export default function Process(props: any) {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const eyebrow = props.eyebrow || t.process.eyebrow;
  const heading = props.heading || t.process.heading;
  const headingAccent = props.headingAccent || t.process.headingAccent;
  const { cta: ctaLabel, ctaSub, deliverLabel, gainLabel } = t.process;

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
    setActiveIndex((current) => (current === nextActive ? current : nextActive));
  });

  // Reduced motion never receives a scroll tick, so resolve the finished
  // state at render rather than waiting for the handler to set it.
  const shownActive = prefersReducedMotion ? steps.length - 1 : activeIndex;
  const shownCompleted = prefersReducedMotion ? steps.length : completedCount;
  const curtainEngaged = shownCompleted >= steps.length;

  const activeStep = steps[shownActive];

  return (
    <section
      ref={sectionRef}
      id="process"
      data-art-directed="dark"
      className="relative isolate lg:h-[230vh]"
      style={{ backgroundColor: SLAB }}
      aria-label={eyebrow}
    >
      {/* ── Desktop: a pinned stage turns physical scroll into visible progress ── */}
      <div
        className="sticky top-0 hidden h-[100svh] overflow-visible lg:block"
        style={{ backgroundColor: SLAB }}
      >
        {/* Bleeds well above the stage into the tail of the previous section
            at full strength, and the stage's own fallback colour is the same
            dark tone as the painting — so wherever the mask thins out, it
            reveals more dark surface, never a flat light patch. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-[42vh] bottom-0 z-0 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/images/process-impasto-transition.webp')",
            maskImage: "linear-gradient(105deg, transparent 0%, black 62%)",
            WebkitMaskImage:
              "linear-gradient(105deg, transparent 0%, black 62%)",
          }}
        />

        {/* Dissolves the top of the bled image into the previous section's
            exact paper colour, so the seam reads as one continuous surface
            fading into texture — not a hard-edged rectangle of image sitting
            on top of it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-[42vh] z-[1] h-[62vh] bg-gradient-to-b from-[#f7f4ef] via-[#f7f4ef]/55 to-transparent"
        />

        {/* A fixed dark band at the foot of the stage — always present, not
            scroll-scrubbed — so black arrives immediately rather than after
            an animated reveal, and the handoff to the next section is
            seamless the moment the pin releases. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[34%] bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/55 to-transparent"
        />

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1480px] grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)] items-center gap-14 px-8 py-16 xl:gap-20 xl:px-14">
          <div className="min-w-0">
            <div className="mb-7 flex items-center gap-4">
              <span className="h-[2px] w-8" style={{ backgroundColor: RED }} />
              <p
                className="font-body text-[10px] font-bold uppercase tracking-[0.3em] xl:text-[11px]"
                style={{ color: TEXT_LABEL }}
              >
                {eyebrow}
              </p>
            </div>

            <SplitTextReveal
              as="h2"
              className="max-w-[12ch] text-[clamp(2.45rem,4.15vw,4.65rem)] font-bold uppercase leading-[0.88] tracking-[-0.045em]"
              step={24}
              delay={80}
              from="first"
            >
              <span style={{ color: TEXT }}>{heading} </span>
              <span style={{ color: RED }}>{headingAccent}</span>
            </SplitTextReveal>

            <ol className="mt-10 xl:mt-12">
              {steps.map((step, index) => (
                <LedgerRow
                  key={step.num}
                  step={step}
                  index={index}
                  count={steps.length}
                  activeIndex={shownActive}
                  completedCount={shownCompleted}
                  progress={scrollYProgress}
                  reduced={prefersReducedMotion}
                />
              ))}
            </ol>

            <p
              className="mt-6 font-clash text-[10px] font-bold uppercase tracking-[0.2em] tabular-nums"
              style={{ color: TEXT_LABEL }}
            >
              {String(Math.min(shownCompleted + 1, steps.length)).padStart(
                2,
                "0",
              )}{" "}
              — {String(steps.length).padStart(2, "0")}
            </p>
          </div>

          <div className="mx-auto h-[clamp(400px,52vh,520px)] w-full max-w-[640px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeStep.num}
                className="h-full"
                initial={
                  prefersReducedMotion
                    ? false
                    : { clipPath: "inset(100% 0 0 0)" }
                }
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                exit={
                  prefersReducedMotion
                    ? undefined
                    : { clipPath: "inset(0 0 100% 0)" }
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.3,
                  ease: EASE,
                }}
              >
                <Slab
                  step={activeStep}
                  index={shownActive}
                  count={steps.length}
                  gainLabel={gainLabel}
                  deliverLabel={deliverLabel}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* The CTA settles into the permanent dark band once the ledger
            completes - a discrete appear/disappear tied to state, not a
            value scrubbed continuously against scroll position. */}
        <AnimatePresence>
          {curtainEngaged && (
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 pb-14 text-center"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: EASE }}
            >
              <a
                href="#closing-cta"
                className="pointer-events-auto inline-flex items-center gap-3 rounded-full px-8 py-4 font-clash text-[11px] font-bold uppercase tracking-[0.15em] outline-none transition-transform duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white/70"
                style={{ backgroundColor: PAPER, color: INK }}
              >
                {ctaLabel}
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </a>
              <p className="font-body text-[12px] text-white/55">{ctaSub}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile / tablet: the descent ──
          The section falls from the paper it shares with the section above,
          through a real painted edge, into the black the next chapter needs.
          The stroke sits in the flow between step 02 and step 03, so the
          crossover always lands in the same place no matter how long the copy
          runs or which locale is active. */}
      <div className="relative lg:hidden">
        {/* Paper half — continuous with the section above, so the seam at the
            top of this section reads as one surface. */}
        <div
          className="px-5 pb-12 pt-14 sm:px-6"
          style={{ backgroundColor: PAPER }}
        >
          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-7" style={{ backgroundColor: RED }} />
              <p
                className="font-body text-[10px] font-bold uppercase tracking-[0.28em]"
                style={{ color: INK_SOFT }}
              >
                {eyebrow}
              </p>
            </div>
            <h2 className="mt-5 text-[clamp(2.6rem,11vw,3.6rem)] font-bold uppercase leading-[0.88] tracking-[-0.045em]">
              <span style={{ color: INK }}>{heading} </span>
              <span style={{ color: RED }}>{headingAccent}</span>
            </h2>

            <ol className="mt-11 space-y-9">
              {steps.slice(0, 2).map((step, index) => (
                <DescentStep
                  key={step.num}
                  step={step}
                  index={index}
                  tone="paper"
                  reduced={prefersReducedMotion}
                />
              ))}
            </ol>
          </div>
        </div>

        {/* The stroke — the one painted moment. Cropped to the tear so it
            reads as an edge rather than a wallpaper. The image's own top row
            is near-paper and its bottom row is near-slab, so the two short
            gradients below are only there to erase the last few values of
            difference at each seam. */}
        <div
          className="relative aspect-[4/3] w-full overflow-hidden"
          style={{ backgroundColor: PAPER }}
        >
          {/* Cropped to the tear itself. The offset keeps the torn edge just
              above centre so there is white to fall from and black to land on,
              without carrying the image's long featureless black tail. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/monochrome_diagonal_impasto_swirl.webp"
            alt=""
            aria-hidden="true"
            width={941}
            height={1672}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 41%" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-16"
            style={{
              background: `linear-gradient(to bottom, ${PAPER}, transparent)`,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
            style={{
              background: `linear-gradient(to top, ${SLAB}, transparent)`,
            }}
          />
        </div>

        {/* Slab half — hands straight off to the dark chapter card below. */}
        <div
          className="px-5 pb-16 pt-12 sm:px-6"
          style={{ backgroundColor: SLAB }}
        >
          <div className="mx-auto max-w-xl">
            <ol className="space-y-9">
              {steps.slice(2).map((step, index) => (
                <DescentStep
                  key={step.num}
                  step={step}
                  index={index + 2}
                  tone="slab"
                  reduced={prefersReducedMotion}
                />
              ))}
            </ol>

            <div className="mt-12 text-center">
              <a
                href="#closing-cta"
                className="inline-flex min-h-[44px] items-center gap-3 rounded-full px-7 py-4 font-clash text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ backgroundColor: PAPER, color: INK }}
              >
                {ctaLabel}
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </a>
              <p className="mt-4 font-body text-[12px] text-white/55">
                {ctaSub}
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
