> ⚠️ **SUPERSEDED by `MASTERPLAN.md`.** Parked per MASTERPLAN §2.3.
> Read this file for history only, never for direction.

# PLAN — `/services/print` "Print & Physical Branding" page

> Self-contained build brief for a fresh chat. Execute in this repo
> (`LIONOVART_NEXTJS-TAILWIND`). The Branding page work it follows is already
> committed (`feat(brand): bespoke Branding page + canonical ClosingCTA + slim footer`).

## Context / why
`/services/print` is referenced in two places but **the page does not exist yet**:
- `src/lib/service-routes.ts` → `{ id: "print", href: "/services/print", ready: false }`
- The Branding deliverables stack has a **bridge card** linking to `/services/print`
  (`src/components/sections/services/brand/branding/GlassStack.tsx`).

It currently 404s. Build the page, then flip `ready: true` so nav + the bridge resolve.
Print is the **physical/commercial upsell** — the bridge from digital brand → tangible
presence (cards, packaging, signage, merch, premium finishes).

## Decision: capabilities showcase, NOT a catalogue (strong recommendation)
Build a **quote-on-request capabilities showcase**, not an e-commerce catalogue.
Why: premium/bespoke positioning; price depends on stock + finish + quantity (a SKU
grid would look cheap and need constant upkeep); the whole site funnels to **book a
call via Nova**, not self-serve checkout. Present *what we can make* + *how we make it*,
then convert to a quote. A full catalogue / spec PDF is a **later, optional** add (a
downloadable line-sheet or a gated request) — note it, don't build it now.

## Brand system (reuse — do NOT introduce new fonts/colors)
Tokens in `src/app/globals.css`:
- Display `font-clash` (ClashDisplay) · body `font-body` (DM Sans). Max 3 families.
- `brand-red #e5192a` (eyebrows, CTAs) · `brand-gold #f0c917` (reserve for the
  **Premium finishes** highlight — foil/emboss connotation) · ink `#0d0d0d`/`#000` ·
  card `#161616` · `border-dark` · off-white `#f7f4ef`.
- Keep the page **dark** (match web / content-studio). The light→dark journey is the
  Branding page's signature; do not repeat it here.
- (ui-ux-pro-max suggested Liquid Glass + Bodoni/Jost — **rejected**: perf/contrast risk
  and identity preservation. Use the established dark cards + ClashDisplay/DM Sans.)

## Coherence with sibling service pages
Match the shared flow used by `src/app/services/web/page.tsx` &
`content-studio/page.tsx`. Shared components live in
`src/components/sections/services/_shared/`:
`ServiceCurtainHero` · `StatementRelay` · `ProcessBand` · `OfferCards` · `ProofAndClose`.
These pages **end with their own close** (ProofAndClose / OffersAndClose) and do **not**
render the global `ClosingCTA` — so print must NOT add ClosingCTA (would double-close).
Page chrome pattern (copy from a sibling): `<main bg-bg-dark min-h-screen relative z-10>`
→ `Navbar` → sections → `Footer` → `</main>` → `StickyFooterMarquee`.

## Page section flow
```
Navbar
ServiceCurtainHero   eyebrow "Print & Physical"
                     lines [{ "Presence beyond" }, { "the screen", accent:true }]
                     sub "Cards · Packaging · Signage · Merch"
StatementRelay       beats:
                     "Pixels don't shake hands."
                     "The first touch is physical."
                     "Cheap print undoes a premium brand."
CategoryShowcase     ← NEW bespoke scene (see below)
ProcessBand          heading "How we make it"
                     01 Spec    — stock, finish, format, quantity dialed in.
                     02 Proof   — digital + physical proof before the run.
                     03 Produce — vetted presses; color-managed, consistent.
                     04 Deliver — packed, on time, ready to hand out.
OfferCards           single quote offer (no monthly):
                     kind "Project", title "Print Project",
                     blurb "From a card run to a full packaging system.",
                     items ["Print-ready artwork","Stock & finish guidance",
                            "Physical proof","Production management","Delivery"],
                     priceLabel "From", price "On request", ctaLabel "Get a quote"
                     (CTA → openNova("offer", true), same as existing OfferCards)
ProofAndClose        quote placeholder + closingLine "Make it" accent "real."
Footer
StickyFooterMarquee
```

## NEW component — `CategoryShowcase` (mobile-first)
Path: `src/components/sections/services/print/CategoryShowcase.tsx` (`"use client"`).
Categories:
1. **Business cards & stationery** — "The handshake, in your hand."
2. **Packaging** — "Unboxing is a brand moment."
3. **Signage & large-format** — "Be unmissable in physical space."
4. **Merch & apparel** — "Brand people actually wear."
5. **Premium finishes** — "Foil, emboss, spot-UV — the details they feel." ← gold accent, feature tile.

