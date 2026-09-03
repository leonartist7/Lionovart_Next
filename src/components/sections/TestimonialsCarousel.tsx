"use client";

import BrandsElevatedScroll from "@/components/sections/BrandsElevatedScroll";
import styles from "./BrandsElevatedScroll.module.css";

export default function TestimonialsCarousel() {
  return (
    <div className={`${styles.host} -mt-[80px] md:-mt-[100px]`}>
      <BrandsElevatedScroll />
    </div>
  );
}
