# LIONOVART Website Changes - Complete Implementation Plan

## Overview
Three major changes to the LIONOVART website:
1. Redesign the "Sound Familiar?" problem/solution cards (new copy, white solution bg, trust stats, horizontal layout with sticky scroll)
2. Move the red marquee between Problems and Services sections
3. Add a new testimonials carousel after the Services section

## CRITICAL: Do NOT modify these files
- `LumaShowcase.tsx` (lion animation)
- `HeroTop.tsx`
- `Navbar.tsx`
- `Services.tsx`
- `Testimonials.tsx` (existing scroll-stack testimonials)
- `AboutUsHalf.tsx`
- `Comparison.tsx`
- `Process.tsx`
- `Portfolio.tsx`
- `FAQ.tsx`
- `Footer.tsx`
- `ImageMarquee.tsx`
- `TrustedBadgesSection.tsx`

## Files to modify/create (in order)

### 1. `src/lib/i18n/locales/en.ts`

**What:** Replace the `problems` key (lines 170-215) with new 3-card structure that includes `stats` on each solution.

Replace this exact block:
```ts
  problems: {
    eyebrow: "You've Built Something Real",
    heading: "Sound Familiar?",
    items: [
      {
        problem: {
          heading: "You Look Like Everyone Else",
          body: "You blend in — and customers choose whoever they remember first.",
        },
        solution: {
          heading: "A Brand That Stands Out Before You Say a Word",
          body: "Clients recognize you, remember you, and choose you before you've even started your pitch.",
        },
      },
      {
        problem: {
          heading: "Your Phone Isn't Ringing Enough",
          body: "You're great at what you do — your clients love you. But new clients?",
        },
        solution: {
          heading: "Show Up First Where It Counts",
          body: "We make you visible. The next person searching for what you do lands on you — not your competitor.",
        },
      },
      {
        problem: {
          heading: "Marketing Strategy Isn't Enough Anymore",
          body: "You've spent money trying to grow — Facebook ads, SEO agencies, generic content — without knowing what actually worked.",
        },
        solution: {
          heading: "Strategies That Pay for Themselves",
          body: "One team. Clear reports. Honest numbers. We track every dollar, cut what isn't working, and double down on what is.",
        },
      },
      {
        problem: {
          heading: "You're Running the Business, the Marketing, the Website, and the Instagram",
          body: "It's 10pm. You're still editing a reel on your phone. You didn't start this business to become a full-time content creator — did you?",
        },
        solution: {
          heading: "Your Full-Service Brand Creative Partner",
          body: "So you can get your time back. You do what you do best. We make it look, sound, and grow better than ever.",
        },
      },
    ],
  },
```

With this:
```ts
  problems: {
    eyebrow: "You've Built Something Real",
    heading: "Sound Familiar?",
    items: [
      {
        problem: {
          heading: "Your Brand Doesn't Match Your Ambition",
          body: "You've invested in your craft, your team, your space — but your image still looks like day one. Clients pick the competitor who looks like the better choice, even when they're not.",
        },
        solution: {
          heading: "A Brand That Commands Respect on Sight",
          body: "We build identity systems that make clients trust you before you've said a word — logo, web, print, everything aligned.",
          stats: [
            { value: "3x", label: "Perceived Value After Rebrand" },
            { value: "94%", label: "First Impressions Are Design-Based" },
            { value: "50+", label: "Brands Elevated Worldwide" },
          ],
        },
      },
      {
        problem: {
          heading: "You're Invisible Where It Counts",
          body: "You're great at what you do — your existing clients love you. But the next person searching for exactly what you offer? They're finding your competitor instead.",
        },
        solution: {
          heading: "Show Up First. Get Chosen First.",
          body: "From search engines to social feeds, we make sure the right people find you — consistently and in the right places.",
          stats: [
            { value: "+70%", label: "In Direct Bookings — Real Client Result" },
            { value: "5x", label: "More Qualified Leads on Average" },
            { value: "82%", label: "Of Internet Traffic Is Now Video" },
          ],
        },
      },
      {
        problem: {
          heading: "You're Running Everything Alone",
          body: "The website, the socials, the emails, the content — on top of actually running your business. It's 10pm and you're still editing a reel. You didn't start this to become a full-time marketer.",
        },
        solution: {
          heading: "Your Full Creative & Digital Team — One Call Away",
          body: "Brand, web, video, social, print, AI — all handled. You focus on your business. We handle how it looks, sounds, and grows.",
          stats: [
            { value: "24/7", label: "AI Systems Capturing Leads for You" },
            { value: "15h+", label: "Saved Weekly on Average" },
            { value: "100%", label: "Of Partners Multiplied Their ROI" },
          ],
        },
      },
    ],
  },
```

