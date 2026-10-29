'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { galleryLayout, GALLERY_ENTRY_PROJECTION } from '../gallery-layout';
import { cardHandoff } from '../card-handoff';
import { chapterOpacity } from '../chapter-dissolve';
import { serviceGalleryHandoff } from '../service-gallery-handoff';
import styles from './PinnedScene.module.css';

type Chapter = { anchor: HTMLElement; surface: HTMLElement; onActive: (active: boolean) => void };
type Scene = { target: HTMLDivElement | null; register: (chapter: Chapter) => () => void };
const Context = createContext<Scene | null>(null);
export const usePinnedScene = () => useContext(Context);

/** One physical viewport owns every visual chapter. Document anchors only measure travel. */
export default function PinnedScene({ children, environment }: { children: ReactNode; environment: ReactNode }) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const mount = useCallback((node: HTMLDivElement | null) => { targetRef.current = node; setTarget(node); }, []);
  const [enabled, setEnabled] = useState(false);
  const chapters = useRef(new Set<Chapter>());
  const scheduleRef = useRef(() => {});
  const register = useCallback((chapter: Chapter) => {
    chapters.current.add(chapter); scheduleRef.current();
    return () => { chapters.current.delete(chapter); };
  }, []);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce), (max-height: 560px)');
    const sync = () => setEnabled(!query.matches);
    sync(); query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!enabled || !target) return;
    let frame = 0;
    const sync = () => {
      frame = 0;
      let current = 'opening';
      const root = target.closest('[data-service-world]');
      const gallery = root?.querySelector<HTMLElement>('[data-gallery-runway]');
      const exit = root?.querySelector<HTMLElement>('[data-card-exit]')?.getBoundingClientRect();
      const opening = exit ? cardHandoff(exit.top, exit.height, innerHeight) : null;
      const handoff = gallery ? serviceGalleryHandoff(gallery.getBoundingClientRect().top, innerHeight) : null;
      for (const { anchor, surface, onActive } of chapters.current) {
        const bounds = anchor.getBoundingClientRect();
        const chapter = surface.dataset.sceneChapter;
        let opacity = chapterOpacity(bounds.top, bounds.bottom, innerHeight);
        if (handoff && chapter === 'services') {
          // Media reveal owns the entrance; its field must not be multiplied
          // by the generic chapter fade. Copy/atmosphere have a separate gate.
          const entering = opening && opening.progress < 1;
          opacity = (entering ? Number(opening.serviceReveal > 0) : chapterOpacity(bounds.top, Math.max(bounds.bottom, innerHeight), innerHeight)) * handoff.services;
          surface.style.setProperty('--service-gallery-copy', String(handoff.serviceCopy));
          surface.dataset.galleryGathering = String(handoff.progress > 0);
          surface.style.setProperty('--service-gallery-gather', String(handoff.gather));
          surface.style.setProperty('--service-gallery-rear', String(handoff.serviceRear));
          surface.style.setProperty('--service-gallery-release', String(handoff.spread));
          const layout = galleryLayout(innerWidth, innerHeight, document.documentElement.clientWidth);
          surface.style.setProperty('--service-release-x', `${layout.entryX / GALLERY_ENTRY_PROJECTION}px`);
          surface.style.setProperty('--service-release-y', `${layout.y / GALLERY_ENTRY_PROJECTION}px`);
          const media = surface.querySelector<HTMLElement>('[data-service-media]');
          if (media) {
            const r = (media.querySelector('[data-position=center] [data-screening-media]') ?? media).getBoundingClientRect();
            const previousY = Number.parseFloat(media.style.translate.split(' ')[1]) || 0;
            // Remove the front card's release as well as the group's previous
            // translation; otherwise recentering would cancel its upward travel.
            const baseY = r.y + r.height / 2 - previousY + layout.y / GALLERY_ENTRY_PROJECTION * handoff.spread;
            media.style.translate = `0 ${((layout.gatherY - baseY) * handoff.gather) + (layout.vertical ? 0 : innerHeight * .02 / GALLERY_ENTRY_PROJECTION * handoff.spread)}px`;
            media.style.removeProperty('scale');
          }
        }
        if (handoff && chapter === 'work') {
          opacity = Math.max(handoff.title, handoff.gallery) * chapterOpacity(Math.min(bounds.top, 0), bounds.bottom, innerHeight);
          surface.style.setProperty('--gallery-arrival-media', String(handoff.gallery));
          surface.dataset.galleryEntry = handoff.progress.toFixed(3);
        }
        const interactive = chapter === 'services' ? (!opening || opening.serviceCopy > .8) && (!handoff || handoff.progress < .04) : chapter === 'work' ? !handoff || handoff.spread > .99 : true;
        const active = opacity > .5 && interactive && !document.hidden;
        surface.style.opacity = String(opacity);
        surface.style.visibility = opacity > .001 ? 'visible' : 'hidden';
        surface.style.pointerEvents = active ? 'auto' : 'none';
        surface.inert = !active;
        surface.dataset.chapterActive = String(active);
        if (opacity > .5) current = surface.dataset.sceneChapter ?? current;
        onActive(active);
      }
      if (targetRef.current) targetRef.current.dataset.activeChapter = current;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    scheduleRef.current = schedule;
    const resize = new ResizeObserver(schedule);
    const fitted = new ResizeObserver(schedule);
    let measured: Element | null = null;
    const refresh = () => {
      const next = target.querySelector('[data-services-stage] [data-position=center] [data-screening-media]');
      if (next === measured) return;
      fitted.disconnect(); measured = next;
      if (measured) fitted.observe(measured);
      schedule();
    };
    const replacements = new MutationObserver(refresh);
    replacements.observe(target, { childList: true, subtree: true });
    refresh();
    const root = target.closest('[data-service-world]');
    if (root) resize.observe(root);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule);
    void document.fonts.ready.then(schedule); sync();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); fitted.disconnect(); replacements.disconnect(); scheduleRef.current = () => {};
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule); document.removeEventListener('visibilitychange', schedule);
    };
  }, [enabled, target]);
  const context = useMemo(() => ({ target: enabled ? target : null, register }), [enabled, target, register]);
  return <Context.Provider value={context}>
    <div className={styles.viewport} data-pinned-scene data-pinned={enabled}>
      {environment}
      <div ref={mount} className={styles.layers} data-scene-layers />
    </div>
    <div className={styles.runways} data-scene-runways data-pinned={enabled}>{children}</div>
  </Context.Provider>;
}

/** React context follows the portal; visual surfaces share one containing block. */
export function ScenePortal({ children }: { children: ReactNode }) {
  const scene = usePinnedScene();
  return scene?.target ? createPortal(children, scene.target) : children;
}
