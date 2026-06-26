"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Encode each path segment — folders contain spaces (some doubled) and & chars
const imgUrl = (p: string) =>
  p
    .split("/")
    .map((seg) => (seg ? encodeURIComponent(seg) : ""))
    .join("/");

const IMG = "/images/Testimonials/";

type Variant = "big" | "small";

type Review = {
  id: string;
  variant: Variant;
  name: string;
  role: string;
  quote: string;
  image: string; // person/venue photo (.avif preferred)
  logo?: string; // big cards with a brand mark
  stat?: string; // only where the quote states a real number
  statLabel?: string;
  tone?: number; // small-card palette index
};

// Muted sunset tones — elegant, low-saturation. White text. Subtle gradient.
const TONES = [
  "linear-gradient(150deg,#a9542b 0%,#7c3922 100%)", // terracotta
  "linear-gradient(150deg,#996020 0%,#6f3e19 100%)", // amber / ochre
  "linear-gradient(150deg,#9c3f2c 0%,#682922 100%)", // rust
  "linear-gradient(150deg,#8a4926 0%,#5d3220 100%)", // clay
];

// Each page is ordered so the big card (col-span-2) alternates L / R / L:
//   row1: big  sm  sm     row2: sm  sm  big     row3: big  sm  sm
// Roster avoids the 4 brands in TestimonialsCarousel above (Rocco, Forty Seven,
// Lahaut, Podium). Stats are faithful derivations of the i18n quotes — only where
// the quote states a number. Lumura copy is a soft placeholder (confirm details).
const PAGES: Review[][] = [
  [
    {
      id: "marc",
      variant: "big",
      name: "Marc",
      role: "Owner, Northline Motors · Canada",
      quote:
        "Sold more cars off the new site in one quarter than I did all of last year online. The leads show up ready to buy.",
      image: IMG + "Northlinemotors/Marc-Cardealer-M.jpg",
      logo: IMG + "Northlinemotors/Northlinemotors-logo.webp",
      stat: "4×",
      statLabel: "online sales pace",
    },
    {
      id: "mateo",
      variant: "small",
      name: "Mateo",
      role: "Founder, e-commerce · Canada",
      quote: "Redesigned top to bottom. Same traffic, way more checkouts.",
      image: IMG + "Canada/Mateo-Ecommerce-M.avif",
      stat: "2×",
      statLabel: "conversion",
      tone: 0,
    },
    {
      id: "minji",
      variant: "small",
      name: "Min-Ji",
      role: "Founder, clothing label · Korea",
      quote: "My store finally matches the vibe of the clothes. They get fashion.",
      image: IMG + "Korea/Min-Ji-Clothingstore.avif",
      tone: 1,
    },
    {
      id: "haeun",
      variant: "small",
      name: "Ha-eun",
      role: "Owner, lifestyle store · Korea",
      quote: "They made my brand look premium and trustworthy. Sales up, returns down.",
      image: IMG + "Korea/Ha-eun-Store.avif",
      tone: 2,
    },
    {
      id: "jae",
      variant: "small",
      name: "Jae",
      role: "Owner, motorcycle dealership · Korea",
      quote: "New site, new ads, new everything. Doubled my showroom appointments in two months.",
      image: IMG + "Korea/Jae-Motodeal.avif",
      stat: "2×",
      statLabel: "showroom appts",
      tone: 3,
    },
    {
      id: "lumura",
      variant: "big",
      name: "Lumura",
      role: "Hospitality · Italy",
      quote:
        "From day one they understood the vision. Brand, website, content — it finally feels like us.",
      image: IMG + "Italy/Lumura/Team2025.avif",
      logo: IMG + "Italy/Lumura/lumura-logo.webp",
    },
    {
      id: "miller",
      variant: "big",
      name: "Miller & Carter",
      role: "Steakhouse · UK",
      quote: "They rebuilt the brand and the booking flow end to end. Weekends haven't looked back.",
      image: IMG + "Miller&Carter - Resto/MC-back.avif",
      logo: IMG + "Miller&Carter - Resto/mc-logo.avif",
      stat: "2.4×",
      statLabel: "weekend covers",
    },
    {
      id: "ks",
      variant: "small",
      name: "KS",
      role: "Owner, Japanese restaurant · Korea",
      quote: "Best month we've ever had. The new site and menu photos delivered.",
      image: IMG + "Korea/KS-Japaneserestaurant.avif",
      tone: 1,
    },
    {
      id: "seoyeon",
      variant: "small",
      name: "Seo-yeon",
      role: "Owner, coffee shop · Korea",
      quote: "They rebranded our coffee shop — now people cross the city for the aesthetic.",
      image: IMG + "Korea/Seo-yeon-coffee.avif",
      tone: 0,
    },
  ],
  [
    {
      id: "pablo",
      variant: "big",
      name: "Pablo",
      role: "Owner, boutique hotel · Spain",
      quote:
        "Direct bookings are up since they rebuilt our site. We finally stopped handing our margin to the booking platforms.",
      image: IMG + "Spain/Pablo-hotel-M.avif",
      stat: "+60%",
      statLabel: "direct bookings",
    },
    {
      id: "dan",
      variant: "small",
      name: "Dan",
      role: "Director, dental clinic · UK",
      quote: "The website made patients trust us before they walked in. Nailed it.",
      image: IMG + "UK/Dan-Clinic-M.avif",
      tone: 1,
    },
    {
      id: "jess",
      variant: "small",
      name: "Jess",
      role: "Owner, Glow Beauty Studio · UK",
      quote: "Leon rebuilt my whole brand and gave me my confidence back. Worth more than the money.",
      image: IMG + "UK/Jess-Beautysalon-W.avif",
      tone: 2,
    },
    {
      id: "matt",
      variant: "small",
      name: "Matt",
      role: "Director, private clinic · Canada",
      quote: "Booked solid three weeks out since they relaunched our site.",
      image: IMG + "Canada/Matt-Clinic.avif",
      tone: 3,
    },
    {
      id: "maya",
      variant: "small",
      name: "Maya",
      role: "Owner, Maison Fleur · Canada",
      quote: "They gave my flower shop a brand as beautiful as the arrangements. Walk-ins mention the logo.",
      image: IMG + "Canada/Maya-Flowerstore-W.avif",
      tone: 0,
    },
    {
      id: "ben",
      variant: "big",
      name: "Ben",
      role: "Founder, SaaS startup · UK",
      quote:
        "Our page wasn't converting and the brand looked amateur. They overhauled both — we closed our seed six weeks later.",
      image: IMG + "UK/Ben-Saasfounder.avif",
      stat: "6 wks",
      statLabel: "to a closed seed",
    },
    {
      id: "manu",
      variant: "big",
      name: "Manu",
      role: "Director, Costa Realty · Spain",
      quote:
        "The voice agent answers every call, qualifies the lead, books the viewing — even Sundays. I got my evenings back.",
      image: IMG + "Spain/Manu-Realestate-M.avif",
      stat: "24/7",
      statLabel: "AI booking",
    },
    {
      id: "jim",
      variant: "small",
      name: "Jim",
      role: "Founder, Sakura Trails · Korea",
      quote: "Automated booking and a multilingual site — travellers book and pay before they land.",
      image: IMG + "Korea/Jim-JapaneseTour.avif",
      tone: 1,
    },
    {
      id: "sergio",
      variant: "small",
      name: "Sergio",
      role: "Photographer · Spain",
      quote: "My portfolio finally looks worthy of the work.",
      image: IMG + "Spain/Sergio-photographer-M.avif",
      stat: "3×",
      statLabel: "enquiries",
      tone: 2,
    },
  ],
];