**Key structural change:** Each `solution` now has a `stats` array of `{ value: string; label: string }` objects. The TypeScript type `Translations` is inferred from `en.ts` via `typeof en`, so adding `stats` here automatically adds it to the type.

---

### 2. `src/lib/i18n/locales/fr.ts`

**What:** Replace the `problems` key (lines 173-218) with the French version of the new 3-card structure. Must match the same structure as `en.ts` (3 items with `stats`).

Replace this exact block (lines 173-218):
```ts
  problems: {
    eyebrow: "Vous Avez Construit Quelque Chose de Réel",
    heading: "Ça Vous Parle ?",
    items: [
      {
        problem: {
          heading: "Vous Ressemblez à Tout Le Monde",
          body: "Vous vous fondez dans la masse — et les clients choisissent celui dont ils se souviennent en premier.",
        },
        solution: {
          heading: "Une Marque Qui Se Distingue Avant Même Que Vous Parliez",
          body: "Les clients vous reconnaissent, se souviennent de vous et vous choisissent avant même que vous ayez lancé votre pitch.",
        },
      },
      {
        problem: {
          heading: "Votre Téléphone Ne Sonne Pas Assez",
          body: "Vous excellez dans ce que vous faites — vos clients vous adorent. Mais de nouveaux clients ?",
        },
        solution: {
          heading: "Apparaître en Premier Là Où Ça Compte",
          body: "Nous vous rendons visible. La prochaine personne qui cherche ce que vous faites arrive chez vous — pas chez votre concurrent.",
        },
      },
      {
        problem: {
          heading: "La Stratégie Marketing Ne Suffit Plus",
          body: "Vous avez dépensé de l'argent pour croître — publicités Facebook, agences SEO, contenu générique — sans savoir ce qui a vraiment fonctionné.",
        },
        solution: {
          heading: "Des Stratégies Qui Se Rentabilisent",
          body: "Une seule équipe. Des rapports clairs. Des chiffres honnêtes. Nous suivons chaque euro, éliminons ce qui ne fonctionne pas et doublons la mise sur ce qui marche.",
        },
      },
      {
        problem: {
          heading: "Vous Gérez L'Entreprise, Le Marketing, Le Site Web Et L'Instagram",
          body: "Il est 22h. Vous montez encore un reel sur votre téléphone. Vous n'avez pas créé cette entreprise pour devenir créateur de contenu à temps plein — si ?",
        },
        solution: {
          heading: "Votre Partenaire Créatif de Marque Complet",
          body: "Pour vous permettre de récupérer votre temps. Vous faites ce que vous faites le mieux. Nous faisons en sorte que ça ressemble, sonne et croisse mieux que jamais.",
        },
      },
    ],
  },
```

