'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { GALLERY_WORK } from './selected-work/gallery';
import styles from './ScreeningRoom.module.css';

export type ScreeningAsset = { poster: string; video?: string; name: string };
export function previewVideo(source: string, width: number) {
  return source.replace(/\/upload\/(?:[^/]+\/)?(?=v\d+\/)/, `/upload/w_${width},c_limit,f_mp4,vc_h264,q_auto:good,ac_none,fr_24/`);
}

/** One silent decoder per active stage. A real poster survives blocked/failed video. */
export function ScreeningMedia({ asset, active, paused = false, label = true }: { asset: ScreeningAsset; active: boolean; paused?: boolean; label?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const node = video.current;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let disposed = false;
    const sync = () => {
      const allowed = active && !paused && !document.hidden && !media.matches && !connection?.saveData;
      if (allowed && asset.video && node) {
        const source = previewVideo(asset.video, innerWidth < 768 ? 640 : 1280);
        if (node.getAttribute('src') !== source) { node.src = source; node.load(); }
        void node.play().catch(() => { if (!disposed) setPlaying(false); });
      } else { node?.pause(); setPlaying(false); }
    };
    sync(); document.addEventListener('visibilitychange', sync); media.addEventListener('change', sync);
    return () => { disposed = true; node?.pause(); document.removeEventListener('visibilitychange', sync); media.removeEventListener('change', sync); };
  }, [active, paused, asset.video]);
  return <div className={styles.media} data-screening-media>
    <Image src={asset.poster} alt={asset.name} fill sizes="(max-width: 767px) 90vw, 1100px" loading="lazy" />
    {asset.video && <video ref={video} poster={asset.poster} muted playsInline loop preload="none"
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setPlaying(false)} data-playing={playing} aria-hidden="true" />}
    {label && <span className={styles.mediaLabel}>{asset.name}</span>}
  </div>;
}

const SERVICE_REELS: Record<string, readonly string[]> = {
  branding: ['rakbank', 'oma', 'soda-bold', 'lsi-asia-25'],
  web: ['home-interior', 'coffeeshop-app-03', 'interactive-platform-3d-hightech', 'perfum-elegant'],
  'content-studio': ['perfum-elegant', 'soda-bold', 'stormlikes', 'food-snack-bold'],
  print: ['lsi-asia-25', 'oma', 'lsi-asia-25', 'rakbank'],
  'smart-systems': ['vantra-facility-os-hitech', 'platform-smart', 'transport-manager-platform-hitech', 'energy-command-hitech'],
};
export function ServiceScreen({ service, variant, active, paused }: { service: string; variant: number; active: boolean; paused: boolean }) {
  const slugs = SERVICE_REELS[service] ?? [];
  const asset = GALLERY_WORK.find(work => work.slug === slugs[variant % slugs.length]);
  const examples = slugs.map(slug => GALLERY_WORK.find(work => work.slug === slug)).filter(Boolean);
  const portrait = service === 'content-studio';
  const selected: ScreeningAsset = asset ?? { poster: '/images/transparent-led-concept.svg', name: 'Transparent LED · display concept' };
  return <div className={styles.serviceScreen} data-layout={portrait ? 'portrait' : 'wide'}>
    {portrait && examples[1] && <div className={styles.sideStill} aria-hidden="true"><Image src={examples[1].poster} alt="" fill sizes="150px" /></div>}
    <div className={styles.screenMain}><ScreeningMedia key={selected.poster} asset={selected} active={active} paused={paused} /></div>
    {portrait && examples[2] && <div className={styles.sideStill} aria-hidden="true"><Image src={examples[2].poster} alt="" fill sizes="150px" /></div>}
  </div>;
}
