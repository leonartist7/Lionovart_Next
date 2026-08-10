"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

type ProcessStep = {
  num: string;
  title: string;
  description: string;
  tag: string;
  timeline?: string;
  expect?: string;
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
    expect:
      "A deep read of who you are — market, voice, ambition. We ask the questions most agencies skip.",
    deliver:
      "Logo system, typography, colour, brand book, elevated print & packaging.",
    gain: "A brand people recognise before they read the name.",
  },
  {
    title: "Presence",
    description:
      "We take the channels that look inherited and make them unmistakably yours.",
    tag: "Design",
    timeline: "Week 3–4",
    expect:
      "We take the channels that look inherited and make them unmistakably yours.",
    deliver:
      "Profile architecture, content pillars, templates, scroll-stopping creative.",
    gain: "Social that reads as authority, not activity.",
  },
  {
    title: "Systems",
    description:
      "We map where growth leaks and close the gaps with systems that run without you.",
    tag: "Execution",
    timeline: "Week 5–6",
    expect:
      "We map where growth leaks and close the gaps with systems that run without you.",
    deliver: "Funnels, automation, CRM wiring, reporting that stays readable.",
    gain: "Growth that runs whether or not you're watching.",
  },
  {
    title: "Confidence",
    description: "The full handover. Nothing gatekept, nothing locked behind us.",
    tag: "Growth",
    timeline: "Handover",
    expect: "The full handover. Nothing gatekept, nothing locked behind us.",
    deliver: "Brand guidelines, the full asset library, team training.",
    gain: "You share your brand anywhere, without hesitating.",
  },
];

const RED = "#e5192a";
const GOLD = "#f0c917";
const INK = "#141414";
const INK_MUTED = "#5a5550";
const EASE = [0.16, 1, 0.3, 1] as const;

/** Sequence timing (ms). The gaps between nodes are the point — don't tighten them. */
const T_WIPE_START = 200;
const T_WIPE = 650;
const T_LINE_START = 750;
const T_LINE = 3600;

const nodeDelay = (i: number, count: number) =>
  T_LINE_START + T_LINE * ((i + 0.5) / count);

// Vision copy (hardcoded for now; i18n type is `typeof en` across 5 locales).
const VISION_KICKER = "Not artificial.";

