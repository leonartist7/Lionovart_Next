'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { galleryLayout } from '../gallery-layout';
import { cardHandoff } from '../card-handoff';
import { chapterOpacity } from '../chapter-dissolve';
import { serviceGalleryHandoff } from '../service-gallery-handoff';
import styles from './PinnedScene.module.css';
import { useStoryLayout } from './useStoryLayout';

type Chapter = { anchor: HTMLElement; surface: HTMLElement; onActive: (active: boolean) => void };
type Scene = { target: HTMLDivElement | null; staticLayout: boolean; register: (chapter: Chapter) => () => void };
const Context = createContext<Scene | null>(null);
export const usePinnedScene = () => useContext(Context);

/** One physical viewport owns every visual chapter. Document anchors only measure travel. */
export default function PinnedScene({ children, environment }: { children: ReactNode; environment: ReactNode }) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const mount = useCallback((node: HTMLDivElement | null) => { targetRef.current = node; setTarget(node); }, []);
  const { enabled, reason } = useStoryLayout(targetRef);
  const chapters = useRef(new Set<Chapter>());
  const scheduleRef = useRef(() => {});
  const register = useCallback((chapter: Chapter) => {
    chapters.current.add(chapter); scheduleRef.current();
    return () => { chapters.current.delete(chapter); };
  }, []);
  useEffect(() => {
    const root = targetRef.current?.closest<HTMLElement>('[data-service-world]');
    if (!root) return;
    root.dataset.storyStatic = String(!enabled);
    root.dataset.storyLayoutReason = reason;
    window.dispatchEvent(new Event('lionovart:story-layout'));
    return () => { delete root.dataset.storyStatic; delete root.dataset.storyLayoutReason; };
  }, [enabled, reason]);
  useEffect(() => {
    if (!enabled || !target) return;
    let frame = 0;
    let rootRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
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
          opacity = (entering ? Number(Math.max(opening.serviceReveal, opening.expertise) > 0) : chapterOpacity(bounds.top, Math.max(bounds.bottom, innerHeight), innerHeight)) * handoff.services;
          surface.style.setProperty('--service-gallery-copy', String(handoff.serviceCopy));
          surface.dataset.galleryGathering = String(handoff.progress > 0);
          surface.style.setProperty('--service-gallery-gather', String(handoff.gather));
          surface.style.setProperty('--service-gallery-rear', String(handoff.serviceRear));
          surface.style.setProperty('--service-gallery-release', String(handoff.spread));
          const layout = galleryLayout(innerWidth, innerHeight, document.documentElement.clientWidth, rootRem);
          const media = surface.querySelector<HTMLElement>('[data-service-media]');
          if (media) {
            const r = (media.querySelector('[data-position=center] [data-screening-media]') ?? media).getBoundingClientRect();
            const previousY = Number.parseFloat(media.style.translate.split(' ')[1]) || 0;
            const baseY = r.y + r.height / 2 - previousY;
            media.style.translate = `0 ${(layout.gatherY - baseY) * handoff.gather}px`;
            media.style.removeProperty('scale');
          }
        }
        if (handoff && chapter === 'work') {
          opacity = Number(handoff.progress > 0) * chapterOpacity(Math.min(bounds.top, 0), bounds.bottom, innerHeight);
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
    const refreshType = () => { rootRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; schedule(); };
    const resize = new ResizeObserver(refreshType);
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
    window.addEventListener('resize', refreshType);
    window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule);
    void document.fonts.ready.then(schedule); sync();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); fitted.disconnect(); replacements.disconnect(); scheduleRef.current = () => {};
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', refreshType);
      window.removeEventListener('pageshow', schedule); document.removeEventListener('visibilitychange', schedule);
    };
  }, [enabled, target]);
  const context = useMemo(() => ({ target: enabled ? target : null, staticLayout: !enabled, register }), [enabled, target, register]);
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
