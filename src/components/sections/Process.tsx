"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLandingFlow } from "@/contexts/LandingFlowContext";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

type ProcessStep = {
  num: string;
  title: string;
  description: string;
  tag: string;
  gain?: string;
};

const STEPS_STATIC = [
  {
    title: "Identity",
    description:
      "A deep read of who you are — market, voice, ambition. We ask the questions most agencies skip.",
    tag: "Foundation",
    gain: "A brand people recognise before they read the name.",
  },
  {
    title: "Presence",
    description:
      "We take the channels that look inherited and make them unmistakably yours.",
    tag: "Design",
    gain: "Social that reads as authority, not activity.",
  },
  {
    title: "Systems",
    description:
      "We map where growth leaks and close the gaps with systems that run without you.",
    tag: "Execution",
    gain: "Growth that runs whether or not you're watching.",
  },
  {
    title: "Confidence",
    description: "The full handover. Nothing gatekept, nothing locked behind us.",
    tag: "Growth",
    gain: "You share your brand anywhere, without hesitating.",
  },
];

const RED = "#e5192a";
const GOLD = "#f0c917";
const INK = "#141414";
const INK_MUTED = "#5a5550";
const EASE = [0.16, 1, 0.3, 1] as const;
const POP = { type: "spring", stiffness: 300, damping: 20 } as const;

/** Sequence timing (ms). The gaps between nodes are the point — don't tighten them. */
const T_WIPE_START = 200;
const T_WIPE = 650;
const T_LINE_START = 750;
const T_LINE = 2800;

const nodeDelay = (i: number, count: number) =>
  T_LINE_START + T_LINE * ((i + 0.5) / count);

// Vision copy (hardcoded for now; i18n type is `typeof en` across 5 locales).
const VISION_KICKER = "Not artificial.";

