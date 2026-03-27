"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="bg-brand-red-secondary relative overflow-hidden py-[80px] md:py-[180px]"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-[16px] font-semibold uppercase tracking-[0.2em] text-white/70 mb-6"
        >
          The Reality
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="max-w-[900px] text-[2.4rem] font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-[3rem] md:text-[4rem] lg:text-[5rem]"
        >
          Innovating in today&apos;s digital era is not a choice.{" "}
          <span className="text-white/30">IT&apos;S NEEDED.</span>
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ originX: 0 }}
          className="mt-10 h-px w-full bg-white/20"
        />

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="mt-10 max-w-[560px] text-[16px] leading-[160%] text-white/80 md:text-[20px] md:leading-[132%]"
        >
          Businesses that don&apos;t invest in their brand and digital presence
          fall behind. We exist to make sure that&apos;s never you.
        </motion.p>
      </div>
    </section>
  );
}
