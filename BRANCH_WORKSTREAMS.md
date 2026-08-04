# Branch Workstreams — `claude/affectionate-keller-8ba6T`

> Read me first. This branch accidentally carries TWO separate workstreams from two
> different chats. They do not conflict (different files). This doc tracks both so
> either chat can continue without confusion.

Last updated: 2026-06-12

---

## Workstream A — New Service Pages (the "pages" chat) — ACTIVE HERE

**Goal:** Build on-brand, high-converting, fully responsive service pages (one per service,
doubling as capability demos until real case studies exist). Flagships first: Video Production
and Social Media & Content.

**Done:**
- `SERVICE_PAGES_SPEC.md` — approved architecture + sitemap + per-page wireframes + the
  conversion/psychology rationale (the 7-act persuasion spine). This is the source of truth.
- Installed skills used for this work: `.claude/skills/design-taste-frontend`, `.claude/skills/ui-ux-pro-max`
  (reference docs; ui-ux-pro-max's Python search CLI was not included so only its rules apply).
- **DECISION: Video + Social merged** into ONE umbrella service "Content Studio" (brand-facing
  name) with two offers inside: Films & Campaigns (project) + Content Engine (monthly retainer).
- **Built:** merged flagship at route `/services/content-studio` (working coded frames, placeholder
  copy/media). Components in `src/components/sections/services/content/`:
  CurtainHero, StickyStatementRelay, CapabilityScrollScene, SocialScene, OffersAndClose.
  (The old `/services/video` route + `services/video/` folder were renamed into this; no `video`
  route exists anymore.)
- **Built: shared service-page shell** in `src/components/sections/services/_shared/`
  (data-driven, reused by the pages below): `ServiceCurtainHero`, `StatementRelay`, `ProcessBand`,
  `OfferCards`, `ProofAndClose`. All CTAs open Nova.
- **Built: Brand Identity** at `/services/brand` — signature scene `MonogramDrawScene` (a geometric
  mark draws itself stroke-by-stroke on scroll) + `BrandSystemReveal` (type/palette/voice assembling).
- **Built: Web & App** at `/services/web` — signature scene `DeviceBuildScene` (a site assembles
  section-by-section in a browser frame on scroll; schematic wireframe blocks + a real hero clip,
  NOT a fake screenshot).

**Phase 1 (Verify & Wire) — DONE in code, pending local verify:**
- HOMEPAGE merged 7 -> 6 services (Video+Social -> "Content Studio") across `Services.tsx`
  (SERVICES_STATIC), EN/ES/FR locales `services.items`, and `nova-knowledge.ts`.
- Route map `src/lib/service-routes.ts` (localized title -> href; `ready` flag gates linking so we
  never link to an unbuilt page).
- Homepage `Services` items now link to their pages; Navbar expertise menu routes to service pages
  (unbuilt ones fall back to in-page scroll). New `/services` overview hub built.

**Phase 2 (Tier-2 pages) — Smart Systems & AI + Growth Marketing now BUILT (spine-complete):**
- `src/app/services/ai/page.tsx` and `src/app/services/growth/page.tsx` ship on the shared `_shared`
  shell (CurtainHero → StatementRelay → ProcessBand → OfferCards → ProofAndClose) with distinct
  per-page copy/offers. `ready:true` flipped for both in `service-routes.ts`, so `/services` overview
  and the Navbar expertise menu now link them.
- These are spine-complete and conversion-ready. Their bespoke Act-1/Act-3 signature scenes (per
  `SERVICE_PAGES_SPEC.md` §5: AI = Nova orb + live flow diagram; Growth = search pin rising to #1 +
  ceremonial metrics ascent) are intentionally NOT yet built — they need a browser to verify and the
  cloud container has no node_modules. They're the next polish pass, to add + verify locally.
- `print` stays `ready:false` (Tier 3 / "deferred" per spec). No `/services/led` route per spec sitemap.

**Next:**
1. Locally verify (`npm run dev`): the two new pages `/services/ai`, `/services/growth`, plus the
   existing `/services`, `/services/content-studio`, `/services/brand`, `/services/web`, the homepage
   Services section, and the nav expertise menu. (No node_modules in the cloud container, verify locally.)
2. Add the bespoke signature scenes to `/ai` and `/growth` (see above), then re-verify in the browser.
3. Decide on `print` (Tier 3): build a full page or keep it "Soon". Flip `ready` when shipped.
4. Phase 3: 3-skill audit (impeccable critique/audit + design-taste pre-flight + ui-ux-pro-max).
5. Optional: retrofit `/services/content-studio` onto the shared `_shared` components.
6. Add `/work` index. (No `/contact` form, Nova is the endpoint.)

**Decisions locked:**
- CONVERSION ENDPOINT = the Nova voice agent, NOT a form. CTAs call
  `useNovaStore().openNova("hero", true)`. The "$70 market-research hook" is dropped.
- Scope = overview/sitemap delivered then build; fidelity = working coded frames w/ placeholder
  copy; content = concept/demo placeholders.
- Naming = "Content Studio" (H1/nav) with "creative content & film" as supporting line; SEO terms
  ride in the page `<title>`/description/eyebrows.

---

## Workstream B — Performance Audit (the "performance" chat) — PARKED, READY TO RESUME

**Goal:** Kill scroll/animation jank. Clue: Windows "Show animations" OFF = buttery (so the cost
is the motion-enabled render path; browser maps the OS toggle to `prefers-reduced-motion`).

**Done (already committed + pushed on THIS branch):**
- `PERF_AUDIT_PHASE1.md` — full read-only ranked report. Smoking gun: `BottomBlur`'s 3 stacked
  fixed `backdrop-filter` layers (the ones `display:none` under reduced-motion). Ruled out:
  `remotion` (not installed), canvas stars/parallax loop (doesn't exist), Lenis RAF (correct).
- **Phase 2 fixes applied, one per commit (revertible):**
  - `7af89d5` perf(BottomBlur): collapse 3 backdrop-filter layers → 1 masked pass (+`contain:paint`)
  - `dd0b236` perf(Navbar): glass blur 24→12px, disable filter while hidden in hero mode
  - `42c86cc` perf(CustomCursor): per-frame `elementFromPoint` → `pointerover` delegation

**Next for the performance chat:**
1. Local DevTools → Performance verification: record while scrolling, confirm fewer/shorter long
   frames; confirm the on/off (reduced-motion) gap has shrunk. Sanity-check the look (frost, nav
   glass, cursor hover + labels incl. the light Services section).
2. Optional secondary levers (NOT yet done): gate `LiquidMetalButton` WebGL shader to pause when
   idle/off-screen; swap `filter: blur()` entrance animations in `LumaShowcase`/`WhatWeDo` to
   opacity+scale.
3. Branch decision: the perf brief asked for branch `perf/audit-fixes`, but to let the user test
   immediately these fixes were committed on `claude/affectionate-keller-8ba6T`. If you want them
   isolated, `git cherry-pick 7af89d5 dd0b236 42c86cc` onto `perf/audit-fixes`.
4. NOT applied on purpose (look-preserving): dropping `mix-blend-mode` on the cursor ring (would
   hide it over the light Services section) — left as an optional tradeoff.

---

## File ownership (so the two streams don't collide)
- **Workstream A touches:** `src/app/services/**`, `src/components/sections/services/**`,
  `SERVICE_PAGES_SPEC.md`, this section.
- **Workstream B touches:** `src/components/ui/BottomBlur.tsx`, `src/app/globals.css`
  (BottomBlur block + cursor block), `src/components/sections/Navbar.tsx` (glass layer),
  `src/components/ui/CustomCursor.tsx`, `PERF_AUDIT_PHASE1.md`.
- Overlap risk is low. If both edit `globals.css`, B owns the BottomBlur/cursor blocks; A should
  add page-specific CSS elsewhere or in component files.
