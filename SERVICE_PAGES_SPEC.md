> ⚠️ **SUPERSEDED by `MASTERPLAN.md`.** Reference for already-built pages only. The `/services/video` route it specs no longer exists.
> Read this file for history only, never for direction.

# LIONOVART — Service Pages: Architecture, Wireframes & Conversion Strategy

> Status: DESIGN SPEC (no code yet). This is the approval document.
> Register: **brand** (the design IS the product). System: "The Creative King" (see `DESIGN.md`).
> Goal of every page: a founder lands, scrolls, and feels *"I need to work with them"* before they finish reading a single paragraph.

---

## 0. Strategic foundation (read this first)

### 0.1 The one job
Every service page has exactly **one** conversion goal: **book a call / send the brief** (the founder-direct close). Everything else is in service of that single action. No competing CTAs, no "learn more" dead-ends. One decision, made inevitable.

### 0.2 The honest content position
There is no client portfolio yet. So these are **capability-demonstration pages**, not case-study pages. The *experience itself* is the proof: a video page that scroll-scrubs a film proves we can do video; a social page where content orbits and disperses proves we understand motion and feed psychology. As real `$400–600` starters close, real case studies drop into the **same frames** with zero redesign. The frames are built to receive proof later.

### 0.3 The persuasion spine (every page follows it)
A single narrative arc, borrowed from PAS (Problem / Agitate / Solve) wrapped in AIDA, with Cialdini triggers placed deliberately. The scroll *is* the story. Each section opens a loop; the next one pays it off (Zeigarnik effect keeps them scrolling).

| Act | Scroll zone | Job | Psychology | Emotion |
|---|---|---|---|---|
| 1. HOOK | Curtain / first viewport | Stop the scroll, signal "premium, this is for me" | Attention + pattern interrupt | Intrigue |
| 2. STAKES | Sticky text relay | Name the founder's real pain, raise the cost of inaction | PAS, loss aversion | Recognition / discomfort |
| 3. PROOF | Sections rise | Demonstrate capability, the work *is* the argument | Authority, show-don't-tell | Desire |
| 4. MECHANISM | Process band | Show *how*, remove risk, make it feel inevitable | Commitment/consistency, reduce uncertainty | Trust |
| 5. STACK | Offer / ecosystem | Frame value so the price feels like a steal | Hormozi value-stack, anchoring | "That's a no-brainer" |
| 6. SOCIAL PROOF | Testimonial slot | Borrow trust (placeholder now, real later) | Social proof, consensus | Safety |
| 7. CLOSE | Final CTA | Make the single decision, with a reason to act now | Scarcity (founder rate), peak-end rule | Decision |

**Peak-end rule:** the page's most cinematic motion beat goes near the *end* (the CTA reveal), not only the top, so the lasting memory is "that was extraordinary." Most agency sites blow their whole budget on the hero and end on a flat footer. We don't.

### 0.4 Why this beats "8 equal pages"
A solo founder needs first cash, not 8 maintained shells. We build **2 flagships to perfection**, extract a shared `ServicePageShell`, then the remaining 5 inherit the spine and are fast + consistent. Tiering is a conversion decision too: concentrated craft on the two most visual services converts better than thin polish spread across eight.

---

## 1. Sitemap & navigation

### 1.1 Routes (Next.js App Router)
```
/                         Home (exists)
/work                     Portfolio index (NEW, fills as proof arrives)
/services                 Services overview / router (NEW)
  /services/video         FLAGSHIP A  — Video Production
  /services/social        FLAGSHIP B  — Social Media & Content
  /services/brand         Brand Identity & Strategy
  /services/web           Web & App Design & Development
  /services/ai            Smart Systems & AI
  /services/growth        Growth Marketing
  /services/print         Print & Physical            (deferred / "Calgary")
  /services/led           LED Glass                   (deferred / "Coming soon")
/contact                  Contact / brief intake (NEW, the conversion endpoint)
```

### 1.2 Build tiers
- **Tier 1 (now, full cinematic):** `/services/video`, `/services/social`
- **Tier 2 (after shell extraction):** `/services/brand`, `/web`, `/ai`, `/growth`
- **Tier 3 (deferred):** `/services/print`, `/services/led`
- **Supporting:** `/work`, `/contact`, `/services` index

