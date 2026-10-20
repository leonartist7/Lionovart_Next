'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import styles from './ScreeningRoom.module.css';

export default function CardsServicesTransition({ children }: { children: ReactNode }) {
  const intro = useRef<HTMLDivElement>(null), exit = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = intro.current, runway = exit.current;
    if (!node || !runway) return;
    const media = matchMedia('(prefers-reduced-motion: reduce), (max-height: 560px)');
    let frame = 0;
    const sync = () => {
      frame = 0;
      const bounds = runway.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -bounds.top / Math.max(1, bounds.height) / .5));
      node.style.top = `${innerHeight - node.offsetHeight}px`;
      node.style.opacity = media.matches ? '1' : String(1 - p * p * (3 - 2 * p));
      node.inert = !media.matches && p >= 1;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const observer = new ResizeObserver(schedule); observer.observe(node);
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule);
    media.addEventListener('change', schedule); sync();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); media.removeEventListener('change', schedule); };
  }, []);
  return <div className={styles.cardTransition} data-card-transition data-scroll-manual>
    <div ref={intro} className={styles.cardIntro}>{children}</div>
    <div ref={exit} className={styles.cardExit} data-card-exit aria-hidden="true" />
  </div>;
}
