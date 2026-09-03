"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const IMG = "/images/Testimonials/";

const encodeAsset = (path: string) => encodeURI(path);

type ElevatedCardData = {
  id: string;
  name: string;
  role: string;
  kind: "Client" | "Brand";
  image: string;
  quote: string;
  stat?: string;
  statLabel?: string;
  statKind?: "reported" | "estimated";
};

type CardLayout = {
  left: string;
  top: string;
  width: string;
  aspectRatio: string;
  yFrom: string;
  yTo: string;
  xFrom?: string;
  xTo?: string;
  rotateFrom?: number;
  rotateTo?: number;
  zIndex: number;
};

const CARDS: ElevatedCardData[] = [
  {
    id: "rocco",
    name: "CocoRocco",
    role: "Website · Menu Content",
    kind: "Client",
    image: IMG + "CocoRocco  - Resto/Rocco-Profile.avif",
    quote:
      "Leon rebuilt our site and photographed the menu so it finally matches what is on the plate. Guests now arrive already knowing what they want.",
    statLabel: "Guests arrive more informed",
  },
  {
    id: "forty-seven",
    name: "Forty Seven",
    role: "Website · Brand Content",
    kind: "Brand",
    image: IMG + "Forty Seven - Hotel/Fortyseven-back.png",
    quote:
      "The new website and content gave guests a reason to book with us directly. Direct reservations are up, and the place finally feels as good online as it does in person.",
    statLabel: "Direct reservations increased",
  },
  {
    id: "mateo",
    name: "Mateo",
    role: "Founder, e-commerce · Canada",
    kind: "Client",
    image: IMG + "Canada/Mateo-Ecommerce-M.avif",
    quote: "Redesigned top to bottom. Same traffic, way more checkouts.",
    stat: "2×",
    statLabel: "conversion",
  },
  {
    id: "odace",
    name: "Odace",
    role: "Luxury Jewellery · France",
    kind: "Brand",
    image: IMG + "France/ODACE/ODACE_-background.webp",
    quote:
      "They shaped the whole identity — the kind of branding that makes a jewellery house feel timeless.",
    stat: "~28%",
    statLabel: "stronger product discovery",
    statKind: "estimated",
  },
  {
    id: "pablo",
    name: "Pablo",
    role: "Owner, boutique hotel · Spain",
    kind: "Client",
    image: IMG + "Spain/Pablo-hotel-M.avif",
    quote:
      "Direct bookings are up since they rebuilt our site. We finally stopped handing our margin to the booking platforms.",
    stat: "+60%",
    statLabel: "direct bookings",
  },
  {
    id: "miller-carter",
    name: "Miller & Carter",
    role: "Steakhouse · UK",
    kind: "Brand",
    image: IMG + "Miller&Carter - Resto/MC-back.avif",
    quote:
      "They rebuilt the brand and the booking flow end to end. Weekends haven't looked back.",
    stat: "2.4×",
    statLabel: "weekend covers",
  },
];

const DESKTOP_LAYOUTS: CardLayout[] = [
  {
    left: "5%",
    top: "12%",
    width: "clamp(300px, 27vw, 455px)",
    aspectRatio: "3 / 2",
    yFrom: "58vh",
    yTo: "-148vh",
    xFrom: "-2vw",
    xTo: "2vw",
    rotateFrom: -1.4,
    rotateTo: 0.4,
    zIndex: 30,
  },
  {
    left: "63%",
    top: "5%",
    width: "clamp(310px, 26vw, 445px)",
    aspectRatio: "3 / 2",
    yFrom: "66vh",
    yTo: "-138vh",
    xFrom: "2.2vw",
    xTo: "-1.2vw",
    rotateFrom: 1.1,
    rotateTo: -0.5,
    zIndex: 30,
  },
  {
    left: "26%",
    top: "47%",
    width: "clamp(290px, 24vw, 410px)",
    aspectRatio: "4 / 3",
    yFrom: "82vh",
    yTo: "-123vh",
    xFrom: "1.2vw",
    xTo: "-1.8vw",
    rotateFrom: 0.8,
    rotateTo: -0.6,
    zIndex: 10,
  },
  {
    left: "69%",
    top: "39%",
    width: "clamp(300px, 25vw, 425px)",
    aspectRatio: "3 / 2",
    yFrom: "88vh",
    yTo: "-117vh",
    xFrom: "-1vw",
    xTo: "1.7vw",
    rotateFrom: -0.7,
    rotateTo: 0.5,
    zIndex: 10,
  },
  {
    left: "9%",
    top: "79%",
    width: "clamp(300px, 26vw, 440px)",
    aspectRatio: "3 / 2",
    yFrom: "108vh",
    yTo: "-96vh",
    xFrom: "-1.4vw",
    xTo: "1vw",
    rotateFrom: -0.9,
    rotateTo: 0.35,
    zIndex: 30,
  },
  {
    left: "53%",
    top: "72%",
    width: "clamp(320px, 28vw, 470px)",
    aspectRatio: "3 / 2",
    yFrom: "116vh",
    yTo: "-90vh",
    xFrom: "1.5vw",
    xTo: "-1vw",
    rotateFrom: 0.7,
    rotateTo: -0.35,
    zIndex: 30,
  },
];

