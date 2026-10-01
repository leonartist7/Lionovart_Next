"use client";

import BrandsElevatedScrollV2 from "@/components/sections/BrandsElevatedScrollV2";
import styles from "./BrandsElevatedScroll.module.css";

export default function TestimonialsCarousel() {
  return (
    <div
      className={`${styles.host} -mt-[81px] md:-mt-[101px]`}
      style={{ boxShadow: "0 -2px 0 var(--site-surface-light)" }}
    >
      <BrandsElevatedScrollV2 />
    </div>
  );
}