export default function Process(props: any) {
  const flow = useLandingFlow();
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.process.eyebrow;
  const heading = props.heading || t.process.heading;
  const headingAccent = props.headingAccent || t.process.headingAccent;

  const { triggerLabel, cta: ctaLabel, ctaSub } = t.process;

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
  /** Which card is mid-pop, for the gold burst behind it. Only one at a time. */
  const [cardFlash, setCardFlash] = useState<number | null>(null);
  /** Wipe circle geometry, measured from the trigger at click time. */
  const [wipe, setWipe] = useState<{ x: number; y: number; r: number } | null>(
    null
  );

  const started = stage > -1;

  const run = useCallback(() => {
    if (started) return;

    // Measure the wipe origin from the trigger, falling back to section centre
    // (inverse flow and the auto-run safety net have no click point).
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
      const at = nodeDelay(i, steps.length);
      push(() => setStage(i + 1), at);
      push(() => setCardFlash(i), at);
      push(() => setCardFlash(null), at + 320);
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

  // Safety net: a visitor who never clicks must not lose the content. In inverse
  // flow the section is entered from the far side, so it always self-arms.
  const autoStart = flow === "inverse";
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
            hold = window.setTimeout(run, autoStart ? 300 : 1500);
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
  }, [run, started, autoStart]);

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

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
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

        {/* ── Trigger — a big circle and an arrow ── */}
        <motion.div
          className="relative flex flex-col items-center justify-center overflow-hidden"
          initial={false}
          animate={{ height: started ? 24 : 224, marginTop: started ? 8 : 48 }}
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
                  aria-label={triggerLabel}
                  className="group relative grid h-[160px] w-[160px] place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-4"
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
                  <ArrowDown
                    aria-hidden
                    className="h-9 w-9 transition-transform duration-300 group-hover:translate-y-1"
                    strokeWidth={2.25}
                  />
                </button>
                <p
                  className="mt-6 max-w-[16ch] text-center font-clash text-[13px] font-bold uppercase leading-snug tracking-[0.14em]"
                  style={{ color: RED }}
                >
                  {triggerLabel}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gold ignition flash — what makes it read "unlocked" without a lock icon */}
          <AnimatePresence>
            {flash && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute h-[160px] w-[160px] rounded-full"
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: 0, scale: 1.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: EASE }}
                style={{ boxShadow: `0 0 0 2px ${GOLD}` }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── The center gold line + achievement cards ── */}
        {/* Collapsed to zero height while dormant: nothing here is meant to be
            seen until the trigger fires, so there's no faint "preview" to render
            and no reserved void to sit on beforehand. */}
        <motion.div
          className="w-full overflow-hidden"
          initial={false}
          animate={{ height: dark ? "auto" : 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
        >
          <div className="relative w-full">
            {/* Track */}
            <div
              aria-hidden
              className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2"
              style={{ backgroundColor: hairline }}
            />
            {/* Travelling line */}
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-0 w-px origin-top -translate-x-1/2"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: started ? 1 : 0 }}
              transition={{
                duration: reduce ? 0 : T_LINE / 1000,
                delay: reduce ? 0 : T_LINE_START / 1000,
                ease: "linear",
              }}
              style={{ bottom: 0, backgroundColor: GOLD }}
            />

            <ol className="relative flex flex-col items-center gap-10 py-2 md:gap-14">
              {steps.map((step, i) => {
                const on = unlocked(i);
                return (
                  <li key={step.num} className="relative flex justify-center">
                    {/* Node — a bead on the line where it meets the card */}
                    <motion.span
                      aria-hidden
                      className="absolute -top-5 left-1/2 block -translate-x-1/2 rounded-full"
                      initial={false}
                      animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }}
                      transition={reduce ? { duration: 0 } : POP}
                      style={{ width: 12, height: 12, backgroundColor: GOLD }}
                    />

                    {/* The achievement card */}
                    <motion.div
                      className="relative w-[280px] rounded-2xl bg-white px-7 py-7 text-center sm:w-[340px] sm:px-9 sm:py-8"
                      initial={false}
                      animate={{
                        scale: on ? 1 : 0.6,
                        opacity: on ? 1 : 0,
                        y: on ? 0 : 10,
                      }}
                      transition={reduce ? { duration: 0 } : POP}
                      style={{
                        border: `2px solid ${GOLD}`,
                        boxShadow:
                          "0 0 0 1px rgba(240,201,23,0.25), 0 12px 34px rgba(0,0,0,0.35)",
                      }}
                    >
                      {/* Gold burst on unlock */}
                      <AnimatePresence>
                        {cardFlash === i && (
                          <motion.span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-2xl"
                            initial={{ opacity: 0.8, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.18 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: EASE }}
                            style={{ boxShadow: `0 0 0 3px ${GOLD}` }}
                          />
                        )}
                      </AnimatePresence>

                      <span
                        className="font-clash text-[13px] font-black tabular-nums"
                        style={{ color: GOLD }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className="mt-1 font-clash text-[1.4rem] font-bold uppercase leading-[1.05] tracking-[-0.01em] sm:text-[1.7rem]"
                        style={{ color: INK }}
                      >
                        {step.title}
                      </h3>
                      {step.gain && (
                        <p
                          className="mx-auto mt-2 max-w-[26ch] font-body text-[13px] leading-[1.5] sm:text-[14px]"
                          style={{ color: INK_MUTED }}
                        >
                          {step.gain}
                        </p>
                      )}
                    </motion.div>
                  </li>
                );
              })}
            </ol>
          </div>
        </motion.div>

        {/* ── Final reveal — the line becomes the stem of the "i" ── */}
        {/* Collapsed to zero height while dormant, so the section doesn't sit on a
            few hundred px of reserved void before anyone triggers it. */}
        <motion.div
          className="w-full overflow-hidden"
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
              {/* The dot and stem of the "i" — solid gold. Kept as flat marks
                  rather than the lion artwork so it stays crisp at this size. */}
              <motion.span
                aria-hidden
                className="block rounded-full"
                initial={false}
                animate={{ scale: revealed ? 1 : 0.4 }}
                transition={{ duration: reduce ? 0.2 : 0.5, ease: EASE }}
                style={{ width: 46, height: 46, backgroundColor: GOLD }}
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
                  backgroundColor: GOLD,
                }}
              />

              <p
                className="mt-8 text-[11px] font-bold uppercase tracking-[0.3em] md:text-[13px]"
                style={{ color: GOLD }}
              >
                {VISION_KICKER}
              </p>
              <h3
                className="mt-3 font-clash text-[2rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] sm:text-[2.8rem] md:text-[3.4rem]"
                style={{ color: textMain, transition: "color 500ms linear" }}
              >
                Artistic <span style={{ color: GOLD }}>Intelligence</span>
              </h3>

              {/* The ask — they just watched stage 01 unlock, so offer them the real one */}
              <a
                href="#closing-cta"
                className="mt-9 inline-flex items-center rounded-full px-9 py-4 font-clash text-[13px] font-bold uppercase tracking-[0.16em] outline-none transition-transform duration-300 hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                style={{ backgroundColor: GOLD, color: INK }}
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