### 1.3 Navigation rules (Hick's law: fewer choices = faster decisions)
- Reuse the existing `Navbar` (hero-red → scrolled-glass) on every page for instant brand continuity.
- Services live behind **one** nav item that opens a service menu. We do not dump 8 links in the bar.
- A **persistent, low-key CTA** (the existing `StickyCTA` / Nova orb) follows the scroll so the single action is always one tap away (Fitts's law: the close target is always reachable).
- Reuse `Footer` + `StickyFooterMarquee` everywhere: the page-exit experience is consistent and ends on brand.

### 1.4 Inter-page model
The home page funnels into service pages; each service page funnels into `/contact`. `/work` is the cross-link hub that grows. No page is a dead-end; every scroll terminates at the one decision.

---

## 2. The shared `ServicePageShell` (the reusable spine)

All service pages are the **same 7 acts** in the same order. What changes per page is the *medium of the hook and proof* (video scrub vs floating tiles vs type system vs UI flythrough). Building the shell once guarantees coherence and makes pages 3–7 cheap.

```
[ Navbar (shared) ]
ACT 1  Curtain hook            ← per-page medium
ACT 2  Sticky statement relay  ← per-page copy, same mechanic
ACT 3  Capability proof        ← per-page medium (THE differentiator)
ACT 4  Process / mechanism     ← shared component, per-page steps
ACT 5  Value stack / offer     ← shared component, per-page packages
ACT 6  Proof slot              ← shared, placeholder → real testimonial
ACT 7  CTA close               ← shared, peak motion beat
[ Footer + StickyFooterMarquee (shared) ]
```

Reused engine (already in repo, no rebuild): `VideoCurtainReveal`, `HeroRevealWrapper`, `SceneVideoBackdrop`, `ImageMarquee`, `SectionReveal`, `SplitTextReveal`, `LiquidMetalButton`, Lenis smooth scroll, `Process`, `Footer`.

---

## 3. FLAGSHIP A — Video Production (`/services/video`)

**Page thesis:** prove we make film by *making the page behave like film.* The scroll is the edit.

### 3.1 Frame-by-frame (DESKTOP ≥1024px)

```
┌──────────────────────────────────────────────┐  ACT 1 — HOOK (reuse VideoCurtainReveal)
│ [Navbar red]                                   │  Full-bleed showreel video card, rounded.
│                                                │  Center line, Clash Display, one word red.
│        [ SHOWREEL VIDEO, muted loop ]          │  Sub-eyebrow: tracked label, white/80.
│        WE MAKE PEOPLE  ⟶ STOP                   │  Scroll cue bottom.
│        ▏scroll                                 │  WHY: identical entry to home = brand
└──────────────────────────────────────────────┘  continuity + "this is the same caliber."
        ↓ curtain lifts on scroll (-100vh)

┌──────────────────────────────────────────────┐  ACT 2 — STAKES (sticky text relay)
│                                                │  One line at a time, centered, pinned.
│            82% of traffic is video.            │  Beat 1 holds → fades → Beat 2 rises:
│                                                │  "Your competitor's reel is already winning."
│                  (sticky)                      │  → Beat 3: "You have 3 seconds. Then they scroll."
│                                                │  WHY: PAS. Loss aversion. Zeigarnik open loop.
└──────────────────────────────────────────────┘  Black void, no distraction. The canyon hierarchy.
        ↓ on last beat, sections RISE from below

┌──────────────────────────────────────────────┐  ACT 3 — PROOF (the differentiator)
│  ◀ scroll-scrubbed film, currentTime ← scroll  │  A film plays *by scrolling*. As it scrubs,
│                                                │  capability tags reveal in synced zones:
│   [ frame ]   BRAND FILMS                      │  "Brand films" · "Social reels" · "Motion"
│   [ frame ]      SOCIAL REELS                  │  · "Sound design" · "AI-assisted". Each lands
│   [ frame ]          MOTION DESIGN             │  on a matching frame = immersive coherence.
└──────────────────────────────────────────────┘  WHY: show-don't-tell authority. The medium = proof.
                                                     ⚠ MOBILE uses frame-sequence, not <video> scrub.

┌──────────────────────────────────────────────┐  ACT 4 — MECHANISM (reuse Process)
│  01 ──── 02 ──── 03 ──── 04                    │  Horizontal process band, scroll-driven fill.
│  Brief    Concept  Shoot   Deliver             │  Goal-gradient: a visible progress line.
│                                                │  WHY: removes risk, makes outcome feel inevitable,
└──────────────────────────────────────────────┘  commitment/consistency before the offer.

┌──────────────────────────────────────────────┐  ACT 5 — VALUE STACK (offer)
│  THE REEL SPRINT                               │  NOT a 3-card pricing grid (banned: SaaS slop).
│  • 1 hero film  • 4 cut-downs  • sound         │  One anchored package, value listed as a stack,
│  • motion titles  • 9:16 + 16:9                │  price revealed last (anchoring). Founder rate
│  ████ value ~$X   your rate $Y                 │  tag. WHY: Hormozi value/price gap = "steal."
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐  ACT 6 — PROOF SLOT (placeholder → real)
│  "[ testimonial lands here ]"   ★★★★★          │  Single strong quote, laurel-framed (existing
│   — Client, Business                           │  TrustedBadges vocabulary). One, not a wall.
└──────────────────────────────────────────────┘  WHY: social proof; quality > quantity when new.

┌──────────────────────────────────────────────┐  ACT 7 — CLOSE (peak-end beat)
│         LET'S MAKE YOURS ROAR.                 │  Biggest motion moment of the page here.
│         [ ● Start your film ]  red liquid btn  │  Single red CTA. Scarcity line: limited
│         3 founder slots this month.            │  founder slots. WHY: peak-end rule + scarcity.
└──────────────────────────────────────────────┘
[ Footer + sticky marquee ]
```

### 3.2 MOBILE (<768px) — honest adaptation, not a squeeze
- **ACT 1:** same curtain, video object-cover, headline `clamp` already handles it.
- **ACT 2:** sticky relay unchanged (it's centered type, scales perfectly).
- **ACT 3:** **frame-sequence, not video scrub.** Scrubbing `<video>.currentTime` stutters on iOS Safari. On mobile we preload ~24–48 webp frames and swap by scroll progress = buttery, no stall. This is the line between "50k" and "janky." Capability tags stack vertically, one per frame zone.
- **ACT 4:** process band rotates to **vertical** timeline with the same progress fill.
- **ACT 5:** value stack is full-width, price still last.
- **ACT 7:** CTA is a full-width thumb-zone button (Fitts's law on touch).
- `prefers-reduced-motion`: curtain becomes a static poster; scrub becomes a single hero frame + the tags fade in normally. Hierarchy preserved (required by `PRODUCT.md` a11y).

### 3.3 Color reasoning for this page
- Black void = the cinema. It makes footage and red land like a decree (Von Restorff isolation effect: the one red element is where the eye + the click goes).
- Red appears only on: one word in Act 1, the live capability tag in Act 3, the price/rate in Act 5, the CTA in Act 7. Four reds, four moments the eye should move toward the sale.
- Gold: held in reserve. Optional single use on the testimonial star if/when a marquee client lands. Not before.

---

## 4. FLAGSHIP B — Social Media & Content (`/services/social`)

**Page thesis:** prove we understand attention by *making attention behave on the page.* Content orbits, then disperses, the way feeds pull and scatter focus.

### 4.1 Frame-by-frame (DESKTOP ≥1024px)

```
┌──────────────────────────────────────────────┐  ACT 1 — HOOK (floating-tile orbit)
│  [Navbar]      [tile]        [tile]            │  Huge centered headline. Around it, 6–9
│        [tile]                      [tile]      │  content tiles (reels/posts/frames) float
│              WE MAKE BRANDS                    │  with gentle parallax + magnetic drift.
│              IMPOSSIBLE TO IGNORE             │  WHY: pattern interrupt; the page itself is
│        [tile]                      [tile]      │  "scroll-stopping content," the product demoed.
│                  [tile]      ▏scroll           │
└──────────────────────────────────────────────┘
        ↓ on scroll, tiles DISPERSE outward + fade

┌──────────────────────────────────────────────┐  ACT 2 — STAKES (relay, after dispersal)
│            0 posts. 0 followers.               │  Beat 1 → "Your competitor posts daily."
│                  (sticky)                      │  → "Invisible isn't a strategy."
│                                                │  WHY: PAS, names the dead-Instagram pain
└──────────────────────────────────────────────┘  directly (straight from the client brief).

┌──────────────────────────────────────────────┐  ACT 3 — PROOF (content system demo)
│  ┌feed┐ ┌feed┐ ┌feed┐   ⟶ a living grid that   │  A simulated feed/calendar that assembles
│  │ ▓▓ │ │ ▓▓ │ │ ▓▓ │     fills as you scroll  │  itself on scroll: hooks, carousels, reels,
│  └────┘ └────┘ └────┘                          │  a monthly calendar building cell by cell.
│  BEFORE ▸ AFTER toggle on a sample profile     │  Before/after profile transformation.
└──────────────────────────────────────────────┘  WHY: show the *system*, not just pretty posts.

┌──────────────────────────────────────────────┐  ACT 4 — MECHANISM (cadence engine)
│  Strategy → Calendar → Create → Post → Report  │  The monthly engine as a loop graphic.
└──────────────────────────────────────────────┘  WHY: recurring revenue framing = retainer.

┌──────────────────────────────────────────────┐  ACT 5 — VALUE STACK (offer)
│  CONTENT ENGINE / month                        │  Stacked deliverables, anchored value, rate
│  • N posts • N reels • calendar • copy • report │  last. WHY: positions the retainer (highest LTV
└──────────────────────────────────────────────┘  per brief) as obvious value.

ACT 6 proof slot + ACT 7 CTA close: identical pattern to Video page.
```

### 4.2 MOBILE (<768px)
- **ACT 1:** free orbit is dishonest on a 390px screen. Instead, tiles become a **2-column staggered drift** behind the headline, resolving into a feed rhythm. Same idea, true to device.
- **ACT 3:** feed grid is a single column that builds as you scroll (native to how phones consume feeds, so it feels *more* right on mobile than desktop).
- Before/after = a draggable slider (thumb-native).
- Reduced-motion: tiles render in a static composed grid; no drift.

### 4.3 Color reasoning
- The tiles carry the only "busy" color on the page; everything structural stays black + white type. Red marks the before/after "after" state, the rate, and the CTA. The dispersal literally *clears the noise to reveal the message*, a visual argument for "we cut through the feed."

---

## 5. Tier 2 pages (inherit the shell, one signature idea each)

Each reuses the 7-act shell; only the Act 1 hook + Act 3 proof medium change. One sentence of distinct idea each, so they never feel like clones:

| Page | Signature hook (Act 1) | Signature proof (Act 3) |
|---|---|---|
| **Brand Identity** `/brand` | A logo/monogram *constructs itself* from strokes on scroll | A live mini brand-guideline (type, color, mark) assembling |
| **Web & App** `/web` | A device frame where a site *builds section by section* as you scroll | Scroll-synced UI flythrough of a mock product |
| **Smart Systems & AI** `/ai` | The Nova orb (existing) speaks the hook; voice waveform reacts | A live automation/flow diagram animating node by node |
| **Growth Marketing** `/growth` | A search result / map pin *rises to #1* on scroll | An animated metrics ascent (done as laurel/ceremonial, NOT a hero-metric grid) |

These are intentionally lighter to build. The *spine* carries the conversion; the signature beat carries the brand.

---

## 6. Color & motion as persuasion (system-wide reasoning)

This section documents *why*, so nothing is arbitrary (the anti-slop guarantee).

### 6.1 Color = a directional language, not decoration
- **Black (void):** authority, luxury, focus. It is the stage that makes one red element unmissable. Premium brands earn the right to negative space; using it signals confidence (and confidence sells).
- **Red (lacquer):** the color of *the next action*. It appears only on the thing the founder should look at or click next. Because it is rationed, every instance pulls the eye toward the sale (Von Restorff). If red is everywhere, it directs nowhere.
- **Gold (sovereign):** reserved for genuine triumph (a real marquee client, an award). Its rarity is what makes it read as prestige later. Spending it now on decoration would bankrupt its meaning.

### 6.2 Motion = pacing the story, not showing off
- Curtain + sticky relay = controlling tempo: we slow the founder down at the exact moment we state the stakes, so the pain lands.
- Scroll-synced proof = the dopamine of *causing* the reveal; participation increases retention and perceived value (IKEA effect, lightly).
- Peak motion at the CTA = the lasting memory is excellence at the moment of decision (peak-end rule).
- Every curve is exponential ease-out (per `DESIGN.md`): decisive, never bouncy. Bounce reads as playful/cheap; this brand is sovereign.
- All scroll choreography ships with a `prefers-reduced-motion` fallback that keeps the hierarchy and the message (a11y is non-negotiable in `PRODUCT.md`).

### 6.3 Typography = one voice = total confidence
Clash Display only, the canyon between 11px labels and 11rem display. A single typeface across an entire scale is itself a persuasion move: it says "we don't need variety to hold your attention." Consistency reads as mastery.

---

## 7. Anti-AI-slop checklist (enforced on every page)

Each page is reviewed against this before it ships (via `impeccable critique` + `audit`):

- [ ] No identical card grids (icon + heading + text × N). Act 3 and Act 5 use bespoke structures.
- [ ] No hero-metric template. Stats only appear laurel-framed / ceremonial.
- [ ] No gradient text, no `background-clip: text`.
- [ ] No decorative glassmorphism. Blur only for nav/panel layers.
- [ ] No side-stripe (`border-left`) accents.
- [ ] No em dashes in any on-page copy.
- [ ] No second typeface.
- [ ] Red passes the "is this the single most important thing right now?" test at every instance.
- [ ] Category-reflex check: a creative-agency page that's dark + red + big type IS the cliché. The defense is *precision of deployment + the scroll choreography*, which a template cannot fake. Verified per page.
- [ ] Every page passes WCAG AA contrast + full keyboard nav + reduced-motion fallback.

---

## 8. Build plan & orchestration

### 8.1 Sequence
1. **Approve this spec** (you are here).
2. Build `ServicePageShell` (Acts 4–7 are shared components; Acts 1–3 are slots).
3. Build **Video Production** end-to-end as working coded frames (placeholder copy/media).
4. Review live on phone + desktop, run `impeccable critique`/`audit`.
5. Build **Social Media** reusing the shell.
6. Extract learnings, then Tier 2 pages.

### 8.2 Verification per page (goal-driven, per CLAUDE.md)
- Renders at 360 / 390 / 768 / 1024 / 1440 / 2560 widths without overflow or layout break.
- Scroll choreography is smooth (no jank) on a throttled mobile profile.
- `prefers-reduced-motion` path verified.
- Lighthouse a11y ≥ 95; AA contrast confirmed.
- Single CTA reachable in thumb zone on mobile at all scroll depths.

### 8.3 On the multi-agent orchestrator question
For *design coherence*, we do NOT split the creative vision across different models (seams show, and coherence is the whole product). What we DO: run **parallel sub-agents on genuinely independent, fully-specified components** (e.g. one builds the sticky-relay, one builds the floating-tile system) under THIS single spec, then gate everything through one reviewer (`impeccable` critique/audit). One vision, parallel hands, one judge. No separate CLI setup required; it is orchestrated from this session.

---

## Open inputs needed before/while building
1. **Showreel + sample footage** for `/services/video` Act 1 + Act 3 (or approve stock/AI-generated placeholders).
2. **Sample post/reel imagery** for `/services/social` tiles (or placeholders).
3. **Real package names + price anchors** for Act 5 (or use bracketed placeholders, refined later).
4. **Founder-rate scarcity terms** (e.g. "3 slots/month") so Act 7 scarcity is truthful, not invented.