const ALL: Review[] = PAGES.flat();

// ─── Shared bits ──────────────────────────────────────────────────────────────
function Logo({ src, className = "" }: { src: string; className?: string }) {
  return (
    <img
      src={imgUrl(src)}
      alt="client logo"
      loading="lazy"
      className={`w-auto object-contain brightness-0 invert ${className}`}
    />
  );
}

function NameRole({ name, role }: { name: string; role: string }) {
  return (
    <div className="min-w-0">
      <p className="font-clash text-[13px] md:text-[15px] font-bold uppercase tracking-[0.1em] text-white truncate">
        {name}
      </p>
      <p className="font-body text-[11px] md:text-xs text-white/55 mt-0.5 truncate">{role}</p>
    </div>
  );
}

// ─── Big card — image-left (grid) / image-top (mobile track) ───────────────────
function BigContent({
  card,
  isHovered,
  preload,
  stacked,
}: {
  card: Review;
  isHovered: boolean;
  preload: boolean;
  stacked: boolean;
}) {
  return (
    <div className={stacked ? "flex flex-col h-full" : "flex h-full"}>
      <div
        className={
          stacked
            ? "h-[150px] w-full shrink-0 bg-cover bg-center"
            : "w-[38%] shrink-0 bg-cover bg-center"
        }
        style={{
          backgroundImage: preload ? `url(${imgUrl(card.image)})` : undefined,
          opacity: preload ? 1 : 0,
          filter: isHovered ? "brightness(1.04)" : "brightness(0.85)",
          transition: "filter 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease",
        }}
      />
      <div className="flex flex-col justify-between flex-1 min-w-0 p-5 md:p-7 bg-[#0c0c0c]">
        {card.stat ? (
          <div>
            <p className="font-clash text-3xl md:text-[2.5rem] font-bold leading-none text-brand-gold">
              {card.stat}
            </p>
            <p className="font-body text-xs md:text-sm text-white/70 mt-1.5">{card.statLabel}</p>
          </div>
        ) : (
          <span />
        )}
        <p className="font-body text-sm md:text-[15px] text-white/85 leading-relaxed my-4 line-clamp-4">
          &ldquo;{card.quote}&rdquo;
        </p>
        <div className="flex items-end justify-between gap-3">
          <NameRole name={card.name} role={card.role} />
          {card.logo && <Logo src={card.logo} className="h-7 md:h-8 max-w-[120px] shrink-0" />}
        </div>
      </div>
    </div>
  );
}

