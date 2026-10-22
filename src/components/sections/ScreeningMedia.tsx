'use client';
import Image from 'next/image';
import HandoffDissolveFilter from './HandoffDissolveFilter';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { GALLERY_WORK } from './selected-work/gallery';
import { useLanguage } from '@/contexts/LanguageContext';
import { exhibitLabel, exhibitPosition, serviceExhibits } from './service-triptych';
import styles from './ScreeningRoom.module.css';
import glass from './ServiceGlassStage.module.css';

export type ScreeningAsset = { poster: string; video?: string; name: string };
export function previewVideo(source: string, width: number) {
  return source.replace(/\/upload\/(?:[^/]+\/)?(?=v\d+\/)/, `/upload/w_${width},c_limit,f_mp4,vc_h264,q_auto:good,ac_none/`);
}

/** One silent decoder per active stage. A real poster survives blocked/failed video. */
export function ScreeningMedia({ asset, active, paused = false, label = true }: { asset: ScreeningAsset; active: boolean; paused?: boolean; label?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);
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
        node.dataset.playback = 'loading';
        void node.play().catch((error: DOMException) => { if (!disposed) { node.dataset.playback = error.name; setPlaying(false); } });
      } else { if (node) { node.pause(); node.dataset.playback = 'paused'; } setPlaying(false); }
    };
    sync(); document.addEventListener('visibilitychange', sync); media.addEventListener('change', sync);
    return () => { disposed = true; node?.pause(); document.removeEventListener('visibilitychange', sync); media.removeEventListener('change', sync); };
  }, [active, paused, asset.video]);
  return <div className={styles.media} data-screening-media data-aspect-ready={ratio !== null}
    style={{ '--screen-ratio': ratio ?? 1.6 } as CSSProperties}>
    <Image src={asset.poster} alt={asset.name} fill sizes="(max-width: 767px) 90vw, 1100px" loading="lazy"
      onLoad={event => { const image = event.currentTarget; if (image.naturalHeight) setRatio(image.naturalWidth / image.naturalHeight); }} />
    {asset.video && <video ref={video} poster={asset.poster} muted playsInline loop preload="none"
      onLoadedMetadata={event => { const node = event.currentTarget; if (node.videoHeight) setRatio(node.videoWidth / node.videoHeight); }}
      onPlaying={event => { event.currentTarget.dataset.playback = 'playing'; setPlaying(true); }} onPause={() => setPlaying(false)} onError={event => { event.currentTarget.dataset.playback = `media-error-${event.currentTarget.error?.code}`; setPlaying(false); }} data-playing={playing} aria-hidden="true" />}
    {label && <span className={styles.mediaLabel}>{asset.name}</span>}
  </div>;
}

export function ServiceScreen({ service, variant, active, paused, onVariant }: { service: string; variant: number; active: boolean; paused: boolean; onVariant: (index: number) => void }) {
  const { locale } = useLanguage();
  const exhibits = serviceExhibits(service);
  const mergeId = `service-merge-${useId().replace(/:/g, "")}`;
  return <div className={glass.stage} data-service-triptych data-service-merge-filter={mergeId} data-paused={paused || !active}
    onPointerDown={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <HandoffDissolveFilter id={mergeId} seed={30} incoming />
    <div className={glass.atmosphere} aria-hidden="true">
      {exhibits.map((exhibit, index) => <div key={index} className={glass.colorSpill} data-selected={index === variant}
        style={{ background: `radial-gradient(ellipse closest-side at 50% 50%, ${exhibit.tint}55, transparent 100%)` }} />)}
    </div>
    {exhibits.map((exhibit, index) => {
      const asset: ScreeningAsset = GALLERY_WORK.find(work => work.slug === exhibit.slug) ?? {
        poster: '/images/transparent-led-concept.svg', name: locale === 'fr' ? 'LED transparent · concept' : 'Transparent LED · display concept',
      };
      const position = exhibitPosition(index, variant);
      const label = exhibitLabel(exhibit, locale);
      return <div key={`${service}-${index}`} className={glass.card} data-position={position} data-exhibit-index={index}>
        <div className={glass.screen}><ScreeningMedia asset={asset} active={active && position === 'center'} paused={paused} label={false} /></div>
        <span className={glass.cardLabel} aria-hidden="true">{label}</span>
        <button type="button" className={glass.selectCard} aria-label={label} aria-pressed={position === 'center'}
          tabIndex={position === 'center' ? -1 : 0} onClick={() => onVariant(index)} />
      </div>;
    })}
  </div>;
}
