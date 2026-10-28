'use client';

import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDecorativeMotion } from '@/hooks/useDecorativeMotion';
import styles from './CampaignMarquee.module.css';

/** A readable campaign invitation; only decorative copies move. */
export default function CampaignMarquee() {
  const { locale } = useLanguage(); const fr = locale === 'fr';
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { amount: .1 });
  const [paused, setPaused] = useState(false);
  const { available, running } = useDecorativeMotion(inView);
  const title = fr ? 'Votre prochain temps fort' : 'Your next big moment';
  const outcomes = fr
    ? ['Affirmez votre présence', 'Transformez l’attention en demandes', 'Donnez envie de revenir']
    : ['Build recognition', 'Turn attention into enquiries', 'Bring customers back'];
  return <section ref={root} className={styles.section} data-campaign-marquee data-nav-surface="light"
    data-motion-active={running && !paused} aria-labelledby="campaign-marquee-heading">
    <h2 id="campaign-marquee-heading" className="sr-only">{title}</h2>
    <div className={styles.headline} aria-hidden="true">
      <div className={styles.headlineTrack}>
        {[0, 1].map(copy => <div key={copy} className={styles.headlineCopy}><span>{title}</span><ArrowUpRight /></div>)}
      </div>
    </div>
    <div className={styles.outcomes} aria-hidden="true">
      <div className={styles.outcomeTrack}>
        {[0, 1].map(copy => <div key={copy} className={styles.outcomeCopy}>
          {outcomes.map(outcome => <span key={outcome}>{outcome}<i>·</i></span>)}
        </div>)}
      </div>
    </div>
    <p className="sr-only">{outcomes.join('. ')}.</p>
    <div className={styles.footer}>
      <p>{fr ? 'Un lancement, une saison, une raison de vous choisir.' : 'A launch, a season, a reason to choose you.'}</p>
      <div className={styles.actions}>
        <Link href="/services#seasonal" className={styles.cta}>{fr ? 'Préparer ma campagne' : 'Plan my campaign'}<ArrowUpRight aria-hidden="true" /></Link>
        {available && <button type="button" className={styles.pause} aria-pressed={paused}
          aria-label={fr ? paused ? 'Reprendre le défilement du texte' : 'Mettre le défilement du texte en pause' : paused ? 'Resume moving text' : 'Pause moving text'}
          onClick={() => setPaused(value => !value)}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>}
      </div>
    </div>
  </section>;
}
