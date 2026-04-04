"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
  useInView,
} from "framer-motion";
import Image from "next/image";

/* ─── Variants ─────────────────────────────────────────────────── */
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

/* ─── Marquee images — Cloudinary portfolio shots ───────────────── */
const MARQUEE_IMAGES = [
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/1_1_bv3shm.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/Thumb_2_p6ksrb.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277352/Frame_1_zhyago.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_2_cd1gee.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277380/freepik_from-this-brand-identity-help-me-make-a-mockup-of-her-landing-page..-looking-premium-and-elegant_0001_bnk4us.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/Screenshots_2_apvmbr.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277352/freepik__design-a-highly-polished-professional-corporate-we__1650_qukgx3.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277350/image_19_rnwg8w.avif",
];

/* ─── Wrap helper ───────────────────────────────────────────────── */
function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

/* ─── Velocity Marquee ──────────────────────────────────────────── */
interface VelocityMarqueeProps {
  images: string[];
  baseVelocity: number;
}

function VelocityMarquee({ images, baseVelocity }: VelocityMarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_t, delta) => {
    let moveBy = baseVelocity * (delta / 1000);
    const scrollFactor = smoothVelocity.get() * 0.0001;
    moveBy += Math.sign(baseVelocity) * Math.abs(scrollFactor) * (delta / 1000) * 100;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <motion.div className="flex w-max gap-4 md:gap-6" style={{ x }}>
      {[...images, ...images].map((src, i) => (
        <div
          key={i}
          className="relative h-[96px] w-[144px] sm:h-[128px] sm:w-[192px] md:h-[160px] md:w-[240px] shrink-0 rounded-[12px] md:rounded-[20px] overflow-hidden bg-white/5 border border-white/10"
        >
          <Image
            src={src}
            alt="Portfolio showcase"
            fill
            className="object-cover transition-transform duration-500 hover:scale-110 pointer-events-auto"
            sizes="(max-width: 768px) 144px, (max-width: 1024px) 192px, 240px"
          />
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Count-Up Hook ─────────────────────────────────────────────── */
function useCountUp(target: number, duration: number = 1800, active: boolean = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

/* ─── Animated Stats Overlay ────────────────────────────────────── */
function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const clients = useCountUp(50, 1600, inView);
  const industries = useCountUp(20, 1400, inView);
  const years = useCountUp(20, 1200, inView);

  return (
    <div ref={ref} className="flex items-center justify-center gap-6 md:gap-10">
      {[
        { value: clients, suffix: "+", label: "Clients" },
        { value: industries, suffix: "+", label: "Industries" },
        { value: years, suffix: "+", label: "Years Exp." },
      ].map((stat) => (
        <div key={stat.label} className="flex flex-col items-center">
          <span className="text-[22px] sm:text-[26px] font-black text-white leading-none tabular-nums">
            {stat.value}{stat.suffix}
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50 mt-1">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export default function HeroTop() {
  const [email, setEmail] = useState("");

  return (
    <section className="relative flex min-h-[72vh] flex-col items-center justify-center px-4 pt-28 pb-6 md:pt-32 md:px-6 overflow-hidden">
      {/* Bottom gradient to blend seamlessly into the next section */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-bg-dark to-transparent z-0 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-[1200px] flex-col items-center gap-6 text-center"
      >
        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-center text-[11.2vw] sm:text-[4.05rem] md:text-[5.05rem] lg:text-[6.5rem] xl:text-[7.3rem] font-bold uppercase leading-[1.05] tracking-tight text-text-main flex flex-col items-center"
        >
          <span className="block whitespace-nowrap">MAKE YOUR</span>

          <span className="block whitespace-nowrap mt-1 md:mt-2">
            BRAND{" "}
            <span className="relative inline-block">
              <span className="opacity-0 select-none">________</span>
              <Image
                src="https://imgur.com/8czAkK3.png"
                alt="Brand fill"
                width={400}
                height={100}
                className="pointer-events-none absolute left-1/2 top-1/2 h-auto w-[130%] -translate-x-1/2 -translate-y-[65%] object-contain"
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

        {/* CTA Form — "Connect Now" */}
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
            Connect Now
          </button>
        </motion.form>

        {/* Trust Badges — PNG + animated count-up overlay */}
        <motion.div
          variants={itemVariants}
          className="mt-4 flex flex-col items-center gap-3 md:mt-5"
        >
          <Image
            src="https://imgur.com/L6zJMEm.png"
            alt="Trust badges"
            width={800}
            height={200}
            className="h-auto w-full max-w-[320px] object-contain"
            draggable={false}
            priority
          />
        </motion.div>

        {/* Trust Text */}
        <motion.p
          variants={itemVariants}
          className="mt-1 text-[13px] font-medium tracking-wide text-text-muted md:text-[14px]"
        >
          Trusted by 50+ startups and global brands, across 20+ industries.
        </motion.p>
      </motion.div>

      {/* Image Marquees */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-10 mt-8 md:mt-12 w-full flex flex-col gap-4 md:gap-6 overflow-hidden max-w-[1600px] pointer-events-none"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <VelocityMarquee images={MARQUEE_IMAGES} baseVelocity={-0.75} />
        <VelocityMarquee images={MARQUEE_IMAGES.slice().reverse()} baseVelocity={0.75} />
      </motion.div>

      {/* ── Floating Founder Card — bottom-right ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="
          absolute bottom-6 right-4 z-20
          md:bottom-10 md:right-8
          flex items-center gap-3
          rounded-[20px]
          border border-white/10
          bg-black/60 backdrop-blur-xl
          px-4 py-3
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        "
      >
        {/* Avatar placeholder — swap src for your real photo */}
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-brand-red/60 bg-brand-red/10">
          {/* Replace the div below with <Image> once you have a photo URL */}
          <div className="flex h-full w-full items-center justify-center text-brand-red font-black text-lg select-none">
            L
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-white leading-tight tracking-tight">
            Leo — Founder
          </span>
          <span className="text-[11px] text-white/50 leading-tight">
            LIONOVART Creative Agency
          </span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[10px] text-green-400 font-semibold uppercase tracking-widest">
            Open
          </span>
        </div>
      </motion.div>
    </section>
  );
}
