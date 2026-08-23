"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlobePulse } from "@/components/ui/cobe-globe-pulse";
import { Marquee } from "@/components/ui/marquee";
import { useLanguage } from "@/contexts/LanguageContext";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";

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
  image?: string; // person/venue photo (.avif preferred). Absent for logo-only brands.
  logo?: string; // brand mark — used as avatar on small cards with no photo
  stat?: string; // only where the quote states a real number
  statLabel?: string;
  statKind?: "reported" | "estimated";
  tone?: number; // small-card palette index
};

// Each desktop page is ordered so the big card (col-span-2) alternates L / R / L:
//   row1: big sm sm   row2: sm sm big   row3: big sm sm
// Roster avoids the 4 brands in TestimonialsCarousel above (Rocco, Forty Seven,
// Lahaut, Podium). Stats are faithful derivations of the i18n quotes — only where
// the quote states a number. Lumura / Odace / BC copy is brand-written (editable).
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
      stat: "~18%",
      statLabel: "more repeat customers",
      statKind: "estimated",
      tone: 1,
    },
    {
      id: "haeun",
      variant: "small",
      name: "Ha-eun",
      role: "Owner, lifestyle store · Korea",
      quote: "They made my brand look premium and trustworthy. Sales up, returns down.",
      image: IMG + "Korea/Ha-eun-Store.avif",
      stat: "~20%",
      statLabel: "fewer returns",
      statKind: "estimated",
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
      role: "Realtor · Tuscany, Italy",
      quote:
        "They built our brand and site to match the homes we sell — refined, calm, and unmistakably us.",
      image: IMG + "Italy/Lumura/Team2025.avif",
      logo: IMG + "Italy/Lumura/lumura-logo.webp",
      stat: "~35%",
      statLabel: "more qualified enquiries",
      statKind: "estimated",
    },
    {
      id: "odace",
      variant: "big",
      name: "Odace",
      role: "Luxury Jewellery · France",
      quote:
        "They shaped the whole identity — the kind of branding that makes a jewellery house feel timeless.",
      image: IMG + "France/ODACE/ODACE_-background.webp",
      logo: IMG + "France/ODACE/logo-odace.avif",
      stat: "~28%",
      statLabel: "stronger product discovery",
      statKind: "estimated",
    },
    {
      id: "dan",
      variant: "small",
      name: "Dan",
      role: "Director, dental clinic · UK",
      quote: "The website made patients trust us before they walked in. Nailed it.",
      image: IMG + "UK/Dan-Clinic-M.avif",
      stat: "~30%",
      statLabel: "more appointment enquiries",
      statKind: "estimated",
      tone: 1,
    },
    {
      id: "jess",
      variant: "small",
      name: "Jess",
      role: "Owner, Glow Beauty Studio · UK",
      quote: "Leon rebuilt my whole brand and gave me my confidence back. Worth more than the money.",
      image: IMG + "UK/Jess-Beautysalon-W.avif",
      stat: "~22%",
      statLabel: "more booking enquiries",
      statKind: "estimated",
      tone: 2,
    },
  ],
  [
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
      id: "matt",
      variant: "small",
      name: "Matt",
      role: "Director, private clinic · Canada",
      quote: "Booked solid three weeks out since they relaunched our site.",
      image: IMG + "Canada/Matt-Clinic.avif",
      stat: "3 wks",
      statLabel: "booked solid",
      statKind: "reported",
      tone: 3,
    },
    {
      id: "maya",
      variant: "small",
      name: "Maya",
      role: "Owner, Maison Fleur · Canada",
      quote: "They gave my flower shop a brand as beautiful as the arrangements. Walk-ins mention the logo.",
      image: IMG + "Canada/Maya-Flowerstore-W.avif",
      stat: "~25%",
      statLabel: "stronger walk-in recognition",
      statKind: "estimated",
      tone: 0,
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
    {
      id: "jim",
      variant: "small",
      name: "Jim",
      role: "Founder, Sakura Trails · Korea",
      quote: "Automated booking and a multilingual site — travellers book and pay before they land.",
      image: IMG + "Korea/Jim-JapaneseTour.avif",
      stat: "24/7",
      statLabel: "automated booking",
      statKind: "reported",
      tone: 1,
    },
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
      id: "seoyeon",
      variant: "small",
      name: "Seo-yeon",
      role: "Owner, coffee shop · Korea",
      quote: "They rebranded our coffee shop — now people cross the city for the aesthetic.",
      image: IMG + "Korea/Seo-yeon-coffee.avif",
      stat: "~30%",
      statLabel: "more store visits",
      statKind: "estimated",
      tone: 0,
    },
    {
      id: "bc",
      variant: "small",
      name: "Brin de Causette",
      role: "Artisan Home Decor · France",
      quote: "Leon gave my little workshop a beautiful brand and website. I'm so proud to share my work now.",
      logo: IMG + "France/BC/BC-logo.avif",
      stat: "~24%",
      statLabel: "more online enquiries",
      statKind: "estimated",
      tone: 3,
    },
  ],
];

const ALL: Review[] = PAGES.flat();

