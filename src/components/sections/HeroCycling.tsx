"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CyclingTextChars } from "@/components/ui/CyclingTextChars";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Word {
  /** "text" renders a <span>; "image" renders a next/image */
  type: "text" | "image";
  /** Plain string for text words; /public-relative path for image words */
  content: string;
  /** Alt text for image words (ignored for text words) */
  alt?: string;
  /** How long to hold this word before cycling to the next (ms). Default: 2500 */
  holdMs?: number;
}

export interface HeroCyclingProps {
  /** Static first line(s). Can be a string or array of strings for multiple lines. */
  staticText?: string | string[];
  /** Ordered cycling sequence. Loops infinitely. */
  words?: Word[];
  /** CSS font-size for the static line. Default: clamp(2.5rem, 8vw, 6.5rem) */
  fontSize?: string;
  /** CSS font-size for the cycling line. Defaults to fontSize if not set. */
  cyclingFontSize?: string;
  /** Force animation even when OS has prefers-reduced-motion enabled. Default: false */
  forceAnimate?: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_HOLD_MS = 2500;

const DEFAULT_WORDS: Word[] = [
  {
    type: "image",
    content: "/cycling/to-roar.png",
    alt: "To Roar — brand power unleashed",
    holdMs: 4000,
  },
  {
    type: "image",
    content: "/cycling/more-sales.png",
    alt: "More Sales — measurable revenue growth",
  },
  { type: "text", content: "TOTAL CONFIDENCE" },
  { type: "text", content: "BOLD IDENTITY" },
  { type: "text", content: "REAL GROWTH" },
  { type: "text", content: "BETTER DESIGN" },
];

// ─── Animation variants ────────────────────────────────────────────────────────

const EASING = [0.65, 0, 0.35, 1] as const;
const DURATION = 0.6;

const wordVariants = {
  initial: { y: "100%", opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: DURATION, ease: EASING },
  },
  exit: {
    y: "-100%",
    opacity: 0,
    transition: { duration: DURATION, ease: EASING },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Two-line cycling hero:
 *   Line 1 — static text (Clash Display, white)
 *   Line 2 — cycles through text/image words with upward slide animation
 *
 * Usage:
 *   <HeroCycling />
 *   <HeroCycling staticText="YOUR BRAND DESERVES" words={[...]} />
 */
export default function HeroCycling({
  staticText = "YOUR BRAND DESERVES",
  words = DEFAULT_WORDS,
  fontSize = "clamp(2.5rem, 8vw, 6.5rem)",
  cyclingFontSize,
  forceAnimate = false,
}: HeroCyclingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Detect reduced motion (client-only) ──────────────────────────────────
  useEffect(() => {
    setHasMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ── Cycling timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasMounted || (prefersReduced && !forceAnimate) || isPaused || words.length <= 1) return;

    const holdMs = words[currentIndex]?.holdMs ?? DEFAULT_HOLD_MS;
    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % words.length);
    }, holdMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, hasMounted, isPaused, prefersReduced, words]);

  // ── Pause when tab is hidden ─────────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ── Sizing ───────────────────────────────────────────────────────────────
  // clamp() keeps container height == font-size at every viewport width.
  // Images fill this height; text matches this font-size.
  const clampSize = fontSize;
  const cyclingClampSize = cyclingFontSize ?? fontSize;

  const sharedTextStyle: React.CSSProperties = {
    fontSize: clampSize,
    lineHeight: 1,
    letterSpacing: "0.05em",
    wordSpacing: "0.2em",
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#ffffff",
    margin: 0,
    whiteSpace: "nowrap",
    textAlign: "center",
    width: "100%",
  };

  const cyclingTextStyle: React.CSSProperties = {
    ...sharedTextStyle,
    fontSize: cyclingClampSize,
  };

  // ── Word renderer ────────────────────────────────────────────────────────
  const renderWord = (word: Word, priority: boolean) => {
    if (word.type === "image") {
      return (
        <div
          style={{
            position: "relative",
            height: "100%",
            minWidth: cyclingClampSize,
            maxWidth: "100%",
            width: "100%",
          }}
        >
          <Image
            src={word.content}
            alt={word.alt ?? ""}
            fill
            style={{ objectFit: "contain", objectPosition: "center center" }}
            priority={priority}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 75vw, 65vw"
          />
        </div>
      );
    }

    return (
      <CyclingTextChars text={word.content} style={cyclingTextStyle} />
    );
  };

  // Reduced motion / pre-mount: static first word, no animation
  const showStatic = !hasMounted || (prefersReduced && !forceAnimate);

  return (
    <div
      aria-label="Hero tagline"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {/* ── Static Text Lines ── */}
      {Array.isArray(staticText) ? (
        staticText.map((line, idx) => (
          <h1 key={idx} style={{ ...sharedTextStyle, whiteSpace: "normal" }}>{line}</h1>
        ))
      ) : (
        <h1 style={{ ...sharedTextStyle, whiteSpace: "normal" }}>{staticText}</h1>
      )}

      {/* ── Gap between static and cycling lines ── */}
      <div style={{ height: "0.2em" }} />

      {/* ── Line 2: Cycling ── */}
      <div
        role="region"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Cycling brand promise"
        tabIndex={0}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        style={{
          position: "relative",
          overflow: "hidden",
          height: cyclingClampSize,
          // Subtle visual focus ring for keyboard users
          outline: "none",
        }}
        onKeyDown={(e) => {
          // Allow spacebar to manually pause/resume (accessibility bonus)
          if (e.key === " ") {
            e.preventDefault();
            setIsPaused((p) => !p);
          }
        }}
      >
        {showStatic ? (
          // Static fallback: first word, no motion
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {renderWord(words[0], true)}
          </div>
        ) : (
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={currentIndex}
              variants={wordVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                willChange: "transform",
              }}
            >
              {renderWord(words[currentIndex], currentIndex === 0)}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
