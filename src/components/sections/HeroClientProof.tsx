"use client";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./HeroClientProof.module.css";

// Existing client results, reused from Testimonials. Lumura remains an estimate.
const CLIENTS = [
  { name: "Northline Motors", logo: "/images/Testimonials/Northlinemotors/Northlinemotors-logo.webp", value: "4×" },
  { name: "Miller & Carter", logo: "/images/Testimonials/Miller&Carter - Resto/mc-logo.avif", value: "2.4×" },
  { name: "Lumura", logo: "/images/Testimonials/Italy/Lumura/lumura-logo.webp", value: "~35%" },
];
const LABELS = {
  en: ["online sales pace", "weekend covers", "more qualified enquiries · est."],
  fr: ["rythme des ventes en ligne", "couverts le week-end", "demandes en plus · estim."],
  es: ["ritmo de ventas online", "comensales en fin de semana", "más consultas · estim."],
  it: ["ritmo vendite online", "coperti nel weekend", "più richieste · stima"],
  ja: ["オンライン販売ペース", "週末の来客数", "問い合わせ増加 · 推定"],
  ko: ["온라인 판매 속도", "주말 방문 고객", "문의 증가 · 추정"],
};
export default function HeroClientProof() {
  const { t, locale } = useLanguage();
  const labels = LABELS[locale] ?? LABELS.en;
  return <div className={styles.proof} data-hero-client-results>
    <p className={styles.trust}>{t.hero.trustLine}</p>
    <div className={styles.clients}>
      {CLIENTS.map((client, i) => <a key={client.name} href="#client-experience" className={styles.client}>
        <Image src={client.logo.split("/").map(encodeURIComponent).join("/")} alt={client.name} width={130} height={36} className={styles.logo} />
        <span className={styles.value}>{client.value}</span>
        <span className={styles.label}>{labels[i]}</span>
      </a>)}
    </div>
  </div>;
}
