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
type Scene = { cardSlots: readonly (HTMLElement | null)[]; registerCardSlot: (index: number, slot: HTMLElement | null) => void; target: HTMLDivElement | null; staticLayout: boolean; register: (chapter: Chapter) => () => void };
const Context = createContext<Scene | null>(null);
export const usePinnedScene = () => useContext(Context);

/** One physical viewport owns every visual chapter. Document anchors only measure travel. */
export default function PinnedScene({ children, environment }: { children: ReactNode; environment: ReactNode }) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [cardSlots, setCardSlots] = useState<readonly (HTMLElement | null)[]>([null, null, null]);
  const registerCardSlot = useCallback((index: number, slot: HTMLElement | null) => {
    setCardSlots(previous => {
      if (previous[index] === slot) return previous;
      const next = [...previous]; next[index] = slot; return next;
    });
  }, []);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const mount = useCallback((node: HTMLDivElement | null) => { targetRef.current = node; setTarget(node); }, []);
  const { enabled, reason } = useStoryLayout(targetRef);
  const chapters = useRef(new Set<Chapter>());
  const scheduleRef = useRef(() => {});
  const register = useCallback((chapter: Chapter) => {
    chapters.current.add(chapter); scheduleRef.current();
    return () => { chapters.current.delete(chapter); scheduleRef.current(); };
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
    const root = target.closest('[data-service-world]');
    let dirty = true, reads = 0;
    let exitBounds: { top: number; height: number } | null = null;
    let galleryTop: number | null = null;
    let media: HTMLElement | null = null;
    let gatherOffset = 0;
    const bounds = new Map<Chapter, { top: number; bottom: number }>();
    const activeStates = new WeakMap<HTMLElement, boolean>();
    // Runways stay in document flow. Read them together only when layout changes,
    // before any scene writes; native scroll then needs only cached coordinates.
    const measure = () => {
      dirty = false;
      const y = scrollY;
      const exit = root?.querySelector<HTMLElement>('[data-card-exit]')?.getBoundingClientRect();
      exitBounds = exit ? { top: y + exit.top, height: exit.height } : null;
      const gallery = root?.querySelector<HTMLElement>('[data-gallery-runway]')?.getBoundingClientRect();
      galleryTop = gallery ? y + gallery.top : null;
      bounds.clear();
      for (const chapter of chapters.current) {
        const box = chapter.anchor.getBoundingClientRect();
        bounds.set(chapter, { top: y + box.top, bottom: y + box.bottom });
      }
      const rootRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const layout = galleryLayout(innerWidth, innerHeight, document.documentElement.clientWidth, rootRem);
      media = target.querySelector<HTMLElement>('[data-services-stage] [data-service-media]');
      if (media) {
        const frame = (media.querySelector('[data-position=center] [data-service-frame-target], [data-position=center] [data-screening-media]') ?? media).getBoundingClientRect();
        const previousY = Number.parseFloat(media.style.translate.split(' ')[1]) || 0;
        gatherOffset = layout.gatherY - (frame.y + frame.height / 2 - previousY);
      }
      target.dataset.geometryReads = String(++reads);
    };
    const sync = () => {
      frame = 0;
      if (dirty) measure();
      let current = 'opening';
      const y = scrollY;
      const opening = exitBounds ? cardHandoff(exitBounds.top - y, exitBounds.height, innerHeight) : null;
      const handoff = galleryTop !== null ? serviceGalleryHandoff(galleryTop - y, innerHeight) : null;
      for (const registered of chapters.current) {
        const { surface, onActive } = registered;
        const cached = bounds.get(registered);
        if (!cached) continue;
        const top = cached.top - y, bottom = cached.bottom - y;
        const chapter = surface.dataset.sceneChapter;
        let opacity = chapterOpacity(top, bottom, innerHeight);
        if (handoff && chapter === 'services') {
          // Media reveal owns the entrance; its field must not be multiplied
          // by the generic chapter fade. Copy/atmosphere have a separate gate.
          const entering = opening && opening.progress < 1;
          opacity = (entering ? Number(Math.max(opening.serviceReveal, opening.expertise) > 0) : chapterOpacity(top, Math.max(bottom, innerHeight), innerHeight)) * handoff.services;
          surface.style.setProperty('--service-gallery-copy', String(handoff.serviceCopy));
          surface.dataset.galleryGathering = String(handoff.progress > 0);
          surface.style.setProperty('--service-gallery-gather', String(handoff.gather));
          surface.style.setProperty('--service-gallery-rear', String(handoff.serviceRear));
          surface.style.setProperty('--service-gallery-release', String(handoff.spread));
          if (media) {
            media.style.translate = `0 ${gatherOffset * handoff.gather}px`;
            media.style.removeProperty('scale');
          }
        }
        if (handoff && chapter === 'work') {
          opacity = Number(handoff.progress > 0) * chapterOpacity(Math.min(top, 0), bottom, innerHeight);
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
        if (activeStates.get(surface) !== active) {
          activeStates.set(surface, active); onActive(active);
        }
      }
      if (targetRef.current) targetRef.current.dataset.activeChapter = current;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const refreshGeometry = () => { dirty = true; schedule(); };
    scheduleRef.current = refreshGeometry;
    const resize = new ResizeObserver(refreshGeometry);
    const fitted = new ResizeObserver(refreshGeometry);
    let measured: Element | null = null;
    const refresh = () => {
      const next = target.querySelector('[data-services-stage] [data-position=center] [data-service-frame-target], [data-services-stage] [data-position=center] [data-screening-media]');
      refreshGeometry();
      if (next === measured) return;
      fitted.disconnect(); measured = next;
      if (measured) fitted.observe(measured);
      schedule();
    };
    const replacements = new MutationObserver(refresh);
    replacements.observe(target, { childList: true, subtree: true });
    refresh();
    // The viewport can resize with mobile browser chrome without changing the
    // svh runways or the world's flow height. Refresh cached scene geometry too.
    resize.observe(target);
    if (root) resize.observe(root);
    for (const { anchor } of chapters.current) resize.observe(anchor);
    const locale = new MutationObserver(refreshGeometry);
    locale.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'style', 'class'] });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', refreshGeometry);
    window.addEventListener('pageshow', refreshGeometry);
    window.addEventListener('lionovart:story-layout', refreshGeometry);
    document.addEventListener('load', refreshGeometry, true);
    document.addEventListener('visibilitychange', schedule);
    void document.fonts.ready.then(refreshGeometry); sync();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); fitted.disconnect(); replacements.disconnect(); locale.disconnect(); scheduleRef.current = () => {};
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', refreshGeometry);
      window.removeEventListener('pageshow', refreshGeometry); document.removeEventListener('visibilitychange', schedule);
      window.removeEventListener('lionovart:story-layout', refreshGeometry);
      document.removeEventListener('load', refreshGeometry, true);
    };
  }, [enabled, target]);
  const context = useMemo(() => ({ target: enabled ? target : null, staticLayout: !enabled, register, cardSlots, registerCardSlot }), [enabled, target, register, cardSlots, registerCardSlot]);
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

