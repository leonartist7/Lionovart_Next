"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

type Testimonial = { quote: string; author: string; role: string; initials: string; image?: string };

// Static fallback — real client words, used if i18n is unavailable.
const TESTIMONIALS_STATIC: Testimonial[] = [
  {
    quote:
      "We were getting traffic but almost no direct bookings — everything was going through booking sites and eating our margin. Within two months of the new website going live, direct reservations jumped almost 70%. It finally looks like the place we actually run, not a template.",
    author: "Camille Moreau",
    role: "Owner, Maison Verre · Annecy, France",
    initials: "CM",
  },
  {
    quote:
      "I was not as confident to hand out my business card and didn't know what to post in instagram for two years. Thank you Leon for rebuilding my whole brand identity, got my confidence back and now I know what to do when someone asks what I do. That's worth more than the money, gracias!",
    author: "Sofia Álvarez",
    role: "Founder, Luminous Skin Studio · UK",
    initials: "SA",
  },
  {
    quote:
      "The voice agent they set up for us handles after-hours calls, qualifies leads, and books viewings straight into my calendar. I got a call last Sunday while I was at dinner with my kids — except I didn't, because it was already handled. That one system pays for everything else we do with them.",
    author: "Marco De Luca",
    role: "Director, Atelier Realty · Milan",
    initials: "MD",
  },
  {
    quote:
      "Three reels in and we had more reservations in one weekend than we'd had the entire previous month. It wasn't just that the videos looked good — it's that they finally sounded like us. Warm, not corporate. People walked in quoting lines from the reels.",
    author: "Isabelle Chen",
    role: "Co-owner, Mesa 14 · Toronto",
    initials: "IC",
  },
  {
    quote:
      "I'm a contractor, not a marketing guy. Before LIONOVART I was editing Instagram posts at 11pm after a 12-hour site day. Now I don't touch any of it. Website, ads, socials, the whole thing — handled. My phone rings more than it ever has and I actually get to sleep.",
    author: "James Hollister",
    role: "Founder, Hollister Build Co. · Calgary",
    initials: "JH",
  },
];

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Card ─────────────────────────────────────────────────────────────────
function TestimonialCard({ quote, author, role, initials, image }: Testimonial) {
  return (
    <div className="shrink-0 w-[340px] md:w-[400px] lg:w-[440px] bg-[#0d0d0d] border border-white/[0.06] rounded-2xl px-7 py-6 md:px-8 md:py-7 shadow-[0_2px_16px_rgba(0,0,0,0.4)]">
      <span
        aria-hidden
        className="font-clash text-[72px] leading-[0.8] text-brand-red font-bold mb-2 block select-none"
      >
        &ldquo;
      </span>
      <p className="font-body text-[15px] md:text-[16px] leading-[1.75] text-white/85 font-normal">
        {quote}
      </p>
      <div className="mt-5 mb-4 border-t border-white/10" />
      <div className="flex items-center gap-3">
        {image ? (
          <img
            src={encodeURI(image)}
            alt={author}
            loading="lazy"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-white/15 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-clash font-bold text-[14px] bg-brand-red shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-clash text-[12px] font-bold uppercase tracking-[0.12em] text-white truncate">
            {author}
          </p>
          <p className="font-body text-[11px] text-white/55 mt-0.5 truncate">{role}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────
// Each row owns its drag state + offset independently. The CSS marquee runs on
// the inner track; the outer motion.div carries the persisted drag offset so
// the auto-scroll resumes from wherever the user released.
function MarqueeRow({
  cards,
  direction,
}: {
  cards: Testimonial[];
  direction: "left" | "right";
}) {
  const dragX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const track = [...cards, ...cards];

  // Pause the infinite marquee while the row is offscreen — the duplicated
  // track is thousands of px wide, and animating its transform from page
  // load costs compositor work for the whole session otherwise.
  const rowRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rowRef} className="overflow-hidden">
      <motion.div
        style={{ x: dragX }}
        drag="x"
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        whileTap={{ cursor: "grabbing" }}
        className="w-max cursor-grab"
      >
        <div
          className={cn(
            "flex gap-5 w-max will-change-transform",
            direction === "left"
              ? "animate-marquee-left"
              : "animate-marquee-right",
            "group-hover:[animation-play-state:paused]"
          )}
          // Inline style: the .animate-marquee-* shorthand (unlayered in
          // globals.css) wins the cascade over Tailwind's layered
          // [animation-play-state:paused] utility, so class-based pausing
          // silently never applied. Inline always wins.
          style={{
            animationPlayState: isDragging || !inView ? "paused" : "running",
          }}
        >
          {track.map((c, i) => (
            <TestimonialCard key={i} {...c} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────
export default function Testimonials(props: any) {
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.testimonials.eyebrow;
  const heading = props.heading || t.testimonials.heading;
  const headingAccent = props.headingAccent || "";

  const source: Testimonial[] =
    props.items && props.items.length > 0
      ? props.items.map((item: any) => ({
          quote: item.quote,
          author: item.author,
          role: item.role ?? "",
          initials: item.initials ?? initialsFor(item.author ?? ""),
          image: item.image,
        }))
      : t.testimonials.reviews?.length
      ? t.testimonials.reviews.map((r: any) => ({
          quote: r.quote,
          author: r.author,
          role: r.role ?? "",
          initials: r.initials ?? initialsFor(r.author ?? ""),
          image: r.image,
        }))
      : TESTIMONIALS_STATIC;

  return (
    <section id="testimonials" className="bg-bg-brand-black overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 pt-[80px] md:pt-[100px]">
        <div className="flex flex-col items-center text-center mb-[60px] md:mb-[80px]">
          <motion.p
            className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {eyebrow}
          </motion.p>
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {heading}
            {headingAccent && (
              <>
                {" "}
                <span className="text-brand-red">{headingAccent}</span>
              </>
            )}
          </motion.h2>
        </div>
      </div>

      <div className="group pb-[100px] md:pb-[120px]">
        <MarqueeRow cards={source} direction="left" />
      </div>
    </section>
  );
}
