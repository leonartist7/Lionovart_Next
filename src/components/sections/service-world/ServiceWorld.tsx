'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useHydratedReducedMotion } from '@/hooks/useHydratedReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { serviceExhibit } from './scene-art';
import type { WorldEngine } from './world-renderer';
import { worldLight, smooth, type WorldInput } from './world-state';
import styles from './ServiceWorld.module.css';

type Selection = { service: string; variant: number; enabled: boolean; paused: boolean };
const WorldContext = createContext<{ ready: boolean; stageReady: string | null; select: (selection: Selection) => void } | null>(null);
export const useServiceWorld = () => useContext(WorldContext);

export default function ServiceWorld({ children, mediaFirst = false }: { children: ReactNode; mediaFirst?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<WorldEngine | null>(null);
  const selection = useRef<Selection>({ service: 'branding', variant: 0, enabled: true, paused: false });
  const syncRef = useRef<() => void>(() => {});
  const reduced = useHydratedReducedMotion();
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [stageReady, setStageReady] = useState<string | null>(null);
  const select = useCallback((value: Selection) => { selection.current = value; syncRef.current(); }, []);
  const context = useMemo(() => ({ ready, stageReady, select }), [ready, stageReady, select]);

  useEffect(() => {
    const root = host.current, surface = canvas.current;
    if (!root || !surface || reduced === null) return;
    let disposed = false, loading = false, failed = false, frame = 0;
    let latest: WorldInput | null = null, lastLight = -1;
    let pointer: [number, number] = [0, 0];
    const cardExit = root.querySelector<HTMLElement>('[data-card-exit]');
    const runway = cardExit ?? root.querySelector<HTMLElement>('[data-work-runway]');
    const services = root.querySelector<HTMLElement>('[data-services-runway]');
    const query = new URLSearchParams(location.search);
    const fallbackOnly = mediaFirst || query.get('world') === 'poster';
    const review = query.get('worldReview') === '1';
    root.dataset.worldStatus = mediaFirst ? 'media' : fallbackOnly ? 'poster' : 'waiting';
    root.dataset.worldError = !mediaFirst && fallbackOnly ? 'Poster selected in review' : '';
    setReady(false); setStageReady(null);
    const fail = (reason: unknown) => {
      if (disposed) return;
      failed = true;
      root.dataset.worldStatus = 'fallback';
      root.dataset.worldError = reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : 'Graphics initialization failed';
      setReady(false); setStageReady(null); root.dataset.worldReady = 'false';
      surface.style.opacity = '0'; engine.current?.dispose(); engine.current = null;
    };
    const sync = () => {
      frame = 0;
      if (disposed) return;
      const h = innerHeight, w = innerWidth;
      const entry = runway?.getBoundingClientRect();
      const end = root.getBoundingClientRect();
      const visible = end.top < h && end.bottom > 0 && !document.hidden;
      const staticEntry = root.querySelector('[data-work-services-transition]')?.getAttribute('data-static') === 'true';
      const staticCards = matchMedia('(prefers-reduced-motion: reduce), (max-height: 560px)').matches;
      const light = cardExit ? (staticCards ? 1 : smooth((-entry!.top / Math.max(1, entry!.height) - .45) / .45)) : entry && !staticEntry ? worldLight(entry.top, entry.height) : 1;
      const galleryBounds = root.querySelector('[data-gallery]')?.getBoundingClientRect();
      root.style.setProperty('--gallery-travel', String(galleryBounds ? Math.min(1, Math.max(0, 1 - galleryBounds.top / h)) : 0));
      if (light !== lastLight) {
        lastLight = light;
        root.style.setProperty('--world-light', String(light));
        root.style.setProperty('--world-ink', light > .46 ? '#171412' : '#fffaf1');
      }
      const serviceBounds = services?.getBoundingClientRect();
      const workStage = root.querySelector<HTMLElement>('[data-world-work]');
      const workBounds = workStage?.getBoundingClientRect();
      const stage = root.querySelector<HTMLElement>('[data-world-service]');
      const s = selection.current;
      const gallery = workStage?.closest('[data-gallery]')?.getBoundingClientRect();
      const atWork = !!workBounds && workBounds.top < h * .8 && !!gallery && gallery.bottom > 0;
      const atServices = !!serviceBounds && serviceBounds.top < h * .6 && serviceBounds.bottom > h * .4;
      const rect = atWork ? workBounds! : atServices && stage ? stage.getBoundingClientRect() : { left: 0, top: h * .12, width: w, height: h * .65 };
      const input: WorldInput = {
        exhibit: atWork ? 'work' : atServices ? serviceExhibit(s.service) : 'arrival',
        work: workStage?.dataset.projectId && workStage.dataset.projectPoster ? { id: workStage.dataset.projectId, poster: workStage.dataset.projectPoster } : null,
        variant: s.variant, enabled: s.enabled, paused: s.paused, light,
        visible, reduced: !!reduced, rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }, pointer,
      };
      latest = input;
      root.dataset.worldVisible = String(visible);
      root.dataset.worldMotion = reduced ? 'reduced' : s.paused ? 'paused' : 'active';
      surface.style.opacity = visible && !failed ? '1' : '0';
      if (engine.current) engine.current.update(input);
      else if (visible && !loading && !failed && !fallbackOnly) {
        loading = true; root.dataset.worldStatus = 'loading';
        void import('./world-renderer').then(async ({ createWorld }) => {
          if (disposed || failed) return;
          const created = await createWorld(surface, query.get('world') === 'webgl', fail, () => {
            if (!disposed && !failed) { setReady(true); root.dataset.worldReady = 'true'; root.dataset.worldStatus = 'ready'; }
          }, key => { if (!disposed && !failed) setStageReady(key); });
          if (disposed || failed) { created.dispose(); return; }
          engine.current = created;
          sync();
        }).catch(fail);
      }
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(sync); };
    syncRef.current = schedule;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || reduced || !latest?.visible || latest.paused) return;
      pointer = [event.clientX / innerWidth - .5, event.clientY / innerHeight - .5];
      // Reuse the last scroll/resize measurement. Pointer movement never forces layout.
      engine.current?.update({ ...latest, pointer });
    };
    const retry = () => setAttempt(value => value + 1);
    const simulateFailure = () => fail('Simulated failure from review controls');
    if (review) {
      window.addEventListener('lionovart:world-retry', retry);
      window.addEventListener('lionovart:world-fail', simulateFailure);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    if (services) observer.observe(services);
    const mutation = new MutationObserver(schedule);
    mutation.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-world-service', 'data-project-id', 'data-project-poster'] });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    void document.fonts.ready.then(schedule);
    sync();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); mutation.disconnect();
      window.removeEventListener('lionovart:world-retry', retry); window.removeEventListener('lionovart:world-fail', simulateFailure);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule); window.removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', schedule);
      engine.current?.dispose(); engine.current = null; syncRef.current = () => {};
    };
  }, [reduced, attempt, mediaFirst]);

  return <WorldContext.Provider value={context}><div ref={host} className={styles.world} data-service-world data-world-ready={ready} data-world-mode={mediaFirst ? "media" : "models"}>
    <div className={styles.environment} data-world-environment aria-hidden="true"><div className={styles.architecture}><i /><i /><i /><i /></div></div>
    <canvas key={`${attempt}-${reduced}`} ref={canvas} className={styles.canvas} aria-hidden="true" />
    <div className={styles.story}>{children}</div>
  </div></WorldContext.Provider>;
}

