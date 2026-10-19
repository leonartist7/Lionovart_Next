'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './WorldPoster.module.css';
import StudioPoster from './StudioPoster';
import { useHydratedReducedMotion } from '@/hooks/useHydratedReducedMotion';

const titles = [['THE NEXT', 'CHAPTER.'], ['MAKE IT', 'MATTER.'], ['IN', 'MOTION.'], ['EVERY', 'MOMENT.']];
const subtitles = ['A SEASON OF POSSIBILITIES', 'DESIGNED TO BE NOTICED', 'CREATIVITY, IN MOTION', 'A STORY WORTH SHARING'];
function Artwork({ variant }: { variant: number }) {
  return <div className={styles.art} data-variant={variant}>
    <small>LIONOVART / STUDIO</small><strong>{titles[variant][0]}<br />{titles[variant][1]}</strong>
    <div className={styles.rings}>{Array.from({ length: 6 }, (_, i) => <i key={i} style={{ width: `${44 + i * 10}%`, height: `${44 + i * 10}%` }} />)}</div>
    <em>{subtitles[variant]}</em>
  </div>;
}

/** A lightweight, interactive composition when the GPU is unavailable or still loading. */
export default function WorldPoster({ service, variant, enabled, paused, active }: { service: string; variant: number; enabled: boolean; paused: boolean; active: boolean }) {
  const reduced = useHydratedReducedMotion();
  const video = useRef<HTMLVideoElement>(null), root = useRef<HTMLDivElement>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [visible, setVisible] = useState(false), [playing, setPlaying] = useState(false);
  const motion = service === 'content-studio' && variant === 2 && active && visible && !paused && !reduced;
  useEffect(() => {
    const node = root.current; if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting)); observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = video.current;
    const sync = () => {
      setPageVisible(!document.hidden);
      if (motion && !document.hidden) void element?.play().catch(() => setPlaying(false));
      else element?.pause();
    };
    sync(); document.addEventListener('visibilitychange', sync);
    return () => { element?.pause(); document.removeEventListener('visibilitychange', sync); };
  }, [motion]);
  return <div ref={root} className={styles.poster} data-mode={service} data-variant={variant} data-led-enabled={enabled} data-paused={paused || !!reduced} data-active={active && visible && pageVisible} aria-hidden="true">
    <div className={styles.room}><i /><i /><i /></div>
    <div className={styles.stage}>
      <div className={styles.podium} />
      {service === 'content-studio' ? <>
        {variant === 3 ? <div className={styles.calendar}>{Array.from({ length: 12 }, (_, i) => <div key={i}><Artwork variant={i % 4} /></div>)}</div> : <>
          <div className={styles.screen}><Artwork variant={variant} />
            {motion && <video ref={video} src="https://res.cloudinary.com/dgio9uutc/video/upload/c_limit,w_720,f_mp4,vc_h264,q_auto/Demo_hero.mp4"
              muted loop playsInline preload="none" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} style={{ opacity: playing ? 1 : 0 }} />}
          </div>
          <div className={styles.phone}><Artwork variant={variant} /></div>
          <div className={styles.product}><div /><span>L / A</span></div>
          <div className={styles.block} />
        </>}
      </> : service !== 'led' ? <StudioPoster service={service} variant={variant} /> : <div className={styles.store}>
        <div className={styles.interior}><i /><i /><div className={styles.desk} /><span>LIONOVART</span></div>
        <div className={styles.glass}><div className={styles.pixels} /><div className={styles.ledRings}><i /><i /><i /></div></div>
        <div className={styles.mullion} />
      </div>}
    </div>
  </div>;
}
