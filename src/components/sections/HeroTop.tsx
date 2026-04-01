"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HeroTop() {
  const [email, setEmail] = useState("");

  return (
    <section className="relative flex min-h-[72vh] flex-col items-center justify-center px-4 pt-28 md:pt-32 md:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-[700px] flex-col items-center gap-6 text-center"
      >
        {/* Main Heading — centered so BRAND ________ extends symmetrically wider than MAKE YOUR */}
        <motion.h1
          variants={itemVariants}
          className="text-center text-[3rem] font-bold uppercase leading-[1.05] tracking-tight text-text-main sm:text-[3.6rem] md:text-[4.5rem] lg:text-[5.8rem]"
        >
          MAKE YOUR
          <br />
          {/* Underscores wrapper — image floats on top of them */}
          <span className="relative inline-block">
            BRAND{" "}
            <span className="relative inline-block">
              <span className="opacity-0 select-none">________</span>
              {/* Overlay image */}
              <Image
                src="https://imgur.com/8czAkK3.png"
                alt="Brand fill"
                width={400}
                height={100}
                className="pointer-events-none absolute left-1/2 top-1/2 h-auto w-[110%] -translate-x-1/2 -translate-y-1/2 object-contain"
                draggable={false}
                priority
              />
            </span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="max-w-[520px] text-[15px] leading-[170%] text-text-muted md:text-[18px]"
        >
          The art of innovating ambitious businesses in today&apos;s digital
          landscape.
        </motion.p>

        {/* Premium Email Form */}
        <motion.form
          variants={itemVariants}
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full max-w-[480px] flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="
              flex-1 rounded-[14px] border border-white/10 bg-white/5
              px-5 py-3.5 text-[14px] text-text-main placeholder-text-muted/50
              outline-none ring-0 backdrop-blur-sm
              transition-colors duration-200
              focus:border-white/25 focus:bg-white/8
              md:text-[15px]
            "
          />
          <button
            type="submit"
            className="
              shrink-0 rounded-[14px] bg-brand-red px-6 py-3.5
              text-[13px] font-bold uppercase tracking-widest text-white
              transition-all duration-200 hover:brightness-110 hover:scale-[1.03]
              active:scale-[0.98] sm:px-7
            "
          >
            Get Started
          </button>
        </motion.form>

        {/* Trust Badges — pushed down with large top margin */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex w-full max-w-[520px] items-center justify-center md:mt-8"
        >
          <Image
            src="https://imgur.com/L6zJMEm.png"
            alt="Trust badges"
            width={800}
            height={200}
            className="h-auto w-full object-contain opacity-80"
            draggable={false}
            priority
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
