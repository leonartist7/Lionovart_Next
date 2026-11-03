import { sceneArtwork, serviceExhibit, type StudioExhibit } from './scene-art';
import styles from './WorldPoster.module.css';

/** Authored perspective compositions using the same art as the Three.js materials. */
export default function StudioPoster({ service, variant }: { service: string; variant: number }) {
  const exhibit = serviceExhibit(service) as StudioExhibit;
  const art = { backgroundImage: `url("${sceneArtwork(exhibit, variant)}")` };
  const detail = { backgroundImage: `url("${sceneArtwork(exhibit, variant, true)}")` };
  if (exhibit === 'brand') return <div className={styles.brandSet}>
    <div className={styles.brandBoard} style={art} />
    <div className={styles.brandBook}><i style={detail} /><i style={art} /></div>
    <div className={styles.brandBox} style={art} /><div className={styles.brandCard} style={detail} />
    <div className={styles.swatches}><i /><i /><i /><i /></div>
  </div>;
  if (exhibit === 'digital') return <div className={styles.digitalSet}>
    <div className={styles.laptop}><div style={art} /><i /></div>
    <div className={styles.tablet} style={art} /><div className={styles.appPhone} style={art} />
    <div className={styles.interfaceCard} style={detail} />
  </div>;
  if (exhibit === 'spaces') return <div className={styles.spaceSet}>
    <div className={styles.portal} /><div className={styles.spaceWall} style={art} />
    <div className={styles.reception}><span>ATELIER / LIVE</span></div>
    <div className={styles.sign} style={detail} /><div className={styles.displayPlinth}><i /></div>
    <div className={styles.printPanel} style={art} />
  </div>;
  return <div className={styles.systemSet}>
    <svg className={styles.connections} viewBox="0 0 800 400" preserveAspectRatio="none">
      <path d="M90 95H240L400 200L560 95H710 M90 305H240L400 200L560 305H710" />
      <path className={styles.signal} d={['M90 95H240L400 200L560 305H710', 'M710 95H560L400 200', 'M90 305H240L400 200L560 95H710', 'M710 305H560L400 200'][variant]} />
    </svg>
    <div className={styles.systemHub} style={art} />
    {['AOS', 'PORTAL', 'FLOW', 'DATA'].map((label, i) => <div className={styles.systemNode} key={label} data-selected={variant === i}><b>{['◎', '◈', '↗', '▥'][i]}</b><span>{label}</span><i /></div>)}
  </div>;
}