// ─── Small card — colored, profile pic LEFT of the name ────────────────────────
function SmallContent({ card, isHovered }: { card: Review; isHovered: boolean }) {
  return (
    <div className="relative h-full">
      <div
        className="absolute inset-0"
        style={{
          background: TONES[card.tone ?? 0],
          filter: isHovered ? "brightness(1.08)" : "brightness(1)",
          transition: "filter 0.45s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      {/* subtle top-left sheen for depth */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(150deg, rgba(255,255,255,0.08) 0%, transparent 42%)" }}
      />
      <div className="relative z-10 flex flex-col h-full p-5 md:p-6">
        <div className="flex items-center gap-3">
          <img
            src={imgUrl(card.image)}
            alt={card.name}
            loading="lazy"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-white/25 shrink-0"
          />
          <NameRole name={card.name} role={card.role} />
        </div>
        <p className="font-body text-[13px] md:text-sm text-white/90 leading-relaxed mt-4 flex-1 line-clamp-5">
          &ldquo;{card.quote}&rdquo;
        </p>
        {card.stat && (
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-clash text-2xl font-bold text-white leading-none">{card.stat}</span>
            <span className="font-body text-[11px] text-white/70 uppercase tracking-[0.08em]">
              {card.statLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card wrapper — lazy-load + hover; layout sets span (grid) vs width (track) ─
function Card({ card, layout }: { card: Review; layout: "grid" | "track" }) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [preload, setPreload] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPreload(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const big = card.variant === "big";
  const outer =
    layout === "grid"
      ? big
        ? "col-span-2"
        : "col-span-1"
      : "snap-start shrink-0 w-[85vw] max-w-[400px] h-[400px]";

  return (
    <motion.div
      ref={ref}
      className={outer}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] h-full min-h-[300px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          scale: isHovered ? 1.012 : 1,
          boxShadow: isHovered
            ? "0 18px 44px -10px rgba(0,0,0,0.55), 0 0 26px -6px rgba(229,25,42,0.22)"
            : "0 2px 12px -2px rgba(0,0,0,0.35)",
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {big ? (
          <BigContent card={card} isHovered={isHovered} preload={preload} stacked={layout === "track"} />
        ) : (
          <SmallContent card={card} isHovered={isHovered} />
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Arrow button ──────────────────────────────────────────────────────────────
function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous reviews" : "Next reviews"}
      className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all duration-200"
    >
      {dir === "prev" ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Testimonials(props: any) {
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.testimonials.eyebrow;
  const heading = props.heading || t.testimonials.heading;
  const headingAccent = props.headingAccent || "";

  // Desktop pagination
  const [page, setPage] = useState(0);
  const next = () => setPage((p) => (p + 1) % PAGES.length);
  const prev = () => setPage((p) => (p - 1 + PAGES.length) % PAGES.length);

  // Mobile swipe progress
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0);
  };
  // Scroll to the next/prev card by its offset — robust with scroll-snap
  // (scrollBy is unreliable under snap-mandatory in some engines).
  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const cur = el.scrollLeft;
    let target: number;
    if (dir > 0) {
      const nextCard = cards.find((c) => c.offsetLeft > cur + 8);
      target = nextCard ? nextCard.offsetLeft : el.scrollWidth;
    } else {
      const prevCards = cards.filter((c) => c.offsetLeft < cur - 8);
      target = prevCards.length ? prevCards[prevCards.length - 1].offsetLeft : 0;
    }
    // Assignment (not scrollTo/scrollBy) — animates via the `scroll-smooth`
    // class on real browsers and behaves reliably under scroll-snap.
    el.scrollLeft = target;
  };

  return (
    <section id="testimonials" className="bg-bg-brand-black">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 pt-[80px] md:pt-[100px] pb-[100px] md:pb-[120px]">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-[44px] md:mb-[60px]">
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

        {/* Desktop — paginated alternating bento */}
        <div className="hidden md:block">
          <div className="flex items-center justify-end gap-4 mb-6">
            <span className="font-body text-sm text-white/45 tabular-nums">
              {page + 1} / {PAGES.length}
            </span>
            <div className="flex items-center gap-2">
              <Arrow dir="prev" onClick={prev} />
              <Arrow dir="next" onClick={next} />
            </div>
          </div>

          {/* Keyed remount on page change → fade/slide in. No AnimatePresence:
              mode="wait" deadlocks when the section is off-screen (exit never
              resolves, next page never mounts). */}
          <motion.div
            key={page}
            className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(300px,1fr)] gap-4"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {PAGES[page].map((card) => (
              <Card key={card.id} card={card} layout="grid" />
            ))}
          </motion.div>
        </div>

        {/* Mobile — horizontal swipe carousel */}
        <div className="md:hidden">
          <div
            ref={trackRef}
            onScroll={onScroll}
            data-lenis-prevent
            className="relative flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {ALL.map((card) => (
              <Card key={card.id} card={card} layout="track" />
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 mt-5">
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-red rounded-full transition-[width] duration-150"
                style={{ width: `${Math.max(8, progress)}%` }}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Arrow dir="prev" onClick={() => scrollByCard(-1)} />
              <Arrow dir="next" onClick={() => scrollByCard(1)} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