const MOBILE_LAYOUTS: CardLayout[] = [
  {
    left: "4%",
    top: "9%",
    width: "45%",
    aspectRatio: "4 / 5",
    yFrom: "52vh",
    yTo: "-154vh",
    xFrom: "-2vw",
    xTo: "2vw",
    rotateFrom: -1.2,
    rotateTo: 0.3,
    zIndex: 30,
  },
  {
    left: "55%",
    top: "3%",
    width: "40%",
    aspectRatio: "4 / 5",
    yFrom: "66vh",
    yTo: "-140vh",
    xFrom: "2vw",
    xTo: "-2vw",
    rotateFrom: 1.2,
    rotateTo: -0.4,
    zIndex: 10,
  },
  {
    left: "8%",
    top: "59%",
    width: "40%",
    aspectRatio: "4 / 5",
    yFrom: "92vh",
    yTo: "-114vh",
    xFrom: "1vw",
    xTo: "-1vw",
    rotateFrom: 0.8,
    rotateTo: -0.45,
    zIndex: 10,
  },
  {
    left: "54%",
    top: "51%",
    width: "42%",
    aspectRatio: "4 / 5",
    yFrom: "104vh",
    yTo: "-102vh",
    xFrom: "-1vw",
    xTo: "1.5vw",
    rotateFrom: -0.8,
    rotateTo: 0.4,
    zIndex: 30,
  },
];

function ElevatedCard({
  card,
  layout,
  progress,
  active,
  onToggle,
  reducedMotion,
}: {
  card: ElevatedCardData;
  layout: CardLayout;
  progress: MotionValue<number>;
  active: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
}) {
  const y = useTransform(progress, [0, 1], reducedMotion ? ["0vh", "0vh"] : [layout.yFrom, layout.yTo]);
  const x = useTransform(
    progress,
    [0, 1],
    reducedMotion ? ["0vw", "0vw"] : [layout.xFrom ?? "0vw", layout.xTo ?? "0vw"]
  );
  const rotate = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [0, 0] : [layout.rotateFrom ?? 0, layout.rotateTo ?? 0]
  );
  const scale = useTransform(progress, [0, 0.5, 1], reducedMotion ? [1, 1, 1] : [0.985, 1.015, 0.99]);

  return (
    <motion.button
      type="button"
      data-elevated-card={card.id}
      aria-expanded={active}
      aria-label={`${card.name}. ${active ? "Hide" : "Show"} client result`}
      onClick={onToggle}
      className="group absolute overflow-hidden rounded-[18px] text-left shadow-[0_26px_70px_-34px_rgba(0,0,0,0.55)] outline-none ring-1 ring-black/[0.08] transition-[box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-brand-red md:rounded-[22px]"
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        aspectRatio: layout.aspectRatio,
        y,
        x,
        rotate,
        scale,
        zIndex: layout.zIndex,
        willChange: reducedMotion ? undefined : "transform",
      }}
    >
      <img
        src={encodeAsset(card.image)}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-[transform,filter,opacity] duration-500 ease-out motion-safe:group-hover:scale-[1.025] ${
          active ? "scale-[1.015] brightness-[0.38] saturate-[0.78]" : "brightness-[0.92]"
        }`}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />

      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 md:left-4 md:top-4">
        <span className="rounded-full border border-white/20 bg-black/55 px-2.5 py-1 font-clash text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md md:px-3 md:py-1.5 md:text-[10px]">
          {card.name}
        </span>
        <span className="hidden rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-clash text-[8px] font-bold uppercase tracking-[0.15em] text-white/75 backdrop-blur-md sm:inline-block md:text-[9px]">
          {card.kind}
        </span>
      </div>

      <div
        className={`absolute inset-0 z-10 flex flex-col justify-end p-4 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-5 lg:p-6 ${
          active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="max-w-[34rem]">
          {card.statKind === "estimated" && (
            <p className="mb-1 font-clash text-[8px] font-bold uppercase tracking-[0.2em] text-white/55 md:text-[9px]">
              Est. impact
            </p>
          )}
          {card.stat ? (
            <div className="flex items-end gap-2 md:gap-3">
              <span className="font-clash text-[clamp(1.7rem,3vw,3.1rem)] font-semibold leading-none tracking-[-0.04em] text-white">
                {card.stat}
              </span>
              <span className="pb-0.5 font-body text-[10px] uppercase tracking-[0.08em] text-white/70 md:text-xs">
                {card.statLabel}
              </span>
            </div>
          ) : (
            <p className="font-clash text-[clamp(1rem,1.7vw,1.45rem)] font-semibold leading-tight text-white">
              {card.statLabel}
            </p>
          )}

          <blockquote className="mt-3 line-clamp-4 font-body text-[10px] leading-[1.55] text-white/78 sm:text-xs md:mt-4 md:text-sm">
            &ldquo;{card.quote}&rdquo;
          </blockquote>
          <p className="mt-3 font-clash text-[8px] font-bold uppercase tracking-[0.18em] text-brand-gold md:text-[9px]">
            {card.role}
          </p>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 z-[5] p-3 transition-opacity duration-300 md:p-4 ${
          active ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="font-clash text-[8px] font-bold uppercase tracking-[0.18em] text-white/85 md:text-[9px]">
          Tap to reveal result
        </p>
      </div>
    </motion.button>
  );
}