With this:
```ts
  problems: {
    eyebrow: "Vous Avez Construit Quelque Chose de Réel",
    heading: "Ça Vous Parle ?",
    items: [
      {
        problem: {
          heading: "Votre Image Ne Reflète Pas Votre Ambition",
          body: "Vous avez investi dans votre savoir-faire, votre équipe, votre espace — mais votre image ressemble encore au premier jour. Les clients choisissent celui qui a l'air du meilleur choix, même quand il ne l'est pas.",
        },
        solution: {
          heading: "Une Marque Qui Impose Le Respect au Premier Regard",
          body: "Nous créons des systèmes d'identité qui inspirent confiance avant même que vous ayez dit un mot — logo, web, print, tout aligné.",
          stats: [
            { value: "3x", label: "Valeur Perçue Après Refonte" },
            { value: "94%", label: "Premières Impressions Basées sur le Design" },
            { value: "50+", label: "Marques Élevées dans le Monde" },
          ],
        },
      },
      {
        problem: {
          heading: "Vous Êtes Invisible Là Où Ça Compte",
          body: "Vous excellez dans ce que vous faites — vos clients vous adorent. Mais la prochaine personne qui cherche exactement ce que vous proposez ? Elle trouve votre concurrent.",
        },
        solution: {
          heading: "Apparaître en Premier. Être Choisi en Premier.",
          body: "Des moteurs de recherche aux réseaux sociaux, nous faisons en sorte que les bonnes personnes vous trouvent — de manière constante et aux bons endroits.",
          stats: [
            { value: "+70%", label: "De Réservations Directes — Résultat Client Réel" },
            { value: "5x", label: "Plus de Leads Qualifiés en Moyenne" },
            { value: "82%", label: "Du Trafic Internet Est Maintenant Vidéo" },
          ],
        },
      },
      {
        problem: {
          heading: "Vous Gérez Tout Seul",
          body: "Le site web, les réseaux, les emails, le contenu — en plus de gérer votre entreprise. Il est 22h et vous montez encore un reel. Vous n'avez pas créé votre entreprise pour devenir un marketeur à plein temps.",
        },
        solution: {
          heading: "Votre Équipe Créative & Digitale Complète — À Un Appel",
          body: "Marque, web, vidéo, réseaux, impression, IA — tout est géré. Concentrez-vous sur votre entreprise. Nous gérons son image, son son et sa croissance.",
          stats: [
            { value: "24/7", label: "Systèmes IA Capturant des Leads pour Vous" },
            { value: "15h+", label: "Économisées par Semaine en Moyenne" },
            { value: "100%", label: "Des Partenaires Ont Multiplié Leur ROI" },
          ],
        },
      },
    ],
  },
```

**Note:** `es.ts`, `it.ts`, `ko.ts` use `...en` spread and don't override `problems`, so they automatically inherit the new English structure. No changes needed for those files.

---

### 3. `src/components/sections/ProblemsSolvedSection.tsx`

**What:** Complete rewrite. Replace the entire file (199 lines) with a new version that:
- Uses horizontal card layout (image left, text right) instead of 2-column grid
- Uses CSS `position: sticky` for scroll-stacking behavior
- Has white background on solution face instead of `cards.webp` image
- Has left-aligned text instead of centered
- Has black text on solution face
- Shows trust stats row on solution face
- Preserves the EXACT same paw animation logic (timing, easing, controls, images)
- Shows 3 cards instead of 4

Here is the complete new file:

