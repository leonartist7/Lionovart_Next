'use client';

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { useDissolveStage } from '@/hooks/useDissolveStage';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicCopy } from '@/hooks/usePublicCopy';
import { ScenePortal, usePinnedScene } from './service-world/PinnedScene';
import { ScreeningMedia } from './ScreeningMedia';
import { GALLERY_SERVICE_LABELS, type GalleryWork } from './selected-work/gallery';
import { galleryLayout, GALLERY_ENTRY_PROJECTION } from './gallery-layout';
import { serviceGalleryHandoff } from './service-gallery-handoff';
import { galleryCardPose, galleryEnding, galleryPairProgress, galleryProgress, galleryTravel, GALLERY_DEPTH_STEP } from './gallery-journey';
import styles from './GalleryWalkthrough.module.css';

function WorkTags({ work }: { work: GalleryWork }) {
  const tr = usePublicCopy();
  return <span className={styles.projectTags} data-work-tags>
    {work.services.map(id => <span key={id}>{tr(GALLERY_SERVICE_LABELS[id] ?? id)}</span>)}
  </span>;
}

function GalleryPanel({ work, index, pairs, progress, entry, entryScale, near, active, selected, dimmed, onSelect }: {
  work: GalleryWork; index: number; pairs: number; progress: MotionValue<number>; entry: MotionValue<number>; entryScale: MotionValue<number>;
  near: boolean; active: boolean; selected: boolean; dimmed: boolean; onSelect: (slug: string) => void;
}) {
  const pair = Math.floor(index / 2), side = index % 2 ? 1 : -1;
  const [visible, setVisible] = useState(pair < 4);
  const reduce = useReducedMotion();
  const focusTarget = useMotionValue(0), dimTarget = useMotionValue(1);
  const focusSpring = useSpring(focusTarget, { stiffness: 180, damping: 30, mass: 1 });
  const dimSpring = useSpring(dimTarget, { stiffness: 180, damping: 30, mass: 1 });
  useEffect(() => { focusTarget.set(selected ? 1 : 0); dimTarget.set(dimmed ? .35 : 1); }, [selected, dimmed, focusTarget, dimTarget]);
  const transform = useTransform(() => {
    const spread = entry.get(), focus = reduce ? 0 : focusSpring.get();
    const { z } = galleryCardPose(progress.get(), pair, pairs);
    const baseZ = -350 - index * 18 * (1 - spread) + (z + 350) * spread;
    const depth = baseZ + (Math.max(0, baseZ) - baseZ) * focus;
    const size = 1 + (entryScale.get() - 1) * (1 - spread);
    return `translate3d(calc(${side * spread * (1 - focus)} * var(--gallery-wall-offset)), calc(${side * spread * (1 - focus)} * var(--gallery-wall-offset-y) + ${(pair % 2 ? -1 : 1) * spread * (1 - focus)} * var(--gallery-wall-stagger)), ${depth}px) translate(-50%,-50%) rotateY(calc(${-side * spread * (1 - focus)} * var(--gallery-wall-angle))) scale(${size})`;
  });
  const opacity = useTransform(() => galleryCardPose(progress.get(), pair, pairs).opacity * (pair < 3 ? 1 : entry.get()) * (reduce ? dimTarget.get() : dimSpring.get()));
  const labelOpacity = useTransform(() => Math.max(0, Math.min(1, (entry.get() - .65) / .35)) * Math.max(0, ((reduce ? dimTarget.get() : dimSpring.get()) - .35) / .65));
  useMotionValueEvent(progress, 'change', p => setVisible(galleryCardPose(p, pair, pairs).visible));
  return <motion.div className={styles.panel} data-gallery-panel data-gallery-index={index} data-focused={selected}
    style={{ transform, opacity }} inert={!near || !active} aria-hidden={!near}>
    {visible && <button type="button" className={styles.project} onClick={() => onSelect(work.slug)}
      aria-label={`Focus work: ${work.name}`} aria-pressed={selected}>
      <div className={styles.screen}><ScreeningMedia asset={work} active={active && near && (selected || !dimmed && side < 0)} label={false} /></div>
      <motion.span className={styles.projectCaption} style={{ opacity: labelOpacity }}>
        <span className={styles.projectName}>{work.name}<span aria-hidden="true">{selected ? '−' : '+'}</span></span>
        <WorkTags work={work} />
      </motion.span>
    </button>}
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
  const entry = useMotionValue(0), arrivalTitle = useMotionValue(0), entryScale = useMotionValue(1);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const currentPair = useRef(0);
  const onSelect = (slug: string) => setSelectedSlug(current => current === slug ? null : slug);
  const [pair, setPair] = useState(0), [ending, setEnding] = useState(false), [walking, setWalking] = useState(true);
  const pairs = Math.max(1, Math.ceil(projects.length / 2));
  const pinned = !!scene?.target;
  const titleOpacity = useTransform(() => galleryEnding(progress.get()).header * arrivalTitle.get());
  const logoTransform = useTransform(progress, p => `translate(-50%,-50%) translateZ(${galleryEnding(p).logoZ}px)`);
  const logoOpacity = useTransform(progress, p => galleryEnding(p).logo);
  const copyOpacity = useTransform(progress, p => galleryEnding(p).copy);
  const copyTransform = useTransform(progress, p => `translateY(${(1 - galleryEnding(p).copy) * 16}px)`);
  const linkOpacity = useTransform(progress, p => galleryEnding(p).links);
  const navOpacity = useTransform(() => (1 - galleryEnding(progress.get()).copy) * entry.get());
  useMotionValueEvent(progress, 'change', p => {
    const nextPair = Math.min(pairs - 1, Math.max(0, Math.round(galleryTravel(p, pairs) / GALLERY_DEPTH_STEP)));
    if (currentPair.current !== nextPair || galleryEnding(p).copy > .05) { currentPair.current = nextPair; setSelectedSlug(null); }
    setPair(nextPair);
    setEnding(galleryEnding(p).links > .7);
    setWalking(galleryEnding(p).copy < .05);
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
        surface.dataset.galleryAxis = layout.vertical ? 'vertical' : 'horizontal';
        surface.dataset.galleryCompact = String(layout.compact);
        surface.style.setProperty('--gallery-wall-offset', `${layout.x}px`);
        surface.style.setProperty('--gallery-wall-offset-y', `${layout.y}px`);
        surface.style.setProperty('--gallery-wall-stagger', layout.vertical ? '0px' : '2svh');
        surface.style.setProperty('--gallery-wall-angle', layout.vertical ? '0deg' : '16deg');
        surface.style.setProperty('--gallery-panel-top', `${layout.panelTop}%`);
        surface.style.setProperty('--gallery-panel-width', `${layout.panelWidth}px`);
      }
      const value = pinned ? galleryProgress(box.top, box.height, innerHeight) : 0;
      progress.set(value);
      const arrival = serviceGalleryHandoff(box.top, innerHeight);
      entry.set(pinned ? arrival.spread : 1);
      arrivalTitle.set(pinned ? arrival.title : 1);
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
  }, [pinned, progress, entry, entryScale, arrivalTitle, runway, scene?.target, stage]);

  useEffect(() => {
    if (!['#selected-work', '#partnership'].includes(location.hash)) return;
    let frame = 0;
    const land = () => { frame = requestAnimationFrame(() => {
      const anchor = runway.current; if (!anchor) return;
      const box = anchor.getBoundingClientRect();
      const offset = location.hash === '#partnership' && pinned ? (box.height - innerHeight * .85) * .91 : 0;
      const target = scrollY + box.top + offset;
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true, userData: { navigation: true } });
      else window.scrollTo({ top: target, behavior: 'instant' });
    }); };
    if (document.documentElement.dataset.splashComplete === 'true') land();
    else window.addEventListener('lionovart:splash-complete', land, { once: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('lionovart:splash-complete', land); };
  }, [pinned, runway, lenis]);

  const navigate = (target: number) => {
    const anchor = runway.current; if (!anchor) return;
    const box = anchor.getBoundingClientRect();
    const p = target >= pairs ? .91 : galleryPairProgress(target, pairs);
    const y = scrollY + box.top + p * (box.height - innerHeight * .85);
    if (lenis) lenis.scrollTo(y, { duration: .7, userData: { navigation: true } });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const continueTo = (event: MouseEvent<HTMLAnchorElement>, hash: '#about' | '#client-experience') => {
    // Preserve modified-click/browser behavior; ordinary activation stays in this document.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.querySelector<HTMLElement>(hash === '#about' ? '[data-about-runway]' : hash);
    if (!target) return;
    event.preventDefault();
    event.stopPropagation(); // The root Lenis anchor listener must not replace this runway destination.
    history.replaceState(null, '', hash);
    const top = scrollY + target.getBoundingClientRect().top - (hash === '#about' && pinned ? 0 : 64);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenis) lenis.scrollTo(top, { duration: .9, immediate: reduced, userData: { navigation: true } });
    else window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
  };

  return <section id="selected-work" className={styles.section} data-gallery="compact" data-gallery-story data-nav-surface="light"
    data-scroll-title-skip data-curves={servicesCurves} aria-labelledby="selected-work-heading">
    <div ref={runway} className={styles.runway} data-gallery-runway style={{ '--gallery-runway': `${Math.max(6, pairs * .55 + 2.6) * 100}svh` } as CSSProperties}>
      <span id="partnership" className={styles.partnershipAnchor} aria-hidden="true" />
      <ScenePortal><div ref={stage} className={styles.stage} data-scroll-title-skip data-dissolve-stage data-gallery-stage data-scene-chapter="work" data-walkthrough-pinned={pinned}
        onKeyDown={event => { if (event.key === 'Escape') { setSelectedSlug(null); event.stopPropagation(); } }}>
        <motion.header className={styles.header} style={{ opacity: pinned ? titleOpacity : 1 }}>
          <h2 id="selected-work-heading">{tr('Selected work')}</h2>
          <p>{fr ? 'Entrez dans notre univers.' : 'Step inside our world.'}</p>
        </motion.header>
        {pinned ? <div className={styles.corridor} data-gallery-corridor>
          {projects.map((work, index) => <GalleryPanel key={work.slug} work={work} index={index} pairs={pairs}
            progress={progress} entry={entry} entryScale={entryScale} selected={selectedSlug === work.slug} dimmed={!!selectedSlug && selectedSlug !== work.slug && Math.floor(index / 2) === pair} near={Math.floor(index / 2) === pair && !ending} active={active}
            onSelect={onSelect} />)}
          <motion.div className={styles.logo} data-gallery-logo style={{ transform: logoTransform, opacity: logoOpacity }}>
            <Image src="/images/lionovart-icon.svg" alt="LIONOVART" width={160} height={160} />
          </motion.div>
        </div> : <div className={styles.staticGrid}>
          {projects.map(work => <button type="button" key={work.slug} className={styles.staticProject} data-focused={selectedSlug === work.slug} data-dimmed={!!selectedSlug && selectedSlug !== work.slug}
            onClick={() => onSelect(work.slug)} aria-label={`Focus work: ${work.name}`} aria-pressed={selectedSlug === work.slug}>
            <div className={styles.screen}><ScreeningMedia asset={work} active={false} label={false} /></div>
            <span className={styles.projectCaption}><span className={styles.projectName}>{work.name}<span aria-hidden="true">{selectedSlug === work.slug ? '−' : '+'}</span></span><WorkTags work={work} /></span>
          </button>)}
        </div>}
        <motion.div className={styles.ending} data-gallery-ending aria-hidden={pinned && !ending} style={{ opacity: pinned ? copyOpacity : 1, transform: pinned ? copyTransform : 'none' }}>
          {!pinned && <Image src="/images/lionovart-icon.svg" alt="LIONOVART" width={96} height={96} />}
          <h2>{tr('One partnership')}</h2>
          <p>{tr('Designing your legacy')}</p>
          <motion.div className={styles.links} style={{ opacity: pinned ? linkOpacity : 1 }} inert={pinned && !ending} aria-hidden={pinned && !ending}>
            <a href="#about" onClick={event => continueTo(event, '#about')}>{fr ? 'Rencontrez le studio' : 'Meet the studio'}<ArrowDown aria-hidden="true" /></a>
            <a href="#client-experience" onClick={event => continueTo(event, '#client-experience')}>{fr ? 'Découvrez nos résultats' : 'See our results'}<ArrowDown aria-hidden="true" /></a>
          </motion.div>
        </motion.div>
        {pinned && <motion.nav className={styles.navigation} style={{ opacity: navOpacity }} aria-label={fr ? 'Parcourir les projets' : 'Browse the gallery'} inert={!walking} aria-hidden={!walking}>
          <button type="button" onClick={() => navigate(Math.max(0, pair - 1))} disabled={pair === 0} aria-label={tr('Previous works')}><ArrowLeft className={styles.horizontalArrow} aria-hidden="true" /><ArrowUp className={styles.verticalArrow} aria-hidden="true" /></button>
          <span aria-live="polite">{String(pair + 1).padStart(2, '0')} <i>/ {String(pairs).padStart(2, '0')}</i></span>
          <button type="button" onClick={() => navigate(pair + 1)} aria-label={pair === pairs - 1 ? tr('One partnership') : tr('Next works')}><ArrowRight className={styles.horizontalArrow} aria-hidden="true" /><ArrowDown className={styles.verticalArrow} aria-hidden="true" /></button>
        </motion.nav>}
      </div></ScenePortal>
    </div>
  </section>;
}