function StickyTitle({ progress }: { progress: MotionValue<number> }) {
  const lightOpacity = useTransform(progress, [0.18, 0.5], [0, 1]);
  const darkOpacity = useTransform(progress, [0.12, 0.47], [1, 0]);
  const x = useTransform(progress, [0, 1], ["1.5vw", "-1.5vw"]);

  const titleClass =
    "absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-clash text-[clamp(5rem,10.9vw,13rem)] font-semibold uppercase leading-none tracking-[-0.065em] max-md:text-[clamp(4rem,21.8vw,7rem)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      <motion.div className={`${titleClass} text-[#111111]`} style={{ opacity: darkOpacity, x }}>
        Brands Elevated
      </motion.div>
      <motion.div className={`${titleClass} text-white`} style={{ opacity: lightOpacity, x }}>
        Brands Elevated
      </motion.div>
    </div>
  );
}

export default function BrandsElevatedScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [activeId, setActiveId] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const blackOpacity = useTransform(scrollYProgress, [0.03, 0.72, 1], [0, 0.94, 1]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.08, 0.22], [1, 1, 0]);

  useEffect(() => {
    if (!activeId) return;

    const closeOnScroll = () => setActiveId(null);
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(`[data-elevated-card="${activeId}"]`)) setActiveId(null);
    };

    window.addEventListener("scroll", closeOnScroll, { passive: true });
    window.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      window.removeEventListener("scroll", closeOnScroll);
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [activeId]);

  return (
    <div
      ref={sectionRef}
      className={`relative w-full bg-[#f0ede6] ${reducedMotion ? "min-h-[150svh]" : "h-[350svh] md:h-[390svh]"}`}
      aria-label="Brands elevated — selected client results"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[#050505]"
          style={{ opacity: blackOpacity }}
          aria-hidden="true"
        />

        <motion.div
          className="pointer-events-none absolute left-4 top-[max(1rem,4vh)] z-40 max-w-[18rem] sm:left-6 md:left-10 md:top-10"
          style={{ opacity: introOpacity }}
          aria-hidden="true"
        >
          <p className="font-clash text-[9px] font-bold uppercase tracking-[0.25em] text-black/55 md:text-[10px]">
            Selected proof
          </p>
          <p className="mt-2 font-body text-xs leading-relaxed text-black/55 md:text-sm">
            People, brands, and outcomes — elevated together.
          </p>
        </motion.div>

        <StickyTitle progress={scrollYProgress} />

        <div className="absolute inset-0 hidden md:block">
          {CARDS.map((card, index) => (
            <ElevatedCard
              key={card.id}
              card={card}
              layout={DESKTOP_LAYOUTS[index]}
              progress={scrollYProgress}
              active={activeId === card.id}
              onToggle={() => setActiveId((current) => (current === card.id ? null : card.id))}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        <div className="absolute inset-0 md:hidden">
          {CARDS.slice(0, 4).map((card, index) => (
            <ElevatedCard
              key={card.id}
              card={card}
              layout={MOBILE_LAYOUTS[index]}
              progress={scrollYProgress}
              active={activeId === card.id}
              onToggle={() => setActiveId((current) => (current === card.id ? null : card.id))}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center md:bottom-6">
          <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 font-clash text-[8px] font-bold uppercase tracking-[0.2em] text-white/55 backdrop-blur-md md:text-[9px]">
            Scroll to explore
          </div>
        </div>
      </div>
    </div>
  );
}
