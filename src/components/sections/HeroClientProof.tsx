"use client";
/* eslint-disable @next/next/no-img-element */
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
    <a className="hero-client-proof" href="#client-experience" aria-label={title.join(" ")}>
      <img className="hero-client-laurel" src={`${ASSETS}v1787020265/Laurel-L_vxtg55.webp`} alt="" width={52} height={130} />
      <span className="hero-client-rating">
        <span className="hero-client-stars" aria-hidden="true">
          {[0, 1, 2, 3, 4].map(i => <img key={i} src={`${ASSETS}v1787020126/Golden_Beveled_Star_Icon_wwcwek.webp`} alt="" width={27} height={27} />)}
        </span>
        <span className="hero-client-faces" aria-hidden="true">
          {FACES.map(src => <img key={src} src={src} alt="" width={32} height={32} />)}
        </span>
        <span className="hero-client-title">{title.map(line => <span key={line}>{line}</span>)}</span>
      </span>
      <img className="hero-client-laurel" src={`${ASSETS}v1787020265/Laurel-R_kj7isz.webp`} alt="" width={52} height={130} />
    </a>
  );
}
