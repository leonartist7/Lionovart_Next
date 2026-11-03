"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { emitExperienceCue } from "../experience/experience-cues";
import ClosingCTA from "./ClosingCTA";
import { ClosingRevealContext } from "./ClosingRibbonOrnament";
import { PROCESS_FILM_COPY } from "./process-video-copy";
import styles from "./ProcessLionJourney.module.css";

const STEP_RING = "https://res.cloudinary.com/dgio9uutc/image/upload/v1791549765/steps_1_urfdp7.avif";

/** Natural document flow; the four steps own their motion, independently of the CTA. */
export default function ProcessLionJourney() {
  const { t, locale } = useLanguage();
  const reduced = useHydratedReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = root.current;
    if (!host || reduced !== false) return;
    const rows = [...host.querySelectorAll<HTMLElement>('[data-process-step]')];
    let frame = 0, visible = false;
    let geometry: { row: HTMLElement; center: number; height: number }[] = [];
    const paint = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      const line = innerHeight * .52;
      for (const { row, center, height } of geometry) {
        const y = center - scrollY;
        const emphasis = Math.max(0, 1 - Math.abs(y - line) / Math.max(height, innerHeight * .42));
        const highlighted = emphasis >= .8;
        if (highlighted && row.dataset.highlighted !== 'true') emitExperienceCue('process', row.dataset.stepIndex!, Number(row.dataset.stepIndex));
        row.dataset.highlighted = String(highlighted);
        row.dataset.completed = String(y < line);
        row.style.setProperty('--step-highlight', String(emphasis));
        row.style.transform = `translate3d(${emphasis * (innerWidth < 640 ? 5 : 12)}px,0,0)`;
      }
    };
    const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(paint); };
    const measure = () => {
      geometry = rows.map(row => { const r = row.getBoundingClientRect(); return { row, center: scrollY + r.top + r.height / 2, height: r.height }; });
      schedule();
    };
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    visibility.observe(host);
    const resize = new ResizeObserver(measure); rows.forEach(row => resize.observe(row));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    document.addEventListener('visibilitychange', schedule);
    void document.fonts.ready.then(measure); measure();
    return () => {
      cancelAnimationFrame(frame); visibility.disconnect(); resize.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure);
      document.removeEventListener('visibilitychange', schedule);
      rows.forEach(row => { row.style.removeProperty('transform'); row.style.removeProperty('--step-highlight'); delete row.dataset.highlighted; delete row.dataset.completed; });
    };
  }, [locale, reduced]);
  return <div ref={root} className={styles.journey} data-process-journey data-static={reduced !== false} data-nav-surface="dark">
    <section id="process" data-nova-section="process" className={styles.process} aria-labelledby="process-heading" data-scroll-title-skip data-art-directed="dark">
      <div className={styles.inner}>
        <h2 id="process-heading" className={styles.heading}>{t.process.heading} <span>{t.process.headingAccent}</span></h2>
        <ol className={styles.steps} role="list">
          {PROCESS_FILM_COPY[locale].stages.map((stage, index) => <li key={stage} className={styles.step} data-process-step data-step-index={index}>
            <div className={styles.stepNumber} data-process-number aria-hidden="true">
              <Image src={STEP_RING} alt="" fill sizes="(max-width: 639px) 48px, 80px" className={styles.ring} />
              <span>{index + 1}</span>
            </div>
            <div className={styles.stepCopy}><h3>{stage}</h3><p>{t.process.steps[index].description}</p></div>
          </li>)}
        </ol>
      </div>
    </section>
    <div id="closing-studio" className={styles.closingSurface} data-nova-section="closing-cta">
      <ClosingRevealContext.Provider value={1}><ClosingCTA workShowcase /></ClosingRevealContext.Provider>
    </div>
  </div>;
}
