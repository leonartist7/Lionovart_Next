"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame, useInView } from "framer-motion";
import Image from "next/image";

/* ─── Testimonial data ──────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: "Working with LIONOVART transformed our brand overnight. We went from looking like a local shop to a global agency. The ROI has been incredible.",
    name: "James Carter",
    role: "CEO, Carter Tech",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/1_1_bv3shm.avif",
    stars: 5,
  },
  {
    quote: "Their attention to detail and ability to capture our voice is unmatched. Truly a premium experience from start to finish. Highly recommended.",
    name: "Sarah Jenkins",
    role: "Founder, Glow Skincare",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277352/Frame_1_zhyago.avif",
    stars: 5,
  },
  {
    quote: "The web design sprint was intense but completely worth it. Our conversion rate doubled in the first month. Best investment we've made.",
    name: "Michael Chen",
    role: "Director, Apex Capital",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif",
    stars: 5,
  },
  {
    quote: "We didn't just get a new logo — we got an entire strategic direction that repositioned us as the clear market leader.",
    name: "Elena Rodriguez",
    role: "CMO, Horizon Properties",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif",
    stars: 5,
  },
  {
    quote: "Finally, an agency that listens and delivers on time. The video production quality absolutely blew our expectations out of the water.",
    name: "David Smith",
    role: "Founder, Elevate Fitness",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/Thumb_2_p6ksrb.avif",
    stars: 5,
  },
  {
    quote: "Automating our lead pipelines with LIONOVART gave me 20 hours a week back. The system practically pays for itself every single day.",
    name: "Rachel Dawson",
    role: "Managing Partner, Legal Edge",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277380/freepik_from-this-brand-identity-help-me-make-a-mockup-of-her-landing-page..-looking-premium-and-elegant_0001_bnk4us.avif",
    stars: 5,
  },
  {
    quote: "The brand identity they built is something I'm genuinely proud to show off. Every asset is polished, intentional, and unforgettable.",
    name: "Priya Anand",
    role: "Creative Director, Mint Studio",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277352/freepik__design-a-highly-polished-professional-corporate-we__1650_qukgx3.avif",
    stars: 5,
  },
  {
    quote: "From the first call to final delivery — the process was smooth, fast and the results speak for themselves. Exceptional team.",
    name: "Marcus Obi",
    role: "Co-founder, Atlas Labs",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_2_cd1gee.avif",
    stars: 5,
  },
];

/* ─── Wrap helper ───────────────────────────────────────────────── */
function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

/* ─── Star rating ───────────────────────────────────────────────── */
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Single testimonial card ───────────────────────────────────── */
function TestimonialCard({ t }: { t: typeof TESTIMONIALS[number] }) {
  return (
    <div className="
      shrink-0 w-[320px] sm:w-[360px] md:w-[400px]
      rounded-[24px]
      border border-white/8
      bg-[#111111]
      p-7
      flex flex-col gap-4
      mx-3
    ">
      <Stars count={t.stars} />
      <p className="text-[14px] sm:text-[15px] leading-[165%] text-white/80 italic flex-1">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-2 border-t border-white/6">
        {/* Avatar — project screenshot cropped to circle */}
        <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden border border-white/10">
          <Image
            src={t.image}
            alt={t.name}
            fill
            className="object-cover"
            sizes="44px"
          />
        </div>
        <div>
          <p className="text-[13px] font-bold text-white uppercase tracking-tight leading-tight">{t.name}</p>
          <p className="text-[11px] text-white/40 leading-tight">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Scrolling row of cards ────────────────────────────────────── */
function TestimonialRow({
  items,
  baseVelocity,
  pauseOnHover = true,
}: {
  items: typeof TESTIMONIALS;
  baseVelocity: number;
  pauseOnHover?: boolean;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const isPaused = useRef(false);

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_t, delta) => {
    if (isPaused.current) return;
    let moveBy = baseVelocity * (delta / 1000);
    const scrollFactor = smoothVelocity.get() * 0.00005;
    moveBy += Math.sign(baseVelocity) * Math.abs(scrollFactor) * (delta / 1000) * 100;
    baseX.set(baseX.get() + moveBy);
  });

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => { if (pauseOnHover) isPaused.current = true; }}
      onMouseLeave={() => { if (pauseOnHover) isPaused.current = false; }}
    >
      <motion.div className="flex w-max" style={{ x }}>
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} t={t} />
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Main section ──────────────────────────────────────────────── */
export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  // Split into two rows with offset
  const row1 = TESTIMONIALS.slice(0, 5);
  const row2 = [...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(0, 3)];

  return (
    <section ref={ref} id="testimonials" className="bg-bg-dark py-[80px] md:py-[140px] overflow-hidden">
      {/* Heading */}
      <div className="mx-auto max-w-[1200px] px-4 mb-14 md:mb-20 text-center">
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

      {/* Two moving rows with edge fades */}
      <motion.div
        className="flex flex-col gap-5"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        {/* Row 1 — moves left */}
        <TestimonialRow items={row1} baseVelocity={-0.35} />
        {/* Row 2 — moves right */}
        <TestimonialRow items={row2} baseVelocity={0.35} />
      </motion.div>
    </section>
  );
}
