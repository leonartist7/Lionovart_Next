"use client";

import BrandsElevatedScrollV2 from "@/components/sections/BrandsElevatedScrollV2";
import styles from "./BrandsElevatedScroll.module.css";

export default function TestimonialsCarousel() {
  return (
    <div className={`${styles.host} -mt-[80px] md:-mt-[100px]`}>
      <BrandsElevatedScrollV2 />
    </div>
  );
}
