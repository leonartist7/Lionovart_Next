'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { usePublicCopy } from '@/hooks/usePublicCopy';
import { useDissolveStage } from '@/hooks/useDissolveStage';
import { partnershipPose, PARTNERSHIP_SCROLL_LENGTH } from './partnership-motion';
import PartnershipTiles from './PartnershipTiles';
import styles from './ScreeningRoom.module.css';

/** The partnership now follows Services and opens into the project corridor. */
export default function WorkServicesTransition() {
  const tr = usePublicCopy();
  const { runway, stage } = useDissolveStage();
  const progress = useMotionValue(0);
  const [staticScene, setStaticScene] = useState(false);
  const headingOpacity = useTransform(progress, p => partnershipPose(p).chapterOpacity);
  useEffect(() => {
    const node = runway.current; if (!node) return;
    const media = matchMedia('(prefers-reduced-motion: reduce), (max-height: 560px)');
    let frame = 0;
    const sync = () => {
      frame = 0; setStaticScene(media.matches);
      const rect = node.getBoundingClientRect();
      progress.set(Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height))));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const observer = new ResizeObserver(schedule); observer.observe(node);
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule);
    media.addEventListener('change', schedule); sync();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); media.removeEventListener('change', schedule); };
  }, [progress, runway]);
  return <section id="partnership" data-work-services-transition data-scroll-manual data-static={staticScene} data-nav-surface="light" className={styles.partnership}>
    <div ref={runway} data-work-runway className={styles.partnershipRunway} style={{ height: `${PARTNERSHIP_SCROLL_LENGTH * 100}svh` }}>
      <div ref={stage} data-work-scene data-dissolve-stage className={styles.partnershipStage}>
        <PartnershipTiles progress={progress} staticScene={staticScene} />
        <motion.header className={styles.partnershipHeading} data-work-heading style={{ opacity: staticScene ? 1 : headingOpacity }}>
          <h2>{tr('One partnership')}</h2><p>{tr('Designing your legacy')}</p>
        </motion.header>
      </div>
    </div>
  </section>;
}
