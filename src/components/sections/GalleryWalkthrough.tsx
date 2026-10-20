'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Dialog } from '@base-ui/react/dialog';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useDissolveStage } from '@/hooks/useDissolveStage';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicCopy } from '@/hooks/usePublicCopy';
import { ScenePortal, usePinnedScene } from './service-world/PinnedScene';
import { ScreeningMedia } from './ScreeningMedia';
import type { GalleryWork } from './selected-work/gallery';
import { galleryCardPose, galleryEnding, galleryPairProgress, galleryProgress, galleryTravel, GALLERY_DEPTH_STEP } from './gallery-journey';
import styles from './GalleryWalkthrough.module.css';

function GalleryPanel({ work, index, pairs, progress, near, active, onSelect }: {
  work: GalleryWork; index: number; pairs: number; progress: MotionValue<number>;
  near: boolean; active: boolean; onSelect: (slug: string) => void;
}) {
  const pair = Math.floor(index / 2), side = index % 2 ? 1 : -1;
  const [visible, setVisible] = useState(pair < 4);
  const transform = useTransform(progress, p => {
    const { z } = galleryCardPose(p, pair, pairs);
    return `translate3d(calc(${side} * var(--gallery-wall-offset)), ${pair % 2 ? '-2svh' : '2svh'}, ${z}px) translate(-50%,-50%) rotateY(${-side * 20}deg)`;
  });
  const opacity = useTransform(progress, p => galleryCardPose(p, pair, pairs).opacity);
  useMotionValueEvent(progress, 'change', p => setVisible(galleryCardPose(p, pair, pairs).visible));
  return <motion.div className={styles.panel} data-gallery-panel data-gallery-index={index}
    style={{ transform, opacity }} inert={!near || !active} aria-hidden={!near}>
    {visible && <Dialog.Trigger className={styles.project} onClick={() => onSelect(work.slug)} aria-label={`View work: ${work.name}`}>
      <div className={styles.screen}><ScreeningMedia asset={work} active={active && near && side < 0} label={false} /></div>
      <span className={styles.projectName}>{work.name}<ArrowUpRight aria-hidden="true" /></span>
    </Dialog.Trigger>}
  </motion.div>;
}

