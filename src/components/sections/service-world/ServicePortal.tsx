'use client';

import { useEffect, useRef } from 'react';
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
  const ring = useRef<HTMLDivElement>(null), fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = scene?.target, node = ring.current;
    if (!target || !node) return;
    const world = target.closest('[data-service-world]');
    let frame = 0, disposed = false;
    const sync = () => {
      frame = 0;
      const gallery = world?.querySelector('[data-gallery-runway]')?.getBoundingClientRect();
      const anchor = world?.querySelector('[data-service-podium-anchor]')?.getBoundingClientRect();
      if (!gallery || !anchor || document.hidden) { node.style.visibility = 'hidden'; return; }
      const h = innerHeight, w = document.documentElement.clientWidth;
      const layout = galleryLayout(innerWidth, h, w);
      const diameter = galleryRingDiameter(layout);
      const handoff = serviceGalleryHandoff(gallery.top, h);
      const pairs = Number(world?.querySelector('[data-gallery-rows]')?.getAttribute('data-gallery-rows')) || 5;
      const pose = galleryRingPose(galleryProgress(gallery.top, gallery.height, h), 0, pairs);
      const exit = world?.querySelector('[data-card-exit]')?.getBoundingClientRect();
      const opening = exit ? cardHandoff(exit.top, exit.height, h).serviceCopy : 1;
      const lift = handoff.portalLift, pass = handoff.portalPass;
      const door = Math.min(w * .84, h * .70);
      const x = mix(anchor.x + anchor.width / 2, w / 2, lift);
      const y = mix(mix(anchor.y + anchor.height / 2, h * .44, lift), h * layout.panelTop / 100 + 25, pass);
      const size = mix(mix(anchor.width, door, lift), diameter, pass);
      const angle = Math.acos(Math.min(1, anchor.height / Math.max(1, anchor.width))) * 180 / Math.PI * (1 - lift);
      const opacity = mix(mix(.62 * opening, .9, lift), pose.opacity, pass);
      node.style.width = `${diameter}px`;
      node.style.left = `${x}px`; node.style.top = `${y}px`;
      node.style.transform = `translate(-50%,-50%) translateZ(${pose.z * pass}px) rotateX(${angle}deg) scale(${size / diameter})`;
      node.style.opacity = String(opacity);
      node.style.visibility = opacity > .001 ? 'visible' : 'hidden';
      node.dataset.portalProgress = handoff.progress.toFixed(3);
      if (fill.current) fill.current.style.opacity = String(1 - handoff.portalOpen);
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(sync); };
    const resize = new ResizeObserver(schedule);
    if (world) resize.observe(world);
    const mutations = new MutationObserver(schedule);
    if (world) mutations.observe(world, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule);
    void document.fonts.ready.then(schedule); sync();
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); mutations.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule); document.removeEventListener('visibilitychange', schedule);
    };
  }, [scene?.target]);
  if (!scene?.target) return null;
  return <ScenePortal><div className={styles.space} data-service-portal aria-hidden="true">
    <div ref={ring} className={styles.ring} data-gallery-ring="0" data-service-podium>
      <div ref={fill} className={styles.fill} />
    </div>
  </div></ScenePortal>;
}
