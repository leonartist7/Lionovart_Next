import CompactIntroduction from './CompactIntroduction';
import styles from './ScreeningRoom.module.css';

/** The studio introduction returns to document flow after the gallery. */
export default function AboutScene() {
  return <section id="about" className={styles.aboutRunway} data-about-runway
    data-nova-section="about" data-nav-surface="light" data-scroll-title-skip>
    <div className={styles.aboutStage} data-about-stage>
      <CompactIntroduction embedded />
    </div>
  </section>;
}
