"use client";

import GoldThreads from "@/components/ui/GoldThreads";
import ServicesCurves from "./ServicesCurves";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICE_GALLERY_PROJECTS } from "./services/galleryProjects";
import { useWorkBrowse } from "./selected-work/WorkBrowse";
import type { GlassRenderer } from "./selected-work/glassRenderer";
import styles from "./SelectedWork.module.css";

const INTERVAL = 5000;
const FALLBACK_DURATION = 650;
type Selection = { index: number; manual: boolean };
type GalleryMode = "work" | "services";
type GalleryProject = { id: string; name: string; poster: string; color: string; video?: string; discipline?: string };

type SelectedWorkProps = { mode?: GalleryMode; onHeadingClick?: () => void; goldThreads?: boolean; servicesCurves?: boolean };
export default function SelectedWork(props: SelectedWorkProps) {
  const browse = useWorkBrowse();
  const projects = props.mode === "services" ? SERVICE_GALLERY_PROJECTS : browse.projects;
  return <SelectedWorkGallery key={props.mode === "services" ? "services" : `${browse.industry}/${browse.style}`} {...props} projects={projects} />;
}
function SelectedWorkGallery({ mode = "work", onHeadingClick, goldThreads = false, servicesCurves = false, projects }: SelectedWorkProps & { projects: readonly GalleryProject[] }) {
  const t = useTranslations("selectedWork");
  const { t: siteT } = useLanguage();
  const isServices = mode === "services";
  const count = projects.length;
  const reduceMotion = useHydratedReducedMotion();
  const [theme, setTheme] = useState<"ivory" | "dark">("ivory");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [fxActive, setFxActive] = useState(false);
  const [fallbackFrom, setFallbackFrom] = useState<number | null>(null);
  const [engineStatus, setEngineStatus] = useState<"loading" | "ready" | "failed">("loading");
  const engineStatusRef = useRef<"loading" | "ready" | "failed">("loading");
  const busyRef = useRef(false);
  const pendingRef = useRef<Selection | null>(null);
  const launchRef = useRef<(selection: Selection) => void>(() => {});
  const fallbackTimerRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);
  const [announcement, setAnnouncement] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GlassRenderer | null>(null);
  const transitionToken = useRef(0);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const previewVideo = useRef<HTMLVideoElement>(null);
  const project = projects[activeIndex];
  const projectName = isServices ? (siteT.services.items[activeIndex]?.title ?? project.name) : project.name;
  const projectDescription = isServices
    ? (siteT.services.items[activeIndex]?.description ?? "")
    : t(project.discipline as "identityDigital" | "identityIllustration" | "identityCampaign");
  const canAdvance = inView && pageVisible && !paused && !hovered && !focused && !pointerActive && !fxActive && fallbackFrom === null && engineStatus !== "loading" && !reduceMotion;

  useEffect(() => {
    const readTheme = () => setTheme(!isServices && new URLSearchParams(window.location.search).get("workTheme") === "dark" ? "dark" : "ivory");
    readTheme();
    window.addEventListener("popstate", readTheme);
    return () => window.removeEventListener("popstate", readTheme);
  }, [isServices]);

  useEffect(() => {
    if (isServices || window.location.hash !== "#selected-work") return;
    let frame = 0;
    const landOnWork = () => {
      frame = requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: "instant", block: "start" }));
    };
    if (document.documentElement.dataset.splashComplete === "true") landOnWork();
    else window.addEventListener("lionovart:splash-complete", landOnWork, { once: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("lionovart:splash-complete", landOnWork); };
  }, [isServices]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "420px 0px" });
    const visibleObserver = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 0.3), { threshold: [0, 0.3, 0.6] });
    observer.observe(section);
    visibleObserver.observe(section);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    visibility();
    return () => { observer.disconnect(); visibleObserver.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (!near || reduceMotion || !canvasRef.current || !stageRef.current) return;
    let cancelled = false;
    let engine: GlassRenderer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    engineStatusRef.current = "loading";
    setEngineStatus("loading");
    void import("./selected-work/glassRenderer").then(async ({ createGlassRenderer }) => {
      const created = await createGlassRenderer(canvas, projects);
      if (cancelled) { created.dispose(); return; }
      engine = created;
      engineRef.current = created;
      resizeObserver = new ResizeObserver(() => created.resize());
      resizeObserver.observe(stage);
      engineStatusRef.current = "ready";
      setEngineStatus("ready");
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) launchRef.current(pending);
    }).catch(() => {
      if (cancelled) return;
      engineRef.current = null;
      engineStatusRef.current = "failed";
      setEngineStatus("failed");
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) launchRef.current(pending);
    });
    return () => {
      cancelled = true;
      transitionToken.current += 1;
      busyRef.current = false;
      if (fallbackTimerRef.current !== null) window.clearTimeout(fallbackTimerRef.current);
      resizeObserver?.disconnect();
      engine?.dispose();
      engineRef.current = null;
      engineStatusRef.current = "loading";
      setFxActive(false);
      setFallbackFrom(null);
      setEngineStatus("loading");
    };
  }, [near, reduceMotion, projects]);

  const launch = (selection: Selection) => {
    const target = selection.index;
    const previous = activeRef.current;
    if (target === previous) return;
    if (busyRef.current || (engineStatusRef.current === "loading" && !reduceMotion)) {
      pendingRef.current = selection;
      return;
    }
    busyRef.current = true;
    activeRef.current = target;
    elapsedRef.current = 0;
    setProgress(0);
    setActiveIndex(target);
    setVideoFailed(false);
    setVideoPaused(false);
    if (selection.manual) setAnnouncement(`${isServices ? (siteT.services.items[target]?.title ?? projects[target].name) : projects[target].name}, ${target + 1} / ${count}`);
    const engine = engineRef.current;
    const token = ++transitionToken.current;
    const finish = () => {
      if (transitionToken.current !== token) return;
      busyRef.current = false;
      setFxActive(false);
      setFallbackFrom(null);
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending && pending.index !== activeRef.current) launchRef.current(pending);
    };
    const fallback = () => {
      setFxActive(false);
      if (reduceMotion) { finish(); return; }
      setFallbackFrom(previous);
      fallbackTimerRef.current = window.setTimeout(() => { fallbackTimerRef.current = null; finish(); }, FALLBACK_DURATION);
    };
    if (engine && !reduceMotion) {
      try {
        // Render the outgoing poster into the canvas before React reveals the
        // new poster beneath it. Both the image and the caption then update in
        // the same commit without a one-frame flash.
        const transition = engine.transition(previous, target);
        setFxActive(true);
        void transition.then(finish).catch(() => {
          engineStatusRef.current = "failed";
          setEngineStatus("failed");
          fallback();
        });
      } catch {
        engineStatusRef.current = "failed";
        setEngineStatus("failed");
        fallback();
      }
    } else fallback();
  };
  useEffect(() => { launchRef.current = launch; });

  const select = useCallback((index: number, manual = true) => {
    const target = (index + count) % count;
    if (target === activeRef.current) {
      pendingRef.current = null;
      return;
    }
    launchRef.current({ index: target, manual });
  }, [count]);

  useEffect(() => {
    if (!canAdvance) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      elapsedRef.current = Math.min(INTERVAL, elapsedRef.current + now - last);
      last = now;
      setProgress(elapsedRef.current / INTERVAL);
      if (elapsedRef.current >= INTERVAL) select(activeRef.current + 1, false);
    }, 50);
    return () => window.clearInterval(timer);
  }, [canAdvance, select]);

  useEffect(() => {
    const element = previewVideo.current;
    if (!element || !project.video || videoFailed) return;
    if (inView && pageVisible && !fxActive && !reduceMotion && !videoPaused) void element.play().catch(() => setVideoPlaying(false));
    else element.pause();
    return () => element.pause();
  }, [project.video, inView, pageVisible, fxActive, reduceMotion, videoFailed, videoPaused]);
  const startSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("nav")) return;
    swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    setPointerActive(true);
  };
  const endSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    setPointerActive(false);
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) select(activeRef.current + (dx < 0 ? 1 : -1));
  };

  return <section ref={sectionRef} id={isServices ? "services" : "selected-work"} data-scroll-title-skip data-theme={theme} data-gallery={mode} data-floating-navigation={servicesCurves && !isServices} data-art-directed={theme === "dark" ? "dark" : "light"} aria-labelledby={isServices ? "services-heading" : "selected-work-heading"} className={styles.section}
    onFocusCapture={(event) => { if (event.target instanceof HTMLElement) setFocused(event.target.matches(":focus-visible")); }}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    {goldThreads && theme === "ivory" && <GoldThreads />}
    {servicesCurves && theme === "ivory" && <ServicesCurves continuation />}
    <div className={styles.container}>
      <header className={styles.header}>
        {isServices ? <div className={styles.serviceHeader}>
          <p className={styles.eyebrow}><span aria-hidden="true" />{siteT.services.eyebrow}</p>
          <h2 id="services-heading" className={styles.serviceHeading}>
            <button type="button" onClick={onHeadingClick} aria-pressed="true" className={styles.headingSwitch}>{siteT.services.heading} <span>{siteT.services.headingAccent}</span></button>
          </h2>
        </div> : <h2 id="selected-work-heading" className={styles.eyebrow}><span aria-hidden="true" />{t("eyebrow")}</h2>}
      </header>
      <div ref={stageRef} className={styles.stage} style={{ "--project-color": project.color } as CSSProperties} role="region" aria-label={`${projectName} — ${projectDescription}`} tabIndex={0}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
        onPointerLeave={(event) => { if (event.pointerType === "mouse") setHovered(false); }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            select(event.key === "Home" ? 0 : event.key === "End" ? count - 1 : activeRef.current + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
        onPointerDown={startSwipe} onPointerUp={endSwipe} onPointerCancel={() => { swipe.current = null; setPointerActive(false); }}>
        <Image key={project.id} src={project.poster} alt={`${projectName} — ${projectDescription}`} fill priority={activeIndex === 0} sizes="(min-width: 2560px) 2400px, (min-width: 1024px) 94vw, calc(100vw - 32px)" className={styles.artwork} draggable={false} />
        {fallbackFrom !== null && <Image key={`fallback-${fallbackFrom}-${activeIndex}`} src={projects[fallbackFrom].poster} alt="" fill sizes="(min-width: 2560px) 2400px, (min-width: 1024px) 94vw, calc(100vw - 32px)" className={styles.fallbackArtwork} draggable={false} />}
        {project.video && !videoFailed && <video ref={previewVideo} key={`${project.id}-video`} src={project.video} poster={project.poster} muted playsInline loop preload="none" className={styles.film} onError={() => setVideoFailed(true)} onPlay={() => setVideoPlaying(true)} onPause={() => setVideoPlaying(false)} aria-label={projectName} />}
        <canvas ref={canvasRef} className={styles.canvas} data-active={fxActive} aria-hidden="true" />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.stageTop} aria-hidden="true"><span>{String(activeIndex + 1).padStart(2, "0")}</span><span>{String(count).padStart(2, "0")}</span></div>
        <div className={styles.stageBottom}>
          <div className={styles.captionRow}>
            <div className={styles.identity} key={project.id}><h3>{projectName}</h3><p>{projectDescription}</p></div>
            <div className={styles.controls}>
              {project.video && !videoFailed && <button type="button" className={styles.control} aria-label={videoPlaying ? t("pause") : t("play")} onClick={() => { if (videoPlaying) { setVideoPaused(true); previewVideo.current?.pause(); } else { setVideoPaused(false); void previewVideo.current?.play(); } }}>{videoPlaying ? <Pause size={16} /> : <Play size={16} />}</button>}
              {!reduceMotion && <button type="button" className={styles.control} onClick={() => setPaused((value) => !value)} aria-label={paused ? t("play") : t("pause")} aria-pressed={paused}>{paused ? <Play size={16} /> : <Pause size={16} />}<span>{paused ? t("play") : t("pause")}</span></button>}
            </div>
          </div>
          <nav className={styles.projectNav} aria-label={isServices ? `${siteT.services.heading} ${siteT.services.headingAccent}` : t("browse")} style={{ "--gallery-count": count } as CSSProperties}>
            {projects.map((item, index) => <button type="button" key={item.id} className={styles.projectButton} data-active={index === activeIndex} aria-current={index === activeIndex ? "true" : undefined} onClick={() => select(index)}>
              <span className={styles.projectRule} aria-hidden="true"><span style={{ transform: `scaleX(${index === activeIndex ? progress : 0})` }} /></span>
              <span className={styles.projectNumber}>{String(index + 1).padStart(2, "0")}</span><span className={styles.projectLabel}>{isServices ? (siteT.services.items[index]?.title ?? item.name) : item.name}</span>
            </button>)}
          </nav>
        </div>
      </div>
      <div className={styles.divider} />
      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</span>
    </div>
  </section>;
}
