# LIONOVART — Full Site Evaluation, Copy System & Redesign Brief

> Status: DIAGNOSIS + RECOMMENDATIONS (no code yet). Handoff doc for phased implementation.
> Companion docs: `SERVICE_PAGES_SPEC.md` (7-act spine, anti-slop checklist), `DESIGN_SYSTEM.md` (tokens).
> Everything below respects the existing spine: curtain hook → stakes relay → proof → mechanism → offer → social proof → peak-end close.

---

## PART 1 — DIAGNOSIS (what's working, what's leaking)

### 1.1 What's already strong (don't touch the bones)

- **The cinematic spine.** Curtain reveal → sticky hero → chapter title cards (`PROOF.` / `CONFIDENCE.` / `ASK.`) is a genuinely premium scroll rhythm. Few agency sites pace a page this deliberately. Keep it; extend it to new pages.
- **The shared service shell.** `ServiceCurtainHero` + `StatementRelay` + `ProcessBand` + `OfferCards` + `ProofAndClose` is the right architecture. New pages (AI, Print) should inherit it, not reinvent it.
- **Color discipline.** Black void + rationed red is correct and documented. The anti-slop checklist in `SERVICE_PAGES_SPEC.md` §7 is the best thing in the repo — enforce it on every new page.
- **Nova as conversion endpoint.** One CTA target (voice agent → booked call) instead of a dead contact form is a real differentiator. The AI page should weaponize this: *the CTA is a live demo of the product.*

### 1.2 Brand coherence leaks (the expensive problems)

**L1 — Number soup (credibility killer).**
The site states conflicting proof numbers in different sections:
- `WhatWeDo`: "+20 Brands in the Lion's Pride" · "3 Continents" · "9 Languages"
- Hero badges: "+50 Brands Elevated" · "+7 Countries"
- About: "4 continents"
- Hero trust text: "50+ startups and global brands across 20+ industries"
- Problems stats: "100% Of Partners Multiplied Their ROI" (unverifiable; reads as inflation and undermines the true numbers around it)

A premium buyer notices. Pick **three canonical numbers** and use them verbatim everywhere:
`50+ brands · 7 countries · 9 languages`. Retire every variant. Delete or reword "100% multiplied ROI" to something ownable ("Every partner renewed" only if true, else cut).

**L2 — Two testimonial sections, two different casts.**
Homepage renders `TestimonialsCarousel` ("Real Results, Real Words", 3 hardcoded personas) AND `Testimonials` ("The Verdict", 22 reviews from `en.ts`). The carousel's hardcoded cast (Camille/Isabelle/James) overlaps in story but not in name with the locale cast (Pablo/Mathilde/Jess...). Same anecdotes, different people = looks fabricated to anyone reading both.
**Fix:** one source of truth (`en.ts reviews`), one section concept. Recommend: keep the marquee `Testimonials` as the volume proof ("The Verdict"), convert `TestimonialsCarousel` into a *featured single-story* spotlight that pulls 3 entries from the same `en.ts` array. One dataset, two presentations.

**L3 — Mantra dilution.**
"Impossible to ignore" appears as: "impossible to ignore", "impossible to overlook", "won't be ignored", "impossible to ignore every month". A mantra only works verbatim. Canonicalize the exact phrase **"impossible to ignore."** — it is the brand's one sentence. All variants get rewritten to either use it exactly or say something genuinely different.

**L4 — CTA label chaos.**
Live labels: "Start", "Get Started", "Talk to our agent", "Book Your Sprint", "Start a build", "Keep it growing", "Start small", "Build my brand". "Sprint" appears once in the footer and is never explained.
**Fix — one CTA ladder, used site-wide (see §2.3):** cold / warm / hot verbs, consistent everywhere.

**L5 — Live placeholders on shipped pages.**
`/services/web` and `/services/brand` are `ready: true` and publicly linked, but show `$[price]` and `"[ A client says, in one line, … ]"`. This is the single worst conversion leak on the site — a founder who scrolls a beautiful page and hits bracket-placeholder pricing concludes "not finished, not safe."
**Fix immediately (Phase 0):** real "From $X" anchors, and real quotes from the `en.ts` reviews pool (they exist now — Ben/SaaS for web, Jess/Glow for brand).

