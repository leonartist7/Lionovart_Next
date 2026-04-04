"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const currentYear = new Date().getFullYear();

  // Create an array for the marquee text repetition
  const marqueeText = Array(20).fill("LIONOVART");

  return (
    <footer ref={ref} className="bg-[#050505] pt-[100px] border-t border-border-dark relative z-10">
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
              Ready to <span className="text-brand-red">Dominate?</span>
            </h2>
            <p className="text-[18px] text-text-muted max-w-lg">
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
        <div className="flex flex-col items-center text-center gap-12 border-t border-border-dark pt-12 mb-12">
          <div className="space-y-4 flex flex-col items-center">
            <h3 className="text-[24px] font-bold font-clash uppercase text-white tracking-widest">
              LIONOVART
            </h3>
            <p className="text-text-muted text-[14px] max-w-sm">
              Premium brand identities and websites engineered for high-performing founders.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-24">
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
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col justify-center items-center border-t border-border-dark pt-8 pb-12 gap-4">
          <div className="flex gap-6">
            <a href="#" className="text-text-muted hover:text-white text-[13px] uppercase tracking-wider transition-colors">Privacy</a>
            <a href="#" className="text-text-muted hover:text-white text-[13px] uppercase tracking-wider transition-colors">Terms</a>
          </div>
          <p className="text-text-muted text-[13px] uppercase tracking-wider text-center">
            &copy; {currentYear} LIONOVART. All rights reserved.
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
              {text}
            </span>
          ))}
          {/* Duplicate set for seamless scrolling */}
          {marqueeText.map((text, i) => (
            <span 
              key={`dup-${i}`} 
              className="px-6 text-[3.5rem] sm:text-[6rem] md:text-[9rem] font-bold uppercase font-clash text-white select-none"
            >
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </footer>
  );
}
