'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { galleryTitlePose } from '../gallery-journey';
import { ScenePortal, usePinnedScene } from './PinnedScene';
import { cardHandoff } from '../card-handoff';
import { galleryLayout, galleryRingDiameter } from '../gallery-layout';
import { galleryProgress, galleryRingPose } from '../gallery-journey';
import { serviceGalleryHandoff } from '../service-gallery-handoff';
import styles from './ServicePortal.module.css';

const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** The service podium and the first row's world are one physical surface. */
export default function ServicePortal() {
  const scene = usePinnedScene();
  const { locale } = useLanguage();
  const invitation = useRef<HTMLElement>(null), face = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null), fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = scene?.target, node = ring.current;
    if (!target || !node) return;
    const world = target.closest('[data-service-world]');
    let frame = 0, disposed = false;
    let rootRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const sync = () => {
      frame = 0;
      const gallery = world?.querySelector('[data-gallery-runway]')?.getBoundingClientRect();
      const anchor = world?.querySelector('[data-service-podium-anchor]')?.getBoundingClientRect();
      if (!gallery || !anchor || document.hidden) { node.style.visibility = 'hidden'; return; }
      const h = innerHeight, w = document.documentElement.clientWidth;
      const layout = galleryLayout(innerWidth, h, w, rootRem);
      const diameter = galleryRingDiameter(layout);
      const handoff = serviceGalleryHandoff(gallery.top, h);
      const pairs = Number(world?.querySelector('[data-gallery-rows]')?.getAttribute('data-gallery-rows')) || 5;
      const pose = galleryRingPose(galleryProgress(gallery.top, gallery.height, h), 0, pairs);
      const exit = world?.querySelector('[data-card-exit]')?.getBoundingClientRect();
      const opening = exit ? cardHandoff(exit.top, exit.height, h).serviceCopy : 1;
      const lift = handoff.podiumLift, pass = handoff.portalPass;
      const door = Math.min(w * .84, h * .70);
      const x = mix(anchor.x + anchor.width / 2, w / 2, lift);
      const y = mix(mix(anchor.y + anchor.height / 2, h * .44, lift), h * layout.panelTop / 100 + 25, pass);
      const size = mix(mix(anchor.width, door, lift), diameter, pass);
      const angle = Math.acos(Math.min(1, anchor.height / Math.max(1, anchor.width))) * 180 / Math.PI * (1 - handoff.podiumFace);
      const opacity = mix(mix(.62 * opening, 1, lift), pose.opacity, pass);
      // Size changes only when viewport/type geometry changes, never per scroll frame.
      const diameterStyle = `${diameter}px`;
      if (node.style.width !== diameterStyle) node.style.width = diameterStyle;
      node.style.transform = `translate3d(${x}px,${y}px,${pose.z * pass}px) translate(-50%,-50%) scale(${size / diameter})`;
      // Flatten the face inside its carrier before corridor perspective is applied.
      // Otherwise a nearly horizontal disc projects far beyond its measured anchor.
      if (face.current) face.current.style.transform = `rotateX(${angle}deg)`;
      node.style.opacity = String(opacity);
      node.style.visibility = opacity > .001 ? 'visible' : 'hidden';
      node.dataset.portalProgress = handoff.progress.toFixed(3);
      if (fill.current) fill.current.style.opacity = String(1 - handoff.portalOpen);
      if (invitation.current) {
        const title = galleryTitlePose(handoff.progress);
        invitation.current.style.opacity = String(title.opacity);
        invitation.current.style.transform = `translateY(calc(-50% + ${title.y}px))`;
        invitation.current.style.visibility = title.opacity > .001 ? 'visible' : 'hidden';
        invitation.current.setAttribute('aria-hidden', String(title.opacity <= .001));
      }
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(sync); };
    const refreshType = () => { rootRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; schedule(); };
    const resize = new ResizeObserver(refreshType);
    if (world) resize.observe(world);
    const mutations = new MutationObserver(schedule);
    if (world) mutations.observe(world, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', refreshType);
    window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule);
    void document.fonts.ready.then(schedule); sync();
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); mutations.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', refreshType);
      window.removeEventListener('pageshow', schedule); document.removeEventListener('visibilitychange', schedule);
    };
  }, [scene?.target]);
  if (!scene?.target) return null;
  return <ScenePortal><div className={styles.space} data-service-portal>
    <div ref={ring} className={styles.carrier} data-service-podium aria-hidden="true">
      <div ref={face} className={styles.ring} data-gallery-ring="0">
        <div ref={fill} className={styles.fill} />
      </div>
    </div>
    <header ref={invitation} className={styles.invitation} data-gallery-title aria-hidden="true">
      <p>{locale === 'fr' ? 'Entrez dans l’univers' : 'Step inside'}</p>
      <h2 id="selected-work-heading">{locale === 'fr' ? 'de nos réalisations' : 'our selected work'}</h2>
    </header>
  </div></ScenePortal>;
}
