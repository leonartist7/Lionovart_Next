"use client";

import GoldThreads from "@/components/ui/GoldThreads";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useLionJourney } from "./lion-journey/LionJourney";
import StrongTogetherRibbon from "./strong-together/StrongTogetherRibbon";
import styles from "./StrongTogetherTransition.module.css";

/** The ribbon is the boundary between the two halves of the thought. */
export default function StrongTogetherTransition() {
  const journey = useLionJourney();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const setReveal = journey?.setReveal;
  const setRevealSection = journey?.setRevealSection;

  useEffect(() => {
    setRevealSection?.(sectionRef.current);
    // The light side is already present; the lion backdrop can finish here.
    setReveal?.(1);
    return () => setRevealSection?.(null);
  }, [setReveal, setRevealSection]);

  return (
    <section
      ref={sectionRef}
      id="stronger-together"
      aria-labelledby="strong-together-title"
      data-art-directed="light"
      className={styles.section}
    >
      <GoldThreads />
      <div className={styles.marquee}>
        <StrongTogetherRibbon active reducedMotion={reduceMotion} />
      </div>

      <h2 className={`${styles.alone} font-clash`}>
        <span>STRONG</span>
        <span>ALONE.</span>
      </h2>
      <h2 id="strong-together-title" className={`${styles.together} font-clash`}>
        <span>STRONGER</span>
        <span>TOGETHER.</span>
      </h2>
    </section>
  );
}
