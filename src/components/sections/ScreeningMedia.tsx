'use client';
import Image, { getImageProps } from 'next/image';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { ServiceDialLight, ServiceOrbitCard } from './ServiceDialMotion';
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

const POSTER_SIZES = '(max-width: 767px) 90vw, 1100px';
const preparedPosters = new Map<string, Promise<void>>();

export function serviceScreenAssets(service: string): ScreeningAsset[] {
  return serviceExhibits(service).map(exhibit => GALLERY_WORK.find(work => work.slug === exhibit.slug) ?? {
    poster: '/images/transparent-led-concept.svg', name: 'Transparent LED · display concept',
  });
}

/** Prepare the exact responsive image used by Next/Image, not a second full-size download. */
export function prepareServicePosters(service: string) {
  return Promise.all(serviceScreenAssets(service).map(asset => {
    const key = `${asset.poster}:${innerWidth}:${devicePixelRatio}`;
    let ready = preparedPosters.get(key);
    if (!ready) {
      ready = new Promise<void>((resolve, reject) => {
        const image = new window.Image();
        const timer = setTimeout(() => reject(new Error('Poster preparation timed out')), 8000);
        const props = getImageProps({ src: asset.poster, alt: asset.name, fill: true, sizes: POSTER_SIZES }).props;
        image.sizes = props.sizes ?? POSTER_SIZES;
        image.srcset = props.srcSet ?? '';
        image.src = props.src;
        void image.decode().then(() => { clearTimeout(timer); resolve(); }, error => { clearTimeout(timer); reject(error); });
      });
      preparedPosters.set(key, ready);
      void ready.catch(() => preparedPosters.delete(key));
    }
    return ready;
  }));
}

/** A departing layer pauses immediately; a real poster survives blocked/failed video. */
function MediaLayer({ asset, active, paused, prepare, onRatio }: {
  asset: ScreeningAsset; active: boolean; paused: boolean; prepare: boolean; onRatio?: (ratio: number) => void;
}) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const node = video.current;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let disposed = false;
    const sync = () => {
      const allowed = present && active && !paused && !document.hidden && !media.matches && !connection?.saveData;
      // Only the upcoming first service prepares metadata before its entrance.
      // Its fitted frame must not change ratio when playback begins later.
      if ((allowed || (present && prepare && !document.hidden && !media.matches && !connection?.saveData)) && asset.video && node) {
        const source = previewVideo(asset.video, innerWidth < 768 ? 640 : 1280);
        node.preload = allowed ? 'auto' : 'metadata';
        if (node.getAttribute('src') !== source) { node.src = source; node.load(); }
      }
      if (allowed && asset.video && node) {
        node.dataset.playback = 'loading';
        void node.play().catch((error: DOMException) => { if (!disposed) { node.dataset.playback = error.name; setPlaying(false); } });
      } else { if (node) { node.pause(); node.dataset.playback = 'paused'; } setPlaying(false); }
    };
    sync(); document.addEventListener('visibilitychange', sync); media.addEventListener('change', sync);
    return () => { disposed = true; node?.pause(); document.removeEventListener('visibilitychange', sync); media.removeEventListener('change', sync); };
  }, [active, paused, asset.video, prepare, present]);
  return <motion.div className={styles.mediaLayer} data-media-layer data-media-name={asset.name}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: reduced ? .12 : .8, ease: [.22, 1, .36, 1] }}>
    <Image src={asset.poster} alt={asset.name} fill sizes={POSTER_SIZES} loading="lazy"
      onLoad={event => { const image = event.currentTarget; if (image.naturalHeight && !video.current?.videoWidth) onRatio?.(image.naturalWidth / image.naturalHeight); }} />
    {asset.video && <video ref={video} poster={asset.poster} muted playsInline loop preload="none"
      onLoadedMetadata={event => { const node = event.currentTarget; if (node.videoHeight) onRatio?.(node.videoWidth / node.videoHeight); }}
      onPlaying={event => { event.currentTarget.dataset.playback = 'playing'; setPlaying(true); }} onPause={() => setPlaying(false)} onError={event => { event.currentTarget.dataset.playback = `media-error-${event.currentTarget.error?.code}`; setPlaying(false); }} data-playing={playing} aria-hidden="true" />}
  </motion.div>;
}

/** The fitted frame remains mounted while prepared artwork dissolves inside it. */
export function ScreeningMedia({ asset, active, paused = false, label = true, prepare = false, frameRatio }: {
  asset: ScreeningAsset; active: boolean; paused?: boolean; label?: boolean; prepare?: boolean; frameRatio?: number;
}) {
  const [ratio, setRatio] = useState<number | null>(null);
  const displayRatio = frameRatio ?? ratio;
  return <div className={styles.media} data-screening-media data-aspect-ready={displayRatio !== null} data-frame-ratio={frameRatio}
    style={{ '--screen-ratio': displayRatio ?? 1.6 } as CSSProperties}>
    <AnimatePresence initial={false}>
      <MediaLayer key={`${asset.poster}:${asset.video ?? ''}`} asset={asset} active={active} paused={paused} prepare={prepare}
        onRatio={frameRatio ? undefined : setRatio} />
    </AnimatePresence>
    {label && <span className={styles.mediaLabel}>{asset.name}</span>}
  </div>;
}

export function ServiceScreen({ service, variant, active, paused, onVariant }: { service: string; variant: number; active: boolean; paused: boolean; onVariant: (index: number) => void }) {
  const { locale } = useLanguage();
  const exhibits = serviceExhibits(service);
  const assets = serviceScreenAssets(service);
  const mergeId = `service-merge-${useId().replace(/:/g, "")}`;
  return <div className={glass.stage} data-service-triptych data-service-merge-filter={mergeId} data-paused={paused || !active}
    onPointerDown={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <HandoffDissolveFilter id={mergeId} seed={30} incoming />
    <div className={glass.atmosphere} aria-hidden="true">
      {exhibits.map((exhibit, index) => <ServiceDialLight key={index} index={index} className={glass.colorSpill}
        background={`${exhibit.tint}55`} />)}
    </div>
    {exhibits.map((exhibit, index) => {
      const asset = assets[index];
      const position = exhibitPosition(index, variant);
      const label = exhibitLabel(exhibit, locale);
      return <ServiceOrbitCard key={index} index={index} className={glass.card} position={position}>
        <div className={glass.screen}><ScreeningMedia asset={asset} active={active && position === 'center'} paused={paused} label={false} prepare={service === 'branding' && position === 'center'} frameRatio={16 / 9} /></div>
        <button type="button" className={glass.selectCard} aria-label={label} aria-pressed={position === 'center'}
          tabIndex={position === 'center' ? -1 : 0} onClick={() => onVariant(index)} />
      </ServiceOrbitCard>;
    })}
  </div>;
}