export default function Process(props: any) {
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.process.eyebrow;
  const heading = props.heading || t.process.heading;
  const headingAccent = props.headingAccent || t.process.headingAccent;

  const {
    triggerLabel,
    triggerSub,
    expectLabel,
    deliverLabel,
    gainLabel,
    cta: ctaLabel,
    ctaSub,
  } = t.process;

  const steps: ProcessStep[] =
    props.steps && props.steps.length > 0
      ? props.steps.map((s: any, i: number) => ({ ...s, num: String(i + 1) }))
      : (t.process.steps?.length ? t.process.steps : STEPS_STATIC).map(
          (s: any, i: number) => ({ ...s, num: String(i + 1) })
        );

  const prefersReduced = useReducedMotion() ?? false;
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const reduce = hasMounted && prefersReduced;

  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);

  /** -1 = dormant, 0..n-1 = stages unlocked through, n = resolved. */
  const [stage, setStage] = useState(-1);
  const [dark, setDark] = useState(false);
  /** Once the wipe has landed the section owns the black itself, so the expanding
      circle never has to cover the taller layout the final reveal creates. */
  const [settled, setSettled] = useState(false);
  const [flash, setFlash] = useState(false);
  /** Wipe circle geometry, measured from the trigger at click time. */
  const [wipe, setWipe] = useState<{ x: number; y: number; r: number } | null>(
    null
  );

  const started = stage > -1;

  const run = useCallback(() => {
    if (started) return;

    // Measure the wipe origin from the trigger, falling back to section centre
    // when the auto-run safety net has no click point.
    const sectionBox = sectionRef.current?.getBoundingClientRect();
    if (sectionBox) {
      const triggerBox = triggerRef.current?.getBoundingClientRect();
      const x = triggerBox
        ? triggerBox.left - sectionBox.left + triggerBox.width / 2
        : sectionBox.width / 2;
      const y = triggerBox
        ? triggerBox.top - sectionBox.top + triggerBox.height / 2
        : sectionBox.height / 2;
      const r =
        Math.hypot(
          Math.max(x, sectionBox.width - x),
          Math.max(y, sectionBox.height - y)
        ) * 1.05;
      setWipe({ x, y, r });
    }

    if (reduce) {
      setDark(true);
      setSettled(true);
      setStage(steps.length + 1);
      return;
    }

    setStage(0);
    const push = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    push(() => setDark(true), T_WIPE_START);
    push(() => setSettled(true), T_WIPE_START + T_WIPE);
    push(() => setFlash(true), T_WIPE_START);
    push(() => setFlash(false), T_WIPE_START + 260);
    steps.forEach((_, i) => {
      push(() => setStage(i + 1), nodeDelay(i, steps.length));
    });
    push(() => setStage(steps.length + 1), T_LINE_START + T_LINE + 300);
  }, [started, reduce, steps]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    []
  );

  // Safety net: a visitor who never clicks must not lose the content.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || started) return;

    let hold: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Measure against the viewport, not the section: this section is taller
        // than most screens, so `intersectionRatio` would never reach a high
        // threshold and the safety net would silently never fire.
        const filled = entry.intersectionRect.height / window.innerHeight;
        if (entry.isIntersecting && filled >= 0.5) {
          if (hold === undefined) {
            hold = window.setTimeout(run, 1500);
          }
        } else if (hold !== undefined) {
          clearTimeout(hold);
          hold = undefined;
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (hold) clearTimeout(hold);
    };
  }, [run, started]);

  const revealed = stage > steps.length;
  const unlocked = (i: number) => stage > i;

  const textMain = dark ? "#ffffff" : INK;
  const textMuted = dark ? "rgba(255,255,255,0.72)" : INK_MUTED;
  const hairline = dark ? "rgba(255,255,255,0.14)" : "rgba(20,20,20,0.12)";

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative isolate overflow-hidden px-5 py-24 md:px-10 md:py-32"
      style={{ backgroundColor: settled ? "#000000" : "#f7f4ef" }}
    >
      {/* ── The blackout — a circle expanding from the trigger ── */}
      {wipe && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-0 rounded-full bg-bg-dark"
          initial={{ scale: 0 }}
          animate={{ scale: dark ? 1 : 0 }}
          transition={{ duration: reduce ? 0.2 : T_WIPE / 1000, ease: EASE }}
          style={{
            left: wipe.x,
            top: wipe.y,
            width: wipe.r * 2,
            height: wipe.r * 2,
            marginLeft: -wipe.r,
            marginTop: -wipe.r,
          }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center">
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] md:text-[13px]"
            style={{ color: RED }}
          >
            {eyebrow}
          </p>
          {/* Colour lives on the wrapper so the split chars inherit it — anime.js
              restructures the heading's DOM, so per-span styles wouldn't update. */}
          <div style={{ color: textMain, transition: "color 500ms linear" }}>
            <SplitTextReveal
              as="h2"
              className="text-[2rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] sm:text-[2.8rem] md:text-[3.75rem]"
              step={28}
              delay={100}
              from="first"
            >
              {heading} <span style={{ color: RED }}>{headingAccent}</span>
            </SplitTextReveal>
          </div>
        </div>

        {/* ── Trigger ── */}
        <motion.div
          className="relative flex flex-col items-center justify-center overflow-hidden"
          initial={false}
          animate={{ height: started ? 24 : 132, marginTop: started ? 8 : 40 }}
          transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.2, ease: EASE }}
        >
          <AnimatePresence>
            {!started && (
              <motion.div
                className="flex flex-col items-center"
                exit={{ opacity: 0, scale: reduce ? 1 : 0.82 }}
                transition={{ duration: reduce ? 0.15 : 0.32, ease: EASE }}
              >
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={run}
                  className="group relative grid h-[104px] w-[104px] place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-4"
                  style={{ color: RED }}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 h-full w-full -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      fill="none"
                      stroke={hairline}
                      strokeWidth="1.6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      fill="none"
                      stroke={RED}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      pathLength={1}
                      className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-[600ms] ease-out group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0]"
                    />
                  </svg>
                  <span className="max-w-[70px] font-clash text-[12px] font-bold uppercase leading-[1.15] tracking-[0.12em]">
                    {triggerLabel}
                  </span>
                </button>
                <p
                  className="mt-5 font-body text-[13px]"
                  style={{ color: textMuted }}
                >
                  {triggerSub}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gold ignition flash — what makes it read "unlocked" without a lock icon */}
          <AnimatePresence>
            {flash && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute h-[104px] w-[104px] rounded-full"
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: 0, scale: 1.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: EASE }}
                style={{ boxShadow: `0 0 0 2px ${GOLD}` }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── The spine + the four stages ── */}
        <div className="relative mt-4 pl-10 md:mt-8 md:pl-16">
          {/* Track */}
          <div
            aria-hidden
            className="absolute bottom-0 left-[7px] top-0 w-px"
            style={{ backgroundColor: hairline }}
          />
          {/* Travelling line */}
          <motion.div
            aria-hidden
            className="absolute left-[7px] top-0 w-px origin-top"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: started ? 1 : 0 }}
            transition={{
              duration: reduce ? 0 : T_LINE / 1000,
              delay: reduce ? 0 : T_LINE_START / 1000,
              ease: "linear",
            }}
            style={{ bottom: 0, backgroundColor: RED }}
          />

          <ol className="space-y-10 md:space-y-14">
            {steps.map((step, i) => {
              const on = unlocked(i);
              return (
                <li key={step.num} className="relative">
                  {/* Node */}
                  <motion.span
                    aria-hidden
                    className="absolute -left-10 top-[6px] block rounded-full md:-left-16"
                    initial={false}
                    animate={{
                      backgroundColor: on ? RED : hairline,
                      scale: on ? 1 : 0.7,
                    }}
                    transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                    style={{
                      width: 15,
                      height: 15,
                      marginLeft: 0,
                      transform: "translateX(0)",
                    }}
                  />

                  <motion.div
                    initial={false}
                    animate={{
                      opacity: on ? (stage === i + 1 || revealed ? 1 : 0.45) : 0.18,
                      x: reduce ? 0 : on ? 0 : 18,
                    }}
                    transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                  >
                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-clash text-[13px] font-black tabular-nums"
                        style={{ color: RED }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {step.timeline && (
                        <span
                          className="font-body text-[11px] uppercase tracking-[0.22em]"
                          style={{
                            color: textMuted,
                            transition: "color 500ms linear",
                          }}
                        >
                          {step.timeline}
                        </span>
                      )}
                    </div>

                    <h3
                      className="mt-1 font-clash text-[1.5rem] font-bold uppercase leading-[1.05] tracking-[-0.015em] sm:text-[2rem]"
                      style={{ color: textMain, transition: "color 500ms linear" }}
                    >
                      {step.title}
                    </h3>

                    <dl className="mt-4 max-w-[52ch] space-y-2.5">
                      {step.expect && (
                        <div className="hidden sm:block">
                          <dt
                            className="font-body text-[10px] font-bold uppercase tracking-[0.24em]"
                            style={{ color: textMuted }}
                          >
                            {expectLabel}
                          </dt>
                          <dd
                            className="font-body text-[14px] leading-[1.55]"
                            style={{
                              color: textMuted,
                              transition: "color 500ms linear",
                            }}
                          >
                            {step.expect}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt
                          className="font-body text-[10px] font-bold uppercase tracking-[0.24em]"
                          style={{ color: textMuted }}
                        >
                          {deliverLabel}
                        </dt>
                        <dd
                          className="font-body text-[14px] leading-[1.55]"
                          style={{
                            color: textMuted,
                            transition: "color 500ms linear",
                          }}
                        >
                          {step.deliver ?? step.description}
                        </dd>
                      </div>
                      {step.gain && (
                        <div>
                          <dt
                            className="font-body text-[10px] font-bold uppercase tracking-[0.24em]"
                            style={{ color: textMuted }}
                          >
                            {gainLabel}
                          </dt>
                          <dd
                            className="font-clash text-[15px] font-bold leading-[1.35] sm:text-[17px]"
                            style={{ color: RED }}
                          >
                            {step.gain}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── Final reveal — the line becomes the stem of the "i" ── */}
        {/* Collapsed to zero height while dormant, so the section doesn't sit on a
            few hundred px of reserved void before anyone triggers it. */}
        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{ height: revealed ? "auto" : 0 }}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
        >
          <div className="mt-16 flex flex-col items-center text-center md:mt-20">
            <motion.div
            className="flex flex-col items-center"
            initial={false}
            /* inert keeps the CTA out of the tab order while it's still invisible */
            inert={!revealed}
            animate={{ opacity: revealed ? 1 : 0, y: revealed || reduce ? 0 : 14 }}
            transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE }}
          >
              {/* The dot and stem of the "i" — solid brand red. Kept as flat marks
                  rather than the lion artwork so it stays crisp at this size. */}
              <motion.span
                aria-hidden
                className="block rounded-full"
                initial={false}
                animate={{ scale: revealed ? 1 : 0.4 }}
                transition={{ duration: reduce ? 0.2 : 0.5, ease: EASE }}
                style={{ width: 46, height: 46, backgroundColor: RED }}
              />
              <motion.span
                aria-hidden
                className="mt-3 block rounded-full"
                initial={false}
                animate={{ scaleY: revealed ? 1 : 0 }}
                transition={{
                  duration: reduce ? 0.2 : 0.55,
                  delay: reduce ? 0 : 0.15,
                  ease: EASE,
                }}
                style={{
                  transformOrigin: "top center",
                  width: 14,
                  height: 64,
                  backgroundColor: RED,
                }}
              />

            <p
              className="mt-8 text-[11px] font-bold uppercase tracking-[0.3em] md:text-[13px]"
              style={{ color: RED }}
            >
              {VISION_KICKER}
            </p>
            <h3
              className="mt-3 font-clash text-[2rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] sm:text-[2.8rem] md:text-[3.4rem]"
              style={{ color: textMain, transition: "color 500ms linear" }}
            >
              Artistic <span style={{ color: RED }}>Intelligence</span>
            </h3>

            {/* The ask — they just watched stage 01 unlock, so offer them the real one */}
            <a
              href="#closing-cta"
              className="mt-9 inline-flex items-center rounded-full px-9 py-4 font-clash text-[13px] font-bold uppercase tracking-[0.16em] text-white outline-none transition-transform duration-300 hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
              style={{ backgroundColor: RED }}
            >
              {ctaLabel}
            </a>
              <p className="mt-4 font-body text-[13px]" style={{ color: textMuted }}>
                {ctaSub}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
