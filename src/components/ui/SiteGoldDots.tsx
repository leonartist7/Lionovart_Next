import styles from './SiteGoldDots.module.css';

/** One static, translucent texture; the reading column and artwork stay clear. */
export default function SiteGoldDots() {
  return <div className={styles.texture} data-site-gold-dots aria-hidden="true" />;
}
