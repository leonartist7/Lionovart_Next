'use client';
import { useEffect, useRef } from 'react';
import CompactIntroduction from './CompactIntroduction';
import styles from './ScreeningRoom.module.css';

/** The studio introduction returns to document flow after the gallery. */
export default function AboutScene() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce), (max-height:560px)');
    let frame = 0, landingFrame = 0, landed = false;
    const sync = () => {
      frame = 0;
      const animated = !preference.matches && document.querySelector<HTMLElement>('[data-service-world]')?.dataset.storyStatic === 'false';
      node.dataset.aboutReveal = String(animated);
      if (!animated) { node.style.removeProperty('clip-path'); node.style.removeProperty('--about-content-y'); node.inert=false; return; }
      const r = node.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight - r.top) / innerHeight));
      const eased = p * p * (3 - 2 * p);
      const radius = Math.hypot(innerWidth, innerHeight) * .72 * eased;
      const centerY = innerHeight * .5 - r.top;
      node.style.clipPath = p >= .999 ? 'none' : `circle(${radius}px at 50% ${centerY}px)`;
      node.style.setProperty('--about-opening-diameter', `${radius * 2}px`);
      node.style.setProperty('--about-opening-y', `${centerY}px`);
      node.style.setProperty('--about-content-y', `${-Math.max(0,r.top)}px`);
      node.style.setProperty('--about-edge-opacity', p > .01 && p < .999 ? '1' : '0');
      node.dataset.aboutProgress = p.toFixed(3);
      node.inert = p < .03;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const land = (event?: Event) => {
      if (event?.type === 'hashchange') landed = false;
      if (landed || location.hash !== '#about' || document.documentElement.dataset.splashComplete !== 'true') return;
      cancelAnimationFrame(landingFrame);
      landingFrame = requestAnimationFrame(() => { landingFrame = requestAnimationFrame(() => {
        landed = true;
        window.scrollTo({ top:scrollY + node.getBoundingClientRect().top - 64, behavior:'instant' });
        schedule();
      }); });
    };
    window.addEventListener('scroll', schedule, { passive:true });
    window.addEventListener('resize', schedule);
    window.addEventListener('lionovart:story-layout', schedule);
    window.addEventListener('hashchange', land);
    window.addEventListener('lionovart:splash-complete', land);
    window.addEventListener('lionovart:story-layout', land);
    preference.addEventListener('change', schedule); sync(); land();
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(landingFrame); window.removeEventListener('hashchange', land); window.removeEventListener('lionovart:splash-complete', land); window.removeEventListener('lionovart:story-layout', land); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.removeEventListener('lionovart:story-layout', schedule); preference.removeEventListener('change', schedule); node.inert=false; };
  }, []);
  return <section ref={section} id="about" className={styles.aboutRunway} data-about-runway
    data-nova-section="about" data-nav-surface="light" data-scroll-title-skip>
    <div className={styles.aboutStage} data-about-stage>
      <CompactIntroduction embedded />
    </div>
  </section>;
}
