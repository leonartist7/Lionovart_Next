"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Working with LIONOVART transformed our brand overnight. We went from looking like a local shop to a global agency. The ROI has been incredible.",
    name: "James Carter",
    role: "CEO, Carter Tech",
  },
  {
    quote: "Their attention to detail and ability to capture our voice is unmatched. Truly a premium experience from start to finish. Highly recommended.",
    name: "Sarah Jenkins",
    role: "Founder, Glow Skincare",
  },
  {
    quote: "The web design sprint was intense but completely worth it. Our conversion rate doubled in the first month. Best investment we've made.",
    name: "Michael Chen",
    role: "Director, Apex Capital",
  },
  {
    quote: "We didn't just get a new logo, we got an entire strategic direction that has repositioned us in the market as the clear market leader.",
    name: "Elena Rodriguez",
    role: "CMO, Horizon Properties",
  },
  {
    quote: "Finally, an agency that actually listens and delivers on time. The video production quality absolutely blew our expectations out of the water.",
    name: "David Smith",
    role: "Founder, Elevate Fitness",
  },
  {
    quote: "Automating our lead pipelines with LIONOVART gave me 20 hours a week back. The system practically pays for itself every single day.",
    name: "Rachel Dawson",
    role: "Managing Partner, Legal Edge",
  },
];

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} id="testimonials" className="bg-bg-dark py-[80px] md:py-[180px]">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Heading */}
        <div className="mb-16 md:mb-20 text-center">
          <motion.p
            className="text-brand-red text-[13px] font-semibold uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            Client Success
          </motion.p>
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] font-bold uppercase leading-none tracking-tight text-text-main"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Don&apos;t Just Take <span className="text-brand-red">Our Word</span>
          </motion.h2>
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              className="break-inside-avoid bg-[#111111] border border-border-dark p-8 rounded-[20px] transition-transform duration-300 hover:-translate-y-1 hover:border-white/10"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: "easeOut" }}
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, index) => (
                  <svg key={index} className="w-5 h-5 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[16px] leading-[160%] text-text-main mb-8 italic">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red font-bold uppercase">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-white uppercase tracking-tight">
                    {testimonial.name}
                  </h4>
                  <p className="text-[13px] text-text-muted">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
