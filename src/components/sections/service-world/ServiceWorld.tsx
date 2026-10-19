'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useHydratedReducedMotion } from '@/hooks/useHydratedReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { GALLERY_WORK } from '../selected-work/gallery';
import type { WorldEngine } from './world-renderer';
import { worldLight, type WorldInput } from './world-state';
import styles from './ServiceWorld.module.css';

type Selection = { service: string; variant: number; enabled: boolean; paused: boolean };
const WorldContext = createContext<{ ready: boolean; select: (selection: Selection) => void } | null>(null);
export const useServiceWorld = () => useContext(WorldContext);

export default function ServiceWorld({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<WorldEngine | null>(null);
  const selection = useRef<Selection>({ service: 'branding', variant: 0, enabled: true, paused: false });
  const syncRef = useRef<() => void>(() => {});
  const reduced = useHydratedReducedMotion();
  const [ready, setReady] = useState(false);
  const select = useCallback((value: Selection) => { selection.current = value; syncRef.current(); }, []);
  const context = useMemo(() => ({ ready, select }), [ready, select]);

  useEffect(() => {
    const root = host.current, surface = canvas.current;
    if (!root || !surface || reduced === null) return;
    let disposed = false, loading = false, frame = 0;
    let pointer: [number, number] = [0, 0];
    const runway = root.querySelector<HTMLElement>('[data-work-runway]');
    const services = root.querySelector<HTMLElement>('[data-services-runway]');
    const query = new URLSearchParams(location.search);
    const fallbackOnly = query.get('world') === 'poster';
    const fail = () => {
      setReady(false); root.dataset.worldReady = 'false';
      surface.style.opacity = '0'; engine.current?.dispose(); engine.current = null;
    };
    const sync = () => {
      frame = 0;
      if (disposed) return;
      const h = innerHeight, w = innerWidth;
      const entry = runway?.getBoundingClientRect();
      const end = root.getBoundingClientRect();
      const visible = !!entry && entry.top < h && end.bottom > 0 && !document.hidden;
      const light = entry ? worldLight(entry.top, entry.height) : 1;
      root.style.setProperty('--world-light', String(light));
      const serviceBounds = services?.getBoundingClientRect();
      const workBounds = root.querySelector<HTMLElement>('[data-world-work]')?.getBoundingClientRect();
      const stage = root.querySelector<HTMLElement>('[data-world-service]');
      const s = selection.current;
      const atWork = !!workBounds && workBounds.top < h * .8 && workBounds.bottom > h * .15;
      const atServices = !!serviceBounds && serviceBounds.top < h * .6 && serviceBounds.bottom > h * .4;
      const rect = atWork ? workBounds! : atServices && stage ? stage.getBoundingClientRect() : { left: 0, top: h * .12, width: w, height: h * .65 };
      const input: WorldInput = {
        exhibit: atWork ? 'work' : atServices ? s.service === 'content-studio' ? 'content' : s.service === 'led' ? 'led' : 'empty' : 'arrival',
        variant: s.variant, enabled: s.enabled, paused: s.paused, light,
        visible, reduced: !!reduced, rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }, pointer,
      };
      surface.style.opacity = visible ? '1' : '0';
      if (engine.current) engine.current.update(input);
      else if (visible && !loading && !fallbackOnly) {
        loading = true;
        void import('./world-renderer').then(async ({ createWorld }) => {
          const created = await createWorld(surface, GALLERY_WORK[0].poster, query.get('world') === 'webgl', fail);
          if (disposed) { created.dispose(); return; }
          engine.current = created;
          setReady(true); root.dataset.worldReady = 'true';
          sync();
        }).catch(fail);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    syncRef.current = schedule;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || reduced) return;
      pointer = [event.clientX / innerWidth - .5, event.clientY / innerHeight - .5]; schedule();
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    if (services) observer.observe(services);
    const mutation = new MutationObserver(schedule);
    mutation.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-world-service'] });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    void document.fonts.ready.then(schedule);
    sync();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); mutation.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule); window.removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', schedule);
      engine.current?.dispose(); engine.current = null; syncRef.current = () => {};
    };
  }, [reduced]);

  return <WorldContext.Provider value={context}><div ref={host} className={styles.world} data-service-world data-world-ready={ready}>
    <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
    <div className={styles.story}>{children}</div>
  </div></WorldContext.Provider>;
}

export function WorldStageControls({ service, variant, onVariant, labels, enabled, onEnabled, paused, onPaused }: {
  service: string; variant: number; onVariant: (n: number) => void; labels: readonly string[];
  enabled: boolean; onEnabled: () => void; paused: boolean; onPaused: () => void;
}) {
  const { locale } = useLanguage(); const fr = locale === 'fr';
  return <div className={styles.controls} onPointerDown={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
    <p className={styles.hint}>{fr ? 'Choisissez une expérience' : 'Select an experience'} <span aria-hidden="true">↗</span></p>
    <div className={styles.tags} role="group" aria-label={fr ? 'Exemples de services' : 'Service examples'}>
      {labels.map((label, index) => <button type="button" key={label} aria-pressed={variant === index} onClick={() => onVariant(index)}>{label}</button>)}
    </div>
    <div className={styles.utilities}>
      {service === 'led' && <button type="button" role="switch" aria-checked={enabled} onClick={onEnabled}>{fr ? 'Écran LED' : 'LED display'} <span>{enabled ? 'ON' : 'OFF'}</span></button>}
      <button type="button" aria-pressed={paused} onClick={onPaused}>{paused ? (fr ? 'Animer la scène' : 'Play scene') : (fr ? 'Mettre en pause' : 'Pause scene')}</button>
      <span>{fr ? 'Concept illustratif' : 'Illustrative concept'}</span>
    </div>
  </div>;
}
