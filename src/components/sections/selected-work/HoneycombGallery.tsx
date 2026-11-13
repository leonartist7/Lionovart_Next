'use client';

import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScreeningMedia } from '../ScreeningMedia';
import { HONEYCOMB_PASS_END, honeycombPose } from './honeycomb-journey';
import type { GalleryWork } from './gallery';
import type { HoneycombRenderer } from './honeycomb-renderer';
import styles from './HoneycombGallery.module.css';

export default function HoneycombGallery({
  projects, progress, lastProject, active, ready, onReady,
}: {
  projects: readonly GalleryWork[];
  progress: MotionValue<number>;
  lastProject: number;
  active: boolean;
  ready: boolean;
  onReady: (ready: boolean) => void;
}) {
  const { locale } = useLanguage();
  const fr = locale === 'fr';
  const keyboardHelpId = useId();
  const dialogTitleId = useId();
  const canvas = useRef<HTMLCanvasElement>(null);
  const keyboardControl = useRef<HTMLButtonElement>(null);
  const field = useRef<HoneycombRenderer | null>(null);
  const initialProjects = useRef(projects);
  const dialog = useRef<HTMLDialogElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const pointer = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const [available, setAvailable] = useState(false);
  const requestedRenderer = useRef(false);
  const [browsing, setBrowsing] = useState(false);
  const wasBrowsing = useRef(false);
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState<number | null>(null);
  const work = opened === null ? undefined : projects[opened];
  const opacity = useTransform(progress, p => honeycombPose(p, lastProject).opacity);
  const headingOpacity = useTransform(progress, p => {
    const pose = honeycombPose(p, lastProject);
    return pose.opacity * (1 - pose.lift);
  });
  const interactive = ready && active && browsing;

  // A portal occupies the whole viewport even before its runway is nearby.
  // Defer until the active chapter enters the canvas range in either direction.
  useEffect(() => {
    if (!active || progress.get() >= HONEYCOMB_PASS_END || requestedRenderer.current) return;
    requestedRenderer.current = true;
    setAvailable(true);
  }, [active, progress]);

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
      }, {
        onFirstFrame: () => {
          node.dataset.honeycombState = 'rendering';
          onReady(true);
        },
      });
      field.current = instance;
      const p = progress.get();
      const pose = honeycombPose(p, lastProject);
      instance.setPose(pose);
      wasBrowsing.current = pose.browsing;
      setBrowsing(pose.browsing);
      instance.setActive(p < HONEYCOMB_PASS_END && node.closest('[data-chapter-active="true"]') !== null);
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
    if (active && p < HONEYCOMB_PASS_END && !requestedRenderer.current) {
      requestedRenderer.current = true;
      setAvailable(true);
    }
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
    if (!interactive) {
      pointer.current = null;
      field.current?.clearHover();
      field.current?.clearFocus();
      canvas.current?.removeAttribute('data-dragging');
      canvas.current?.removeAttribute('data-hovering');
    }
  }, [interactive]);

  useEffect(() => {
    if (opened !== null && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [opened]);

  const open = (next: number, trigger: HTMLElement | null) => {
    restoreFocus.current = trigger;
    setIndex(next);
    setOpened(next);
  };
  const endPointer = (event: PointerEvent<HTMLCanvasElement>, cancelled = false) => {
    const gesture = pointer.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    pointer.current = null;
    event.currentTarget.dataset.dragging = 'false';
    if (cancelled || gesture.moved) return;
    const next = field.current?.pick(event.clientX, event.clientY);
    if (next != null) open(next, null);
  };

  return <motion.div className={styles.world} data-honeycomb-gallery data-honeycomb-ready={ready}
    data-honeycomb-browsing={interactive} style={{ opacity }} aria-hidden={!interactive} inert={!interactive}>
    <div className={styles.layout}>
      <motion.header className={styles.heading} style={{ opacity: headingOpacity }}>
        <h2>{fr ? 'Nos réalisations' : 'Selected Work'}</h2>
        <p>{fr ? 'Glissez pour explorer' : 'Drag to explore'}</p>
      </motion.header>
      <div className={styles.frame} data-honeycomb-frame>
        <canvas ref={canvas} className={styles.field} aria-hidden="true" data-honeycomb-canvas
          onPointerDown={event => {
            if (!interactive || !event.isPrimary || event.button !== 0) return;
            pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
            keyboardControl.current?.blur();
            field.current?.clearFocus();
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
          onPointerLeave={event => {
            event.currentTarget.removeAttribute('data-hovering');
            field.current?.clearHover();
          }} />
        <span className="sr-only" id={keyboardHelpId}>
          {fr ? 'Utilisez les flèches pour parcourir les projets et Entrée pour ouvrir le projet sélectionné.'
            : 'Use arrow keys to browse projects and Enter to open the selected project.'}
        </span>
        <button ref={keyboardControl} className={styles.keyboardProject} type="button"
          data-honeycomb-keyboard-project aria-describedby={keyboardHelpId}
          onFocus={() => field.current?.goTo(index, true)}
          onBlur={() => field.current?.clearFocus()}
          onKeyDown={event => {
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
              : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
            if (!step) return;
            event.preventDefault();
            const next = (index + step + projects.length) % projects.length;
            setIndex(next);
            field.current?.goTo(next, true);
          }}
          onClick={event => open(index, event.currentTarget)}>
          <span aria-live="polite">{projects[index]?.name}</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
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
