"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { getWhatsAppUrl } from "@/lib/contact";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  // Create an array for the marquee text repetition
  const marqueeText = Array(20).fill("LIONOVART");

  return (
    <footer ref={ref} className="bg-[#050505] pt-[100px] border-t border-border-dark relative z-0">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 w-full">
        
        {/* Top Section: CTA CTA */}
        <div className="flex flex-col items-center text-center mb-24 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h2 className="text-[3rem] sm:text-[4rem] md:text-[6rem] font-bold uppercase leading-[0.9] tracking-tight text-white max-w-3xl mb-6">
              {t.footer.heading} <span className="text-brand-red">{t.footer.headingAccent}</span>
            </h2>
            <p className="text-[18px] text-text-muted max-w-lg">
              {t.footer.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <a
              href={getWhatsAppUrl("Hi! I visited Lionovart and I'm ready to book a sprint. Can we discuss my project?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-16 items-center justify-center rounded-full bg-brand-red px-10 text-[16px] font-bold uppercase tracking-widest text-white transition-all hover:scale-105 hover:bg-brand-red-secondary focus:ring-4 focus:ring-brand-red/30"
            >
              {t.footer.cta}
            </a>
          </motion.div>
        </div>

        {/* Middle Section: Links */}
        <div className="flex flex-col items-center text-center gap-12 border-t border-border-dark pt-12 mb-12">
          {/* Middle Section: Removed Links, just preserving empty space or restructuring if needed */}
          <div className="space-y-4 flex flex-col items-center">
            <h3 className="text-[48px] md:text-[64px] font-bold font-clash uppercase text-white tracking-widest">
              LIONOVART
            </h3>
            <p className="text-text-muted text-[14px] max-w-sm">
              {t.footer.tagline}
            </p>
          </div>
        </div>

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

      {/* Infinite Text Marquee at the very bottom */}
      <div className="w-full overflow-hidden py-6 bg-brand-red relative z-20 pointer-events-none">
        <motion.div
          className="flex w-max whitespace-nowrap"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 800, ease: "linear", repeat: Infinity }}
        >
          {marqueeText.map((text, i) => (
            <span 
              key={i} 
              className="px-6 text-[3.5rem] sm:text-[6rem] md:text-[9rem] font-bold uppercase font-clash text-white select-none"
            >
              {text}&reg;
            </span>
          ))}
          {/* Duplicate set for seamless scrolling */}
          {marqueeText.map((text, i) => (
            <span 
              key={`dup-${i}`} 
              className="px-6 text-[3.5rem] sm:text-[6rem] md:text-[9rem] font-bold uppercase font-clash text-white select-none"
            >
              {text}&reg;
            </span>
          ))}
        </motion.div>
      </div>
    </footer>
  );
}
