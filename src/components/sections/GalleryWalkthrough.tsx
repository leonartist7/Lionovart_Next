'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { useSaveData } from '@/hooks/useSaveData';
import HandoffDissolveFilter from './HandoffDissolveFilter';
import { useDissolveStage } from '@/hooks/useDissolveStage';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicCopy } from '@/hooks/usePublicCopy';
import { ScenePortal, usePinnedScene } from './service-world/PinnedScene';
import { prepareScreeningPosters, ScreeningMedia } from './ScreeningMedia';
import { GALLERY_SERVICE_LABELS, type GalleryWork } from './selected-work/gallery';
import { galleryLayout, galleryRingDiameter, galleryRingCenterOffset, galleryFocusDepth, GALLERY_ENTRY_PROJECTION } from './gallery-layout';
import { doorwayTitleOpacity, serviceGalleryHandoff } from './service-gallery-handoff';
import { galleryCardPose, galleryRingPose, galleryEnding, galleryProjectProgress, galleryProgress, galleryTravel, galleryRunwayScreens, galleryStepTarget, galleryNavigationDuration, galleryNavigationEase, GALLERY_DEPTH_STEP } from './gallery-journey';
import styles from './GalleryWalkthrough.module.css';
import PartnershipMark from './PartnershipMark';
import { partnershipDiscLayout, partnershipLayout } from './partnership-layout';

function WorkTags({ work }: { work: GalleryWork }) {
  const tr = usePublicCopy();
  return <span className={styles.projectTags} data-work-tags>
    {work.services.filter(id => id !== 'motion').map(id => <span key={id}>{tr(GALLERY_SERVICE_LABELS[id] ?? id)}</span>)}
  </span>;
}

const subscribeCapacity = () => () => {};
const constrainedCapacity = () => {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2 || !!memory && memory <= 2;
};
const serverCapacity = () => false;

function GalleryPanel({ work, index, count, progress, entry, entryScale, focusDepth, active, selected, onSelect }: {
  work: GalleryWork; index: number; count: number; progress: MotionValue<number>; entry: MotionValue<number>;
  entryScale: MotionValue<number>; focusDepth: MotionValue<number>; active: boolean; selected: boolean; onSelect: (slug: string) => void;
}) {
  const reduce = useReducedMotion();
  const saveData = useSaveData();
  const constrained = useSyncExternalStore(subscribeCapacity, constrainedCapacity, serverCapacity);
  const simpleExit = reduce || saveData || constrained;
  const panelRef = useRef<HTMLDivElement>(null);
  const filterId = `gallery-erosion-${useId().replace(/:/g, '')}`;
  const cutoffs = useRef<SVGElement[]>([]);
  useEffect(() => { cutoffs.current = [...(panelRef.current?.querySelectorAll<SVGElement>('[data-gallery-cutoff]') ?? [])]; }, [simpleExit]);
  const focusSpring = useSpring(0, { stiffness: 180, damping: 30, mass: 1 });
  useEffect(() => { focusSpring.set(selected ? 1 : 0); }, [selected, focusSpring]);
  const pose = useTransform(progress, p => galleryCardPose(p, index, count));
  const transform = useTransform(() => {
    const { z, forward } = pose.get();
    const focus = (reduce ? Number(selected) : focusSpring.get()) * (1 - forward);
    const depth = z + (Math.min(focusDepth.get(), 145) - z) * focus;
    const size = index === 0 ? 1 + (entryScale.get() - 1) * (1 - entry.get()) : 1;
    return `translate3d(0,0,${depth}px) translate(-50%,-50%) scale(${size})`;
  });
  const opacity = useTransform(pose, p => p.opacity);
  const visibility = useTransform(pose, p => p.visible ? 'visible' : 'hidden');
  const caption = useTransform(() => pose.get().caption * entry.get());
  const filter = useTransform(pose, p => !simpleExit && p.visible && p.dissolve > 0 && p.dissolve < 1 ? `url(#${filterId})` : 'none');
  const maskImage = useTransform(pose, p => {
    if (simpleExit || !p.visible || p.dissolve <= 0) return 'none';
    const hole = -20 + 160 * p.dissolve;
    return `radial-gradient(ellipse closest-side, transparent ${hole}%, #000 ${hole + 20}%)`;
  });
  const [readable, setReadable] = useState(() => pose.get().caption > .5);
  // Subscribe to the numeric input. An object-valued pose can emit during React render.
  useMotionValueEvent(progress, 'change', p => {
    const next = galleryCardPose(p, index, count);
    setReadable(next.caption > .5);
    if (!simpleExit && next.visible && next.dissolve > 0 && next.dissolve < 1) {
      cutoffs.current.forEach(node => {
        node.setAttribute('intercept', String((node.dataset.galleryCutoff === 'edge' ? 1.24 : 1) - next.dissolve * 7));
      });
    }
  });
  const interactive = active && readable;
  return <motion.div ref={panelRef} className={styles.panel} data-gallery-panel data-gallery-index={index} data-gallery-project={work.slug} data-focused={selected}
    style={{ transform, opacity, visibility }} inert={!interactive} aria-hidden={!interactive}>
    <button type="button" className={styles.project} onClick={event => { event.stopPropagation(); event.currentTarget.focus({ preventScroll: true }); onSelect(work.slug); }}
      aria-label={`Focus work: ${work.name}`} aria-pressed={selected}>
      {!simpleExit && <HandoffDissolveFilter id={filterId} seed={index + 43} gallery />}
      <motion.div className={styles.screen} data-gallery-artwork style={{ filter, maskImage }}><ScreeningMedia asset={work} active={interactive} label={false} /></motion.div>
      <motion.span className={styles.projectCaption} style={{ opacity: caption }}><WorkTags work={work} /></motion.span>
    </button>
  </motion.div>;
}

