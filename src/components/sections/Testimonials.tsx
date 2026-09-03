"use client";

import { motion } from "framer-motion";
import { GlobePulse } from "@/components/ui/cobe-globe-pulse";
import { useLanguage } from "@/contexts/LanguageContext";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Results chapter: partner voices first, atmosphere second. The previous wall
 * included editorially estimated impact percentages; production now keeps only
 * the named partner stories instead of presenting estimates as proof.
 */
export default function Testimonials(
  props: {
    eyebrow?: string;
    heading?: string;
    headingAccent?: string;
  } = {},
) {
  const { t } = useLanguage();
  const eyebrow = props.eyebrow || t.testimonials.eyebrow;
  const heading = props.heading || t.testimonials.heading;
  const headingAccent = props.headingAccent || "";

  return (
    <section
      id="testimonials"
      data-art-directed="dark"
      className="relative overflow-hidden bg-bg-brand-black text-white"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 md:px-8 md:py-28 lg:py-32">
        <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.68fr)] lg:gap-[clamp(3rem,7vw,8rem)]">
          <header className="relative z-10 max-w-[760px]">
            <motion.p
              className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red sm:text-[11px] md:text-[12px]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {eyebrow}
            </motion.p>

            <motion.h2
              className="max-w-[10ch] font-clash text-[clamp(3rem,10vw,6.8rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em]"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.58, ease: EASE }}
            >
              {heading}
              {headingAccent ? (
                <>
                  {" "}
                  <span className="text-brand-red">{headingAccent}</span>
                </>
              ) : null}
            </motion.h2>
          </header>

          <motion.div
            className="relative mx-auto w-full max-w-[30rem] lg:ml-auto"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <GlobePulse className="opacity-95" />
          </motion.div>
        </div>

        <div className="mt-12 sm:mt-14 md:mt-16 lg:mt-20">
          <TestimonialsCarousel />
        </div>
      </div>
    </section>
  );
}
