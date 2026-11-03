'use client';

import Image from 'next/image';
import { useId, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNovaStore } from '@/lib/stores/nova-store';
import { useDecorativeMotion } from '@/hooks/useDecorativeMotion';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';
import styles from './PartnershipMark.module.css';

export default function PartnershipMark({ active, ready, tone = 'brand', emblemOnly = false }: { active: boolean; ready: boolean; tone?: 'brand' | 'light'; emblemOnly?: boolean }) {
  const { locale } = useLanguage(); const fr = locale === 'fr';
  const pathId = `partnership-ring-${useId().replace(/:/g, '')}`;
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: .25 });
  const [paused, setPaused] = useState(false);
  const openNova = useNovaStore(state => state.openNova);
  const novaOpen = useNovaStore(state => state.isOpen);
  const { available, running } = useDecorativeMotion(active && inView && !novaOpen && !emblemOnly);
  const invitation = fr ? 'Prêt à aller plus loin ?' : 'Ready to move forward?';
  const response = fr ? 'Je suis prêt !' : "I'm ready now!";
  return <div ref={root} className={styles.mark} data-partnership-mark data-tone={tone} data-emblem-only={emblemOnly} data-motion-active={running && !paused}
    aria-hidden={!ready} inert={!ready}>
    <button type="button" className={styles.invitation} onClick={() => openNova('offer')}
      aria-label={fr ? 'Prêt à aller plus loin ? Commençons à en parler.' : 'Ready to move forward? Start a conversation.'}>
      {!emblemOnly && <svg className={styles.orbit} viewBox="0 0 240 240" aria-hidden="true" focusable="false">
        <defs><path id={pathId} d="M 120 120 m -98 0 a 98 98 0 1 1 196 0 a 98 98 0 1 1 -196 0" /></defs>
        <text className={styles.readyText} textLength="610" lengthAdjust="spacing"><textPath href={`#${pathId}`}>{`${invitation} · `.repeat(3)}</textPath></text>
        <text className={styles.responseText} textLength="610" lengthAdjust="spacing"><textPath href={`#${pathId}`}>{`${response} · `.repeat(4)}</textPath></text>
      </svg>}
      {tone === 'light' ? <svg className={styles.emblem} viewBox="0 0 512 512" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M84 92H192V357H270L321 432H84Z" />
        <path fill="currentColor" stroke="#F51B2C" strokeWidth="8" paintOrder="stroke" d="M192 92L330 299V151H428V432H320L192 241Z" />
        <path fill="currentColor" d="M328 79L360 98L378 79L397 98L428 79V138H328Z" />
      </svg> : <Image className={styles.emblem} src="/images/lionovart-icon.svg" alt="" width={160} height={160} />}
    </button>
    {available && !emblemOnly && <button type="button" className={styles.pause} aria-pressed={paused}
      aria-label={fr ? paused ? 'Reprendre le texte tournant' : 'Mettre le texte tournant en pause' : paused ? 'Resume rotating text' : 'Pause rotating text'}
      onClick={() => setPaused(value => !value)}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>}
  </div>;
}

export function PartnershipResultsButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  const { locale } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: .5 });
  const novaOpen = useNovaStore(state => state.isOpen);
  const { running } = useDecorativeMotion(active && inView && !novaOpen);
  return <div ref={root} className={styles.results} data-partnership-results>
    <LiquidMetalButton label={locale === 'fr' ? 'Découvrez nos résultats' : 'See our results'} width={240} height={52}
      paused={!running} shaderEnabled={running} onClick={onClick} />
  </div>;
}
