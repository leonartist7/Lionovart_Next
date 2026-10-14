"use client";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import styles from "./HeroTrustLine.module.css";

const COUNTRIES = [["kr", "South Korea"], ["ca", "Canada"], ["it", "Italy"], ["ch", "Switzerland"], ["fr", "France"], ["es", "Spain"], ["gb", "United Kingdom"]];
export default function HeroCountryFlags() {
  const tr = usePublicCopy();
  return <div className={styles.flags} data-hero-country-flags>
    {COUNTRIES.map(([code, name]) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={code} src={`https://flagcdn.com/w40/${code}.png`} alt={tr(name)} width={24} height={17} loading="lazy" decoding="async" />
    ))}
  </div>;
}
