"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useInView, useIsPresent } from "motion/react";
import { ArrowLeft, ArrowRight, Expand, Pause, Play, X } from "lucide-react";
import { WORK_PROJECTS, type WorkProject } from "./selected-work/projects";
import styles from "./SelectedWork.module.css";

const ease = [0.16, 1, 0.3, 1] as const;
const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (callback: () => void) => {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const motionSnapshot = () => window.matchMedia(motionQuery).matches;
const serverMotionSnapshot = () => false;
function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, motionSnapshot, serverMotionSnapshot);
}

function PreviewFilm({ project, suspended }: { project: WorkProject; suspended: boolean }) {
  const t = useTranslations("selectedWork");
  const video = useRef<HTMLVideoElement>(null);
  const inView = useInView(video, { amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [manuallyStarted, setManuallyStarted] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const sync = () => {
      if (inView && isPresent && !suspended && !userPaused && (!reduceMotion || manuallyStarted) && !document.hidden) {
        void element.play().catch(() => setPlaying(false));
      } else element.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => { document.removeEventListener("visibilitychange", sync); element.pause(); };
  }, [inView, isPresent, suspended, userPaused, reduceMotion, manuallyStarted]);

  return <>
    <Image src={project.poster} alt={project.name} fill sizes="(min-width: 1600px) 75vw, 100vw" className={styles.artwork} />
    {!failed && <video ref={video} src={project.video} poster={project.poster} className={styles.film} muted playsInline loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} aria-label={project.name} />}
    {!failed && <button className={styles.playback} type="button" onClick={() => {
      if (playing) { setUserPaused(true); video.current?.pause(); }
      else { setUserPaused(false); setManuallyStarted(true); void video.current?.play().catch(() => setPlaying(false)); }
    }} aria-label={playing ? t("pause") : t("play")}>{playing ? <Pause size={16} /> : <Play size={16} />}<span>{playing ? t("pause") : t("play")}</span></button>}
  </>;
}

export default function SelectedWork() {
  const t = useTranslations("selectedWork");
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFailed, setViewerFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const viewerVideo = useRef<HTMLVideoElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const project = WORK_PROJECTS[activeIndex];
  const [dragOffset, setDragOffset] = useState(0);
  const pointer = useRef<{ x: number; y: number; dragging: boolean } | null>(null);
  const dragged = useRef(false);
  const select = (index: number) => setActiveIndex(Math.max(0, Math.min(WORK_PROJECTS.length - 1, index)));
  const finishDrag = () => {
    if (Math.abs(dragOffset) > 45) select(activeIndex + (dragOffset < 0 ? 1 : -1));
    pointer.current = null;
    setDragOffset(0);
  };

  const closeViewer = () => {
    viewerVideo.current?.pause();
    dialog.current?.close();
    setViewerOpen(false);
    openButton.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!viewerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [viewerOpen]);

  return <section id="selected-work" data-scroll-title-skip aria-labelledby="selected-work-heading" className={styles.section} data-art-directed="light">
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 id="selected-work-heading" className={styles.eyebrow}><span aria-hidden="true" />{t("eyebrow")}</h2>
        <span className={styles.counter} aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} <span>/ 04</span></span>
      </header>
      <div className={styles.reel} role="region" aria-label={t("browse")} aria-roledescription="carousel" tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            select(event.key === "Home" ? 0 : event.key === "End" ? WORK_PROJECTS.length - 1 : activeIndex + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
        onPointerDown={(event) => { if (event.button !== 0) return; dragged.current = false; pointer.current = { x: event.clientX, y: event.clientY, dragging: false }; }}
        onPointerMove={(event) => {
          const start = pointer.current;
          if (!start) return;
          const dx = event.clientX - start.x;
          if (!start.dragging && Math.abs(event.clientY - start.y) > Math.abs(dx)) { pointer.current = null; return; }
          if (Math.abs(dx) > 8) {
            start.dragging = true; dragged.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragOffset((activeIndex === 0 && dx > 0) || (activeIndex === WORK_PROJECTS.length - 1 && dx < 0) ? dx * .2 : dx);
          }
        }}
        onPointerUp={finishDrag} onPointerCancel={() => { pointer.current = null; setDragOffset(0); }}
        onClickCapture={(event) => { if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false; } }}>
        <div className={styles.rail} style={{ "--index": activeIndex, "--drag": dragOffset + "px", transitionDuration: dragOffset || reduceMotion ? "0ms" : "500ms" } as CSSProperties}>
          {WORK_PROJECTS.map((item, index) => <div key={item.id} className={styles.slide} data-active={index === activeIndex} data-side={index < activeIndex ? "left" : "right"} role="group" aria-roledescription="slide" aria-label={(index + 1) + " / 4: " + item.name}>
            <div className={styles.stage} style={{ "--project-color": item.color } as CSSProperties}>
              {item.video && index === activeIndex ? <PreviewFilm project={item} suspended={viewerOpen} /> : <Image src={item.poster} alt={item.name + " — " + t(item.discipline)} fill sizes="(min-width: 2560px) 1824px, (min-width: 640px) 76vw, 88vw" className={styles.artwork} draggable={false} />}
              {index !== activeIndex && <button type="button" className={styles.previewSelect} tabIndex={Math.abs(index - activeIndex) === 1 ? 0 : -1} aria-label={t("view") + " " + item.name} onClick={() => select(index)} />}
            </div>
          </div>)}
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.metadata} aria-live="polite" aria-atomic="true">
          <motion.div key={project.id} initial={reduceMotion ? false : { x: 18 }} animate={{ x: 0 }} transition={{ duration: reduceMotion ? 0 : .5, ease }}>
            <h3 className={styles.projectName}>{project.name}</h3>
            <p className={styles.discipline}>{t(project.discipline)}</p>
          </motion.div>
        </div>
        <div className={styles.controls}>
          <button ref={openButton} type="button" className={styles.viewButton} onClick={() => { setViewerFailed(false); setViewerOpen(true); dialog.current?.showModal(); }}>
            {project.video ? t("watch") : t("enlarge")}{project.video ? <Play size={18} /> : <Expand size={18} />}
          </button>
          <div className={styles.arrows}>
            <button type="button" aria-label={t("previous")} disabled={activeIndex === 0} onClick={() => select(activeIndex - 1)}><ArrowLeft size={22} /></button>
            <button type="button" aria-label={t("next")} disabled={activeIndex === WORK_PROJECTS.length - 1} onClick={() => select(activeIndex + 1)}><ArrowRight size={22} /></button>
          </div>
        </div>
      </div>
      <div className={styles.divider} />
    </div>

    <dialog ref={dialog} className={styles.dialog} aria-labelledby="work-viewer-title" data-lenis-prevent onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, video[controls], [tabindex="0"]'));
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }} onCancel={(event) => { event.preventDefault(); closeViewer(); }} onClick={(event) => { if (event.target === event.currentTarget) closeViewer(); }}>
      <div className={styles.viewerHeader}><h3 id="work-viewer-title">{project.name}</h3><button type="button" onClick={closeViewer} aria-label={t("close")} autoFocus><X size={24} /></button></div>
      <div className={styles.viewerMedia}>
        {viewerOpen && (project.video && !viewerFailed ? <video ref={viewerVideo} src={project.video} poster={project.poster} controls muted playsInline preload="metadata" onError={() => setViewerFailed(true)} aria-label={project.name} /> : <Image src={project.poster} alt={`${project.name} — ${t(project.discipline)}`} fill sizes="95vw" className={styles.artwork} />)}
      </div>
      <p className={styles.viewerCaption}>{t(project.discipline)}</p>
    </dialog>
  </section>;
}
