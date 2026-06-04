"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";
import DisciplineCards, {
  type DisciplineMedia,
} from "@/components/sections/what-we-do/VariantCards";
import TrustedBadgesSection from "@/components/sections/TrustedBadgesSection";

gsap.registerPlugin(ScrollTrigger);

/**
 * Discipline media for the DisciplineCards grid. Order: Lead / Innovate / Create.
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
  const [badgesRevealed, setBadgesRevealed] = useState(false);

  /* ── Part A — cinematic scroll-scrubbed center fade-in (badges + eyebrow +
     statement fade together as a curtain; pure opacity/blur, NO rise). The fade
     completes a touch before the trust-badge row reaches mid-screen
     (end:"center 65%") — device-independent. Builds once. ── */
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const fade = section.querySelector<HTMLElement>(".wwd-fade");
      const badges = section.querySelector<HTMLElement>(".wwd-badges");

      if (!fade || !badges) {
        gsap.set(".wwd-fade", { opacity: 1, filter: "none" });
        setBadgesRevealed(true);
        return;
      }

      gsap.set(fade, { opacity: 0, filter: "blur(14px)" });
      const scrollTrigger = {
        trigger: badges,
        start: "top bottom",
        end: "center 65%",
        scrub: true,
      } as const;
      // Opacity is cheap on the compositor — scrub it smoothly.
      gsap.to(fade, {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          ...scrollTrigger,
          onUpdate: (self) => {
            if (self.progress > 0.1) setBadgesRevealed(true);
          },
        },
      });
      // filter:blur is an expensive main-thread repaint. Stepping the scrub
      // quantizes it to a handful of distinct radii instead of recomputing a
      // Gaussian blur every scroll frame — the blur masks the steps visually.
      gsap.to(fade, {
        filter: "blur(0px)",
        ease: "steps(5)",
        scrollTrigger,
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  /* ── Part B — discipline cards enter as the section scrolls into view.
     Desktop: a centered vertical column expands horizontally into the 3-col row.
     Mobile: cards collapse onto the first, then cascade down the column.
     Animations always play (prefers-reduced-motion intentionally overridden for
     this section, per design). Builds once. ── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)",
        },
        (ctx) => {
          const { isDesktop } = ctx.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
          };
          const section = sectionRef.current;
          if (!section) return;
          const cards = gsap.utils.toArray<HTMLElement>(".wwd-card");
          const grid = section.querySelector<HTMLElement>(".wwd-grid");
          if (!cards.length || !grid) return;

          let play: () => void;
          let startPct: number;

          if (isDesktop) {
            // column → row: start as a centered vertical column, then expand
            // horizontally into the row. Offsets measured before any transform
            // (CSS transforms don't shift siblings), so rects = true row slots.
            const buildStart = (card: HTMLElement, i: number): gsap.TweenVars => {
              const gRect = grid.getBoundingClientRect();
              const r = card.getBoundingClientRect();
              const dx = gRect.left + gRect.width / 2 - (r.left + r.width / 2);
              const h = r.height;
              return { x: dx, y: i * (h + 16) + 40, scale: 0.96, autoAlpha: 0 };
            };
            const fromVars = cards.map((card, i) => buildStart(card, i));
            cards.forEach((card, i) => gsap.set(card, fromVars[i]));

            startPct = 0.78;
            play = () => {
              gsap
                .timeline()
                .to(cards, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.1, ease: "power2.out" })
                .to(cards, { x: 0, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.inOut" }, 0.4);
            };
          } else {
            // mobile — stack → spread top-to-bottom: collapse every card onto the
            // first card's slot, then cascade them back down the column.
            const r0 = cards[0].getBoundingClientRect();
            const buildStartM = (card: HTMLElement): gsap.TweenVars => {
              const r = card.getBoundingClientRect();
              const dy = r0.top - r.top; // pile onto card 0
              return { y: dy + 30, scale: 0.94, autoAlpha: 0 };
            };
            const fromVars = cards.map((card) => buildStartM(card));
            cards.forEach((card, i) => gsap.set(card, fromVars[i]));

            startPct = 0.85;
            play = () => {
              gsap.to(cards, {
                y: 0,
                scale: 1,
                autoAlpha: 1,
                stagger: 0.12,
                duration: 0.7,
                ease: "power3.out",
              });
            };
          }

          // Fire the entrance as the grid scrolls into view; if it's already in
          // the zone at build time (reload mid-page / HMR), fire once now.
          let hasPlayed = false;
          const fire = () => {
            if (hasPlayed) return;
            hasPlayed = true;
            play();
          };
          const st = ScrollTrigger.create({
            trigger: grid,
            start: `top ${startPct * 100}%`,
            once: true,
            onEnter: fire,
          });
          if (grid.getBoundingClientRect().top < window.innerHeight * startPct) {
            fire();
            st.kill();
          }
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate pt-10 pb-16 md:flex md:min-h-[100svh] md:flex-col md:justify-center md:pt-14 md:pb-20"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
        {/* ── Part A fade group — badges + eyebrow + statement reveal together ── */}
        <div className="wwd-fade">
          {/* Trust badges — laurel-framed proof row */}
          <div className="wwd-badges">
            <TrustedBadgesSection variant="dark" externalTrigger={badgesRevealed} />
          </div>

          {/* Eyebrow */}
          <p className="wwd-eyebrow mt-6 text-center text-[13px] font-semibold uppercase tracking-[0.3em] text-[#e5192a] md:mt-8 md:text-[14px]">
            {copy.eyebrow}
          </p>

          {/* Statement — appears first, before the cards rise + spread */}
          <h2 className="wwd-headline mx-auto mt-6 max-w-[18ch] text-center font-clash text-[2rem] font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-[2.6rem] md:mt-8 md:text-[3.4rem] lg:text-[4rem]">
            {copy.statement}
          </h2>
        </div>

        {/* ── Part B — discipline cards (column→row desktop, cascade mobile) ── */}
        <div className="mt-12 md:mt-16">
          <DisciplineCards disciplines={copy.disciplines} media={DISCIPLINE_MEDIA} />
        </div>
      </div>
    </section>
  );
}