```tsx
"use client";

import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

// --- Animation timing constants (PRESERVED EXACTLY) ---
const PAW_IN_DURATION = 0.35;
const PULL_DURATION   = 0.70;

const EASE_IN  = [0.2, 0, 0.6, 1]  as const;
const EASE_OUT = [0.20, 1, 0.3, 1] as const;

// --- Single Card ---
function ProblemCard({
  item,
  isRevealed,
  onToggle,
  index,
}: {
  item: {
    problem: { heading: string; body: string };
    solution: {
      heading: string;
      body: string;
      stats: { value: string; label: string }[];
    };
  };
  isRevealed: boolean;
  onToggle: () => void;
  index: number;
}) {
  const cardControls = useAnimation();
  const pawControls  = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  // PRESERVED EXACTLY from original
  const runReveal = async () => {
    await pawControls.set({ x: "-70%", y: "0%", rotate: -6, scale: 0.9 });
    pawControls.start({
      x: "-10%", y: "0%", rotate: 0, scale: 1.15,
      transition: { duration: PAW_IN_DURATION, ease: EASE_OUT },
    });
    await new Promise(r => setTimeout(r, PAW_IN_DURATION * 1000 * 0.85));
    Promise.all([
      cardControls.start({ y: "105%", transition: { duration: PULL_DURATION, ease: EASE_IN } }),
      pawControls.start({ y: "105%", x: "-10%", rotate: 4, scale: 1.05, transition: { duration: PULL_DURATION, ease: EASE_IN } }),
    ]);
  };

  // PRESERVED EXACTLY from original
  const runReset = async () => {
    await Promise.all([
      cardControls.start({ y: "0%", transition: { duration: PULL_DURATION, ease: EASE_OUT } }),
      pawControls.start({ y: "0%", x: "-10%", rotate: 0, scale: 1.15, transition: { duration: PULL_DURATION, ease: EASE_OUT } }),
    ]);
    await new Promise(r => setTimeout(r, 60));
    await pawControls.start({ x: "-50%", rotate: -6, scale: 0.9, transition: { duration: PAW_IN_DURATION, ease: EASE_IN } });
    pawControls.set({ y: "0%" });
  };

  const handleClick = () => {
    onToggle();
    if (!isRevealed) runReveal(); else runReset();
  };

  return (
    <div
      className="sticky z-10"
      style={{ top: `${80 + index * 80}px` }}
    >
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full cursor-pointer"
      >
        <div
          className="
            relative w-full overflow-hidden
            rounded-[20px] md:rounded-[24px]
            shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.04)]
            ring-1 ring-white/[0.06]
            flex flex-col md:flex-row
            min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[340px]
          "
        >
          {/* -- LEFT: Image placeholder -- */}
          <div className="relative w-full md:w-[40%] min-h-[180px] md:min-h-0 bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <div className="flex flex-col items-center gap-2 text-white/30">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <span className="text-[11px] uppercase tracking-widest font-medium">Image Coming Soon</span>
            </div>
          </div>

          {/* -- RIGHT: Content area with problem/solution layers -- */}
          <div className="relative flex-1 overflow-hidden">
            {/* BASE LAYER: SOLUTION (white bg, left-aligned, black text, stats) */}
            <div className="absolute inset-0 bg-white flex flex-col justify-center p-6 sm:p-8 md:p-10">
              {/* Checkmark + heading */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-[#111] font-clash font-bold text-[16px] sm:text-[18px] md:text-[22px] uppercase leading-tight">
                  {item.solution.heading}
                </h3>
              </div>

              {/* Description */}
              <p className="text-[#444] font-sans text-[14px] sm:text-[15px] md:text-[16px] leading-[1.6] mb-6 max-w-[500px]">
                {item.solution.body}
              </p>

              {/* Trust stats row */}
              <div className="flex flex-wrap gap-x-6 gap-y-4 sm:gap-x-8 md:gap-x-10">
                {item.solution.stats.map((stat, si) => (
                  <div key={si} className="flex flex-col">
                    <span className="text-[#e5192a] font-clash font-bold text-[24px] sm:text-[28px] md:text-[32px] leading-none">
                      {stat.value}
                    </span>
                    <span className="text-[#666] text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-wider font-medium mt-1 max-w-[120px] leading-tight">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* OVERLAY LAYER: PROBLEM (black, pulled down by paw) -- PRESERVED EXACTLY */}
            <motion.div
              className="absolute inset-0 z-10 bg-[#000000] p-6 sm:p-8 md:p-10 flex flex-col justify-center"
              initial={{ y: "0%" }}
              animate={cardControls}
            >
              <div className="flex flex-col gap-3 max-w-[500px]">
                <h3 className="text-white font-clash font-bold text-[16px] sm:text-[18px] md:text-[22px] uppercase leading-tight">
                  {item.problem.heading}
                </h3>
                <p className="text-white/70 font-sans text-[14px] sm:text-[15px] md:text-[16px] leading-[1.6]">
                  {item.problem.body}
                </p>
              </div>
            </motion.div>

            {/* LION PAW -- PRESERVED EXACTLY (same image, same controls, same positioning) */}
            <motion.div
              className="pointer-events-none absolute z-20 bottom-0"
              initial={{ x: "-50%", y: "0%", rotate: -6, scale: 0.9 }}
              animate={pawControls}
              style={{ left: 0, width: "clamp(95px, 85%, 145px)", aspectRatio: "1 / 1" }}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{ scale: isHovered && !isRevealed ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 24 }}
              >
                <div className="relative w-full h-full drop-shadow-[0_0_30px_rgba(240,201,23,0.55)]">
                  <Image
                    src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png"
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="50vw"
                    className="object-contain object-bottom-left"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Section ---
export default function ProblemsSolvedSection() {
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const { t } = useLanguage();

  const items = t.problems.items.map((item) => ({
    problem: item.problem,
    solution: item.solution,
  }));

  const toggleCard = (idx: number) => {
    setRevealedIds(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className="relative bg-[#e5192a] py-12 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 relative z-10">

        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col items-center text-center">
          <p className="text-white text-[12px] md:text-[14px] font-clash uppercase tracking-[0.2em] mb-2 md:mb-3">
            {t.problems.eyebrow}
          </p>
          <h2 className="text-[40px] sm:text-[56px] md:text-[76px] font-bold font-clash uppercase leading-[1.05] text-white max-w-4xl">
            {t.problems.heading}
          </h2>
        </div>

        {/* Vertical stacking cards with sticky behavior */}
        <div className="flex flex-col gap-6 md:gap-8 pb-[80px]">
          {items.map((item, i) => (
            <ProblemCard
              key={i}
              item={item}
              index={i}
              isRevealed={revealedIds.includes(i)}
              onToggle={() => toggleCard(i)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
```

