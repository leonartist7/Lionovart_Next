"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import { GlobePulse } from "@/components/ui/cobe-globe-pulse";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";

const IMG = "/images/Testimonials/";

const imgUrl = (path: string) =>
  path
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : ""))
    .join("/");

type Review = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  dark?: boolean;
};

const REVIEWS: Review[] = [
  {
    id: "marc",
    name: "Marc",
    role: "Northline Motors · Canada",
    quote: "Sold more cars off the new site in one quarter than I did all of last year online. The leads show up ready to buy.",
    image: IMG + "Northlinemotors/Marc-Cardealer-M.jpg",
  },
  {
    id: "mateo",
    name: "Mateo",
    role: "E-commerce founder · Canada",
    quote: "Redesigned top to bottom. Same traffic, way more checkouts.",
    image: IMG + "Canada/Mateo-Ecommerce-M.avif",
    dark: true,
  },
  {
    id: "minji",
    name: "Min-Ji",
    role: "Clothing label · Korea",
    quote: "My store finally matches the vibe of the clothes. They get fashion.",
    image: IMG + "Korea/Min-Ji-Clothingstore.avif",
  },
  {
    id: "jae",
    name: "Jae",
    role: "Motorcycle dealership · Korea",
    quote: "New site, new ads, new everything. Doubled my showroom appointments in two months.",
    image: IMG + "Korea/Jae-Motodeal.avif",
    dark: true,
  },
  {
    id: "lumura",
    name: "Lumura",
    role: "Real estate · Tuscany",
    quote: "They built our brand and site to match the homes we sell — refined, calm, and unmistakably us.",
    image: IMG + "Italy/Lumura/Team2025.avif",
  },
  {
    id: "odace",
    name: "Odace",
    role: "Luxury jewellery · France",
    quote: "They shaped the whole identity — the kind of branding that makes a jewellery house feel timeless.",
    image: IMG + "France/ODACE/ODACE_-background.webp",
    dark: true,
  },
  {
    id: "pablo",
    name: "Pablo",
    role: "Boutique hotel · Spain",
    quote: "Direct bookings are up since they rebuilt our site. We finally stopped handing our margin to the booking platforms.",
    image: IMG + "Spain/Pablo-hotel-M.avif",
  },
  {
    id: "jess",
    name: "Jess",
    role: "Glow Beauty Studio · UK",
    quote: "Leon rebuilt my whole brand and gave me my confidence back. Worth more than the money.",
    image: IMG + "UK/Jess-Beautysalon-W.avif",
    dark: true,
  },
];

function ReviewCard({ review, compact = false }: { review: Review; compact?: boolean }) {
  return (
    <article
      className={`overflow-hidden border shadow-[0_32px_80px_-42px_rgba(0,0,0,0.62)] ${compact ? "rounded-[1.25rem]" : "rounded-[1.55rem]"} ${
        review.dark ? "border-white/10 bg-[#111111] text-white" : "border-black/10 bg-[#f4f1ea] text-[#111111]"
      }`}
    >
      <div className={`relative overflow-hidden ${compact ? "aspect-[4/3]" : "aspect-[4/4.25]"}`}>
        <Image
          src={imgUrl(review.image)}
          alt={review.name}
          fill
          sizes="(max-width: 640px) 76vw, (max-width: 1024px) 300px, 330px"
          className="object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${review.dark ? "from-black/45 via-transparent" : "from-black/22 via-transparent"} to-transparent`} />
        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md sm:text-[8px]">
          Elevated
        </span>
      </div>
      <div className={compact ? "p-4" : "p-5 sm:p-6"}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-clash text-[16px] font-bold uppercase tracking-[-0.02em] sm:text-[18px]">{review.name}</h3>
            <p className={`mt-1 font-mono text-[7px] font-bold uppercase tracking-[0.13em] sm:text-[8px] ${review.dark ? "text-white/42" : "text-black/42"}`}>{review.role}</p>
          </div>
          <span className="font-clash text-xl text-brand-red">“</span>
        </div>
        <blockquote className={`mt-4 line-clamp-4 font-body text-[12px] leading-[1.58] sm:text-[13px] ${review.dark ? "text-white/68" : "text-black/64"}`}>
          {review.quote}
        </blockquote>
      </div>
    </article>
  );
}

function FloatingReview({
  review,
  progress,
  start,
  end,
  side,
  tilt,
}: {
  review: Review;
  progress: MotionValue<number>;
  start: number;
  end: number;
  side: "left" | "right";
  tilt: number;
}) {
  const fadeIn = Math.min(end - 0.12, start + 0.07);
  const fadeOut = Math.max(start + 0.16, end - 0.09);
  const y = useTransform(progress, [start, end], ["96vh", "-104vh"]);
  const opacity = useTransform(progress, [Math.max(0, start - 0.025), fadeIn, fadeOut, end], [0, 1, 1, 0]);
  const scale = useTransform(progress, [start, start + (end - start) * 0.4, end], [0.92, 1, 0.96]);
  const rotate = useTransform(progress, [start, end], [tilt, tilt * -0.28]);

  return (
    <motion.div
      style={{ y, opacity, scale, rotate, willChange: "transform, opacity" }}
      className={`absolute top-0 z-30 w-[72vw] max-w-[286px] sm:w-[278px] lg:w-[clamp(270px,20vw,330px)] ${
        side === "left" ? "left-[4vw] sm:left-[8vw] lg:left-[8vw]" : "right-[4vw] sm:right-[8vw] lg:right-[8vw]"
      }`}
    >
      <ReviewCard review={review} />
    </motion.div>
  );
}

