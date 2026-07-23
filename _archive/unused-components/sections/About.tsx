"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";

/* ─── helpers ─────────────────────────────────────────────── */

/** Returns a spring-smoothed opacity for a single word */
function useWordOpacity(
  scrollYProgress: MotionValue<number>,
  start: number,
  end: number
): MotionValue<number> {
  const raw = useTransform(scrollYProgress, [start, end], [0, 1]);
  return useSpring(raw, { stiffness: 120, damping: 24, mass: 0.6 });
}

/** Returns a spring-smoothed translateY for a single word */
function useWordY(
  scrollYProgress: MotionValue<number>,
  start: number,
  end: number
): MotionValue<number> {
  const raw = useTransform(scrollYProgress, [start, end], [20, 0]);
  return useSpring(raw, { stiffness: 120, damping: 24, mass: 0.6 });
}

/* ─── Word component ──────────────────────────────────────── */

interface WordProps {
  children: string;
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
  dim?: boolean; // render in muted white
}

function Word({ children, scrollYProgress, start, end, dim }: WordProps) {
  const opacity = useWordOpacity(scrollYProgress, start, end);
  const y = useWordY(scrollYProgress, start, end);

  return (
    <motion.span
      style={{ opacity, y, display: "inline-block" }}
      className={dim ? "text-white/30" : "text-white"}
    >
      {children}
    </motion.span>
  );
}

/* ─── Body paragraph word reveal ─────────────────────────── */

interface BodyWordProps {
  word: string;
  scrollYProgress: MotionValue<number>;
  index: number;
  total: number;
  /** scroll range [start, end] for the entire body block */
  blockStart: number;
  blockEnd: number;
}

function BodyWord({
  word,
  scrollYProgress,
  index,
  total,
  blockStart,
  blockEnd,
}: BodyWordProps) {
  const span = (blockEnd - blockStart) / total;
  const start = blockStart + index * span * 0.6;
  const end = start + span * 1.4;
  const opacity = useWordOpacity(scrollYProgress, start, end);
  const y = useWordY(scrollYProgress, start, end);

  return (
    <motion.span
      style={{ opacity, y, display: "inline-block" }}
      className="text-white/80"
    >
      {word}
    </motion.span>
  );
}

/* ─── Main section ────────────────────────────────────────── */

const HEADLINE_WORDS = [
  { text: "Innovating", dim: false },
  { text: "in", dim: false },
  { text: "today's", dim: false },
  { text: "digital", dim: false },
  { text: "era", dim: false },
  { text: "is", dim: false },
  { text: "not", dim: false },
  { text: "a", dim: false },
  { text: "choice.", dim: false },
  { text: "IT'S", dim: true },
  { text: "NEEDED.", dim: true },
];

const BODY_TEXT =
  "We exist to make sure that's never you.";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Headline: stagger each word across 0 → 0.55 of scroll progress
  const headlineStart = 0.0;
  const headlineEnd = 0.55;
  const headlineTotal = HEADLINE_WORDS.length;

  // Eyebrow: appears early
  const eyebrowOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.12], [0, 1]),
    { stiffness: 120, damping: 24 }
  );
  const eyebrowY = useSpring(
    useTransform(scrollYProgress, [0, 0.12], [20, 0]),
    { stiffness: 120, damping: 24 }
  );

  // Divider line
  const lineScaleX = useSpring(
    useTransform(scrollYProgress, [0.35, 0.62], [0, 1]),
    { stiffness: 80, damping: 22 }
  );

  // Body words block
  const bodyWords = BODY_TEXT.split(" ");
  const bodyBlockStart = 0.5;
  const bodyBlockEnd = 0.85;

  return (
    <section
      ref={sectionRef}
      className="bg-brand-red-secondary relative overflow-hidden py-[80px] md:py-[180px]"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* ── Eyebrow ── */}
        <motion.p
          style={{ opacity: eyebrowOpacity, y: eyebrowY }}
          className="mb-6 text-[16px] font-semibold uppercase tracking-[0.2em] text-white/70"
        >
          The Reality
        </motion.p>

        {/* ── Headline — scroll-driven word reveal ── */}
        <h2 className="max-w-[900px] text-[2.4rem] font-bold uppercase leading-[1.1] tracking-tight sm:text-[3rem] md:text-[4rem] lg:text-[5rem]">
          {HEADLINE_WORDS.map((word, i) => {
            const span =
              (headlineEnd - headlineStart) / headlineTotal;
            const wordStart = headlineStart + i * span * 0.72;
            const wordEnd = wordStart + span * 1.6;

            return (
              <Word
                key={i}
                scrollYProgress={scrollYProgress}
                start={Math.min(wordStart, 0.98)}
                end={Math.min(wordEnd, 1)}
                dim={word.dim}
              >
                {word.text}
              </Word>
            );
          }).reduce<React.ReactNode[]>((acc, el, i) => {
            // Insert a non-breaking space between each word
            if (i === 0) return [el];
            return [...acc, <span key={`sp-${i}`}>&nbsp;</span>, el];
          }, [])}
        </h2>

        {/* ── Divider ── */}
        <motion.div
          style={{ scaleX: lineScaleX, originX: "0%" }}
          className="mt-10 h-px w-full bg-white/20"
        />

        {/* ── Body paragraph — word reveal ── */}
        <p className="mt-10 max-w-[560px] text-[16px] leading-[160%] md:text-[20px] md:leading-[132%]">
          {bodyWords.map((word, i) => (
            <BodyWord
              key={i}
              word={word}
              scrollYProgress={scrollYProgress}
              index={i}
              total={bodyWords.length}
              blockStart={bodyBlockStart}
              blockEnd={bodyBlockEnd}
            />
          )).reduce<React.ReactNode[]>((acc, el, i) => {
            if (i === 0) return [el];
            return [...acc, <span key={`bsp-${i}`}>&nbsp;</span>, el];
          }, [])}
        </p>
      </div>
    </section>
  );
}
