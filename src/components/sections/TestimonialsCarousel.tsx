"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, type PanInfo, useReducedMotion } from "framer-motion";

const AUTO_PLAY_INTERVAL = 3000;
const TRANSITION_DURATION = 0.6;
const TRANSITION_MS = TRANSITION_DURATION * 1000;
const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 420;
const TRACK_OFFSETS = [-2, -1, 0, 1, 2] as const;
const TRACK_EASE = [0.16, 1, 0.3, 1] as const;
const SIDE_SCALE = 0.85;
const SIDE_VISIBLE_RATIO = 0.15;
const CONTENT_REVEAL_DELAY_MS = 400;

type CarouselItem = {
  brand: string;
  person?: string;
  industry: string;
  shortQuote: string;
  logo: string;
  image?: string;
  backImage: string;
};

const PARTNERS: CarouselItem[] = [
  {
    brand: "CocoRocco",
    person: "Rocco",
    industry: "Website · Menu Content",
    shortQuote:
      "Leon rebuilt our site and photographed the menu so it finally matches what is on the plate. Guests now arrive already knowing what they want.",
    logo: "/images/Testimonials/CocoRocco  - Resto/cocorocco-logo.svg",
    image: "/images/Testimonials/CocoRocco  - Resto/Rocco-Profile.avif",
    backImage: "/images/Testimonials/CocoRocco  - Resto/Rocco-back.avif",
  },
  {
    brand: "Forty Seven",
    industry: "Website · Brand Content",
    shortQuote:
      "The new website and content gave guests a reason to book with us directly. Direct reservations are up, and the place finally feels as good online as it does in person.",
    logo: "/images/Testimonials/Forty Seven - Hotel/logo.webp",
    backImage: "/images/Testimonials/Forty Seven - Hotel/Fortyseven-back.png",
  },
  {
    brand: "Lahaut",
    industry: "Identity · Social Reels",
    shortQuote:
      "The reels completely changed our weekends. People now book days ahead because they saw us on their feed. It finally looks and sounds like our place.",
    logo: "/images/Testimonials/Lahaut  - Resto/lahaut-logo-bleu.svg",
    image: "/images/Testimonials/Lahaut  - Resto/Lahaut-profil.avif",
    backImage: "/images/Testimonials/Lahaut  - Resto/Lahaut-back.avif",
  },
  {
    brand: "Podium",
    industry: "Rebrand · Content",
    shortQuote:
      "Leon rebranded us top to bottom: logo, website, social content, all of it. People recognise the name before they walk in, and the bookings have followed.",
    logo: "/images/Testimonials/Podium  - Resto/Podium-logo.svg",
    image: "/images/Testimonials/Podium  - Resto/Podium-profil.avif",
    backImage: "/images/Testimonials/Podium  - Resto/Podium-back.avif",
  },
];