function ReducedResults() {
  return (
    <div className="bg-[#f2efe8] text-[#111111]">
      <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:py-28">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-brand-red">Results / client voices</p>
        <h2 className="mt-5 whitespace-nowrap font-clash text-[clamp(3rem,9vw,8rem)] font-semibold uppercase leading-[0.8] tracking-[-0.065em]">Brands elevated</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((review) => <ReviewCard key={review.id} review={review} compact />)}
        </div>
      </div>
      <div className="relative min-h-[70vh] overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 flex items-center justify-center"><GlobePulse className="opacity-90" /></div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end end"] });

  const warmOpacity = useTransform(scrollYProgress, [0, 0.12, 0.43], [1, 0.88, 0]);
  const titleColor = useTransform(scrollYProgress, [0, 0.34, 0.54], ["#111111", "#111111", "#f4f1ea"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.72, 0.94, 1], [1, 1, 0.38, 0.2]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.91]);
  const globeOpacity = useTransform(scrollYProgress, [0, 0.7, 0.84, 1], [0, 0, 0.92, 1]);
  const globeScale = useTransform(scrollYProgress, [0.7, 1], [0.78, 1]);
  const closingOpacity = useTransform(scrollYProgress, [0.78, 0.9, 1], [0, 1, 1]);

  if (reduceMotion) {
    return (
      <section id="testimonials" className="bg-[#0a0a0a]">
        <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:py-24"><TestimonialsCarousel /></div>
        <ReducedResults />
      </section>
    );
  }

  return (
    <section id="testimonials" className="overflow-hidden bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pb-20 lg:pt-24">
        <div className="mb-10 flex items-center gap-3">
          <span className="h-px w-9 bg-brand-red" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-white/42 sm:text-[9px]">Client voices / proof in motion</span>
        </div>
        <TestimonialsCarousel />
      </div>

      <div aria-hidden className="h-24 bg-gradient-to-b from-[#0a0a0a] to-[#f2efe8] sm:h-32" />

      <div ref={sceneRef} className="relative h-[430vh] bg-[#0a0a0a]">
        <div className="sticky top-0 h-svh overflow-hidden">
          <motion.div style={{ opacity: warmOpacity }} className="absolute inset-0 bg-[#f2efe8]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(229,25,42,0.09),transparent_34%)]" />

          <motion.div
            style={{ color: titleColor, opacity: titleOpacity, scale: titleScale }}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <h2 className="whitespace-nowrap text-center font-clash text-[clamp(3.55rem,9.6vw,10.5rem)] font-semibold uppercase leading-[0.76] tracking-[-0.075em]">Brands elevated</h2>
          </motion.div>

          <motion.div style={{ color: titleColor }} className="absolute left-5 top-[5svh] z-40 flex items-center gap-3 sm:left-8 lg:left-[5vw]">
            <span className="h-px w-8 bg-brand-red" />
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] opacity-55">Results / real people / real work</span>
          </motion.div>

          <motion.div style={{ color: titleColor }} className="absolute right-5 top-[5svh] z-40 font-mono text-[8px] font-bold uppercase tracking-[0.2em] opacity-45 sm:right-8 lg:right-[5vw]">
            Scroll the pride
          </motion.div>

          <FloatingReview review={REVIEWS[0]} progress={scrollYProgress} start={0.00} end={0.47} side="left" tilt={-4} />
          <FloatingReview review={REVIEWS[1]} progress={scrollYProgress} start={0.06} end={0.54} side="right" tilt={4.5} />
          <FloatingReview review={REVIEWS[2]} progress={scrollYProgress} start={0.16} end={0.64} side="left" tilt={3.2} />
          <FloatingReview review={REVIEWS[3]} progress={scrollYProgress} start={0.25} end={0.72} side="right" tilt={-3.5} />
          <FloatingReview review={REVIEWS[4]} progress={scrollYProgress} start={0.36} end={0.81} side="left" tilt={-4.8} />
          <FloatingReview review={REVIEWS[5]} progress={scrollYProgress} start={0.46} end={0.88} side="right" tilt={3.8} />
          <FloatingReview review={REVIEWS[6]} progress={scrollYProgress} start={0.57} end={0.95} side="left" tilt={2.8} />
          <FloatingReview review={REVIEWS[7]} progress={scrollYProgress} start={0.64} end={0.99} side="right" tilt={-3.4} />

          <motion.div
            aria-hidden
            style={{ opacity: globeOpacity, scale: globeScale }}
            className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
          >
            <div className="h-[72vh] w-[min(92vw,880px)]"><GlobePulse className="opacity-95" /></div>
          </motion.div>

          <motion.div
            style={{ opacity: closingOpacity }}
            className="pointer-events-none absolute inset-x-0 bottom-[7svh] z-20 text-center text-white"
          >
            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-[#c7a86a] sm:text-[9px]">One brand at a time</p>
            <p className="mx-auto mt-2 max-w-[34ch] font-body text-[12px] leading-[1.6] text-white/48 sm:text-[14px]">Different industries. Different ambitions. One standard: make the brand stronger than we found it.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