**Key changes from original:**
1. Cards are now vertical stack (flex-col) not 2-col grid
2. Each card is `position: sticky` with increasing `top` offset (80px, 160px, 240px) so they stack on scroll
3. Each card has horizontal layout: image placeholder (40%) on left, content (60%) on right
4. Solution face: white bg, left-aligned text, black text color, trust stats row in brand-red
5. Problem overlay text: left-aligned instead of centered
6. Paw animation: 100% identical code (same controls, timing, easing, image URL, sizes, positioning)
7. Card count is driven by `t.problems.items` which is now 3 items

**What was NOT changed (preserved exactly):**
- `PAW_IN_DURATION`, `PULL_DURATION` constants
- `EASE_IN`, `EASE_OUT` easing arrays
- `runReveal()` async function: same pawControls.set, same .start calls, same setTimeout timing, same cardControls.start with y:"105%"
- `runReset()` async function: same Promise.all, same pawControls.start sequences
- Lion paw Image source URL: `https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png`
- Paw drop shadow: `rgba(240,201,23,0.55)`
- Paw hover scale spring: stiffness 350, damping 24
- Paw clamp width: `clamp(95px, 85%, 145px)`
- `handleClick` toggle logic
- `revealedIds` state management
- `toggleCard` function
- Section red background `bg-[#e5192a]`
- Eyebrow + heading from i18n

---

### 4. `src/components/sections/MarqueeSlanted.tsx`

**What:** Change the shadow from all-direction to bottom-only.

Find this line (line 49):
```tsx
        className="overflow-hidden bg-brand-red py-4 md:py-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
```

Replace with:
```tsx
        className="overflow-hidden bg-brand-red py-4 md:py-5 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.5)]"
```

The `-4px` spread makes it bottom-only. Nothing else in this file changes.

---

### 5. `src/components/sections/PageBuilder.tsx`

**What:** Two changes:
1. Move `<MarqueeSlanted />` from after Testimonials to between ProblemsSolvedSection and Services
2. Add new `<TestimonialsCarousel />` after Services

Add this import at the top (after existing imports):
```tsx
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
```

Replace the static fallback layout (lines 33-49):
```tsx
    return (
      <>
        <NovaSection id="hero"><HeroTop /></NovaSection>
        <ImageMarquee />
        <TrustedBadgesSection />
        <NovaSection id="about"><AboutUsHalf /></NovaSection>
        <NovaSection id="showcase"><LumaShowcase /></NovaSection>
        <NovaSection id="problems"><ProblemsSolvedSection /></NovaSection>
        <NovaSection id="services"><Services /></NovaSection>
        <NovaSection id="portfolio"><Portfolio /></NovaSection>
        <NovaSection id="process"><Process /></NovaSection>
        <NovaSection id="comparison"><Comparison /></NovaSection>
        <NovaSection id="testimonials"><Testimonials /></NovaSection>
        <MarqueeSlanted />
        <NovaSection id="faq"><FAQ /></NovaSection>
      </>
    );
```