function ReviewCardSurface({ card }: { card: Review }) {
  const avatar = card.image ?? card.logo;

  return (
    <figure
      data-review-visual
      className="testimonial-card-surface relative w-full overflow-hidden rounded-2xl bg-white/[0.035] p-4 transition-[transform,box-shadow,background-color] duration-300 ease-out group-hover/review:bg-white/[0.07] motion-safe:group-hover/review:-translate-y-1.5 motion-safe:group-hover/review:scale-[1.022] group-hover/review:shadow-[0_22px_50px_-18px_rgba(0,0,0,0.75)] sm:p-5 lg:p-6"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {avatar && (
          <img
            src={imgUrl(avatar)}
            alt={card.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(
              "h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/15 sm:h-9 sm:w-9 lg:h-11 lg:w-11",
              !card.image && card.logo && "bg-white/90 object-contain p-1.5"
            )}
          />
        )}
        <div className="min-w-0">
          <figcaption className="truncate font-clash text-[11px] font-bold uppercase tracking-[0.08em] text-white sm:text-xs lg:text-[13px]">
            {card.name}
          </figcaption>
          <p className="truncate font-body text-[10px] text-white/50 sm:text-[11px] lg:text-xs">{card.role}</p>
        </div>
      </div>

      <blockquote className="mt-2 line-clamp-4 font-body text-xs leading-relaxed text-white/80 sm:mt-3 sm:text-[13px] lg:mt-4 lg:line-clamp-5 lg:text-[15px] lg:leading-[1.65]">
        &ldquo;{card.quote}&rdquo;
      </blockquote>

      {card.stat && (
        <div className="mt-3 lg:mt-4">
          {card.statKind === "estimated" && (
            <span className="mb-1 block font-clash text-[8px] font-bold uppercase tracking-[0.18em] text-white/45 lg:text-[9px]">
              Est. impact
            </span>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="font-clash text-base font-bold leading-none text-brand-gold sm:text-lg lg:text-[22px]">
              {card.stat}
            </span>
            <span className="font-body text-[9px] uppercase tracking-[0.06em] text-white/55 sm:text-[10px] lg:text-[11px]">
              {card.statLabel}
            </span>
          </div>
        </div>
      )}
    </figure>
  );
}
function Card3DFrame({ children }: { children: ReactNode }) {
  return (
    <div data-review-frame className="testimonial-card-frame">
      {children}
    </div>
  );
}

function MarqueeCard({ card }: { card: Review }) {
  return (
    <div
      data-review-card
      data-review-id={card.id}
      className="testimonial-review-card group/review relative w-[208px] shrink-0 select-none sm:w-[232px] md:w-[252px] lg:w-[clamp(270px,21vw,330px)]"
    >
      <Card3DFrame>
        <ReviewCardSurface card={card} />
      </Card3DFrame>
    </div>
  );
}


function TestimonialMarqueeColumn({
  cards,
  side,
  reverse = false,
}: {
  cards: Review[];
  side: "left" | "right";
  reverse?: boolean;
}) {
  return (
    <div
      data-testimonial-column={side}
      className={cn(
        "testimonial-marquee-lane h-full",
        side === "right"
          ? "testimonial-marquee-lane--right"
          : "testimonial-marquee-lane--left"
      )}
    >
      <Marquee
        vertical
        reverse={reverse}
        repeat={2}
        data-testimonial-track={side}
        className={cn(
          "testimonial-marquee-column h-full [--gap:1rem]",
          side === "right" ? "[--duration:64s]" : "[--duration:72s]"
        )}
      >
        {cards.map((card) => (
          <MarqueeCard key={card.id} card={card} />
        ))}
      </Marquee>
    </div>
  );
}

export default function Testimonials(
  props: {
    eyebrow?: string;
    heading?: string;
    headingAccent?: string;
  } = {}
) {
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.testimonials.eyebrow;
  const heading = props.heading || t.testimonials.heading;
  const headingAccent = props.headingAccent || "";

  const col1 = ALL.filter((_, index) => index % 2 === 0);
  const col2 = ALL.filter((_, index) => index % 2 === 1);

  return (
    <section id="testimonials" className="overflow-hidden bg-bg-brand-black">
      <div className="mx-auto max-w-[1440px] px-4 pb-[100px] pt-[80px] sm:px-5 md:px-8 md:pb-[120px] md:pt-[100px]">
        <TestimonialsCarousel />

        <div className="relative mt-14 grid items-start gap-9 sm:mt-16 md:gap-12 lg:mt-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-[clamp(2rem,5vw,5rem)]">
          <div className="relative z-10 min-w-0 text-left">
            <div className="flex flex-col items-start lg:max-w-[620px] lg:pt-12">
              <motion.p
                className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red md:text-[13px]"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                {eyebrow}
              </motion.p>

              <motion.h2
                className="relative z-10 max-w-[10ch] text-[2.65rem] font-bold uppercase leading-[0.9] tracking-[-0.025em] text-white sm:text-[3.5rem] md:text-[4.5rem] lg:text-[clamp(3.4rem,4.8vw,5rem)]"
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

            <div className="testimonial-marquee-stage relative z-10 mt-12 flex h-[560px] w-full flex-row items-center justify-start overflow-hidden min-[480px]:justify-center min-[480px]:px-[clamp(12px,3vw,32px)] sm:mt-12 sm:h-[600px] md:h-[660px] lg:mt-12 lg:h-[720px] lg:px-0">
              <div className="testimonials-marquee-plane flex h-full flex-row-reverse items-start gap-3 sm:gap-4 xl:gap-5">
                <TestimonialMarqueeColumn cards={col1} side="right" />
                <TestimonialMarqueeColumn cards={col2} side="left" reverse />
              </div>

              <div
                data-marquee-mask="top"
                className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-bg-brand-black to-transparent sm:h-16"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-bg-brand-black to-transparent sm:h-16" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-bg-brand-black to-transparent lg:w-1/6" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-bg-brand-black to-transparent" />
            </div>
          </div>

          <div className="testimonials-globe-transition">
            <GlobePulse className="opacity-90 lg:opacity-100" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-bg-brand-black via-bg-brand-black/60 to-transparent lg:hidden" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg-brand-black to-transparent lg:h-1/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
