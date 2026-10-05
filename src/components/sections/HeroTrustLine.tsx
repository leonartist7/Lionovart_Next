/* eslint-disable @next/next/no-img-element */
import styles from "./HeroTrustLine.module.css";

const ASSETS = "https://res.cloudinary.com/dgio9uutc/image/upload/";
const LAUREL_LEFT = `${ASSETS}v1787020265/Laurel-L_vxtg55.webp`;
const LAUREL_RIGHT = `${ASSETS}v1787020265/Laurel-R_kj7isz.webp`;

export default function HeroTrustLine({ text }: { text: string }) {
  return (
    <p className={styles.trust}>
      <img className={styles.laurel} src={LAUREL_LEFT} alt="" aria-hidden="true" />
      <span className={styles.copy}>{text}</span>
      <img className={styles.laurel} src={LAUREL_RIGHT} alt="" aria-hidden="true" />
    </p>
  );
}