With:
```tsx
    return (
      <>
        <NovaSection id="hero"><HeroTop /></NovaSection>
        <ImageMarquee />
        <TrustedBadgesSection />
        <NovaSection id="about"><AboutUsHalf /></NovaSection>
        <NovaSection id="showcase"><LumaShowcase /></NovaSection>
        <NovaSection id="problems"><ProblemsSolvedSection /></NovaSection>
        <MarqueeSlanted />
        <NovaSection id="services"><Services /></NovaSection>
        <TestimonialsCarousel />
        <NovaSection id="portfolio"><Portfolio /></NovaSection>
        <NovaSection id="process"><Process /></NovaSection>
        <NovaSection id="comparison"><Comparison /></NovaSection>
        <NovaSection id="testimonials"><Testimonials /></NovaSection>
        <NovaSection id="faq"><FAQ /></NovaSection>
      </>
    );
```

Changes:
- `<MarqueeSlanted />` moved from after Testimonials to after ProblemsSolvedSection
- `<TestimonialsCarousel />` added after Services
- Everything else in exactly the same order

---

### 6. `src/components/sections/TestimonialsCarousel.tsx` (NEW FILE)

**What:** A new testimonials carousel component placed right after Services. Features:
- Large showcase card on dark background
- Circular avatar placeholder with initials
- Quote text, author name, role/brand, 5 stars
- Left/right arrow navigation
- Dot indicators
- Auto-play every 8 seconds (pause on hover)
- 3 testimonials cycling
- Framer Motion `AnimatePresence` transitions
- Uses existing Lenis-compatible patterns (no `useScroll`)

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    initials: "CM",
    name: "Camille Moreau",
    role: "Owner, Maison Verre",
    location: "Annecy, France",
    industry: "Hotel / Hospitality",
    quote:
      "We were getting traffic but almost no direct bookings — everything was going through booking sites and eating our margin. Within two months of the new website going live, direct reservations jumped almost 70%. It finally looks like the place we actually run, not a template.",
    accentColor: "#2563eb",
  },
  {
    initials: "IC",
    name: "Isabelle Chen",
    role: "Co-owner, Mesa 14",
    location: "Toronto, Canada",
    industry: "Restaurant",
    quote:
      "Three reels in and we had more reservations in one weekend than we'd had the entire previous month. It wasn't just that the videos looked good — it's that they finally sounded like us. Warm, not corporate. People walked in quoting lines from the reels.",
    accentColor: "#d97706",
  },
  {
    initials: "JH",
    name: "James Hollister",
    role: "Founder, Hollister Build Co.",
    location: "Calgary, Canada",
    industry: "Contractor / Construction",
    quote:
      "I'm a contractor, not a marketing guy. Before LIONOVART I was editing Instagram posts at 11pm after a 12-hour site day. Now I don't touch any of it. Website, ads, socials, the whole thing — handled. My phone rings more than it ever has and I actually get to sleep.",
    accentColor: "#16a34a",
  },
];

const AUTO_PLAY_INTERVAL = 8000;

