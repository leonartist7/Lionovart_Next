"use client";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import styles from "./HeroClientProof.module.css";
import { useLanguage } from "@/contexts/LanguageContext";

const FACES = [
  "/images/Testimonials/UK/Jess-Beautysalon-W.avif",
  "/images/Testimonials/Northlinemotors/Marc-Cardealer-M.jpg",
  "/images/Testimonials/Italy/Lumura/Team2025.avif",
  "/images/Testimonials/Spain/Pablo-hotel-M.avif",
  "/images/Testimonials/Canada/Maya-Flowerstore-W.avif",
];
const ASSETS = "https://res.cloudinary.com/dgio9uutc/image/upload/";

export default function HeroClientProof() {
  const { t } = useLanguage();
  const title = t.hero.badges.experience;
  return (
    <a data-client-experience-rating className={styles.proof} href="#client-experience" aria-label={title.join(" ")}>
      <ResponsiveImage loading="eager" className={styles.laurel} src={`${ASSETS}v1787020265/Laurel-L_vxtg55.webp`} alt="" sizes="(max-width: 599px) 13px, 28px" width={52} height={130} />
      <span className={styles.rating}>
        <span className={styles.stars} aria-hidden="true">
          {[0, 1, 2, 3, 4].map(i => <ResponsiveImage loading="eager" key={i} src={`${ASSETS}v1787020126/Golden_Beveled_Star_Icon_wwcwek.webp`} alt="" sizes="(max-width: 599px) 12px, 18px" width={27} height={27} />)}
        </span>
        <span className={styles.faces} aria-hidden="true">
          {FACES.map(src => <ResponsiveImage loading="eager" key={src} src={src} alt="" sizes="(max-width: 599px) 18px, 25px" width={32} height={32} />)}
        </span>
        <span className={styles.title}>{title.map(line => <span key={line}>{line}</span>)}</span>
      </span>
      <ResponsiveImage loading="eager" className={styles.laurel} src={`${ASSETS}v1787020265/Laurel-R_kj7isz.webp`} alt="" sizes="(max-width: 599px) 13px, 28px" width={52} height={130} />
    </a>
  );
}
