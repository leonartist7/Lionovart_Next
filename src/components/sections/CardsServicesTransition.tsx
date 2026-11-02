'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScenePortal, usePinnedScene } from './service-world/PinnedScene';
import { STORY_STATIC_QUERY } from './gallery-layout';
import { cardHandoff } from './card-handoff';
import styles from './ScreeningRoom.module.css';

export default function CardsServicesTransition({ children }: { children: ReactNode }) {
  const scene = usePinnedScene();
  const intro = useRef<HTMLDivElement>(null), exit = useRef<HTMLDivElement>(null);
  const message = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  useEffect(() => {
    const node = (scene?.target?.querySelector('[data-scene-opening]') ?? intro.current) as HTMLElement | null, runway = exit.current, copy = message.current;
    if (!node || !runway || !copy) return;
    const world = node.closest('[data-service-world]');
    const media = matchMedia(STORY_STATIC_QUERY);
    let frame = 0;
    const sync = () => {
      frame = 0;
      const isStatic = scene?.staticLayout ?? media.matches;
      const bounds = runway.getBoundingClientRect();
      const pose = cardHandoff(bounds.top, bounds.height, innerHeight);
      node.style.opacity = isStatic ? '1' : String(pose.intro);
      const handoffActive = String(!isStatic && pose.intro === 0);
      if (node.dataset.cardHandoffActive !== handoffActive) {
        node.dataset.cardHandoffActive = handoffActive;
      }
      const retreat = isStatic ? 0 : pose.retreat;
      node.style.setProperty('--handoff-scale', String(1 - .09 * retreat));
      node.style.setProperty('--handoff-y', `${-1.25 * retreat}rem`);
      const services = world?.querySelector<HTMLElement>('[data-services-stage]');
      const reveal = isStatic ? 1 : pose.serviceReveal;
      services?.style.setProperty('--service-opening-copy', String(isStatic ? 1 : pose.serviceCopy));
      services?.style.setProperty('--service-opening-expertise', String(isStatic ? 1 : pose.expertise));
      services?.style.setProperty('--service-opening-sides', String(isStatic ? 1 : pose.serviceSides));
      const triptych = services?.querySelector<HTMLElement>('[data-service-triptych]');
      const centerMedia = triptych?.querySelector<HTMLElement>('[data-position=center] [data-screening-media]');
      if (centerMedia) {
        centerMedia.style.filter = 'none';
        centerMedia.style.opacity = String(reveal);
        triptych?.style.setProperty('--service-entrance-y', `${1.1 * (1 - reveal)}rem`);
      }
      node.style.setProperty('--handoff-proof', String(isStatic ? 1 : pose.proof));
      // Keep the reading face clickable through its transport and hold.
      // It retires only once no painted content remains.
      node.inert = !isStatic && pose.intro === 0;
      node.style.setProperty('--handoff-sculpture', String(isStatic ? 1 : pose.sculpture));
      node.style.setProperty('--handoff-lift', `${isStatic ? 0 : -24 * pose.focus}px`);
      copy.style.visibility = isStatic || Math.max(pose.copy, pose.brand) > .001 ? 'visible' : 'hidden';
      for (const beat of ['lead', 'main', 'necessity', 'brand'] as const) {
        const element = copy.querySelector<HTMLElement>(`[data-brand-beat=${beat}]`);
        if (!element) continue;
        const presence = isStatic ? 1 : pose[beat];
        element.style.opacity = String(presence);
        element.setAttribute('aria-hidden', String(presence === 0));
      }
      const pointerPlane = node.querySelector<HTMLElement>('[data-opening-pointer]');
      if (pointerPlane) pointerPlane.style.setProperty('--handoff-pointer', String(isStatic ? 0 : pose.pointer));
      runway.dataset.handoffProgress = pose.progress.toFixed(3);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const resize = schedule;
    const observer = new ResizeObserver(resize); observer.observe(node);
    const replacements = new MutationObserver(schedule);
    if (world) replacements.observe(world, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', resize);
    media.addEventListener('change', resize); void document.fonts.ready.then(resize); sync();
    return () => {
      world?.querySelector<HTMLElement>('[data-services-stage]')?.style.removeProperty('--service-opening-copy');
      world?.querySelector<HTMLElement>('[data-services-stage]')?.style.removeProperty('--service-opening-expertise');
      world?.querySelector<HTMLElement>('[data-services-stage]')?.style.removeProperty('--service-opening-sides');
      world?.querySelectorAll<HTMLElement>('[data-service-triptych] [data-screening-media]').forEach(el => { el.style.removeProperty('filter'); el.style.removeProperty('opacity'); });
      node.style.opacity = ''; node.inert = false; delete node.dataset.cardHandoffActive;
      node.style.removeProperty('--handoff-scale'); node.style.removeProperty('--handoff-y');
      world?.querySelector<HTMLElement>('[data-service-triptych]')?.style.removeProperty('--service-entrance-y');
      cancelAnimationFrame(frame); observer.disconnect(); replacements.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize); media.removeEventListener('change', resize); };
  }, [scene?.target, scene?.staticLayout]);
  return <div className={styles.cardTransition} data-card-transition data-scroll-manual>
    <div ref={intro} className={styles.cardIntro}>{children}</div>
    <ScenePortal><div ref={message} className={styles.shapingMessage} data-shaping-message data-scroll-title-skip>
      <div className={styles.brandStatement} data-brand-statement>
        <p data-brand-beat="lead">{locale === 'fr' ? 'Pour mener le changement,' : 'To lead today,'}</p>
        <h2><span data-brand-beat="main">{locale === 'fr' ? 'l’innovation n’est pas une option.' : 'innovation isn’t optional.'}</span>
          <span data-brand-beat="necessity" className={styles.necessity}>{locale === 'fr' ? 'C’est une nécessité.' : 'It’s a necessity.'}</span></h2>
      </div>
      <p data-brand-beat="brand" className={styles.brandSignature}>LIONOVART</p>
    </div></ScenePortal>
    <div ref={exit} className={styles.cardExit} data-card-exit aria-hidden="true" />
  </div>;
}