function PartnerCard({
  partner,
  active,
  contentVisible = active,
  contentDelayMs = 0,
}: {
  partner: CarouselItem;
  active: boolean;
  contentVisible?: boolean;
  contentDelayMs?: number;
}) {
  return (
    <article
      aria-hidden={active ? undefined : "true"}
      className="relative h-full w-full select-none overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#111111] shadow-[0_24px_70px_-36px_rgba(0,0,0,0.95)]"
    >
      <img
        src={encodeURI(partner.backImage)}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          active ? "bg-gradient-to-b from-black/45 via-black/72 to-black/[0.97]" : "bg-black/[0.05]"
        }`}
      />

      <div
        style={{ transitionDelay: contentVisible ? `${contentDelayMs}ms` : "0ms" }}
        className={`relative z-10 flex h-full flex-col p-5 transition-[opacity,transform] duration-200 ease-out sm:p-6 lg:px-8 lg:py-7 ${
          contentVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <span
            aria-hidden="true"
            className="block h-10 font-serif text-[58px] font-bold leading-[0.75] text-brand-red sm:h-11 sm:text-[64px]"
          >
            &ldquo;
          </span>
          <blockquote className="mt-2 max-w-[58ch] font-clash text-[15px] font-medium leading-[1.55] text-white/90 sm:text-[16px] lg:text-[18px]">
            {partner.shortQuote}&rdquo;
          </blockquote>

          <img
            src={encodeURI(partner.logo)}
            alt={`${partner.brand} logo`}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="mt-auto h-9 w-auto max-w-[160px] object-contain object-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:h-10 lg:h-11"
          />
        </div>

        <footer className="mt-4 flex min-h-12 items-center gap-3 border-t border-white/10 pt-3.5">
          {partner.image && (
            <img
              src={encodeURI(partner.image)}
              alt={partner.person ?? partner.brand}
              draggable={false}
              loading="lazy"
              decoding="async"
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/25"
            />
          )}
          <div className="min-w-0">
            <h3 className="truncate font-clash text-[15px] font-bold uppercase tracking-[0.04em] text-white sm:text-[16px]">
              {partner.brand}
            </h3>
            <p className="mt-0.5 truncate font-clash text-[9px] font-bold uppercase tracking-[0.15em] text-brand-red sm:text-[10px]">
              {partner.person ? `${partner.person} · ${partner.industry}` : partner.industry}
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}

export default function TestimonialsCarousel() {
  const reduceMotion = useReducedMotion();
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);
  const transitionTimer = useRef<number | null>(null);
  const desktopStageRef = useRef<HTMLDivElement>(null);
  const count = PARTNERS.length;
  const activeIndex = ((virtualIndex % count) + count) % count;

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  }, []);

  const navigate = useCallback(
    (step: -1 | 1) => {
      if (isAnimating) return;
      clearTransitionTimer();
      setDirection(step);
      setVirtualIndex((previous) => previous + step);
      if (!reduceMotion) {
        setIsAnimating(true);
        transitionTimer.current = window.setTimeout(() => {
          setIsAnimating(false);
          transitionTimer.current = null;
        }, TRANSITION_MS);
      }
    },
    [clearTransitionTimer, isAnimating, reduceMotion]
  );

  const goNext = useCallback(() => navigate(1), [navigate]);
  const goPrev = useCallback(() => navigate(-1), [navigate]);

  useEffect(() => {
    if (reduceMotion || hoverPaused || focusPaused || touchPaused || isAnimating || count <= 1) return;
    const timer = window.setTimeout(goNext, AUTO_PLAY_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [activeIndex, count, focusPaused, goNext, hoverPaused, isAnimating, reduceMotion, touchPaused]);

  useEffect(() => clearTransitionTimer, [clearTransitionTimer]);

  useEffect(() => {
    const stage = desktopStageRef.current;
    if (!stage) return;

    const updateWidth = () => setStageWidth(stage.getBoundingClientRect().width);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const handleSwipeEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_DISTANCE || info.velocity.x <= -SWIPE_VELOCITY) goNext();
    else if (info.offset.x >= SWIPE_DISTANCE || info.velocity.x >= SWIPE_VELOCITY) goPrev();
    setTouchPaused(false);
  };

  const handleMobileKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") goPrev();
    if (event.key === "ArrowRight") goNext();
  };

  const layoutWidth = stageWidth || 960;
  const offscreenGap = Math.min(56, Math.max(24, layoutWidth * 0.03));
  const cardWidth = Math.min(1180, Math.max(560, layoutWidth * 0.76));
  const centerX = (layoutWidth - cardWidth) / 2;
  const visibleSideWidth = cardWidth * SIDE_SCALE * SIDE_VISIBLE_RATIO;
  const sideInset = (cardWidth * (1 - SIDE_SCALE)) / 2;

  const xForOffset = (offset: (typeof TRACK_OFFSETS)[number]) => {
    if (offset === 0) return centerX;
    if (offset === 1) return layoutWidth - visibleSideWidth - sideInset;
    if (offset === -1) return visibleSideWidth - cardWidth + sideInset;
    if (offset === 2) return layoutWidth + offscreenGap + cardWidth * 0.2;
    return -cardWidth * 1.2 - offscreenGap;
  };

  return (
    <section
      className="testimonial-carousel-fullbleed relative mx-auto w-full"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false);
      }}
      aria-label="Featured brand partners"
    >
      <p className="sr-only" aria-live="polite">
        Partner {activeIndex + 1} of {count}: {PARTNERS[activeIndex]?.brand}
      </p>

      <div
        ref={desktopStageRef}
        className="relative hidden h-[360px] overflow-hidden rounded-[24px] md:block lg:h-[320px]"
      >
        {TRACK_OFFSETS.map((offset) => {
          const absoluteIndex = virtualIndex + offset;
          const partnerIndex = ((absoluteIndex % count) + count) % count;
          const partner = PARTNERS[partnerIndex] ?? PARTNERS[0];
          const isActive = offset === 0;
          const isSide = Math.abs(offset) === 1;
          const x = xForOffset(offset);

          return (
            <motion.div
              key={absoluteIndex}
              initial={false}
              animate={{
                x,
                y: "-50%",
                scale: isActive ? 1 : isSide ? SIDE_SCALE : 0.78,
                opacity: isActive ? 1 : isSide ? 0.95 : 0,
              }}
              transition={{ duration: reduceMotion ? 0 : TRANSITION_DURATION, ease: TRACK_EASE }}
              className="absolute left-0 top-1/2 h-full origin-center will-change-transform"
              style={{
                width: cardWidth,
                zIndex: isActive ? 20 : isSide ? 10 : 0,
                pointerEvents: isSide ? "auto" : "none",
              }}
              aria-hidden={Math.abs(offset) > 1 ? "true" : undefined}
            >
              <PartnerCard
                partner={partner}
                active={isActive}
                contentVisible={isActive}
                contentDelayMs={isActive && isAnimating && !reduceMotion ? CONTENT_REVEAL_DELAY_MS : 0}
              />
              {isSide && (
                <button
                  type="button"
                  onClick={offset < 0 ? goPrev : goNext}
                  className="absolute inset-0 z-20 rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-red"
                  aria-label={`Show ${offset < 0 ? "previous" : "next"} partner: ${partner.brand}`}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="relative h-[360px] touch-pan-y overflow-hidden rounded-[24px] md:hidden"
        drag={reduceMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragStart={() => setTouchPaused(true)}
        onDragEnd={handleSwipeEnd}
        onPointerDown={() => setTouchPaused(true)}
        onPointerUp={() => setTouchPaused(false)}
        onPointerCancel={() => setTouchPaused(false)}
        onKeyDown={handleMobileKeyDown}
        tabIndex={0}
        role="group"
        aria-roledescription="slide"
        aria-label={`${PARTNERS[activeIndex]?.brand}, partner ${activeIndex + 1} of ${count}. Swipe or use arrow keys to change partner.`}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeIndex}
            custom={direction}
            initial={reduceMotion ? false : { x: direction > 0 ? 42 : -42, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: direction > 0 ? -42 : 42, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : TRANSITION_DURATION, ease: TRACK_EASE }}
            className="absolute inset-0"
          >
            <PartnerCard partner={PARTNERS[activeIndex] ?? PARTNERS[0]} active />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
