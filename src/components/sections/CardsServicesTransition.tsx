'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScenePortal, usePinnedScene } from './service-world/PinnedScene';
import { cardHandoff } from './card-handoff';
import { cardBridgeFrame, type BridgeFrame } from './card-bridge';
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
    let fittedMedia: HTMLElement | null = null;
    let bases: BridgeFrame[] = [];
    const sync = () => {
      frame = 0;
      const bounds = runway.getBoundingClientRect();
      const pose = cardHandoff(bounds.top, bounds.height, innerHeight);
      const panels = Array.from(node.querySelectorAll<HTMLElement>('.opening-glass-pane'));
      const portrait = !!node.querySelector('[data-opening-layout=vertical]');
      const targets = Array.from(world?.querySelectorAll<HTMLElement>('[data-service-triptych] [data-exhibit-index]') ?? []);

      node.style.opacity = media.matches ? '1' : String(pose.intro);
      const handoffActive = String(!media.matches && pose.intro === 0);
      if (node.dataset.cardHandoffActive !== handoffActive) {
        node.dataset.cardHandoffActive = handoffActive;
      }
      const artwork = media.matches ? 0 : pose.artwork;
      node.querySelectorAll<HTMLElement>('[data-handoff-surface]').forEach(surface => {
        surface.style.opacity = String(1 - artwork);
        surface.inert = artwork === 1;
      });
      node.querySelectorAll<HTMLElement>('[data-handoff-artwork]').forEach(surface => { surface.style.opacity = String(artwork); });
      // Every incoming frame shares the outgoing frame's geometry and coverage.
      const services = world?.querySelector<HTMLElement>('[data-services-stage]');
      const reveal = media.matches ? 1 : pose.serviceReveal;
      services?.style.setProperty('--service-opening-copy', String(media.matches ? 1 : pose.serviceCopy));
      services?.style.setProperty('--service-opening-expertise', String(media.matches ? 1 : pose.expertise));
      services?.style.setProperty('--service-opening-sides', String(media.matches ? 1 : pose.serviceSides));
      const triptych = services?.querySelector<HTMLElement>('[data-service-triptych]');
      const centerMedia = triptych?.querySelector<HTMLElement>('[data-position=center] [data-screening-media]');
      if (centerMedia !== fittedMedia) {
        geometry.disconnect(); fittedMedia = centerMedia ?? null;
        if (fittedMedia) geometry.observe(fittedMedia);
      }
      triptych?.querySelectorAll<SVGElement>('[data-service-merge-cutoff]').forEach(cutoff => {
        cutoff.setAttribute('intercept', String((cutoff.dataset.serviceMergeCutoff === 'edge' ? 1.24 : 1) - (1 - reveal) * 14));
      });
      if (centerMedia) {
        centerMedia.style.filter = 'none';
        centerMedia.style.opacity = String(reveal);
      }
      node.style.setProperty('--handoff-proof', String(media.matches ? 1 : pose.proof));
      // Keep the reading face clickable through its transport and hold.
      // It retires only once no painted content remains.
      node.inert = !media.matches && pose.intro === 0;
      node.style.setProperty('--handoff-sculpture', String(media.matches ? 1 : pose.sculpture));
      node.style.setProperty('--handoff-lift', `${media.matches ? 0 : -24 * pose.focus}px`);
      copy.style.visibility = media.matches || Math.max(pose.copy, pose.brand) > .001 ? 'visible' : 'hidden';
      for (const beat of ['lead', 'main', 'necessity', 'brand'] as const) {
        const element = copy.querySelector<HTMLElement>(`[data-brand-beat=${beat}]`);
        if (!element) continue;
        const presence = media.matches ? 1 : pose[beat];
        element.style.opacity = String(presence);
        element.setAttribute('aria-hidden', String(presence === 0));
      }
      const pointerPlane = node.querySelector<HTMLElement>('[data-opening-pointer]');
      if (pointerPlane) pointerPlane.style.setProperty('--handoff-pointer', String(media.matches ? 0 : pose.pointer));
      runway.dataset.handoffProgress = pose.progress.toFixed(3);
      // A direct jump can reach this beat one frame before the shared scene
      // has unfolded the service triptych. Measure its settled target geometry.
      if (!media.matches && pose.progress > 0 && pose.progress < 1 && world?.querySelector<HTMLElement>('[data-services-stage]')?.dataset.galleryGathering === 'true') { schedule(); return; }
      const enteringBackwards = previous >= 1 && pose.progress < 1;
      const startingHandoff = previous === 0 && pose.progress > 0;
      previous = pose.progress;
      if (media.matches || pose.progress < 1 || startingHandoff || enteringBackwards || bases.length !== panels.length) {
        panels.forEach(panel => {
          panel.style.removeProperty('--handoff-x'); panel.style.removeProperty('--handoff-y'); panel.style.removeProperty('--handoff-scale');
          panel.style.removeProperty('--handoff-depth');
          panel.style.removeProperty('--handoff-rotate');
          panel.style.removeProperty('--handoff-word-x'); panel.style.removeProperty('--handoff-word-y');
        });
        bases = panels.map(panel => {
          const r = panel.getBoundingClientRect();
          const style = getComputedStyle(panel);
          const motion = new DOMMatrixReadOnly(style.transform);
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height,
            parentX: r.width / Math.max(1, parseFloat(style.width)), parentY: r.height / Math.max(1, parseFloat(style.height)), motionX: motion.m41, motionY: motion.m42 };
        });
      }
      if (media.matches || !pose.progress) return;
      // A measured frame fits the service media without a flip. Artwork counter-
      // scales uniformly inside its crop while the outer frame changes aspect.
      panels.forEach((panel, index) => {
        const base = bases[index];
        const position = index === 0 ? 'left' : index === 1 ? 'center' : 'right';
        const target = targets.find(el => el.dataset.position === position);
        if (!base || !target) return;
        const r = (target.querySelector('[data-screening-media]') ?? target).getBoundingClientRect();
        const turns = false;
        const inset = innerWidth < 768 && index !== 1 ? (index === 0 ? Math.min(32, innerWidth * .08) : -Math.min(24, innerWidth * .06)) * pose.move * (1 - pose.fit) : 0;
        // The service target already raises both rear cards equally.
        const lift = 0;
        // On a horizontal row, height and centre travel together so a tall
        // card never rises above the viewport before it has become a frame.
        const horizontalMove = portrait ? pose.move : pose.move * .4 + pose.fit * .6;
        const bridge = cardBridgeFrame(base, { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height }, horizontalMove, pose.fit, turns, lift, inset, portrait ? pose.move : pose.fit);
        panel.style.setProperty('--handoff-x', `${bridge.x}px`);
        panel.style.setProperty('--handoff-y', `${bridge.y}px`);
        panel.style.setProperty('--handoff-scale', `${bridge.sx} ${bridge.sy}`);
        panel.style.setProperty('--handoff-rotate', `${bridge.angle}deg`);
        panel.style.setProperty('--handoff-word-x', String(1 / bridge.sx));
        panel.style.setProperty('--handoff-word-y', String(1 / bridge.sy));
        const coverScale = Math.max(bridge.sx, bridge.sy);
        const image = panel.querySelector<HTMLElement>('[data-handoff-artwork] img');
        if (image) image.style.transform = `scale(${coverScale / bridge.sx},${coverScale / bridge.sy})`;
        // Match the service triptych's center-first depth before it dissolves in.
        // The target bounds already include its perspective: scaling to those
        // bounds preserves the fixed panel outline without a second projection.
        panel.style.setProperty('--handoff-depth', String(index === 1 ? 1 : (1 - .38 * pose.move) * pose.rear));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const resize = () => { bases = []; schedule(); };
    const observer = new ResizeObserver(resize); observer.observe(node);
    const geometry = new ResizeObserver(schedule);
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
      node.querySelectorAll<HTMLElement>('[data-handoff-surface]').forEach(surface => { surface.style.opacity = ''; surface.inert = false; });
      cancelAnimationFrame(frame); observer.disconnect(); geometry.disconnect(); replacements.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize); media.removeEventListener('change', resize); };
  }, [scene?.target]);
  return <div className={styles.cardTransition} data-card-transition data-scroll-manual>
    <div ref={intro} className={styles.cardIntro}>{children}</div>
    <ScenePortal><div ref={message} className={styles.shapingMessage} data-shaping-message data-scroll-title-skip>
      <div className={styles.brandStatement}>
        <p data-brand-beat="lead">{locale === 'fr' ? 'Pour mener le changement,' : 'To lead today,'}</p>
        <h2><span data-brand-beat="main">{locale === 'fr' ? 'l’innovation n’est pas une option.' : 'innovation isn’t optional.'}</span>
          <span data-brand-beat="necessity" className={styles.necessity}>{locale === 'fr' ? 'C’est une nécessité.' : 'It’s a necessity.'}</span></h2>
      </div>
      <p data-brand-beat="brand" className={styles.brandSignature}>LIONOVART</p>
    </div></ScenePortal>
    <div ref={exit} className={styles.cardExit} data-card-exit aria-hidden="true" />
  </div>;
}