/** Scroll moves the exhibits through one stationary viewport, then reveals the studio mark. */
export default function GalleryWalkthrough({ projects, onSelect, previewOpen, servicesCurves }: {
  projects: readonly GalleryWork[]; onSelect: (slug: string) => void; previewOpen: boolean; servicesCurves: boolean;
}) {
  const scene = usePinnedScene();
  const lenis = useLenis();
  const { locale } = useLanguage(); const fr = locale === 'fr';
  const tr = usePublicCopy();
  const { runway, stage, active } = useDissolveStage();
  const progress = useMotionValue(0);
  const [pair, setPair] = useState(0), [ending, setEnding] = useState(false), [walking, setWalking] = useState(true);
  const pairs = Math.max(1, Math.ceil(projects.length / 2));
  const pinned = !!scene?.target;
  const titleOpacity = useTransform(progress, p => galleryEnding(p).header);
  const logoTransform = useTransform(progress, p => `translate(-50%,-50%) translateZ(${galleryEnding(p).logoZ}px)`);
  const logoOpacity = useTransform(progress, p => galleryEnding(p).logo);
  const copyOpacity = useTransform(progress, p => galleryEnding(p).copy);
  const copyTransform = useTransform(progress, p => `translateY(${(1 - galleryEnding(p).copy) * 16}px)`);
  const linkOpacity = useTransform(progress, p => galleryEnding(p).links);
  const navOpacity = useTransform(progress, p => 1 - galleryEnding(p).copy);
  useMotionValueEvent(progress, 'change', p => {
    setPair(Math.min(pairs - 1, Math.max(0, Math.round(galleryTravel(p, pairs) / GALLERY_DEPTH_STEP))));
    setEnding(galleryEnding(p).links > .7);
    setWalking(galleryEnding(p).copy < .05);
  });
  useEffect(() => {
    const anchor = runway.current; if (!anchor) return;
    let frame = 0;
    const sync = () => {
      frame = 0;
      const box = anchor.getBoundingClientRect();
      const value = pinned ? galleryProgress(box.top, box.height, innerHeight) : 0;
      progress.set(value);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const observer = new ResizeObserver(schedule); observer.observe(anchor);
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule);
    sync();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [pinned, progress, runway]);

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

  return <section id="selected-work" className={styles.section} data-gallery="compact" data-gallery-story data-nav-surface="light"
    data-scroll-title-skip data-curves={servicesCurves} aria-labelledby="selected-work-heading">
    <div ref={runway} className={styles.runway} data-gallery-runway style={{ '--gallery-runway': `${Math.max(6, pairs * .55 + 2.6) * 100}svh` } as CSSProperties}>
      <span id="partnership" className={styles.partnershipAnchor} aria-hidden="true" />
      <ScenePortal><div ref={stage} className={styles.stage} data-dissolve-stage data-gallery-stage data-scene-chapter="work" data-walkthrough-pinned={pinned}>
        <motion.header className={styles.header} style={{ opacity: pinned ? titleOpacity : 1 }}>
          <h2 id="selected-work-heading">{tr('Selected work')}</h2>
          <p>{fr ? 'Entrez dans notre univers.' : 'Step inside our world.'}</p>
        </motion.header>
        {pinned ? <div className={styles.corridor} data-gallery-corridor>
          {projects.map((work, index) => <GalleryPanel key={work.slug} work={work} index={index} pairs={pairs}
            progress={progress} near={Math.floor(index / 2) === pair && !ending} active={active && !previewOpen}
            onSelect={onSelect} />)}
          <motion.div className={styles.logo} data-gallery-logo style={{ transform: logoTransform, opacity: logoOpacity }}>
            <Image src="/images/lionovart-icon.svg" alt="LIONOVART" width={160} height={160} />
          </motion.div>
        </div> : <div className={styles.staticGrid}>
          {projects.map(work => <Dialog.Trigger key={work.slug} className={styles.staticProject} onClick={() => onSelect(work.slug)} aria-label={`${tr('View work')}: ${work.name}`}>
            <div className={styles.screen}><ScreeningMedia asset={work} active={false} label={false} /></div>
            <span>{work.name}<ArrowUpRight aria-hidden="true" /></span>
          </Dialog.Trigger>)}
        </div>}
        <motion.div className={styles.ending} data-gallery-ending aria-hidden={pinned && !ending} style={{ opacity: pinned ? copyOpacity : 1, transform: pinned ? copyTransform : 'none' }}>
          {!pinned && <Image src="/images/lionovart-icon.svg" alt="LIONOVART" width={96} height={96} />}
          <h2>{tr('One partnership')}</h2>
          <p>{tr('Designing your legacy')}</p>
          <motion.div className={styles.links} style={{ opacity: pinned ? linkOpacity : 1 }} inert={pinned && !ending} aria-hidden={pinned && !ending}>
            <a href="#about">{fr ? 'Rencontrez le studio' : 'Meet the studio'}<ArrowDown aria-hidden="true" /></a>
            <a href="#client-experience">{fr ? 'Découvrez nos résultats' : 'See our results'}<ArrowUpRight aria-hidden="true" /></a>
          </motion.div>
        </motion.div>
        {pinned && <motion.nav className={styles.navigation} style={{ opacity: navOpacity }} aria-label={fr ? 'Parcourir les projets' : 'Browse the gallery'} inert={!walking} aria-hidden={!walking}>
          <button type="button" onClick={() => navigate(Math.max(0, pair - 1))} disabled={pair === 0} aria-label={tr('Previous works')}><ArrowLeft aria-hidden="true" /></button>
          <span aria-live="polite">{String(pair + 1).padStart(2, '0')} <i>/ {String(pairs).padStart(2, '0')}</i></span>
          <button type="button" onClick={() => navigate(pair + 1)} aria-label={pair === pairs - 1 ? tr('One partnership') : tr('Next works')}><ArrowRight aria-hidden="true" /></button>
        </motion.nav>}
      </div></ScenePortal>
    </div>
  </section>;
}
