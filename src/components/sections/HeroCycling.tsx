"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export interface Word {
  type: "text" | "image";
  content: string;
  alt?: string;
  holdMs?: number;
}

export interface HeroCyclingProps {
  staticText?: string | string[];
  words?: Word[];
  fontSize?: string;
  cyclingFontSize?: string;
  imageFontSize?: string;
  cyclingColor?: string;
  letterSpacing?: string;
  forceAnimate?: boolean;
}

const DEFAULT_HOLD_MS = 2500;
const DEFAULT_WORDS: Word[] = [
  { type: "image", content: "/cycling/to-roar.png", alt: "To Roar — brand power unleashed", holdMs: 4000 },
  { type: "image", content: "/cycling/more-sales.png", alt: "More Sales — measurable revenue growth" },
  { type: "text", content: "TOTAL CONFIDENCE" },
  { type: "text", content: "BOLD IDENTITY" },
  { type: "text", content: "REAL GROWTH" },
  { type: "text", content: "BETTER DESIGN" },
];

const EASING = [0.16, 1, 0.3, 1] as const;
const wordVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.34, ease: EASING } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.28, ease: EASING } },
};

/**
 * Shared kinetic headline. Timers and image warming are viewport-gated, so the
 * closing CTA does zero cycling work at the top of a long page.
 */
export default function HeroCycling({
  staticText = "YOUR BRAND DESERVES",
  words = DEFAULT_WORDS,
  fontSize = "clamp(2.5rem, 8vw, 6.5rem)",
  cyclingFontSize,
  imageFontSize,
  cyclingColor = "#ffffff",
  letterSpacing = "0.05em",
  forceAnimate = false,
}: HeroCyclingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [interactionPaused, setInteractionPaused] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setPrefersReduced(motionQuery.matches);
    syncMotion();
    motionQuery.addEventListener("change", syncMotion);
    return () => motionQuery.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "320px 0px", threshold: 0.01 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(document.visibilityState === "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    if (!nearViewport) return;
    words.forEach((word) => {
      if (word.type === "image") {
        const image = new window.Image();
        image.src = word.content;
      }
    });
  }, [nearViewport, words]);

  const reduced = prefersReduced && !forceAnimate;
  const shouldAnimate = hasMounted && nearViewport && pageVisible && !interactionPaused && !reduced;

  useEffect(() => {
    if (!shouldAnimate || words.length <= 1) return;
    const holdMs = words[currentIndex]?.holdMs ?? DEFAULT_HOLD_MS;
    timerRef.current = window.setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % words.length);
    }, holdMs);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [currentIndex, shouldAnimate, words]);

  const cyclingClampSize = cyclingFontSize ?? fontSize;
  const imageClampSize = imageFontSize ?? cyclingClampSize;
  const sharedTextStyle: React.CSSProperties = {
    fontSize,
    lineHeight: 1,
    letterSpacing,
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
    color: cyclingColor,
    fontSize: cyclingClampSize,
  };

  const renderWord = (word: Word, priority: boolean) => {
    if (word.type === "image") {
      const featherX = "linear-gradient(90deg, transparent 0%, #000 1%, #000 99%, transparent 100%)";
      const featherY = "linear-gradient(180deg, transparent 0%, #000 1%, #000 99%, transparent 100%)";
      return (
        <div
          style={{
            position: "relative",
            height: imageClampSize,
            minWidth: imageClampSize,
            maxWidth: "100%",
            width: "100%",
          }}
        >
          <Image
            src={word.content}
            alt={word.alt ?? ""}
            fill
            style={{
              objectFit: "contain",
              objectPosition: "center center",
              WebkitMaskImage: `${featherX}, ${featherY}`,
              WebkitMaskComposite: "source-in",
              maskImage: `${featherX}, ${featherY}`,
              maskComposite: "intersect",
            }}
            priority={priority && nearViewport}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 75vw, 65vw"
          />
        </div>
      );
    }
    return <span style={cyclingTextStyle}>{word.content}</span>;
  };

  const staticMode = !hasMounted || reduced || !nearViewport || !pageVisible;
  const accessiblePromises = words.map((word) => word.alt ?? word.content).join(" · ");

  return (
    <div ref={rootRef} aria-label="Hero tagline" style={{ fontFamily: "var(--font-heading)" }}>
      {Array.isArray(staticText) ? (
        staticText.map((line, index) => (
          <h1 key={index} style={{ ...sharedTextStyle, whiteSpace: "normal" }}>{line}</h1>
        ))
      ) : (
        <h1 style={{ ...sharedTextStyle, whiteSpace: "normal" }}>{staticText}</h1>
      )}

      <div aria-hidden style={{ height: "0.2em" }} />

      <div
        role="region"
        aria-live="off"
        aria-label={`Brand promises: ${accessiblePromises}`}
        tabIndex={0}
        onFocus={() => setInteractionPaused(true)}
        onBlur={() => setInteractionPaused(false)}
        onKeyDown={(event) => {
          if (event.key === " ") {
            event.preventDefault();
            setInteractionPaused((paused) => !paused);
          }
        }}
        style={{
          position: "relative",
          overflow: "hidden",
          height: cyclingClampSize,
          outline: "none",
        }}
      >
        {staticMode ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {renderWord(words[currentIndex] ?? words[0], currentIndex === 0)}
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
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
                justifyContent: "center",
                willChange: "transform, opacity",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {renderWord(words[currentIndex] ?? words[0], currentIndex === 0)}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
