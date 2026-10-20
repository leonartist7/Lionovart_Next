'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { chapterOpacity } from '../chapter-dissolve';
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
      for (const { anchor, surface, onActive } of chapters.current) {
        const bounds = anchor.getBoundingClientRect();
        const opacity = chapterOpacity(bounds.top, bounds.bottom, innerHeight);
        const active = opacity > .5 && !document.hidden;
        surface.style.opacity = String(opacity);
        surface.style.visibility = opacity > .001 ? 'visible' : 'hidden';
        surface.style.pointerEvents = active ? 'auto' : 'none';
        surface.inert = !active;
        surface.dataset.chapterActive = String(active);
        if (active) current = surface.dataset.sceneChapter ?? current;
        onActive(active);
      }
      if (targetRef.current) targetRef.current.dataset.activeChapter = current;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    scheduleRef.current = schedule;
    const resize = new ResizeObserver(schedule);
    const root = target.closest('[data-service-world]');
    if (root) resize.observe(root);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule);
    void document.fonts.ready.then(schedule); sync();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); scheduleRef.current = () => {};
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
