"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { useLanguage } from "@/contexts/LanguageContext";
import DisciplineCards, {
  type DisciplineMedia,
} from "@/components/sections/what-we-do/VariantCards";
import TrustedBadgesSection from "@/components/sections/TrustedBadgesSection";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Discipline media — images now; drop a `video` URL (short muted loop) on any
 * entry to upgrade that card to hover-play preview + lightbox playback.
 * Order: Lead / Innovate / Create.
 */
export const DISCIPLINE_MEDIA: readonly DisciplineMedia[] = [
  { image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/1_1_bv3shm.avif" },
  { image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif" },
  { image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif" },
];

export default function WhatWeDo() {
  const { t } = useLanguage();
  const copy = t.whatWeDo;

  const sectionRef = useRef<HTMLElement>(null);

  /* ── Shared scaffold animations — eyebrow, trust row, gold parallax ── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motionOK: "(prefers-reduced-motion: no-preference)",
          isDesktop: "(min-width: 1024px)",
        },
        (ctx) => {
          const { motionOK, isDesktop } = ctx.conditions as {
            motionOK: boolean;
            isDesktop: boolean;
          };
          let split: SplitText | null = null;

          // Sticky hand-off (desktop) — the site's signature transition. The
          // whole section pins, holds, then dissolves out as the next section
          // rises beneath it (a crossfade, not a plain scroll). Runs even with
          // reduced motion since it's a gentle opacity dissolve, not parallax.
          // pinSpacing:false keeps document height (and hero push timing) intact.
          // scrub:0.5 (not true) ~halves per-tick recalc cost — important because
          // AboutUsHalf right below us is ALSO a pinned/scrubbed section, so the
          // ScrollTrigger graph would otherwise recompute the downstream pin on
          // every Lenis tick. Visually indistinguishable from scrub:true.
          if (isDesktop && sectionRef.current) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: "top top",
                  end: "+=85%",
                  scrub: 0.5,
                  pin: true,
                  pinSpacing: false,
                },
              })
              .to(sectionRef.current, { opacity: 1, duration: 0.5 }) // hold ~first half
              .to(sectionRef.current, { opacity: 0, ease: "power1.in", duration: 0.5 });
          }

          // Decorative reveals — respect reduced motion
          if (!motionOK) {
            gsap.set(".wwd-eyebrow", { opacity: 1, y: 0 });
            return () => {};
          }

          // Eyebrow — SplitText word reveal
          const eyebrowEl = sectionRef.current?.querySelector<HTMLElement>(".wwd-eyebrow");
          if (eyebrowEl) {
            split = new SplitText(eyebrowEl, { type: "words" });
            gsap.from(split.words, {
              yPercent: 110,
              opacity: 0,
              duration: 0.9,
              stagger: 0.06,
              ease: "power3.out",
              scrollTrigger: { trigger: eyebrowEl, start: "top 85%" },
            });
          }

          // (Trust row moved to <TrustedBadgesSection /> at the top of the
          // section — that component runs its own IO + framer-motion reveal,
          // so no GSAP stagger is needed here.)

          return () => {
            split?.revert();
          };
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate pt-8 pb-20 md:pt-10 md:pb-24 lg:pt-12 lg:pb-28"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* ── Trust badges — laurel-framed proof row (was on About) ── */}
        <TrustedBadgesSection variant="dark" />

        {/* ── Eyebrow ── */}
        <div className="mt-6 overflow-hidden md:mt-8">
          <p className="wwd-eyebrow text-center text-[13px] font-semibold uppercase tracking-[0.3em] text-[#e5192a] md:text-[14px]">
            {copy.eyebrow}
          </p>
        </div>

        {/* ── Signature content block — discipline cards ── */}
        <div className="mt-8 md:mt-12">
          <DisciplineCards
            statement={copy.statement}
            disciplines={copy.disciplines}
            media={DISCIPLINE_MEDIA}
          />
        </div>
      </div>
    </section>
  );
}