Layout (mobile-first):
- **Mobile (<md):** single-column stack, full-width cards, generous gap. Each card:
  lucide SVG icon (no emoji), `font-clash` title (text-xl/2xl), DM Sans blurb
  (text-white/70), optional sample thumb (`// TODO: swap asset` — gradient placeholder
  or Cloudinary). 16px+ body, ≥44px tap targets.
- **≥md:** **bento** grid — 2 columns, where **Premium finishes** spans wider/taller as
  the feature tile (gold border/glow). Asymmetry = editorial, premium.
- Cards: established dark pattern — `bg-[#161616] border border-border-dark rounded-2xl`,
  hover = border→brand-red (gold for the finishes tile) + `-translate-y-1` + soft shadow,
  `transition` 200ms, **no scale layout shift**, `cursor-default` (non-link) unless you
  later deep-link.
- Reveal: reuse **`RevealOnScroll`**
  (`src/components/sections/services/brand/branding/RevealOnScroll.tsx`) — staggered
  `delay={i*0.06}`, ease-out-expo, transform+opacity only, content visible by default.

## Type scale + color on dark
- Section heading: `font-clash` `clamp(2rem,5vw,3.8rem)` tracking `-0.03em`, white.
- Eyebrow: 11px, `tracking-[0.3em]`, uppercase, `text-brand-red`.
- Tile title: `font-clash` text-xl→2xl white; blurb DM Sans 15–16px `text-white/70`.
- Body line-height 1.6; line length ≤ ~46ch.
- Accent discipline: red = action/eyebrow; **gold only on the Premium-finishes tile**.

## Motion choreography (brand-consistent)
- Ease-out exponential/quart only (`[0.16,1,0.3,1]`). **No bounce/elastic. No fast
  animations** (ui-ux-pro-max anti-pattern). Reveals ~0.8–0.9s.
- Hover micro-interactions 200ms color/border/translateY.
- Optional: a slow GSAP/ScrollTrigger parallax on tile thumbs (mirror `LumaShowcase`
  sticky pattern) — only if it stays 60fps; otherwise skip.
- `prefers-reduced-motion`: RevealOnScroll already degrades to static/visible.

## Files to create / edit
- **New** `src/app/services/print/page.tsx` (server component, `export const metadata`
  title "Print & Physical Branding"). Copy chrome from `services/web/page.tsx`.
- **New** `src/components/sections/services/print/CategoryShowcase.tsx`.
- **Edit** `src/lib/service-routes.ts` → print `ready: true`.
- Reuse: `_shared/*`, `RevealOnScroll`, `useNovaStore.openNova`, `lucide-react` icons.
- Assets: category thumbs are placeholders, each marked `// TODO: swap asset`
  (gradient or `public/images/*` / Cloudinary). No heavy new media.

## Quality bars
- Mobile-first; verify 375 / 768 / 1024 / 1440px, no horizontal overflow.
- Contrast ≥ 4.5:1 (white/`white/70` on dark — fine; check gold-on-dark for any text).
- SVG icons only (lucide), never emoji. `cursor-pointer` only on truly clickable.
- Transform/opacity animations, `will-change` on animated layers, target 60fps.
- Semantic z-index; reduced-motion fallback.

## Skills to invoke in the build chat
1. **impeccable** (craft mode) — shape + polish the page before/after build.
2. **design-taste-frontend** — anti-slop pass so the bento + tiles don't read templated.
3. **ui-ux-pro-max** (`--domain ux` / `--stack nextjs`) — component-level a11y/perf checks.

## Verification (preview, `next dev --webpack`, port 3737)
1. `/services/print` renders full flow; the **Branding bridge card now resolves** (no 404).
2. Console + network clean; 60fps; reduced-motion degrades gracefully.
3. CategoryShowcase: mobile single-column → md bento with the gold Premium-finishes
   feature tile; hover states; no overflow at 375/768/1024/1440.
4. OfferCards "Get a quote" + ProofAndClose CTA open Nova (`openNova`).
5. Footer + nav now link to a live Print page (it shows in the Services column without
   the "Soon" badge once `ready:true`).

## Out of scope (note for later)
- Full priced catalogue / SKU grid (deliberately deferred — see decision above).
- Optional future: downloadable line-sheet PDF or gated spec request.
- Real sample photography for the category thumbs.
