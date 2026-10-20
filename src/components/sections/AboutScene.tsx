'use client';
import { useDissolveStage } from '@/hooks/useDissolveStage';
import { ScenePortal } from './service-world/PinnedScene';
import CompactIntroduction from './CompactIntroduction';
import styles from './ScreeningRoom.module.css';
export default function AboutScene() {
  const { runway, stage } = useDissolveStage();
  return <section id="about" data-nova-section="about" data-nav-surface="light" data-scroll-title-skip>
    <div ref={runway} className={styles.aboutRunway} data-about-runway>
      <ScenePortal><div ref={stage} className={styles.aboutStage} data-about-stage data-dissolve-stage data-scene-chapter="about" data-lenis-prevent>
        <CompactIntroduction embedded />
      </div></ScenePortal>
    </div>
  </section>;
}