export default function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > activeIndex ? 1 : -1);
      setActiveIndex(idx);
    },
    [activeIndex]
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  const active = TESTIMONIALS[activeIndex];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section className="relative bg-bg-surface-light py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-[1100px] px-4 md:px-8">
        {/* Section label */}
        <div className="mb-8 md:mb-12 text-center">
          <p className="text-[#e5192a] text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-3">
            What Our Partners Say
          </p>
          <h2 className="text-[2rem] sm:text-[2.8rem] md:text-[3.5rem] font-bold uppercase leading-[1.05] tracking-tight text-[#111]">
            Real Results, Real Words
          </h2>
        </div>

        {/* Card */}
        <div
          className="relative bg-[#0d0d0d] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] border border-white/[0.06]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative min-h-[400px] sm:min-h-[420px] md:min-h-[380px]">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0 flex flex-col md:flex-row items-center md:items-stretch p-8 sm:p-10 md:p-12 lg:p-16 gap-8 md:gap-12"
              >
                {/* Left: Avatar + Info */}
                <div className="flex flex-col items-center md:items-start justify-center shrink-0 md:w-[220px]">
                  {/* Avatar circle with initials */}
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-clash font-bold text-[24px] md:text-[28px] mb-5 ring-2 ring-white/10"
                    style={{ backgroundColor: active.accentColor }}
                  >
                    {active.initials}
                  </div>
                  <h3 className="text-white font-bold font-clash text-[18px] md:text-[20px] text-center md:text-left">
                    {active.name}
                  </h3>
                  <p className="text-white/60 text-[13px] md:text-[14px] mt-1 text-center md:text-left">
                    {active.role}
                  </p>
                  <p className="text-white/40 text-[12px] md:text-[13px] mt-0.5 text-center md:text-left">
                    {active.location}
                  </p>
                  {/* Stars */}
                  <div className="flex items-center gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
                    ))}
                  </div>
                </div>

                {/* Right: Quote */}
                <div className="flex flex-col justify-center flex-1">
                  <span className="text-[#e5192a] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                    {active.industry}
                  </span>
                  <blockquote className="text-white/90 text-[16px] sm:text-[17px] md:text-[19px] lg:text-[21px] leading-[1.7] font-light italic">
                    &ldquo;{active.quote}&rdquo;
                  </blockquote>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation bar */}
          <div className="relative z-10 flex items-center justify-between px-8 sm:px-10 md:px-12 lg:px-16 pb-6 md:pb-8">
            {/* Arrows */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all duration-200"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all duration-200"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-8 h-2 bg-[#e5192a]"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Design decisions:**
- Dark card (`#0d0d0d`) on the light `bg-surface-light` background (matches the surrounding sections' light bg)
- Uses `lucide-react` icons (Star, ChevronLeft, ChevronRight) which are already installed
- Uses `framer-motion` AnimatePresence which is already installed
- No `useScroll` or scroll-driven animation (avoids Lenis conflicts)
- Auto-plays every 8 seconds, pauses on hover
- Each testimonial has a unique accent color for the avatar (blue, amber, green) matching the LumaShowcase service colors
- Responsive: stacks vertically on mobile, horizontal on desktop

---

## Implementation Order (execute in this exact sequence)

1. **Edit `en.ts`** - Replace `problems` block with new 3-card + stats version
2. **Edit `fr.ts`** - Replace `problems` block with French 3-card + stats version
3. **Create `TestimonialsCarousel.tsx`** - Write the new file
4. **Edit `MarqueeSlanted.tsx`** - Change shadow to bottom-only
5. **Edit `PageBuilder.tsx`** - Add import + reorder sections
6. **Rewrite `ProblemsSolvedSection.tsx`** - Complete replacement with new layout

**Why this order matters:**
- i18n files first because the TypeScript type changes (adding `stats`) must exist before the component that reads them
- TestimonialsCarousel created before PageBuilder imports it
- ProblemsSolvedSection last because it depends on the i18n type changes

## Post-implementation verification

Run `npm run build` (or `npx next build`) to verify:
1. No TypeScript errors from the new `stats` property
2. No missing imports
3. All components render without errors
4. The existing `Testimonials.tsx` component still works (it reads `t.problems` nowhere — it reads `t.testimonials` which is unchanged)

Then visually verify in `npm run dev`:
1. Lion animation in LumaShowcase works exactly as before
2. Paw swipe animation on each of the 3 cards works
3. Cards stack on scroll with sticky behavior
4. Red marquee appears between Problems and Services with bottom shadow
5. Testimonials carousel arrows and auto-play work
6. Existing testimonial section after Comparison still works
7. All other sections unchanged
