"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { getWhatsAppUrlWithEmail, getWhatsAppUrl } from "@/lib/contact";

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

/* ─── 3D Carousel images — Cloudinary portfolio shots ──────────── */
const ORIGINAL_IMAGES = [
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

// Double the array to 20 items so the cylinder is massive and wraps fully around the screen width
const CAROUSEL_IMAGES = [...ORIGINAL_IMAGES, ...ORIGINAL_IMAGES];
const N = CAROUSEL_IMAGES.length;

/* ─── 3D Carousel ───────────────────────────────────────────────── */
function Carousel3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(600);

  useEffect(() => {
    const compute = () => {
      if (!cardRef.current) return;
      const w = cardRef.current.offsetWidth;
      // CodePen gap approximation
      const r = (w * 0.5 + 12) / Math.tan(Math.PI / N);
      setRadius(r);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div
      className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden flex justify-center"
      style={{
        // By scaling perspective dynamically with viewport width, the depth illusion 
        // stays completely consistent whether on a phone or an ultrawide monitor.
        // CodePen ratio: perspective is exactly 2x the card width.
        perspective: "clamp(400px, 36vw, 800px)",
        // Mask pushes the black fade exclusively to the very edges
        maskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
      }}
    >
      <div
        className="grid"
        style={{
          transformStyle: "preserve-3d",
          animation: "carousel-spin 60s linear infinite",
          // Taller container to allow the huge edge cards to fully expand without clipping
          height: "clamp(260px, 35vw, 550px)",
          placeItems: "center",
        }}
      >
        {CAROUSEL_IMAGES.map((src, i) => {
          const angleTurn = i / N;
          return (
            <div
              key={i}
              ref={i === 0 ? cardRef : undefined}
              style={{
                gridArea: "1 / 1",
                // Dynamic width: ~18vw so they scale with screen, resulting in a huge cylinder diameter
                width: "clamp(120px, 14vw, 240px)",
                aspectRatio: "7 / 10",
                // Negative Z creates the concave "stadium" effect. 
                // Because N=20 and width is 14vw, the radius is huge. This pushes the 
                // center cards far back, and makes the lateral cards massive as they pass the camera.
                transform: `rotateY(${angleTurn}turn) translateZ(${-radius}px)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
              className="relative overflow-hidden rounded-[16px] md:rounded-[24px] border border-white/10"
            >
              <Image
                src={src}
                alt="Portfolio showcase"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 150px, (max-width: 1280px) 20vw, 300px"
              />
            </div>
          );
        })}
      </div>
    </div>
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
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = email.trim()
      ? getWhatsAppUrlWithEmail(email.trim())
      : getWhatsAppUrl();
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="relative flex min-h-[72vh] flex-col items-center justify-center px-4 pt-28 pb-6 md:pt-32 md:px-6 overflow-hidden">
      {/* Bottom gradient to blend into the next section */}
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

        {/* CTA Form */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="flex w-full max-w-[480px] flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
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
            {submitted ? "Opening WhatsApp…" : "Connect Now"}
          </button>
        </motion.form>

        {/* Trust Badges */}
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

      {/* 3D Rotating Carousel — full bleed, breaks out of section padding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.2 }}
        className="relative z-10 mt-6 md:mt-8 w-full overflow-visible"
      >
        <Carousel3D />
      </motion.div>

      {/* Floating Founder Card */}
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
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-brand-red/60 bg-brand-red/10">
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