function GalleryRing({ index, count, progress, entry }: { index: number; count: number; progress: MotionValue<number>; entry: MotionValue<number> }) {
  const transform = useTransform(progress, p => `translate(-50%,-50%) translateZ(${galleryRingPose(p, index, count).z}px)`);
  const opacity = useTransform(() => galleryRingPose(progress.get(), index, count).opacity * entry.get());
  const visibility = useTransform(progress, p => galleryRingPose(p, index, count).visible ? 'visible' : 'hidden');
  return <motion.div className={styles.portalRing} data-gallery-ring={index} data-final={index === count - 1} aria-hidden="true" style={{ transform, opacity, visibility }}>
    {index === count - 1 && <img src="/images/lionovart-icon.svg" className={styles.finalRingLogo} alt="" width={160} height={160} />}
  </motion.div>;
}

/** Scroll moves the exhibits through one stationary viewport, then reveals the studio mark. */
export default function GalleryWalkthrough({ projects, servicesCurves }: {
  projects: readonly GalleryWork[]; servicesCurves: boolean;
}) {
  const scene = usePinnedScene();
  const lenis = useLenis();
  const { locale } = useLanguage(); const fr = locale === 'fr';
  const tr = usePublicCopy();
  const { runway, stage, active } = useDissolveStage();
  const progress = useMotionValue(0);
  const focusDepth = useMotionValue(100);
  const entry = useMotionValue(0), arrivalProgress = useMotionValue(0), entryScale = useMotionValue(1);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const currentProject = useRef(0);
  const readingAnchor = useRef<{ projectIndex: number; slug: string | null; ending: boolean; focus: boolean } | null>(null);
  const navigation = useRef({ ticket: 0, target: null as number | null });
  const [requested, setRequested] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const onSelect = (slug: string) => setSelectedSlug(current => current === slug ? null : slug);
  const [projectIndex, setProjectIndex] = useState(0), [ending, setEnding] = useState(false), [walking, setWalking] = useState(true);
  const projectCount = Math.max(1, projects.length);
  const pinned = !!scene?.target;
  const sharedPortal = !!scene?.target?.closest('[data-world-mode="media"]');
  const titleOpacity = useTransform(() => doorwayTitleOpacity(arrivalProgress.get()));
  const coreOpacity = useTransform(progress, p => galleryEnding(p).core);
  const coreTransform = useTransform(progress, p => `translate(-50%,-50%) translateY(calc((var(--partnership-disc-center) - 48svh) * ${galleryEnding(p).markSettle})) scale(${galleryEnding(p).coreScale})`);
  const headlineOpacity = useTransform(progress, p => galleryEnding(p).title);
  const headlineTransform = useTransform(progress, p => `translate(-50%,-50%) translateY(calc(var(--partnership-disc-size) * ${galleryEnding(p).markSettle * .14}))`);
  const logoOpacity = useTransform(progress, p => galleryEnding(p).logo);
  const copyOpacity = useTransform(progress, p => galleryEnding(p).copy);
  const copyTransform = useTransform(progress, p => {
    const ending = galleryEnding(p);
    return `translateY(calc((48svh - var(--partnership-disc-center)) * ${1-ending.markSettle} + var(--partnership-disc-size) * ${(ending.coreScale-.76)/2} + ${(1-ending.copy)*16}px))`;
  });
  const [finaleVisible, setFinaleVisible] = useState(false), [logoReady, setLogoReady] = useState(false);
  const navOpacity = useTransform(() => galleryEnding(progress.get()).navigation * entry.get());
  useMotionValueEvent(progress, 'change', p => {
    const nextProject = Math.min(projectCount - 1, Math.max(0, Math.floor(galleryTravel(p, projectCount) / GALLERY_DEPTH_STEP + .18)));
    if (currentProject.current !== nextProject || galleryEnding(p).copy > .05) { currentProject.current = nextProject; setSelectedSlug(null); }
    setProjectIndex(nextProject);
    setEnding(galleryEnding(p).core > .7);
    setFinaleVisible(galleryEnding(p).title > .5);
    setLogoReady(galleryEnding(p).core > .5);
    setWalking(galleryEnding(p).navigation > .1);
  });
  useEffect(() => {
    const anchor = runway.current; if (!anchor) return;
    let frame = 0, layoutKey = '';
    let rootRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const sync = () => {
      frame = 0;
      const box = anchor.getBoundingClientRect();
      const rem = rootRem;
      const nextKey = `${innerWidth}/${innerHeight}/${document.documentElement.clientWidth}/${rem}`;
      const surface = stage.current;
      if (surface && nextKey !== layoutKey) {
        layoutKey = nextKey;
        const layout = galleryLayout(innerWidth, innerHeight, document.documentElement.clientWidth, rem);
        const captions = [...surface.querySelectorAll<HTMLElement>('[data-work-tags]')];
        const captionHeight = Math.max(layout.captionAllowance, ...captions.map(node => node.offsetHeight));
        const captionWidth = Math.max(layout.panelWidth, ...captions.map(node => node.offsetWidth));
        focusDepth.set(galleryFocusDepth(layout, document.documentElement.clientWidth, innerHeight, rem, captionHeight, captionWidth));
        surface.style.setProperty('--gallery-ring-size', `${galleryRingDiameter(layout, captionHeight)}px`);
        surface.style.setProperty('--gallery-ring-offset', `${galleryRingCenterOffset(layout, captionHeight)}px`);
        const endingLayout = partnershipLayout(document.documentElement.clientWidth, innerHeight);
        surface.style.setProperty('--partnership-mark-size', `${endingLayout.markSize}px`);
        surface.style.setProperty('--partnership-mark-top', `${endingLayout.markCenter}px`);
        surface.style.setProperty('--partnership-copy-top', `${endingLayout.copyTop}px`);
        surface.style.setProperty('--partnership-cta-bottom', `${endingLayout.ctaBottom}px`);
        surface.dataset.galleryAxis = layout.vertical ? 'vertical' : 'horizontal';
        surface.dataset.galleryCompact = String(layout.compact);
        surface.style.setProperty('--gallery-caption-width', `${layout.captionWidth}px`);
        const disc = partnershipDiscLayout(document.documentElement.clientWidth, innerHeight, rem);
        surface.style.setProperty('--partnership-disc-size', `${disc.diameter}px`);
        surface.style.setProperty('--partnership-disc-center', `${disc.center}px`);
        surface.style.setProperty('--partnership-copy-top', `${disc.subtitleTop}px`);
        surface.style.setProperty('--gallery-panel-top', `${layout.panelTop}%`);
        surface.style.setProperty('--gallery-panel-width', `${layout.panelWidth}px`);
      }
      const value = pinned ? galleryProgress(box.top, box.height, innerHeight) : 0;
      progress.set(value);
      const arrival = serviceGalleryHandoff(box.top, innerHeight);
      // Inherit the service's complete 16:9 frame during the size match, then
      // continuously recover each artwork's natural frame on the tunnel axis.
      surface?.style.setProperty('--gallery-frame-match', String(pinned ? 1 - arrival.spread : 0));
      entry.set(pinned ? arrival.spread : 1);
      arrivalProgress.set(pinned ? arrival.progress : 0);
      if (pinned && arrival.progress < 1) {
        const source = scene?.target?.querySelector<HTMLElement>('[data-services-stage] [data-position=center] [data-service-frame-target], [data-services-stage] [data-position=center] [data-screening-media]');
        const incoming = stage.current?.querySelector<HTMLElement>('[data-gallery-index="0"] [data-screening-media]');
        if (source && incoming?.offsetWidth) entryScale.set(source.getBoundingClientRect().width / (incoming.offsetWidth / GALLERY_ENTRY_PROJECTION));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const refreshType = () => { rootRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; layoutKey = ''; schedule(); };
    const observer = new ResizeObserver(refreshType); observer.observe(anchor);
    // Media metadata and service replacement can change the fitted width after
    // the scroll frame. Keep the entry match current even while the reader rests.
    const geometry = new ResizeObserver(() => { layoutKey = ''; schedule(); });
    let measured: Element[] = [];
    const refresh = () => {
      const next = [scene?.target?.querySelector('[data-services-stage] [data-position=center] [data-service-frame-target], [data-services-stage] [data-position=center] [data-screening-media]'),
        stage.current?.querySelector('[data-gallery-index="0"] [data-screening-media]'),
        ...(stage.current?.querySelectorAll('[data-work-tags]') ?? [])].filter((node): node is Element => !!node);
      if (next.length === measured.length && next.every((node, index) => node === measured[index])) return;
      geometry.disconnect(); measured = next; measured.forEach(node => geometry.observe(node)); schedule();
    };
    const replacements = new MutationObserver(refresh);
    if (scene?.target) replacements.observe(scene.target, { childList: true, subtree: true });
    refresh();
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', refreshType);
    void document.fonts.ready.then(refreshType);
    sync();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); geometry.disconnect(); replacements.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', refreshType); };
  }, [pinned, progress, entry, entryScale, focusDepth, arrivalProgress, runway, scene?.target, stage]);

  // Snapshot the reading identity before the shared scene changes DOM owners.
  useEffect(() => {
    const remember = () => {
      const surface = stage.current;
      if (!surface) return;
      const bounds = runway.current?.getBoundingClientRect();
      if (!bounds || bounds.top > innerHeight * .2 || bounds.bottom < 0) return;
      if (pinned && surface.dataset.chapterActive !== 'true') return;
      const cards = [...surface.querySelectorAll<HTMLElement>('[data-static-project]')];
      const visible = cards.find(card => { const box = card.getBoundingClientRect(); return box.bottom > innerHeight * .2 && box.top < innerHeight; });
      const atEnding = pinned ? finaleVisible : !visible && (surface.querySelector('[data-partnership-static-mark]')?.getBoundingClientRect().top ?? Infinity) < innerHeight;
      const index = pinned ? currentProject.current : Math.max(0, cards.indexOf(visible!));
      readingAnchor.current = { projectIndex: index, slug: selectedSlug ?? projects[index]?.slug ?? null,
        ending: atEnding, focus: surface.contains(document.activeElement) };
    };
    window.addEventListener('lionovart:story-layout-will-change', remember);
    return () => window.removeEventListener('lionovart:story-layout-will-change', remember);
  }, [pinned, finaleVisible, selectedSlug, projects, runway, stage]);

  useEffect(() => {
    const remembered = readingAnchor.current;
    readingAnchor.current = null;
    // A later-page anchor must not be mistaken for a gallery resize restore.
    if (!remembered && location.hash && !['#selected-work', '#partnership'].includes(location.hash)) return;
    const bounds = runway.current?.getBoundingClientRect();
    const withinGallery = bounds && bounds.top <= innerHeight * .2 && bounds.bottom > innerHeight;
    if (!remembered && !withinGallery && !['#selected-work', '#partnership'].includes(location.hash)) return;
    let frame = 0;
    const land = () => { frame = requestAnimationFrame(() => {
      const anchor = runway.current; if (!anchor) return;
      const box = anchor.getBoundingClientRect();
      const offset = remembered && pinned ? (box.height - innerHeight * .85) * (remembered.ending ? .98 : galleryProjectProgress(remembered.projectIndex, projectCount)) : location.hash === '#partnership' && pinned ? (box.height - innerHeight * .85) * .98 : pinned && location.hash === '#selected-work' ? -innerHeight * .52 : 0;
      const staticEnding = !pinned && (remembered?.ending || location.hash === '#partnership') ? stage.current?.querySelector('[data-partnership-static-mark], [data-gallery-ending]') : null;
      const project = remembered?.slug ? [...(stage.current?.querySelectorAll<HTMLElement>('[data-static-project], [data-gallery-project]') ?? [])].find(node => (node.dataset.staticProject ?? node.dataset.galleryProject) === remembered.slug) : null;
      const target = !pinned && project && !remembered?.ending ? scrollY + project.getBoundingClientRect().top - 6 * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) : staticEnding ? scrollY + staticEnding.getBoundingClientRect().top - 96 : scrollY + box.top + offset;
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true, userData: { navigation: true } });
      else window.scrollTo({ top: target, behavior: 'instant' });
      if (remembered?.focus) {
        frame = requestAnimationFrame(() => {
          const equivalent = remembered.ending ? stage.current?.querySelector<HTMLButtonElement>('[data-partnership-action] button') : project?.matches('button') ? project : project?.querySelector<HTMLButtonElement>('button');
          if (equivalent && !equivalent.closest('[inert]')) equivalent.focus({ preventScroll: true });
        });
      }
    }); };
    if (document.documentElement.dataset.splashComplete === 'true') land();
    else window.addEventListener('lionovart:splash-complete', land, { once: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('lionovart:splash-complete', land); };
  }, [pinned, runway, stage, lenis, projectCount]);

  // Native gestures interrupt both poster preparation and arrow travel. No scroll lock.
  useEffect(() => {
    const controller = navigation.current;
    const interrupt = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (!['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        if (event.target instanceof Element && event.target.closest('[data-gallery-navigation], [data-work-filter]')) return;
      }
      if (controller.target === null) return;
      controller.ticket++;
      controller.target = null; setRequested(null);
      if (lenis) lenis.scrollTo(lenis.animatedScroll, { immediate: true });
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    reduced.addEventListener('change', interrupt);
    window.addEventListener('resize', interrupt);
    window.addEventListener('wheel', interrupt, { passive: true, capture: true });
    window.addEventListener('touchstart', interrupt, { passive: true, capture: true });
    window.addEventListener('keydown', interrupt, true);
    return () => {
      controller.ticket++;
      reduced.removeEventListener('change', interrupt);
      window.removeEventListener('resize', interrupt);
      window.removeEventListener('wheel', interrupt, true);
      window.removeEventListener('touchstart', interrupt, true);
      window.removeEventListener('keydown', interrupt, true);
      if (controller.target !== null && lenis) lenis.scrollTo(lenis.animatedScroll, { immediate: true });
    };
  }, [lenis]);

  const move = (direction: -1 | 1) => {
    const target = galleryStepTarget(currentProject.current, navigation.current.target, direction, projectCount);
    const ticket = ++navigation.current.ticket;
    navigation.current.target = target; setRequested(target); setPreviewError(false);
    setSelectedSlug(null);
    const complete = () => {
      if (ticket !== navigation.current.ticket) return;
      navigation.current.target = null; setRequested(null);
    };
    void prepareScreeningPosters(projects.slice(target, target + 1)).then(() => {
      if (ticket !== navigation.current.ticket) return;
      const anchor = runway.current; if (!anchor) return;
      const box = anchor.getBoundingClientRect();
      const p = target >= projectCount ? .98 : galleryProjectProgress(target, projectCount);
      const y = scrollY + box.top + p * (box.height - innerHeight * .85);
      const distance = y - scrollY;
      const duration = galleryNavigationDuration(distance, innerHeight);
      // Lenis exposes velocity in px/frame; carry it into the new curve in px/sec.
      const easing = galleryNavigationEase((lenis?.velocity ?? 0) * 60, distance, duration);
      if (lenis) lenis.scrollTo(y, { duration, lerp: 0, easing, lock: false, userData: { navigation: true }, onComplete: complete });
      else { window.scrollTo({ top: y, behavior: 'smooth' }); complete(); }
    }, () => {
      if (ticket !== navigation.current.ticket) return;
      complete(); setPreviewError(true);
    });
  };

  const continueToResults = () => {
    const target = document.getElementById('client-results') ?? document.getElementById('client-experience');
    if (!target) return;
    history.replaceState(null, '', `#${target.id}`);
    const top = scrollY + target.getBoundingClientRect().top - 64;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenis) lenis.scrollTo(top, { duration: 1.1, immediate: reduced, userData: { navigation: true } });
    else window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
  };

  return <section id="selected-work" className={styles.section} data-gallery="compact" data-gallery-story data-nav-surface="light"
    data-scroll-title-skip data-curves={servicesCurves} aria-labelledby="selected-work-heading">
    <div ref={runway} className={styles.runway} data-gallery-runway style={{ '--gallery-runway': `${galleryRunwayScreens(projectCount) * 100}svh` } as CSSProperties}>
      <span id="partnership" className={styles.partnershipAnchor} aria-hidden="true" />
      <ScenePortal><div ref={stage} className={styles.stage} data-scroll-title-skip data-dissolve-stage data-gallery-stage data-gallery-rows={projectCount} data-scene-chapter="work" data-walkthrough-pinned={pinned}
        onClick={() => { if (selectedSlug) setSelectedSlug(null); }}
        onKeyDown={event => { if (event.key === 'Escape' && selectedSlug) { setSelectedSlug(null); event.stopPropagation(); } }}>
        {!sharedPortal && <motion.header className={styles.header} data-gallery-title style={{ opacity: pinned ? titleOpacity : 1, transform: pinned ? 'translateY(-50%)' : 'none' }}>
          <p>{fr ? 'Entrez dans l’univers' : 'Step inside'}</p>
          <h2 id="selected-work-heading">{fr ? 'de nos réalisations' : 'our selected work'}</h2>
        </motion.header>}
        {pinned && <motion.div className={styles.redCore} data-gallery-red-core style={{ opacity: coreOpacity, transform: coreTransform }}>
          <motion.h2 className={styles.discTitle} data-partnership-disc-title aria-hidden={!finaleVisible} style={{ opacity: headlineOpacity, transform: headlineTransform }}>{locale === 'en' ? 'One Partnership' : tr('One partnership')}</motion.h2>
          <motion.div className={styles.discLogo} data-gallery-logo style={{ opacity: logoOpacity, pointerEvents: logoReady ? 'auto' : 'none' }}>
            <img src="/images/lionovart-icon.svg" className={styles.realLogo} alt="LIONOVART" width={160} height={160} />
          </motion.div>
        </motion.div>}
        {pinned ? <div className={styles.corridor} data-gallery-corridor>
          {projects.map((work, index) => <GalleryRing key={`ring-${work.slug}`} index={index} count={projectCount} progress={progress} entry={entry} />)}
          {projects.map((work, index) => <GalleryPanel key={work.slug} work={work} index={index} count={projectCount}
            progress={progress} entry={entry} entryScale={entryScale} focusDepth={focusDepth} selected={selectedSlug === work.slug}
            active={active && index === projectIndex && !ending} onSelect={onSelect} />)}
        </div> : <div className={styles.staticGrid}>
          {projects.map(work => <button type="button" key={work.slug} data-static-project={work.slug} className={styles.staticProject} data-focused={selectedSlug === work.slug} data-dimmed={!!selectedSlug && selectedSlug !== work.slug}
            onClick={event => { event.stopPropagation(); event.currentTarget.focus({ preventScroll: true }); onSelect(work.slug); }} aria-label={`Focus work: ${work.name}`} aria-pressed={selectedSlug === work.slug}>
            <div className={styles.screen}><ScreeningMedia asset={work} active={false} label={false} /></div>
            <span className={styles.projectCaption}><WorkTags work={work} /></span>
          </button>)}
        </div>}
        {!pinned && <div className={styles.staticMark} data-partnership-static-mark><PartnershipMark emblemOnly active={active} ready /></div>}
        <motion.div className={styles.ending} data-gallery-ending aria-hidden={pinned && !logoReady} style={{ opacity: pinned ? copyOpacity : 1, transform: pinned ? copyTransform : 'none' }}>
          {!pinned && <h2>{tr('One partnership')}</h2>}
          <p>{tr('Designing your legacy')}</p>
        </motion.div>
        {previewError && <motion.p className={styles.previewError} style={{ opacity: pinned ? navOpacity : 1 }} aria-hidden={pinned && !walking} role="status">{fr ? 'Aperçu indisponible. Réessayez.' : 'Preview unavailable. Please try again.'}</motion.p>}
        {pinned && <motion.nav className={styles.navigation} data-gallery-navigation aria-busy={requested !== null} style={{ opacity: navOpacity }} aria-label={fr ? 'Parcourir les projets' : 'Browse the gallery'} inert={!walking} aria-hidden={!walking}>
          <button type="button" onClick={() => move(-1)} disabled={(requested ?? projectIndex) === 0} aria-label={tr('Previous works')}><ArrowLeft className={styles.horizontalArrow} aria-hidden="true" /><ArrowUp className={styles.verticalArrow} aria-hidden="true" /></button>
          <span aria-live="polite">{String(projectIndex + 1).padStart(2, '0')} <i>/ {String(projectCount).padStart(2, '0')}</i></span>
          <button type="button" onClick={() => move(1)} aria-label={(requested ?? projectIndex) >= projectCount - 1 ? tr('One partnership') : tr('Next works')}><ArrowRight className={styles.horizontalArrow} aria-hidden="true" /><ArrowDown className={styles.verticalArrow} aria-hidden="true" /></button>
        </motion.nav>}
      </div></ScenePortal>
    </div>
  </section>;
}

