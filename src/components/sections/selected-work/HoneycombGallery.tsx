'use client';

import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { ArrowDown, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScreeningMedia } from '../ScreeningMedia';
import { HONEYCOMB_PASS_END, honeycombPose } from './honeycomb-journey';
import type { GalleryWork } from './gallery';
import type { HoneycombRenderer } from './honeycomb-renderer';
import styles from './HoneycombGallery.module.css';

export default function HoneycombGallery({
  projects, progress, lastProject, active, ready, onReady, onContinue,
}: {
  projects: readonly GalleryWork[];
  progress: MotionValue<number>;
  lastProject: number;
  active: boolean;
  ready: boolean;
  onReady: (ready: boolean) => void;
  onContinue: () => void;
}) {
  const { locale } = useLanguage();
  const fr = locale === 'fr';
  const titleId = useId();
  const dialogTitleId = useId();
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<HoneycombRenderer | null>(null);
  const initialProjects = useRef(projects);
  const dialog = useRef<HTMLDialogElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const pointer = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const [available, setAvailable] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const wasBrowsing = useRef(false);
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState<number | null>(null);
  const work = opened === null ? undefined : projects[opened];
  const opacity = useTransform(progress, p => honeycombPose(p, lastProject).opacity);
  const interactive = ready && active && browsing;

  // A portal occupies the whole viewport even before its runway is nearby.
  // Use the chapter activation to defer its renderer and poster requests.
  useEffect(() => { if (active && progress.get() < HONEYCOMB_PASS_END) setAvailable(true); }, [active, progress]);

  useEffect(() => {
    if (!available || !canvas.current) return;
    const node = canvas.current;
    let cancelled = false;
    let instance: HoneycombRenderer | undefined;
    node.dataset.honeycombState = 'loading';
    void import('./honeycomb-renderer').then(({ createHoneycombRenderer }) => {
      if (cancelled) return;
      instance = createHoneycombRenderer(node, initialProjects.current, () => {
        node.dataset.honeycombState = 'context-lost';
        onReady(false);
        instance?.dispose();
        field.current = null;
      });
      field.current = instance;
      const p = progress.get();
      const pose = honeycombPose(p, lastProject);
      instance.setPose(pose);
      wasBrowsing.current = pose.browsing;
      setBrowsing(pose.browsing);
      instance.setActive(p < HONEYCOMB_PASS_END && node.closest('[data-chapter-active="true"]') !== null);
      node.dataset.honeycombState = 'rendering';
      onReady(true);
    }).catch(() => {
      if (!cancelled) {
        node.dataset.honeycombState = 'unavailable';
        onReady(false);
      }
    });
    return () => {
      cancelled = true;
      instance?.dispose();
      field.current = null;
      onReady(false);
    };
  }, [available, lastProject, onReady, progress]);

  useEffect(() => {
    field.current?.setActive(active && progress.get() < HONEYCOMB_PASS_END);
  }, [active, progress, ready]);

  useMotionValueEvent(progress, 'change', p => {
    const pose = honeycombPose(p, lastProject);
    field.current?.setPose(pose);
    field.current?.setActive(active && p < HONEYCOMB_PASS_END);
    if (wasBrowsing.current !== pose.browsing) {
      wasBrowsing.current = pose.browsing;
      setBrowsing(pose.browsing);
    }
  });

  useEffect(() => {
    if (!interactive && dialog.current?.open) {
      restoreFocus.current = null;
      dialog.current.close();
    }
    if (!interactive) pointer.current = null;
  }, [interactive]);

  useEffect(() => {
    if (opened !== null && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [opened]);

  const select = (next: number) => {
    field.current?.goTo(next);
    setIndex(next);
  };
  const open = (next: number, trigger: HTMLElement) => {
    restoreFocus.current = trigger;
    select(next);
    setOpened(next);
  };
  const endPointer = (event: PointerEvent<HTMLCanvasElement>, cancelled = false) => {
    const gesture = pointer.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    pointer.current = null;
    event.currentTarget.dataset.dragging = 'false';
    if (cancelled || gesture.moved) return;
    const next = field.current?.pick(event.clientX, event.clientY);
    const trigger = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>('[data-honeycomb-open]');
    if (next != null && trigger) open(next, trigger);
  };

  return <motion.div className={styles.world} data-honeycomb-gallery data-honeycomb-ready={ready}
    data-honeycomb-browsing={interactive} style={{ opacity }} aria-hidden={!interactive} inert={!interactive}>
    <canvas ref={canvas} className={styles.field} aria-hidden="true" data-honeycomb-canvas
      onPointerDown={event => {
        if (!interactive || !event.isPrimary || event.button !== 0) return;
        pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        const gesture = pointer.current;
        if (!gesture) {
          const overTile = event.pointerType === 'mouse' && field.current?.hover(event.clientX, event.clientY);
          event.currentTarget.dataset.hovering = String(Boolean(overTile));
          return;
        }
        if (gesture.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        if (!gesture.moved && Math.hypot(dx, dy) < 6) return;
        gesture.moved = true;
        gesture.x = event.clientX; gesture.y = event.clientY;
        event.currentTarget.dataset.dragging = 'true';
        field.current?.drag(dx, event.pointerType === 'touch' ? 0 : dy);
      }}
      onPointerUp={event => endPointer(event)}
      onPointerCancel={event => endPointer(event, true)}
      onLostPointerCapture={event => endPointer(event, true)}
      onPointerLeave={() => field.current?.clearHover()} />
    <header className={styles.heading}>
      <h2 id={titleId}>{fr ? 'Nos réalisations' : 'Selected Work'}</h2>
      <p>{fr ? 'Glissez pour explorer' : 'Drag to explore'}</p>
    </header>
    <div className={styles.controls}>
      <label className="sr-only" htmlFor={titleId + '-projects'}>{fr ? 'Projet' : 'Project'}</label>
      <select id={titleId + '-projects'} data-honeycomb-projects value={index} onChange={event => select(Number(event.target.value))}>
        {projects.map((project, i) => <option key={project.slug} value={i}>{project.name}</option>)}
      </select>
      <button type="button" data-honeycomb-open onClick={event => open(index, event.currentTarget)}>
        {fr ? 'Voir le projet' : 'View project'}
      </button>
      <button type="button" className={styles.continue} data-honeycomb-continue onClick={onContinue}>
        {fr ? 'Continuer vers One Partnership' : 'Continue to One Partnership'}
        <ArrowDown aria-hidden="true" size={15} />
      </button>
    </div>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={dialogTitleId} aria-modal={work ? true : undefined} role="dialog" data-lenis-prevent
      onClose={() => { setOpened(null); restoreFocus.current?.focus({ preventScroll: true }); restoreFocus.current = null; }}
      onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      {work && <div className={styles.detail} data-honeycomb-detail={work.slug}>
        <div className={styles.detailHeading}>
          <h3 id={dialogTitleId}>{work.name}</h3>
          <button type="button" aria-label={fr ? 'Fermer le projet' : 'Close project'} onClick={() => dialog.current?.close()} autoFocus>
            <X aria-hidden="true" size={21} />
          </button>
        </div>
        <div className={styles.artwork}>
          <ScreeningMedia asset={work} frameRatio={16 / 9} active={interactive} label={false} />
        </div>
      </div>}
    </dialog>
  </motion.div>;
}
