'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScenePortal, usePinnedScene } from './service-world/PinnedScene';
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
    const media = matchMedia('(prefers-reduced-motion: reduce), (max-height: 560px)');
    let frame = 0, previous = 0;
    let bases: { x: number; y: number; width: number; height: number; scale: number }[] = [];
    const sync = () => {
      frame = 0;
      const bounds = runway.getBoundingClientRect();
      const pose = cardHandoff(bounds.top, bounds.height, innerHeight);
      const panels = Array.from(node.querySelectorAll<HTMLElement>('.opening-glass-pane'));
      const targets = Array.from(world?.querySelectorAll<HTMLElement>('[data-service-triptych] [data-exhibit-index]') ?? []);

      node.style.opacity = media.matches ? '1' : String(pose.intro);
      node.style.setProperty('--handoff-content', String(media.matches ? 1 : pose.content));
      node.style.setProperty('--handoff-proof', String(media.matches ? 1 : pose.proof));
      node.inert = !media.matches && pose.progress > .12;
      copy.style.opacity = String(media.matches ? 0 : pose.copy);
      copy.style.visibility = !media.matches && pose.copy > .001 ? 'visible' : 'hidden';
      runway.dataset.handoffProgress = pose.progress.toFixed(3);
      const enteringBackwards = previous >= 1 && pose.progress < 1;
      previous = pose.progress;
      if (media.matches || pose.progress === 0 || enteringBackwards || bases.length !== panels.length) {
        panels.forEach(panel => {
          panel.style.removeProperty('--handoff-x'); panel.style.removeProperty('--handoff-y'); panel.style.removeProperty('--handoff-scale');
          panel.style.removeProperty('--handoff-depth');
        });
        bases = panels.map(panel => {
          const r = panel.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height,
            scale: r.width / Math.max(1, panel.offsetWidth) };
        });
      }
      if (media.matches || !pose.progress) return;
      // Reuse the original three faces. Transport is translation + uniform
      // scale only; content dissolves as they reach the service exhibit slots.
      panels.forEach((panel, index) => {
        const base = bases[index];
        const position = index === 0 ? 'left' : index === 1 ? 'center' : 'right';
        const target = targets.find(el => el.dataset.position === position);
        if (!base || !target) return;
        const r = target.getBoundingClientRect();
        const scale = Math.min(1, r.width / Math.max(1, base.width), r.height / Math.max(1, base.height));
        panel.style.setProperty('--handoff-x', `${(r.x + r.width / 2 - base.x) * pose.move / base.scale}px`);
        panel.style.setProperty('--handoff-y', `${(r.y + r.height / 2 - base.y) * pose.move / base.scale}px`);
        panel.style.setProperty('--handoff-scale', String(1 + (scale - 1) * pose.move));
        // Match the service triptych's center-first depth before it dissolves in.
        // The target bounds already include its perspective: scaling to those
        // bounds preserves the fixed panel outline without a second projection.
        panel.style.setProperty('--handoff-depth', String(index === 1 ? 1 : 1 - .38 * pose.move));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const resize = () => { bases = []; schedule(); };
    const observer = new ResizeObserver(resize); observer.observe(node);
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', resize);
    media.addEventListener('change', resize); void document.fonts.ready.then(resize); sync();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize); media.removeEventListener('change', resize); };
  }, [scene?.target]);
  return <div className={styles.cardTransition} data-card-transition data-scroll-manual>
    <div ref={intro} className={styles.cardIntro}>{children}</div>
    <ScenePortal><div ref={message} className={styles.shapingMessage} data-shaping-message data-scroll-title-skip>
      <h2>{locale === 'fr' ? 'Façonner l’avenir de votre entreprise.' : 'Shaping what comes next for your business.'}</h2>
      <span>{locale === 'fr' ? 'Par la stratégie, le design et les expériences.' : 'Through strategy, design and experiences.'}</span>
    </div></ScenePortal>
    <div ref={exit} className={styles.cardExit} data-card-exit aria-hidden="true" />
  </div>;
}
