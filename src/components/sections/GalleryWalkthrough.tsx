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
import { galleryLayout, GALLERY_ENTRY_PROJECTION } from './gallery-layout';
import { serviceGalleryHandoff } from './service-gallery-handoff';
import { galleryCardPose, galleryEnding, galleryPairProgress, galleryProgress, galleryTravel, galleryTitlePose, galleryRunwayScreens, galleryStepTarget, galleryNavigationDuration, galleryNavigationEase, GALLERY_DEPTH_STEP } from './gallery-journey';
import styles from './GalleryWalkthrough.module.css';
import PartnershipMark, { PartnershipResultsButton } from './PartnershipMark';
import { partnershipLayout } from './partnership-layout';

const subscribeCapacity = () => () => {};
const constrainedCapacity = () => {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2 || !!memory && memory <= 2;
};
const serverCapacity = () => false;

function WorkTags({ work }: { work: GalleryWork }) {
  const tr = usePublicCopy();
  return <span className={styles.projectTags} data-work-tags>
    {work.services.map(id => <span key={id}>{tr(GALLERY_SERVICE_LABELS[id] ?? id)}</span>)}
  </span>;
}

function GalleryPanel({ work, index, pairs, progress, entry, entryScale, near, active, selected, dimmed, solo, onSelect }: {
  work: GalleryWork; index: number; pairs: number; progress: MotionValue<number>; entry: MotionValue<number>; entryScale: MotionValue<number>;
  near: boolean; active: boolean; selected: boolean; dimmed: boolean; solo: boolean; onSelect: (slug: string) => void;
}) {
  const pair = Math.floor(index / 2), side = solo ? 0 : index % 2 ? 1 : -1;
  const reduce = useReducedMotion();
  const saveData = useSaveData();
  const constrained = useSyncExternalStore(subscribeCapacity, constrainedCapacity, serverCapacity);
  const simpleExit = saveData || constrained;
  const filterId = `gallery-erosion-${useId().replace(/:/g, '')}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const [readable, setReadable] = useState(true);
  const erosion = useTransform(progress, p => galleryCardPose(p, pair, pairs).dissolve);
  const filter = useTransform(erosion, p => !reduce && !simpleExit && p > 0 && p < 1 ? `url(#${filterId})` : 'none');
  useMotionValueEvent(erosion, 'change', value => {
    panelRef.current?.querySelectorAll<SVGElement>('[data-gallery-cutoff]').forEach(node => {
      node.setAttribute('intercept', String((node.dataset.galleryCutoff === 'edge' ? 1.24 : 1) - value * 10));
    });
    setReadable(value < .12);
  });
  // Restore the threshold after preference changes and deep-link mounting.
  useEffect(() => {
    panelRef.current?.querySelectorAll<SVGElement>('[data-gallery-cutoff]').forEach(node => {
      node.setAttribute('intercept', String((node.dataset.galleryCutoff === 'edge' ? 1.24 : 1) - erosion.get() * 10));
    });
  }, [erosion, reduce, simpleExit]);
  const [mediaVisible, setMediaVisible] = useState(pair === 0);
  useMotionValueEvent(progress, 'change', p => setMediaVisible(galleryCardPose(p, pair, pairs).opacity > .2));
  const focusTarget = useMotionValue(0), dimTarget = useMotionValue(1);
  const focusSpring = useSpring(focusTarget, { stiffness: 180, damping: 30, mass: 1 });
  const dimSpring = useSpring(dimTarget, { stiffness: 180, damping: 30, mass: 1 });
  useEffect(() => { focusTarget.set(selected ? 1 : 0); dimTarget.set(dimmed ? .35 : 1); }, [selected, dimmed, focusTarget, dimTarget]);
  const transform = useTransform(() => {
    const spread = entry.get(), focus = reduce ? 0 : focusSpring.get();
    const { z, outward, background, preview } = galleryCardPose(progress.get(), pair, pairs);
    const baseZ = -350 - index * 18 * (1 - spread) + (z + 350) * spread;
    const depth = baseZ + (Math.max(0, baseZ) - baseZ) * focus;
    const size = 1 + (entryScale.get() - 1) * (1 - spread);
    const gapCompensation = Math.max(0, z + 350) / 2000;
    return `translate3d(calc(${side * spread * (1 - focus)} * (var(--gallery-wall-offset) - ${preview} * var(--gallery-preview-inset,0px) - ${gapCompensation} * var(--gallery-center-gap,0px) + ${outward} * var(--gallery-wall-travel) + ${background * Math.max(1, (1000 - z) / 1000)} * var(--gallery-background-x,0px))), calc(${side * spread * (1 - focus)} * (var(--gallery-wall-offset-y) + ${outward} * var(--gallery-wall-travel-y)) + ${(pair % 2 ? -1 : 1) * spread * (1 - focus) * outward} * var(--gallery-wall-stagger)), ${depth}px) translate(-50%,-50%) rotateY(calc(${-side * spread * (1 - focus)} * (var(--gallery-wall-angle) + ${outward} * var(--gallery-exit-angle) + ${background} * var(--gallery-background-angle,0deg)))) scale(${size})`;
  });
  const opacity = useTransform(() => {
    const pose = galleryCardPose(progress.get(), pair, pairs);
    return (reduce || simpleExit ? pose.opacity : pose.surfaceOpacity) * (pair > 0 ? entry.get() : 1) * (reduce ? dimTarget.get() : dimSpring.get());
  });
  const labelOpacity = useTransform(() => galleryCardPose(progress.get(), pair, pairs).caption * Math.max(0, Math.min(1, (entry.get() - .65) / .35)) * Math.max(0, ((reduce ? dimTarget.get() : dimSpring.get()) - .35) / .65));
  const visibility = useTransform(progress, p => galleryCardPose(p, pair, pairs).visible ? 'visible' : 'hidden');
  return <motion.div ref={panelRef} className={styles.panel} data-gallery-panel data-gallery-index={index} data-focused={selected}
    style={{ transform, opacity, visibility }} inert={!near || !active || !readable} aria-hidden={!near || !readable}>
    <button type="button" className={styles.project} onClick={() => onSelect(work.slug)}
      aria-label={`Focus work: ${work.name}`} aria-pressed={selected}>
      <HandoffDissolveFilter id={filterId} seed={index + 43} gallery />
      <motion.div className={styles.screen} data-gallery-artwork style={{ filter }}><ScreeningMedia asset={work} active={active && near && readable && mediaVisible && (selected || !dimmed && side <= 0)} label={false} /></motion.div>
      <motion.span className={styles.projectCaption} style={{ opacity: labelOpacity }}>
        <WorkTags work={work} />
      </motion.span>
    </button>
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
  const entry = useMotionValue(0), arrivalProgress = useMotionValue(0), entryScale = useMotionValue(1);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const currentPair = useRef(0);
  const navigation = useRef({ ticket: 0, target: null as number | null });
  const [requested, setRequested] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const onSelect = (slug: string) => setSelectedSlug(current => current === slug ? null : slug);
  const [pair, setPair] = useState(0), [ending, setEnding] = useState(false), [walking, setWalking] = useState(true);
  const pairs = Math.max(1, Math.ceil(projects.length / 2));
  const pinned = !!scene?.target;
  const titleOpacity = useTransform(arrivalProgress, p => galleryTitlePose(p).opacity);
  const titleTransform = useTransform(arrivalProgress, p => {
    const { y, z } = galleryTitlePose(p);
    return `perspective(1000px) translate3d(0,${y}px,${z}px)`;
  });
  const logoTransform = useTransform(progress, p => `translate(-50%,-50%) translateZ(${galleryEnding(p).logoZ}px)`);
  const logoOpacity = useTransform(progress, p => galleryEnding(p).logo);
  const ringOpacity = useTransform(progress, p => galleryEnding(p).ring);
  const copyOpacity = useTransform(progress, p => galleryEnding(p).copy);
  const copyTransform = useTransform(progress, p => `translateY(${(1 - galleryEnding(p).copy) * 16}px)`);
  const linkOpacity = useTransform(progress, p => galleryEnding(p).links);
  const navOpacity = useTransform(() => galleryEnding(progress.get()).navigation * entry.get());
  useMotionValueEvent(progress, 'change', p => {
    const nextPair = Math.min(pairs - 1, Math.max(0, Math.floor(galleryTravel(p, pairs) / GALLERY_DEPTH_STEP + .2)));
    if (currentPair.current !== nextPair || galleryEnding(p).copy > .05) { currentPair.current = nextPair; setSelectedSlug(null); }
    setPair(nextPair);
    setEnding(galleryEnding(p).links > .7);
    setWalking(galleryEnding(p).navigation > .1);
  });
  useEffect(() => {
    const anchor = runway.current; if (!anchor) return;
    let frame = 0, layoutKey = '';
    const sync = () => {
      frame = 0;
      const box = anchor.getBoundingClientRect();
      const nextKey = `${innerWidth}/${innerHeight}/${document.documentElement.clientWidth}`;
      const surface = stage.current;
      if (surface && nextKey !== layoutKey) {
        layoutKey = nextKey;
        const layout = galleryLayout(innerWidth, innerHeight, document.documentElement.clientWidth);
        const endingLayout = partnershipLayout(document.documentElement.clientWidth, innerHeight);
        surface.style.setProperty('--partnership-mark-size', `${endingLayout.markSize}px`);
        surface.style.setProperty('--partnership-mark-top', `${endingLayout.markCenter}px`);
        surface.style.setProperty('--partnership-copy-top', `${endingLayout.copyTop}px`);
        surface.style.setProperty('--partnership-cta-bottom', `${endingLayout.ctaBottom}px`);
        surface.dataset.galleryAxis = layout.vertical ? 'vertical' : 'horizontal';
        surface.dataset.galleryCompact = String(layout.compact);
        surface.style.setProperty('--gallery-wall-offset', `${layout.x}px`);
        surface.style.setProperty('--gallery-center-gap', `${layout.centerGap}px`);
        surface.style.setProperty('--gallery-preview-inset', `${layout.previewInset}px`);
        surface.style.setProperty('--gallery-background-x', `${layout.backgroundX}px`);
        surface.style.setProperty('--gallery-background-angle', layout.vertical ? '7deg' : '0deg');
        surface.style.setProperty('--gallery-wall-offset-y', `${layout.y}px`);
        surface.style.setProperty('--gallery-wall-travel', `${layout.exitX - layout.x}px`);
        surface.style.setProperty('--gallery-wall-travel-y', `${layout.exitY - layout.y}px`);
        surface.style.setProperty('--gallery-wall-stagger', layout.vertical ? '0px' : '2svh');
        surface.style.setProperty('--gallery-wall-angle', layout.vertical ? '0deg' : '4deg');
        surface.style.setProperty('--gallery-exit-angle', layout.vertical ? '0deg' : '2deg');
        surface.style.setProperty('--gallery-panel-top', `${layout.panelTop}%`);
        surface.style.setProperty('--gallery-panel-width', `${layout.panelWidth}px`);
      }
      const value = pinned ? galleryProgress(box.top, box.height, innerHeight) : 0;
      progress.set(value);
      const arrival = serviceGalleryHandoff(box.top, innerHeight);
      // Inherit the service's complete 16:9 frame during the size match, then
      // continuously recover each artwork's natural frame as the cards fan out.
      surface?.style.setProperty('--gallery-frame-match', String(pinned ? 1 - arrival.spread : 0));
      entry.set(pinned ? arrival.spread : 1);
      arrivalProgress.set(pinned ? arrival.progress : 0);
      if (pinned && arrival.progress < 1) {
        const source = scene?.target?.querySelector<HTMLElement>('[data-services-stage] [data-position=center] [data-screening-media]');
        const incoming = stage.current?.querySelector<HTMLElement>('[data-gallery-index="0"] [data-screening-media]');
        if (source && incoming?.offsetWidth) entryScale.set(source.getBoundingClientRect().width / (incoming.offsetWidth / GALLERY_ENTRY_PROJECTION));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const observer = new ResizeObserver(schedule); observer.observe(anchor);
    // Media metadata and service replacement can change the fitted width after
    // the scroll frame. Keep the entry match current even while the reader rests.
    const geometry = new ResizeObserver(schedule);
    let measured: Element[] = [];
    const refresh = () => {
      const next = [scene?.target?.querySelector('[data-services-stage] [data-position=center] [data-screening-media]'),
        stage.current?.querySelector('[data-gallery-index="0"] [data-screening-media]')].filter((node): node is Element => !!node);
      if (next.length === measured.length && next.every((node, index) => node === measured[index])) return;
      geometry.disconnect(); measured = next; measured.forEach(node => geometry.observe(node)); schedule();
    };
    const replacements = new MutationObserver(refresh);
    if (scene?.target) replacements.observe(scene.target, { childList: true, subtree: true });
    refresh();
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule);
    sync();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); geometry.disconnect(); replacements.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [pinned, progress, entry, entryScale, arrivalProgress, runway, scene?.target, stage]);

  useEffect(() => {
    const bounds = runway.current?.getBoundingClientRect();
    const withinGallery = bounds && bounds.top <= innerHeight * .2 && bounds.bottom > innerHeight;
    if (!withinGallery && !['#selected-work', '#partnership'].includes(location.hash)) return;
    let frame = 0;
    const land = () => { frame = requestAnimationFrame(() => {
      const anchor = runway.current; if (!anchor) return;
      const box = anchor.getBoundingClientRect();
      const offset = location.hash === '#partnership' && pinned ? (box.height - innerHeight * .85) * .91 : pinned && location.hash === '#selected-work' ? -innerHeight * .52 : 0;
      const staticEnding = !pinned && location.hash === '#partnership' ? stage.current?.querySelector('[data-partnership-static-mark], [data-gallery-ending]') : null;
      const target = staticEnding ? scrollY + staticEnding.getBoundingClientRect().top - 96 : scrollY + box.top + offset;
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true, userData: { navigation: true } });
      else window.scrollTo({ top: target, behavior: 'instant' });
    }); };
    if (document.documentElement.dataset.splashComplete === 'true') land();
    else window.addEventListener('lionovart:splash-complete', land, { once: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('lionovart:splash-complete', land); };
  }, [pinned, runway, stage, lenis]);

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
    const target = galleryStepTarget(currentPair.current, navigation.current.target, direction, pairs);
    const ticket = ++navigation.current.ticket;
    navigation.current.target = target; setRequested(target); setPreviewError(false);
    setSelectedSlug(null);
    const complete = () => {
      if (ticket !== navigation.current.ticket) return;
      navigation.current.target = null; setRequested(null);
    };
    void prepareScreeningPosters(projects.slice(target * 2, target * 2 + 2)).then(() => {
      if (ticket !== navigation.current.ticket) return;
      const anchor = runway.current; if (!anchor) return;
      const box = anchor.getBoundingClientRect();
      const p = target >= pairs ? .91 : galleryPairProgress(target, pairs);
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
    <div ref={runway} className={styles.runway} data-gallery-runway style={{ '--gallery-runway': `${galleryRunwayScreens(pairs) * 100}svh` } as CSSProperties}>
      <span id="partnership" className={styles.partnershipAnchor} aria-hidden="true" />
      <ScenePortal><div ref={stage} className={styles.stage} data-scroll-title-skip data-dissolve-stage data-gallery-stage data-gallery-rows={pairs} data-scene-chapter="work" data-walkthrough-pinned={pinned}
        onKeyDown={event => { if (event.key === 'Escape' && selectedSlug) { setSelectedSlug(null); event.stopPropagation(); } }}>
        <motion.header className={styles.header} style={{ opacity: pinned ? titleOpacity : 1, transform: pinned ? titleTransform : 'none' }}>
          <h2 id="selected-work-heading">{tr('Selected work')}</h2>
          <p>{fr ? 'Entrez dans notre univers.' : 'Step inside our world.'}</p>
        </motion.header>
        {pinned ? <div className={styles.corridor} data-gallery-corridor>
          {projects.map((work, index) => <GalleryPanel key={work.slug} work={work} index={index} pairs={pairs}
            progress={progress} entry={entry} entryScale={entryScale} solo={index === projects.length - 1 && projects.length % 2 === 1} selected={selectedSlug === work.slug} dimmed={!!selectedSlug && selectedSlug !== work.slug && Math.floor(index / 2) === pair} near={Math.floor(index / 2) === pair && !ending} active={active}
            onSelect={onSelect} />)}
          <motion.div className={styles.logo} data-gallery-logo style={{ transform: logoTransform, opacity: logoOpacity, pointerEvents: ending ? 'auto' : 'none', '--partnership-ring': ringOpacity } as unknown as React.ComponentProps<typeof motion.div>['style']}>
            <PartnershipMark active={active && ending} ready={ending} />
          </motion.div>
        </div> : <div className={styles.staticGrid}>
          {projects.map(work => <button type="button" key={work.slug} className={styles.staticProject} data-focused={selectedSlug === work.slug} data-dimmed={!!selectedSlug && selectedSlug !== work.slug}
            onClick={() => onSelect(work.slug)} aria-label={`Focus work: ${work.name}`} aria-pressed={selectedSlug === work.slug}>
            <div className={styles.screen}><ScreeningMedia asset={work} active={false} label={false} /></div>
            <span className={styles.projectCaption}><WorkTags work={work} /></span>
          </button>)}
        </div>}
        {!pinned && <div className={styles.staticMark} data-partnership-static-mark><PartnershipMark active={active} ready /></div>}
        <motion.div className={styles.ending} data-gallery-ending aria-hidden={pinned && !ending} style={{ opacity: pinned ? copyOpacity : 1, transform: pinned ? copyTransform : 'none' }}>
          <h2>{tr('One partnership')}</h2>
          <p>{tr('Designing your legacy')}</p>
        </motion.div>
        <motion.div className={styles.partnershipAction} data-partnership-action style={{ opacity: pinned ? linkOpacity : 1 }}
          inert={pinned && !ending} aria-hidden={pinned && !ending}>
          <PartnershipResultsButton active={active && (!pinned || ending)} onClick={continueToResults} />
        </motion.div>
        {previewError && <motion.p className={styles.previewError} style={{ opacity: pinned ? navOpacity : 1 }} aria-hidden={pinned && !walking} role="status">{fr ? 'Aperçu indisponible. Réessayez.' : 'Preview unavailable. Please try again.'}</motion.p>}
        {pinned && <motion.nav className={styles.navigation} data-gallery-navigation aria-busy={requested !== null} style={{ opacity: navOpacity }} aria-label={fr ? 'Parcourir les projets' : 'Browse the gallery'} inert={!walking} aria-hidden={!walking}>
          <button type="button" onClick={() => move(-1)} disabled={(requested ?? pair) === 0} aria-label={tr('Previous works')}><ArrowLeft className={styles.horizontalArrow} aria-hidden="true" /><ArrowUp className={styles.verticalArrow} aria-hidden="true" /></button>
          <span aria-live="polite">{String(pair + 1).padStart(2, '0')} <i>/ {String(pairs).padStart(2, '0')}</i></span>
          <button type="button" onClick={() => move(1)} aria-label={(requested ?? pair) >= pairs - 1 ? tr('One partnership') : tr('Next works')}><ArrowRight className={styles.horizontalArrow} aria-hidden="true" /><ArrowDown className={styles.verticalArrow} aria-hidden="true" /></button>
        </motion.nav>}
      </div></ScenePortal>
    </div>
  </section>;
}