**L6 — Service naming drift.**
"Smart Systems & AI" (routes/nav) vs "AI & Automation" (WhatWeDo) vs "Mod Systems AI" (founder's working name). Pick the public name once. Recommendation in §4.1.

### 1.3 Page-by-page design critique

| Page | Verdict | Notes |
|---|---|---|
| `/` Home | **A−** | Spine is excellent. Leaks: L1, L2 above; hero relies on a single CTA (good) but the free-audit magnet (per funnel strategy) isn't surfaced anywhere above the fold. |
| `/services` index | **B+** | Clean editorial list, correct restraint. "Soon" pills on Print/AI/Growth are honest but cold — replace with "Q3" or a one-line teaser to keep desire alive. |
| `/services/web` | **B** | Shell is right, DeviceBuildScene is the correct signature. Penalized for L5 (placeholders) and relay beats that are good but generic ("Generic looks like everyone else" — true, but it's the line every agency uses). Sharper beats proposed in §3.2. |
| `/services/brand` | **B** | Same shell strength, same L5 penalty. "You are how they remember you" is the best hero line on the site — keep. |
| `/services/content-studio` | **B+** | Custom components (CurtainHero, SocialScene) give it the most personality of the tier-2 pages. Needs: real reels in tiles when available, mantra canonicalization (this page *owns* "impossible to ignore"), and the same offer/price reality pass. |
| `/services/print` | **missing** | `ready: false`. Full concept in §5. |
| `/services/ai` | **missing** | `ready: false`. This is the flagship opportunity. Full concept in §4. |

---

## PART 2 — THE COPY SYSTEM (one voice, every page)

### 2.1 Voice pillars (write every line against these)

1. **Sovereign, not loud.** Short declaratives. The brand never begs ("Don't miss out!") — it states ("Your competitors already did this.").
2. **Founder-to-founder.** We name the 10pm-still-editing-a-reel pain precisely. No corporate "solutions for your business needs."
3. **Numbers only when true.** Three canonical numbers, used verbatim. A fake stat poisons every real one.
4. **The product demonstrates itself.** Copy never claims what the page can show. (The AI page doesn't say "our agents sound human" — it lets you talk to one.)

### 2.2 Messaging hierarchy (the one-page brand script)

- **Promise (the mantra):** *We make brands impossible to ignore.*
- **Mechanism:** *One team. Every medium.* — brand, web, content, print, AI, growth.
- **Proof:** *50+ brands · 7 countries · 9 languages.*
- **Personality line (the wink, used sparingly):** *Let's make your brand roar.*

### 2.3 The CTA ladder (replaces all current labels)

| Temperature | Label | Where | Action |
|---|---|---|---|
| Cold (magnet) | **"Get your free brand audit"** | Hero secondary, footer, services index | Nova opens in audit mode (funnel magnet per strategy memo) |
| Warm | **"Talk to NOVA"** | Primary on every service page, navbar | Nova voice session |
| Hot | **"Book the call"** | Offer cards, ProofAndClose, post-Nova | Calendar / WhatsApp |

Rules: never two same-temperature CTAs in one viewport; red only on the highest-temperature CTA present; the footer "Book Your Sprint" becomes "Book the call" (or introduce the Sprint concept properly on offer cards first — don't use a term once).

### 2.4 Site-wide copy refresh (homepage)

- **Hero subtitle** (current is a serviceable list): propose *"Brand, web, content, and AI systems — one team that makes your business impossible to ignore."* (mantra verbatim, mechanism embedded).
- **WhatWeDo trust line:** replace "+20 Brands in the Lion's Pride" with canonical "50+ brands" (keep "Lion's Pride" phrasing if loved: "50+ brands in the Lion's Pride").
- **Problems/IMAGINE stats:** swap "100%/ROI" for a true, concrete one (e.g. "+70% direct bookings — real client result" already exists and is the strongest stat on the site; let it lead).
- **FAQ:** answers are good (warm, concrete). Add two new entries when AI page ships: "Will the voice agent sound robotic?" and "What happens to the calls it can't handle?" — these are the two real objections.

---

## PART 3 — TIER-2 PAGE COPY PUNCH-UP (web, brand, content)

### 3.1 Principle
Each relay beat must be something a competitor *couldn't* say. Generic truth = wallpaper.

### 3.2 Proposed relay beats

**/services/web** (current: "A slow site costs you clients every day…")
1. *"Your website is your best salesperson. Or your worst."*
2. *"Visitors decide in 3 seconds. Most sites spend them loading."*
3. *"Pretty doesn't pay. Converting does."*

**/services/brand** (keep hero; sharpen beats)
1. *"A logo is not a brand."* (keep — it's good)
2. *"A brand is the feeling before the first word."* (keep)
3. *"People pay premium prices to brands that look like they don't need the money."* (new closer — names the actual mechanism of premium pricing)

**/services/content-studio**
1. *"Nobody follows a brand out of politeness."*
2. *"Your customers watch 3 hours of video a day. None of it is yours."*
3. *"Impossible to ignore."* (the mantra, alone, as the final beat — this page owns it)

### 3.3 Offer reality pass (all three pages)
- Replace `$[price]` with real "From $X" anchors (founder supplies numbers — see Open Inputs).
- Replace bracket quotes with real reviews from `en.ts`: web → Ben (SaaS, "closed our seed round"), brand → Jess (Glow Beauty), content → Mathilde (café) or Enzo (tours).

---

## PART 4 — NEW FLAGSHIP: `/services/ai` (the innovation push)

### 4.1 Naming decision (resolve L6)
Recommendation: public name **"AI & Smart Systems"** with the hero brand moment **"MOD SYSTEMS"** as the *product line name* — i.e., the page is the service, MOD SYSTEMS is what clients buy ("a MOD System: your voice agent + CRM + automations, modular by design"). This gives the founder's name a job instead of competing with the nav label. If simpler is preferred: keep "Smart Systems & AI" everywhere and drop MOD entirely. **Pick one before build.**

### 4.2 Positioning (the page's argument)
> We don't sell chatbots. We make today's technology work for local businesses — voice agents that answer every call, CRMs built around how *you* work, and automations that run your follow-up while you run your business. Secure, custom, on autopilot — with a team behind it that keeps it improving.

Key frame: **partner, not vendor.** The client gets a *system + a team*, not a tool.

### 4.3 Page architecture (7-act spine, AI medium)

**ACT 1 — HOOK: the big video curtain.**
Founder's video in `ServiceCurtainHero` (it accepts `videoSrc` — zero new code for the frame).
Hero lines: `{ "Your business answers." } { "Even when you don't.", accent }`
Eyebrow: "AI & Smart Systems". Sub: "Voice agents · CRM · Automation".

**ACT 2 — STAKES relay:**
1. *"Every missed call is a client calling the next number."*
2. *"After hours. Weekends. Lunch rush. That's when they call."*
3. *"Your competitor just hired a receptionist that never sleeps."*

**ACT 3 — PROOF (the differentiator): a live call, scroll-scrubbed.**
The signature scene: a **simulated phone conversation that types itself out as you scroll** — waveform animating, caller asks about availability, the agent answers, qualifies, books a slot into a visible calendar, fires a confirmation SMS, and a CRM card slides in with the captured lead. The scroll *is* the call. End-card: **"That was 47 seconds. You weren't there."**
Then the kicker only this site can do: **"Don't take our word for it — talk to one."** → button opens Nova live. The demo is the product. No competitor page can fake this.

**ACT 3b — THE ECOSYSTEM: animated flow diagram.**
Node-by-node build (per existing spec §5): Call/WhatsApp/Web → Voice Agent → Qualify → CRM → Calendar → Follow-up → Review request. Label: *"One system. Every lead, captured, qualified, booked, followed up. On autopilot."* Mention security + performance plainly (one line, no jargon wall).

**ACT 4 — INDUSTRY RAIL (horizontal scroll-snap cards, one mini-transcript each):**
| Industry | Scenario one-liner |
|---|---|
| Clinics & med-spas | Books appointments, answers insurance FAQs, sends reminders that cut no-shows. |
| Real estate | Qualifies buyers at 11pm, books viewings straight into the agent's calendar. |
| Restaurants | Takes reservations and answers "are you open?" during the rush, in 3 languages. |
| Car dealerships | Books test drives, answers inventory questions, follows up every lead. |
| Contractors | Captures job details from the first call, schedules estimates, no more voicemail tag. |
| Hotels & tours | Answers booking questions instantly, recovers direct bookings from OTA leakage. |
Each card cites the matching real testimonial when one exists (Defne/realty, Manu/Costa Realty, Jim/Sakura Trails — they're already in `en.ts`).

**ACT 5 — OFFER (two ways in):**
- *Project:* **"The System Build"** — voice agent + custom CRM + core automations, configured to the business. From $X.
- *Monthly (featured, "Most chosen"):* **"Autopilot"** — we run it, monitor it, improve it; new automations monthly; human team on call. From $X/mo.

**ACT 6 — PROOF:** Manu (Costa Realty) quote — it's the strongest voice-agent testimonial in the pool.

**ACT 7 — CLOSE (peak-end):** The Nova orb itself as the final beat — it pulses, waveform reacts, line: *"The receptionist you're about to hire is already on this page."* CTA: **Talk to NOVA**.

### 4.4 Build notes
- Reuse: `ServiceCurtainHero` (custom videoSrc), `StatementRelay`, `ProcessBand`, `OfferCards`, `ProofAndClose`, Nova store.
- New: call-transcript scroll scene (ACT 3), flow-diagram scene (ACT 3b), industry rail (ACT 4). Three components, all spec'd above.
- Mobile: transcript scene types on scroll natively (text = cheap, no video scrub problem); industry rail = swipe with snap; flow diagram stacks vertical.
- Anti-slop: industry rail must NOT be icon+heading+text clones — each card is a transcript snippet (bespoke structure, passes checklist §7.1).

---

## PART 5 — NEW PAGE: `/services/print` (the catalog)

### 5.1 The design move: paper on a digital site
Every other page is black void. Print is tactile — so this page earns the system's **one light section**: warm cream (`bg-off-white #f5f0eb`, already a token) with subtle paper grain, black ink type, red as the only pigment. The page *feels like holding the catalog*. This contrast is intentional brand logic (digital = void, physical = paper), not decoration — and it makes the page instantly distinct without breaking the family.

### 5.2 Page architecture

**ACT 1 — HOOK:** Curtain hero, macro footage (ink hitting paper, foil stamp, card stack riffling). Lines: `{ "Pixels fade." } { "Paper stays.", accent }`. Sub: "Print · Packaging · Signage · Events".

**ACT 2 — STAKES relay** (on black, before the paper reveal):
1. *"Everything on a screen disappears when it's closed."*
2. *"What you hand someone, they keep."*
3. *"The brands people remember exist in the real world."*
Then the transition beat: the black void *tears away* (curtain) to the cream catalog. The medium switch IS the act break.

**ACT 3 — THE CATALOG (signature).**
An editorial catalog with a **sticky table-of-contents rail** (desktop left, numbered like SKUs) and full editorial spreads on the right. Scroll the spreads; TOC tracks and is clickable. Mobile: TOC collapses into a sticky top chip-row.

| № | Item | Spread copy (one line each) |
|---|---|---|
| 01 | Business Cards & Stationery | The 6-second handshake that keeps working after you leave. |
| 02 | Menus | The only marketing your customer reads while holding it for 10 minutes. |
| 03 | Flyers & Print Campaigns | Neighborhood reach with your brand's exact voice. |
| 04 | Signage & Display | Be found, then be remembered — storefront to trade floor. |
| 05 | Stands & Exhibitions | A booth people cross the hall for. |
| 06 | Packaging | The unboxing is the second purchase decision. |
| 07 | Merchandising & Apparel | Customers who wear your brand are billboards you don't rent. |
| 08 | Custom Printing | If it has a surface, we can brand it. |
| 09 | QR Balloons & Activations | Playful on the outside, trackable on the inside — every scan is a lead. |
| 10 | Immersive Event Experiences | Store openings, festivals, venues — environments people photograph and post for you. |

Each spread: large image slot (placeholder → real photography as produced), SKU number in red mono, item name in Clash, one line of copy, quiet "Add to brief →" link.

**ACT 4 — MECHANISM:** ProcessBand. Design → Proof → Production → Delivery. One line on quality control ("We press-check. You don't have to.").

**ACT 5 — OFFER:** print is quote-based, not packaged. Single offer card: **"The Print Brief"** — *"Tell NOVA what you need; get a quote within 24h."* Items list = the catalog TOC. No fake "From $" on commodity print.

**ACT 6/7 — PROOF + CLOSE:** physical-brand testimonial slot (Maya/Maison Fleur "walk-ins mention the logo" fits). Close line: *"Put your brand"* / *"in their hands.", accent* → Talk to NOVA.

### 5.3 The "Add to brief" mechanic (light, optional, high-convert)
Each catalog spread's "Add to brief →" appends the item to a small floating brief chip (count badge). Tapping the chip opens Nova pre-seeded: "I need: menus, signage, QR balloons." Turns browsing into an order. Build as enhancement after the static catalog ships.

---

## PART 6 — CONTENT STUDIO BRAND CHECK (focused fixes)

1. **Mantra ownership:** final relay beat becomes the verbatim mantra (see §3.2). Remove "stays impossible to ignore every month" phrasing from homepage services blurb (variant violation, L3).
2. **Real media:** tiles/feed scenes still run placeholders. Slot real reels as produced; frames already built to receive them (per spec §0.2).
3. **Offer naming:** align with AI page's pattern — Project: "The Launch Pack", Monthly featured: "The Content Engine" (name already exists in spec §4 — use it, it's good).
4. **Cross-sell beat:** after SocialScene, one quiet band: *"Filmed for social. Built for everywhere."* linking print (event coverage) + web (site video) — the One-Studio mechanism made visible on the page where it's most credible.

---

## PART 7 — PHASED IMPLEMENTATION PLAN

> Each phase independently shippable. Verify per `SERVICE_PAGES_SPEC.md` §8.2 (360→2560 widths, reduced-motion, AA contrast, thumb-zone CTA).

### Phase 0 — Stop the leaks (no new pages, highest ROI)
1. Canonical numbers everywhere (L1): fix `en.ts` + `WhatWeDo` + hero badges. Kill "100% ROI" stat.
2. Real prices + real quotes on `/services/web`, `/services/brand` (L5).
3. CTA ladder labels site-wide (L4): footer, hero, offer cards, navbar.
4. Testimonial dedup (L2): `TestimonialsCarousel` reads 3 featured entries from `en.ts`; delete its hardcoded cast.
5. Mantra canonicalization pass (L3) across `en.ts` (+ es/fr mirrors).
- **Verify:** grep for `$[price]`, `[ A client`, old labels — zero hits; es/fr parity.

### Phase 1 — `/services/ai` flagship (Part 4)
1. Decide name (§4.1) → update `service-routes.ts` (`ready: true`), nav, locales.
2. Page from shared shell + founder's video in curtain.
3. New scenes: call-transcript scroll (ACT 3) → flow diagram (ACT 3b) → industry rail (ACT 4).
4. Nova live-demo CTA wiring; ProofAndClose with Manu quote.
5. Two FAQ entries (§2.4); add AI items to homepage services links.
- **Verify:** transcript scene smooth on throttled mobile; reduced-motion shows full static transcript; Nova opens from every CTA.

### Phase 2 — `/services/print` catalog (Part 5)
1. Cream/paper theme variant for the shell (one light-mode section pass, AA-checked: black ink on `#f5f0eb`).
2. Catalog scene: sticky TOC + 10 spreads (static images first).
3. ProcessBand, quote-based offer, proof, close.
4. `ready: true` in routes.
5. (Enhancement) "Add to brief" → Nova pre-seed.
- **Verify:** TOC tracking correct at all heights; mobile chip-row sticky; image slots lazy-load.

### Phase 3 — Content Studio + homepage copy pass (Parts 3, 6)
1. Tier-2 relay beats punch-up (web, brand, content).
2. Content Studio: mantra beat, offer names, cross-sell band, real media slots.
3. Homepage: hero subtitle, WhatWeDo trust line, IMAGINE stats, FAQ additions.
4. Mirror everything to `es.ts` / `fr.ts`.
- **Verify:** locale switcher shows no English bleed-through; no orphaned keys.

### Phase 4 — System polish (peak-end + cohesion)
1. `/services` index: replace "Soon" pills (everything is live now) with signature one-liners from `service-routes.ts`.
2. Peak-end audit: every page's biggest motion beat is at the CTA, not the hero (spec §0.3) — fix any page that front-loads.
3. `/work` portfolio index when first real case studies exist; drop into existing proof frames.
4. Full anti-slop checklist (§7) + Lighthouse pass on all 6 service pages.

---

## OPEN INPUTS NEEDED FROM FOUNDER
1. **Price anchors** for web/brand/content/AI offers ("From $X" — Phase 0 blocker).
2. **The AI page video** (file or Cloudinary URL) + confirm name: MOD SYSTEMS vs Smart Systems & AI.
3. **Print photography** (or approve premium stock/AI-generated placeholders per spec §0.2).
4. Truthful **scarcity terms** for closes ("3 founder slots/month") — only if real.
5. Confirm the **free-audit magnet** wording so the cold CTA matches what Nova actually delivers.
