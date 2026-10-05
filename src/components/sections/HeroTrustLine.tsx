/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import styles from "./HeroTrustLine.module.css";

const ASSETS = "https://res.cloudinary.com/dgio9uutc/image/upload/";
const LAUREL_LEFT = `${ASSETS}v1787020265/Laurel-L_vxtg55.webp`;
const LAUREL_RIGHT = `${ASSETS}v1787020265/Laurel-R_kj7isz.webp`;
const STAR = `${ASSETS}v1787020126/Golden_Beveled_Star_Icon_wwcwek.webp`;
const variants = ["laurels", "stars", "both"] as const;

export default function HeroTrustLine({ text }: { text: string }) {
  const [variantIndex, setVariantIndex] = useState(0);
  const variant = variants[variantIndex];
  const next = () => setVariantIndex(index => (index + 1) % variants.length);
  return <button className={styles.trust} type="button" onClick={next}
    aria-label={`Preview trust line with ${variant}. Click to cycle laurels, stars, and both.`}
    title="Click to preview laurels, stars, or both">
    {variant !== "stars" && <img className={styles.laurel} src={LAUREL_LEFT} alt="" aria-hidden="true" />}
    <span className={styles.copy}>
      {variant !== "laurels" && <span className={styles.stars} aria-hidden="true"}>
        {Array.from({ length: 5 }, (_, index) => <img key={index} src={STAR} alt="" />)}
      </span>}
      <span>{text}</span>
    </span>
    {variant !== "stars" && <img className={styles.laurel} src={LAUREL_RIGHT} alt="" aria-hidden="true" />}
  </button>;
}
