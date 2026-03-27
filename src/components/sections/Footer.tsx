"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const currentYear = new Date().getFullYear();

  return (
    <footer ref={ref} className="bg-[#050505] pt-[100px] pb-8 border-t border-border-dark">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        
        {/* Top Section: CTA CTA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-[3rem] sm:text-[4rem] md:text-[6rem] font-bold uppercase leading-[0.9] tracking-tight text-white max-w-2xl mb-6">
              Ready to <span className="text-brand-red">Dominate?</span>
            </h2>
            <p className="text-[18px] text-text-muted max-w-md">
              Stop blending in with the competition. Claim your spot as the undisputed industry leader.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <a
              href="#contact"
              className="inline-flex h-16 items-center justify-center rounded-full bg-brand-red px-10 text-[16px] font-bold uppercase tracking-widest text-white transition-all hover:scale-105 hover:bg-brand-red-secondary focus:ring-4 focus:ring-brand-red/30"
            >
              Book Your Sprint
            </a>
          </motion.div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-border-dark pt-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-[24px] font-bold font-clash uppercase text-white tracking-widest">
              LIONOVART
            </h3>
            <p className="text-text-muted text-[14px] max-w-xs">
              Premium brand identities and websites engineered for high-performing founders.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[14px] font-bold uppercase tracking-widest text-brand-red">Company</h4>
            <ul className="space-y-3">
              <li><a href="#about" className="text-text-muted hover:text-white transition-colors text-[14px] uppercase tracking-wider">About Us</a></li>
              <li><a href="#services" className="text-text-muted hover:text-white transition-colors text-[14px] uppercase tracking-wider">Services</a></li>
              <li><a href="#portfolio" className="text-text-muted hover:text-white transition-colors text-[14px] uppercase tracking-wider">Work</a></li>
              <li><a href="#process" className="text-text-muted hover:text-white transition-colors text-[14px] uppercase tracking-wider">Process</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[14px] font-bold uppercase tracking-widest text-brand-red">Social</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-text-muted hover:text-white transition-colors text-[14px] uppercase tracking-wider">Instagram</a></li>
              <li><a href="#" className="text-text-muted hover:text-white transition-colors text-[14px] uppercase tracking-wider">Twitter / X</a></li>
              <li><a href="#" className="text-text-muted hover:text-white transition-colors text-[14px] uppercase tracking-wider">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-border-dark pt-8">
          <p className="text-text-muted text-[13px] uppercase tracking-wider mb-4 md:mb-0">
            &copy; {currentYear} LIONOVART. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-text-muted hover:text-white text-[13px] uppercase tracking-wider transition-colors">Privacy</a>
            <a href="#" className="text-text-muted hover:text-white text-[13px] uppercase tracking-wider transition-colors">Terms</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
