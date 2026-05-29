"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { getWhatsAppUrl } from "@/lib/contact";
import { useLanguage } from "@/contexts/LanguageContext";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import VideoBackdrop from "@/components/ui/VideoBackdrop";

const FOOTER_CLIP =
  "https://res.cloudinary.com/dgio9uutc/video/upload/v1779845599/Footage_02_chsoa3.mp4";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  return (
    <footer ref={ref} className="bg-[#000000] pt-12 md:pt-16 lg:pt-[100px] border-t border-border-dark relative z-0 shadow-[inset_4px_4px_16px_rgba(0,0,0,0.5),inset_-4px_-4px_16px_rgba(255,255,255,0.04)]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 w-full">

        {/* Top Section: CTA — video bookend, mirrors the hero open. */}
        <div className="relative isolate overflow-hidden rounded-[22px] md:rounded-[30px] mb-24 px-6 py-20 md:py-28 flex flex-col items-center text-center gap-8">
          <VideoBackdrop src={FOOTER_CLIP} className="absolute inset-0 z-0" overlayClassName="bg-black/65" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            <SplitTextReveal
              as="h2"
              className="text-[3rem] sm:text-[4rem] md:text-[6rem] font-bold uppercase leading-[0.9] tracking-tight text-white max-w-3xl mb-6"
              step={22}
              delay={150}
              from="center"
              duration={1100}
            >
              {t.footer.heading} <span className="text-brand-red">{t.footer.headingAccent}</span>
            </SplitTextReveal>
            <p className="text-[18px] text-text-muted max-w-lg">
              {t.footer.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="relative z-10"
          >
            <a
              href={getWhatsAppUrl("Hi! I visited Lionovart and I'm ready to book a sprint. Can we discuss my project?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-16 items-center justify-center rounded-full bg-brand-red border-2 border-brand-red px-10 text-[16px] font-bold uppercase tracking-widest text-white transition-all duration-200 hover:bg-white hover:text-brand-red hover:scale-105 focus:ring-4 focus:ring-brand-red/30"
            >
              {t.footer.cta}
            </a>
          </motion.div>
        </div>

        {/* Middle divider */}
        <div className="border-t border-border-dark pt-12 mb-12" />

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col justify-center items-center pt-8 pb-12 gap-4">
          <div className="flex gap-6">
            <a href="#" className="text-text-muted hover:text-white text-[13px] uppercase tracking-wider transition-colors">{t.footer.privacy}</a>
            <a href="#" className="text-text-muted hover:text-white text-[13px] uppercase tracking-wider transition-colors">{t.footer.terms}</a>
          </div>
          <p className="text-text-muted text-[13px] uppercase tracking-wider text-center">
            &copy; {currentYear} LIONOVART. {t.footer.copyright}
          </p>
        </div>
      </div>

    </footer>
  );
}