export function WorldStageControls({ service, variant, onVariant, labels, enabled, onEnabled, paused, onPaused, mediaFirst = false }: {
  mediaFirst?: boolean; service: string; variant: number; onVariant: (n: number) => void; labels: readonly string[];
  enabled: boolean; onEnabled: () => void; paused: boolean; onPaused: () => void;
}) {
  const { locale } = useLanguage(); const fr = locale === 'fr';
  return <div className={styles.controls} onPointerDown={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
    <p className={styles.hint}>{fr ? 'Choisissez une expérience' : 'Select an experience'} <span aria-hidden="true">↗</span></p>
    <div className={styles.tags} role="group" aria-label={fr ? 'Exemples de services' : 'Service examples'}>
      {labels.map((label, index) => <button type="button" key={label} aria-pressed={variant === index} onClick={() => onVariant(index)}>{label}</button>)}
    </div>
    <div className={styles.utilities}>
      {service === 'led' && !mediaFirst && <button type="button" role="switch" aria-checked={enabled} onClick={onEnabled}>{fr ? 'Écran LED' : 'LED display'} <span>{enabled ? 'ON' : 'OFF'}</span></button>}
      <button type="button" aria-pressed={paused} onClick={onPaused}>{paused ? (fr ? 'Lire les aperçus' : 'Play previews') : (fr ? 'Mettre en pause' : 'Pause previews')}</button>
      {!mediaFirst && <span>{fr ? 'Concept illustratif' : 'Illustrative concept'}</span>}
    </div>
  </div>;
}
