# LIONOVART — MASTERPLAN

> **This document supersedes every other plan in this repository.**
> Where this file disagrees with any other document, this file wins.
> Last updated: 2026-08-26 · Owner: Leon (Creative & Business Director)

---

## §0 — HOW TO USE THIS DOCUMENT

**If you are an AI model executing work on this project, read this section completely before touching anything.**

### 0.1 Document supremacy

| Rank | Document | Authority |
|---|---|---|
| 1 | **`MASTERPLAN.md`** (this file) | Strategy, offer, sequence, priorities. Absolute. |
| 2 | `docs/V2_REBRAND_MASTER_PLAN.md` **Part B.1 only** | Craft law: motion, type, reveal recipes, reduced-motion. Its *positioning* is dead; its *rules* are law. |
| 3 | `AGENTS.md` + `CLAUDE.md` | Repo conventions and Next.js version warnings. |
| 4 | `SEO_AEO_MASTER_PLAN.md`, `NOVA_HARDENING_PLAN.md` | Technical reference within their domain. |
| — | Everything else | **Superseded.** See §8. Read for history, never for direction. |

### 0.2 Rules for executing models

1. **Do not invent.** No customer, statistic, review, award, or capability that is not verifiably real. If a spec needs content you do not have, leave a `TODO(leon):` marker and tell him. Never fill the gap with plausible fiction. This applies to code you write *and* to output your code generates at runtime.
2. **Do not add dependencies.** The stack in §1.4 is closed. If you believe you need a package, stop and ask.
3. **Do not widen scope.** Build what the week's card says. If you notice something else broken, write it in `§9 FIELD NOTES` at the bottom of this file — do not fix it.
4. **Every task has a Verify line.** You are not done when the code compiles. You are done when the Verify line is demonstrably true. State how you verified it.
5. **Do not touch `/v2`.** It is a parked concept. `noindex`, frozen.
6. **Respect the 10-Hour Law** (§1.5). If your work creates a recurring human task, you have failed the task.

---

## §1 — CONSTRAINTS (ABSOLUTE)

### 1.1 Voice

Founder-to-founder. Outcome-led — what they *get*, never what we *do*. Short sentences. Rhythm, not paragraphs. Confident without arrogance.

**Always:** "investment," never "price" or "cost" as a *label*. (Numbers themselves are fine and required — see §3.)

**Never:**
- False urgency or unenforceable scarcity. A scarcity claim is permitted **only** when the number is literally true and mechanically enforced (§4.3).
- Competitor bashing.
- Filler validation: "Great question!", "Absolutely!", "I understand."
- Prescriptive marketing copy ("you should do X"). Reflect, validate, plant curiosity.
- Agency-speak. Section intros that repeat the heading.

### 1.2 Visual identity

| Token | Hex | Rule |
|---|---|---|
| Base dark | `#0d0d0d` | Main background |
| Deep black | `#0a0a0a` | Heavier sections |
| Cream | `#f5f0eb` | Light sections |
| Brand red | `#e5192a` | **Narrative line, eyebrows, CTAs only.** Never decoration. |
| Red secondary | `#db0000` | Bold section fills |
| Gold | `#f0c917` | **Light only** — glow, rim, gradient. Never a flat fill. Never body text. |

**Typography:** Clash Display. Display = uppercase, tight tracking, short lines. Body = ≤65ch, `leading-[1.65]`, 65–80% opacity on dark.

**Motion:** One easing everywhere — `[0.16, 1, 0.3, 1]`. Durations 0.8–2.2s. Reveals fire once (`viewport={{ once: true }}`). Nothing bounces. Nothing loops except ambient video/shader.

**Depth comes from light** — radial glows, gradient masks, ember texture. Never borders, never drop shadows, never visible photo rectangle edges.

**Forbidden outright:** floating cards · pastel gradients · hero metric soup · equal-card grids · stock photos · brutalist grids · decorative dots · fake precision numbers · marquees outside the two that already exist.

**Two craft recipes are law** (full text in `docs/V2_REBRAND_MASTER_PLAN.md` B.1, reproduced because they are bug-prone):

- **Masked line reveal:** the `overflow-hidden` wrapper must be the `motion.div` carrying `initial`/`whileInView`/`viewport`; the inner heading animates by variant propagation. Never put `whileInView` on the clipped child — IntersectionObserver computes intersection *after* ancestor clipping, so it never fires and the headline stays invisible forever.
- **Reduced motion:** pass `initial`/`animate`/`whileInView`/`style` **unconditionally**; express reduced motion only through `transition={reduceMotion ? { duration: 0 } : {...}}`. `useReducedMotion()` is null during SSR, so any branch that changes rendered output causes a hydration mismatch.

### 1.3 Zero tolerance

1. **No fabricated customers.** Every proof item carries a real status label (§4.2).
2. **No statistic without a source** named on the page or in a visible footnote.
3. **No scarcity claim** that is not mechanically enforced (§4.3).
4. **No client PII leaves Firestore** without consent. Voice sessions disclose recording before capture.
5. **WCAG 2.1 AA verified, not asserted.** Gold `#f0c917` on cream `#f5f0eb` is ≈1.8:1 and fails — it is never text on cream.
6. **The Magnet never invents findings.** If the scrape returns nothing usable, the audit says so. An audit that hallucinates a weakness destroys the exact trust it exists to build.

### 1.4 Stack — closed

Next 16.2.1 App Router · React 19.2.4 · Tailwind v4 (tokens in `globals.css`, never a config file) · Framer Motion 12 · GSAP + ScrollTrigger · Lenis · Firebase Admin / Firestore · Gemini (Live voice, text, dossier) · Resend · PostHog · Google Cloud Run via `cloudbuild.yaml`.

- **Booking = Google Calendar** via `BOOKING_URL`. `src/lib/calcom.ts` stays dormant — do not delete, do not wire.
- **Payments = Stripe Payment Links.** The one new external service. Zero code: links are created in the Stripe dashboard and pasted into config.
- **CRM = `/admin`.** It already exists (leads, conversations, objections, analytics, dossiers). Extend it. Never build a second one.

### 1.5 ⚖️ THE 10-HOUR LAW

> Leon has **5–15 hours per week** for sales and marketing. Not for delivery — for growth.
>
> **No system enters this plan unless it (a) runs without Leon, or (b) returns more than $500 of pipeline per founder-hour spent.**

Consequences, non-negotiable:
- No daily posting. No cold calling. No manually written audits. No manual proposal assembly.
- If a spec you are implementing would create a recurring human task, you have misread the spec.

### 1.6 The market

**Now:** Calgary local business owners — restaurants, cafés, salons, clinics, contractors, realtors, retail. Making money, looking amateur online. Entry **$500–2,500**.
**Later:** UK / Europe, unlocked by the Leapfrog (§4.1).

---

## §2 — THE VISION

**One sentence:** LIONOVART sells AI-powered brand and growth systems to Calgary businesses by *being* the working demo of one — a site that audits a stranger's business in sixty seconds, talks to them at 11pm, and books the call itself.

### 2.1 The eight systems

**① THE MAGNET** — Instant Brand Audit.
Visitor drops a URL. Sixty seconds later: a real, personalized teardown at a shareable link. **Kills** the manual-audit bottleneck (a promised 48h Loom is a business-ending promise at 10 hrs/wk), the "why would I give you my email" problem, and "prove you're good first" — in one move. **Why now:** `src/lib/scrape-website.ts` and `src/lib/dossier.ts` both exist and have never been connected. The two hard parts are already built. **BUILD.**

**② THE PROOF ENGINE** — Roar Files.
One afternoon on one real business → **five outputs**: a concept redesign, a `/work` case page, a vertical video, a carousel, and an outreach opener addressed to that owner. **Kills** no-portfolio, no-content, no-social-proof, and no-reason-to-cold-email — simultaneously. **BUILD as documented process, not software.**

**③ NOVA** — repositioned twice.
Not a chat widget. It is (a) the **demo** — hand a restaurant owner your phone, no Calgary competitor can answer it — and (b) the **highest-LTV product**, currently listed sixth of seven services. **ALREADY BUILT.** Needs repositioning and P0 hardening, not features.

**④ THE LADDER** — published offer architecture (§3).
**Kills** quote-request friction, unqualified calls eating the ten hours, and the mismatch where a contractor sees a cinematic site and assumes $50k.

**⑤ THE CLOSE** — lead → proposal → deposit → onboarded.
There is currently **no point in this system where money is collected.** **INTEGRATE:** Stripe Payment Link + proposal template + Resend.

**⑥ THE PRIDE** — the client portal, as a product.
The internal CRM is `/admin` — extend it, never rebuild it. The *portal* is different: build it as something clients pay for, once retainers exist to justify it. ⚪ Later.

**⑦ THE SIGNAL** — SEO / AEO / local.
Technical foundation already shipped. The change: it stops being a separate workstream and becomes the downstream consumer of the Proof Engine. Every Roar File is a `/work` page targeting a real Calgary search term.
**GBP is deferred** — it requires a verifiable address Leon does not yet have. Trigger: create it the week an address exists.

**⑧ THE MIRROR** — one dashboard, real numbers.
PostHog is installed with zero events defined. At 10 hrs/wk you cannot afford to spend eight of them on something that isn't converting.

### 2.2 The loop

```
   THE PROOF ENGINE ──┬──→ social + outreach ──┐
   (1 afternoon)      ├──→ /work pages ────────┤
                      └──→ THE SIGNAL ─────────┤
                                               ▼
   $300 Google Ads ──────────────────────→  THE MAGNET
                                          (60s real audit)
                                               │
                                               ▼
                                            NOVA
                                    (qualifies, books the call)
                                               │
                                               ▼
                                          THE LADDER
                                      (named tier, real number)
                                               │
                                               ▼
                                          THE CLOSE
                                    (proposal → deposit → cash)
                                               │
                          ┌────────────────────┴──────────────┐
                          ▼                                   ▼
                    delivered work ──→ THE PROOF ENGINE   THE PRIDE
                    (now real client work)   ↑          (retainer, referrals)
                          └──────────────────┘
   THE MIRROR ⑧ watches every arrow.
```

**The compounding asset is not the website.** It is the loop: delivered work feeds the Proof Engine, which stops needing concept studies because it has real ones. Every project makes the next one easier to sell.

### 2.3 Deliberately NOT in this plan

| Cut | Why |
|---|---|
| `/v2` as a shipping site | Concept visualization only. Craft rules survive; positioning does not. Stays `noindex`. |
| LED glass | No revenue path in 90 days. A pitch differentiator, not a build. |
| i18n URL routing | Structural, risky, Calgary is English. Revisit when UK/EU is real. |
| Daily social posting | Violates the 10-Hour Law. Weekly Roar File instead. |
| Cold calling | Leon says it doesn't work for him. Believed. Removed. |
| A second CRM | `/admin` is the CRM. |
| Print catalogue page | Print sells in person. `PRINT_PAGE_PLAN.md` parks. |
| Google Business Profile | Blocked on address. Deferred to trigger, not a week. |

---

## §3 — THE LADDER (the offer)

### 3.1 Design principle

Low-friction entry that is an easy yes. Modular ascension so the same client can grow without renegotiating. Numbers published — because an unpublished number costs Leon a call to quote, and calls are the scarcest resource in this business.

**The word "price" never appears. The numbers always do.** Label them *Investment*.

### 3.2 The three tiers

| | **THE SPARK** | **THE ROAR** | **THE PRIDE** |
|---|---|---|---|
| **Investment** | **$750** | **$2,500** | **from $1,200 / month** |
| **Timeline** | 2 weeks | 4 weeks | Ongoing, 3-month minimum |
| **For** | Looks amateur, needs to look real fast | Ready to be the obvious choice | Wants it run for them |
| **Includes** | Logo system + brand sheet · business card · 3 social templates · Google Business setup | Everything in Spark · full brand system + guidelines · 5-section conversion website · content starter kit (9 posts) | Pick **2+ modules**, scale up or down monthly, pause without starting over |
| **Modules** | — | — | Content Engine · NOVA (AI agent) · Growth (SEO + ads) · Design-on-call |

### 3.3 À la carte (attaches to any tier)

| Module | Investment |
|---|---|
| NOVA voice agent — setup | $900 + $150/mo |
| Brand film (60s) | $1,500 |
| Print pack (cards, signage, collateral) | $400 |
| Content day (photo + video capture) | $800 |
| Google Business optimization | $350 |

### 3.4 THE FOUNDING FIVE (the entry wedge)

**THE ROAR at $1,500 instead of $2,500 — for the first five Calgary partners.**

Not a discount. An **exchange**. The partner gives:
1. Full case-study rights (photos, metrics, before/after).
2. A filmed video testimonial.
3. Three warm introductions to other Calgary owners.

Framing rule: this is stated as *what they give*, never as *what we're taking off*. That is the difference between exclusivity and desperation.

**It is genuinely limited to five and mechanically enforced** (§4.3).

### 3.5 Where the numbers go on the site

| # | Placement | What appears | Why there |
|---|---|---|---|
| 1 | **`/pricing`** — new page | The full ladder, all tiers, modules, Founding Five, FAQ | The destination. Linked from nav and every service page. |
| 2 | **Homepage — the existing `SignatureOffer` slot** | Three tiers, "from" numbers only, CTA → `/pricing` | It already sits after `Services`, before `Comparison` in `PageBuilder.tsx`. **Repurpose the slot, do not add a section.** |
| 3 | **Each `/services/*` page** | One line in the offer band: "Investment starts at $X" → `/pricing` | Catches the visitor who arrived from search on one service. |
| 4 | **The Magnet result page** | The recommended tier, personalized to what the audit found | **The money placement.** They just saw their problem; the fix is right there. |
| 5 | **NOVA's knowledge base** | Full ladder so she can quote ranges in conversation | Stops her deflecting on the single most common question. |
| 6 | ❌ **Never the hero** | — | The hero sells the outcome. Numbers there kill the cinematic open and the premium read. |

---

## §4 — THE PROOF DOCTRINE

### 4.1 The Leapfrog

The sequencing strategy, and it is correct:

```
PHASE 1 (now)     International work  ──sells──→  Calgary owners
                  ("they've worked in Europe")

PHASE 2 (month 4+) Calgary client work ──sells──→ More Calgary, at higher rates
                                       ──sells──→ UK / Europe
```

A Calgary owner seeing a Barcelona hospitality brand study does not need it to be a paid engagement to be impressed. They need it to be **good**. The leapfrog works completely with honest labels.

### 4.2 Labels — mandatory on every proof item

Every `/work` card, every testimonial, every portfolio image carries one small label chip:

| Label | Means | Example |
|---|---|---|
| `Client Work` | A paying client. Written permission on file. | `Client Work · France` |
| `Creative Study` | Self-initiated redesign of a real business. | `Creative Study · Barcelona` |
| `Concept Direction` | Original concept, no real business behind it. | `Concept Direction` |

Chip spec: `text-[10px] uppercase tracking-[0.18em]`, 60% opacity, bottom-left of the card. Present, never shouted. It reads as a studio with a point of view — which is a *stronger* premium signal than testimonials, because every agency has testimonials and almost none show speculative work at this quality.

### 4.3 Scarcity, made true

The Founding Five counter is real data, not copy.

**Firestore:** `config/founding_five` → `{ total: 5, claimed: number, updated_at }`
**Read:** `GET /api/founding-five` → `{ remaining }`, cached 5 min via existing `src/lib/cache.ts`.
**Write:** manual, from `/admin`, when a partner signs.

**Banner copy is derived, never hardcoded:**
- `remaining > 0` → "**{remaining} of 5 founding partner spots remain**"
- `remaining === 0` → "**Founding partner spots are filled. Join the waitlist →**"

A number that moves is more persuasive than a number that sits. And it is true, which means it survives being questioned.

### 4.4 The integrity pass (Week 1, blocking)

`src/lib/i18n/locales/en.ts` currently ships named testimonials with named businesses and hard numbers. Some are real; some are placeholders. Resolution:

1. **Real ones stay** — keep name, add `Client Work · {country}` chip, get written permission on file (`TODO(leon)`).
2. **Placeholders come out of `testimonials.reviews`** and are re-authored as `/work` Creative Studies with honest chips. The perception Leon wants (international range) is fully preserved.
3. **Unsourced stats** — every number in `en.ts` and `BRAND_MARKETING_HANDOFF.md` §8 either gets a visible source or comes down. `94% of first impressions are design-based` → cite. `+20 Brands in the Lion's Pride` → make true or cut.
4. **`FounderOfferBanner`** switches to the derived Founding Five copy (§4.3).

---

## §5 — SYSTEM SPECS

### 5.1 ① THE MAGNET — Instant Brand Audit

**Objective:** A stranger gives a URL and an email, and sixty seconds later holds a real, specific, personalized teardown of their own business — good enough that they wonder what the paid version looks like.

#### Strategic direction

The audit **is** the pitch. It must be genuinely useful even if they never buy — that is what makes it convert. Three things make it feel expensive:

1. **It is about them, not us.** Their screenshot, their headline, their words quoted back. Zero LIONOVART marketing above the fold.
2. **It is specific.** Not "your site could be faster." Rather: "Your homepage headline is *'Welcome to our website'*. A visitor cannot tell what you sell in the first three seconds."
3. **It ends with the fix, not the sell.** The recommended tier appears *after* the findings, framed as "here's what fixing this looks like."

#### Architecture

```
/audit                        capture page (URL + name + email + optional socials)
   │  POST /api/audit
   ▼
/api/audit/route.ts
   ├── 1. rate limit          src/lib/rate-limit.ts — 3 per IP per 24h
   ├── 2. scrapeWebsite(url)  src/lib/scrape-website.ts (SSRF guards already present)
   ├── 3. Gemini analysis     GEMINI_MODEL, fixed rubric (below), JSON out
   ├── 4. write Firestore     audits/{id}  +  leads/{id} with source:"audit_magnet"
   ├── 5. notify              src/lib/notify.ts (Slack) + Resend email to visitor
   └── 6. return { slug }
   ▼
/audit/[slug]                 server component, reads Firestore, noindex, shareable
```

#### Data model — `audits/{id}`

```ts
interface AuditDoc {
  slug: string;              // nanoid(10), URL-safe, unguessable
  url: string;               // normalized input
  business_name: string;     // from scrape <title> / og:site_name
  lead_id: string;           // FK → leads/{id}
  scores: {
    first_impression: number;    // 0-100
    message_clarity: number;
    mobile_experience: number;
    trust_signals: number;
    findability: number;
    conversion_path: number;
  };
  overall: number;           // mean, rounded
  findings: Array<{
    dimension: keyof AuditDoc["scores"];
    verdict: string;         // ONE sentence, quotes their actual content
    fix: string;             // the single highest-leverage action
    evidence: string | null; // literal quoted text from their site, or null
  }>;
  recommended_tier: "spark" | "roar" | "pride";
  scrape_quality: "full" | "partial" | "empty";
  created_at: Timestamp;
}
```

#### The rubric — six dimensions, fixed, never improvised

| Dimension | The question it answers |
|---|---|
| First impression | In 3 seconds, does this look like a business worth paying more for? |
| Message clarity | Can a stranger tell what you sell and who it is for, above the fold? |
| Mobile experience | Is the phone version the real version, or an afterthought? |
| Trust signals | Reviews, faces, real photos, proof — present or absent? |
| Findability | Would Google and AI engines know what this business is? |
| Conversion path | How many taps from landing to contacting you? |

Each finding: **verdict** (one sentence, quotes their real content), **fix** (one action), **evidence** (literal quote or `null`).

#### Cost & performance

- Gemini `GEMINI_MODEL` (flash tier). Input ≈ 8–15k tokens of scraped text, output ≈ 1.5k. **Fractions of a cent per audit.**
- Target: **under 60s** end to end. Scrape timeout 10s, Gemini timeout 30s.
- Rate limit 3/IP/24h caps abuse and cost.
- The `/audit/[slug]` page is a server component reading one Firestore doc — instant, cacheable, zero client JS beyond the brand's motion.

#### Failure modes — every one has defined behavior

| Failure | Behavior |
|---|---|
| URL unreachable / DNS fails | Form-level error: "We couldn't reach that address. Check the spelling?" No lead written, no charge. |
| Site is JS-only, scrape returns no text | `scrape_quality: "empty"`. Audit renders **only** the dimensions that can be judged from headers/meta, and states plainly which it could not assess. **Never fabricate findings.** |
| Partial scrape | `scrape_quality: "partial"`. Same rule — assess what exists, say what it could not see. |
| Gemini fails or times out | Lead is **still written** (that is the point of the page). Visitor sees: "Your audit is taking longer than usual. It'll be in your inbox within the hour." Slack alert fires to Leon. |
| Firestore unavailable | **Hard fail with a visible error.** Do not return a success state. Today `lead/route.ts` returns HTTP 200 `{saved:false}` on this path — **that bug is fixed in Week 5.** |
| Redirect chain to a private IP | `safeFetch` must re-check the SSRF guard on **every hop**, not just the first. Verify this. |

#### Art direction — `/audit/[slug]`

Dark base `#0d0d0d`. Cream `#f5f0eb` for the findings block — the light section is where the useful content lives, which makes it read as a document rather than a landing page.

- **Overall score:** one large numeral, Clash Display, `clamp(6rem, 14vw, 11rem)`. Colour by band — under 50 `#e5192a`, 50–74 `#f0c917` as *glow not fill*, 75+ white. No gauge, no donut, no progress ring.
- **Six dimensions:** a single vertical stack, not a grid. Each row = dimension name, a thin `2px` bar (their score, red fill on `white/10` track), verdict, fix. Rows stagger in at 60ms intervals, once.
- **Evidence quotes:** set in the body face, italic, `border-l border-brand-red/40 pl-4`, 70% opacity. Their words, visibly theirs.
- **The close:** after all six, a single band with the recommended tier and one CTA. Not three tiers — **one**, chosen for them.
- **Accessibility:** every score also stated as text (`"62 out of 100"`), never colour alone. Bars are `role="img"` with `aria-label`. Full keyboard path. Contrast checked against §1.3.

#### ✅ Acceptance checklist

- [ ] `POST /api/audit` with a real Calgary business URL returns a `slug` in **under 60 seconds**.
- [ ] `/audit/{slug}` renders six dimensions, six verdicts, six fixes, and at least one literal evidence quote from that site.
- [ ] Submitting writes **both** an `audits/{id}` doc and a `leads/{id}` doc with `source: "audit_magnet"`, linked by `lead_id`.
- [ ] `LeadBody` in `src/app/api/strategist/lead/route.ts` accepts and persists `website_url` and `socials`.
- [ ] A JS-only site (test with any SPA) produces `scrape_quality: "empty"` and an audit that **explicitly names what it could not assess** — with zero invented findings.
- [ ] A dead URL produces a form error and **no** Firestore write.
- [ ] Killing the Gemini key mid-test still writes the lead and still shows the visitor a non-broken page.
- [ ] Fourth submission from one IP inside 24h is rejected with a clear message.
- [ ] Lighthouse accessibility ≥ 95 on `/audit/[slug]`. Every score readable as text. Keyboard reaches the CTA.
- [ ] `/audit/[slug]` is `noindex` (personal data). `/audit` is indexable.
- [ ] Page respects `prefers-reduced-motion` per the §1.2 recipe.

**Dependencies:** none — everything needed exists. **Unlocks:** the ads test, the outreach CTA, the NOVA handoff, and the Proof Engine's opener.

---

### 5.2 ② THE PROOF ENGINE — Roar Files

**Objective:** Convert one afternoon of Leon's craft into five assets that each do a different job, so proof, content, SEO, and outreach are produced by a single act.

#### The process — fixed, repeatable, one per week

| Step | Time | Output |
|---|---|---|
| 1. Pick | 15 min | One real business. Criteria: visibly weak online, in an ICP niche, has a physical location, is *not* already a competitor's client. |
| 2. Capture | 30 min | Screenshot their current site + socials. Screenshot their Google listing. Note the three things costing them money. |
| 3. Redesign | 2.5 h | Hero + one section + logo direction + one social template. **Not a full site.** Enough to make the gap visible. |
| 4. Package | 45 min | `/work` case page: their before, the study, the three problems, the direction. `Creative Study` chip. |
| 5. Cut | 30 min | One vertical video (before → after, no narration, brand motion) + one carousel. |
| 6. Send | 20 min | Email/DM to the owner: *"I redesigned your storefront this week. No pitch — here it is."* Link to the case page. |

**≈ 4.5 hours. One per week. Five outputs.**

#### Why the send works

It is not a cold pitch — it is a gift that is already made. The owner cannot un-see the gap between what they have and what they could have. And if they never reply, the asset still did four other jobs.

#### `/work` architecture

```
/work                 index — grid of case cards, each with a §4.2 label chip
/work/[slug]          detail — before, study, the three problems, the direction, CTA
```

Data source: a typed array in `src/lib/work.ts` (not a CMS — a CMS is a subscription and a maintenance burden that violates the 10-Hour Law). Each entry carries `label: "client" | "study" | "concept"`, `region`, images, and the three problems.

#### ✅ Acceptance checklist

- [ ] `/work` renders every entry from `src/lib/work.ts` with a visible, correctly-typed label chip.
- [ ] `/work/[slug]` renders before/after with **no** visible photo rectangle edge (gradient-masked per §1.2).
- [ ] Every case page emits `BreadcrumbList` schema and a canonical, per `src/lib/seo/`.
- [ ] Each case page `<title>` targets a real search term ("Calgary café branding" etc.), one primary term per page.
- [ ] `sitemap.ts` includes every `/work/[slug]`.
- [ ] No entry lacks a label. A missing label is a build-blocking type error, not a runtime default.
- [ ] Images are `next/image`, served from `public/`, LCP under 2.5s on the index.

**Dependencies:** §4.2 labels defined. **Unlocks:** THE SIGNAL's content layer, all outreach, the eventual real case studies.

---

### 5.3 ⑤ THE CLOSE — lead to cash

**Objective:** Make it possible to take money. Today it is not.

#### The chain

```
Call booked (Google Calendar via BOOKING_URL)
   ↓
Proposal  — Google Doc template, 5 variables, ≤10 min to fill
   ↓
Deposit   — Stripe Payment Link (50%), one per tier, created once in dashboard
   ↓
Onboarded — Resend welcome sequence + intake form → Firestore
   ↓
Pipeline stage tracked in /admin
```

#### Build vs integrate

**Everything here is integrate.** Stripe Payment Links are created in the Stripe dashboard and stored in `src/lib/offers.ts` alongside the tier definitions. No checkout code, no webhooks in v1 — Leon marks paid in `/admin`. Webhooks are ⚪ later, and only if volume justifies them.

#### Fixes required in the same pass

| File | Bug | Fix |
|---|---|---|
| `src/app/api/strategist/lead/route.ts:19-21` | Returns HTTP **200** `{saved:false}` when Firebase is unconfigured — a lead can vanish with no error surfaced | Return 503 and alert. A silently dropped lead is worse than a visible failure. |
| `src/lib/notify.ts:10-13` | Silently no-ops without `SLACK_WEBHOOK_URL` | Fall back to a Resend email to `CONTACT_EMAIL`. Never fail silently on a captured lead. |

#### ✅ Acceptance checklist

- [ ] `src/lib/offers.ts` exports every tier with name, investment, inclusions, and Stripe Payment Link URL — **single source of truth**, consumed by `/pricing`, `SignatureOffer`, service pages, the audit page, and NOVA's knowledge.
- [ ] A test purchase on a Stripe test link completes and is visible in the Stripe dashboard.
- [ ] `/admin` leads list shows a pipeline stage field (`new · audited · called · proposed · won · lost`) that is editable.
- [ ] With Firebase env vars removed, submitting a lead returns **503** and fires the notify fallback. Verified by removing the vars locally.
- [ ] With `SLACK_WEBHOOK_URL` unset, a captured lead still produces an email to `CONTACT_EMAIL`.
- [ ] No hardcoded number anywhere in the codebase — every price reads from `offers.ts`.

**Dependencies:** §3 Ladder finalized. **Unlocks:** revenue. Literally.

---

### 5.4 ⑧ THE MIRROR — the numbers

**Objective:** Know within one glance whether the machine is working, because at 10 hrs/wk you cannot afford to spend eight on something that isn't.

**PostHog events — this exact list, these exact names:**

```
audit_started          { source }
audit_completed        { overall_score, scrape_quality, duration_ms }
audit_viewed           { slug, is_owner }
nova_opened            { section, trigger }
nova_lead_captured     { has_email, has_phone }
booking_clicked        { source_page }
pricing_viewed         { tier_hovered }
work_case_viewed       { slug, label }
founding_five_clicked  { remaining }
```

**The one funnel that matters:** `visitors → audit_started → audit_completed → nova_opened OR booking_clicked → deal`

**✅ Acceptance:** every event above fires with correct properties, verified in PostHog live events; `/admin/analytics` renders the funnel with real counts; no event fires twice on one action.

---

## §6 — THE 12-WEEK CALENDAR

**Budget: 10 hours per week** (the midpoint of 5–15). Each week has a single goal, hour-costed tasks, and a **Verify** line that is objectively true or false. Do not start a week until the previous week's Verify lines all pass.

`[L]` = Leon only (creative judgment, relationships). `[AI]` = an executing model can do it autonomously. `[L+AI]` = model builds, Leon decides.

---

### 🔴 WEEKS 1–5 — THE MACHINE

#### **WEEK 1 — Integrity & the Ladder decided** · 10h
> Nothing else can be built on proof that isn't settled.

| Task | Who | h |
|---|---|---|
| Separate real testimonials from placeholders in `en.ts`; list which is which | [L] | 1 |
| Re-author placeholders as Creative Study entries (§4.2); real ones get `Client Work · {country}` chips | [L+AI] | 3 |
| Source or remove every unsourced statistic in `en.ts` and the site copy | [AI] | 2 |
| Finalize the Ladder: confirm or adjust every number in §3 | [L] | 1 |
| Build `src/lib/offers.ts` — the single source of truth | [AI] | 2 |
| Create the 4 Stripe Payment Links (Spark, Roar, Founding Five, Pride deposit) | [L] | 1 |

**✅ Verify:** `grep` finds zero testimonials in `en.ts` without a permission note or a Study reclassification · every visible number traces to `offers.ts` or a cited source · four live Stripe links exist.

---

#### **WEEK 2 — The Ladder published** · 10h
> You cannot sell what has no number.

| Task | Who | h |
|---|---|---|
| Build `/pricing` — three tiers, à la carte, Founding Five, FAQ | [AI] | 5 |
| Rebuild `SignatureOffer` in its existing `PageBuilder` slot as the three-tier band | [AI] | 3 |
| Add "Investment starts at $X" line to all 5 `/services/*` pages | [AI] | 1 |
| Add the Ladder to NOVA's knowledge base (`nova-brain/knowledge`) | [AI] | 1 |

**✅ Verify:** `/pricing` live, all numbers from `offers.ts`, zero hardcoded · homepage shows three tiers linking to `/pricing` · NOVA quotes correct ranges when asked "how much" · Lighthouse a11y ≥ 95 on `/pricing`.

---

#### **WEEK 3 — The Magnet, backend** · 12h *(the one heavy week)*

| Task | Who | h |
|---|---|---|
| `POST /api/audit` — rate limit → scrape → Gemini → Firestore → notify | [AI] | 6 |
| The six-dimension rubric prompt + strict JSON schema + the never-fabricate rule | [AI] | 3 |
| Extend `LeadBody` with `website_url` + `socials`; wire `source: "audit_magnet"` | [AI] | 1 |
| Verify `safeFetch` re-checks SSRF guards on every redirect hop | [AI] | 2 |

**✅ Verify:** curl the endpoint with 3 real Calgary URLs → valid JSON under 60s each · an SPA URL returns `scrape_quality:"empty"` with zero invented findings · a redirect to `127.0.0.1` is blocked · 4th request from one IP is rejected.

---

#### **WEEK 4 — The Magnet, frontend** · 10h

| Task | Who | h |
|---|---|---|
| `/audit` capture page — URL + name + email, art-directed per §1.2 | [AI] | 3 |
| `/audit/[slug]` result page per the §5.1 art direction | [AI] | 5 |
| Resend delivery email + Slack notify | [AI] | 1 |
| Accessibility pass — scores as text, aria-labels, keyboard path | [AI] | 1 |

**✅ Verify:** end-to-end as a stranger → real audit in under 60s · scores readable with CSS colour disabled · Lighthouse a11y ≥ 95 · `noindex` on `[slug]` confirmed in response headers · reduced-motion renders correctly with no hydration warning in console.

---

#### **WEEK 5 — The Close** · 10h
> The week you become able to take money.

| Task | Who | h |
|---|---|---|
| Fix the silent-loss bugs: `lead/route.ts` 200→503, `notify.ts` Resend fallback | [AI] | 2 |
| Pipeline stage field + editor in `/admin` leads | [AI] | 3 |
| Proposal template (Google Doc, 5 variables) | [L] | 2 |
| Onboarding sequence in Resend + intake form → Firestore | [AI] | 3 |

**✅ Verify:** Firebase vars removed → lead POST returns 503 and email fires · `SLACK_WEBHOOK_URL` unset → email still arrives · a lead can be dragged `new → won` in `/admin` and it persists · a test proposal is filled in under 10 minutes.

---

### 🟡 WEEKS 6–12 — COMPOUNDING

#### **WEEK 6 — Roar File #1 + `/work`** · 10h

| Task | Who | h |
|---|---|---|
| `src/lib/work.ts` typed model + `/work` index + `/work/[slug]` | [AI] | 5 |
| Roar File #1, full 6-step process (§5.2) | [L] | 4.5 |
| Sitemap + breadcrumb schema for work routes | [AI] | 0.5 |

**✅ Verify:** `/work` live with #1 · label chip present and correct · case page in `sitemap.xml` · Rich Results Test passes BreadcrumbList · the owner has been sent the link.

---

#### **WEEK 7 — Roar File #2 + outreach rhythm** · 10h

| Task | Who | h |
|---|---|---|
| Roar File #2 | [L] | 4.5 |
| Outreach template set — email, IG DM, in-person opener | [L+AI] | 2 |
| Send to 15 Calgary owners (the two Files + 13 audit links) | [L] | 2.5 |
| Post File #1 + #2 video and carousel to Instagram | [L] | 1 |

**✅ Verify:** 15 sends logged in `/admin` · at least 2 replies (if 0 after 20 sends, the opener is wrong — rewrite before scaling) · IG has 4 posts.

---

#### **WEEK 8 — Roar File #3 + The Mirror** · 10h

| Task | Who | h |
|---|---|---|
| Roar File #3 | [L] | 4.5 |
| PostHog events — the exact list in §5.4 | [AI] | 3 |
| `/admin/analytics` funnel view | [AI] | 2 |
| 15 more outreach sends | [L] | 0.5 |

**✅ Verify:** every §5.4 event visible in PostHog live events with correct properties · funnel renders real counts · no double-fires.

---

#### **WEEK 9 — NOVA repositioned + hardened** · 10h

| Task | Who | h |
|---|---|---|
| `NOVA_HARDENING_PLAN.md` **P0s only**: authenticate `/api/strategist/tool`, fail closed when `NOVA_WS_SECRET` unset | [AI] | 4 |
| P1: `fetch_user_memory` cross-user dossier disclosure | [AI] | 2 |
| Build `/services/ai` per `AI_SYSTEMS_PAGE_SPEC.md` — NOVA as product | [AI] | 3 |
| Script + rehearse the 90-second in-person NOVA demo | [L] | 1 |

**✅ Verify:** unauthenticated POST to `/api/strategist/tool` is rejected · WS refuses connection with `NOVA_WS_SECRET` unset · a dossier request for another lead's ID returns 403 · demo runs on a phone on cellular in under 90s.

---

#### **WEEK 10 — Paid test, $300** · 10h

| Task | Who | h |
|---|---|---|
| Google Ads: exact match only, ~5 keywords, Calgary geo-fenced, **landing on `/audit`, never the homepage** | [L+AI] | 3 |
| Conversion tracking wired to `audit_completed` | [AI] | 2 |
| Roar File #4 | [L] | 4.5 |
| Read results, kill losing keywords | [L] | 0.5 |

Keywords: `web design calgary` · `logo designer calgary` · `branding agency calgary` · `website for small business calgary` · `video production calgary`. $10/day, 30 days.

**✅ Verify:** ads live and spending · conversions recorded against `audit_completed` · cost-per-audit-lead is a known number. If CPL > $60, pause and fix the landing page before spending more.

---

#### **WEEK 11 — The Orbit** · 10h

| Task | Who | h |
|---|---|---|
| List 20 Calgary accountants / realtors / business coaches who touch your buyer weekly | [L+AI] | 2 |
| One-page referral agreement — 10% of first project | [L+AI] | 1.5 |
| Reach out to all 20 with a free audit for their own business as the opener | [L] | 2 |
| Roar File #5 | [L] | 4.5 |

**✅ Verify:** 20 contacted · ≥3 agreements in place · every partner has been through the Magnet themselves (they cannot refer what they haven't experienced).

---

#### **WEEK 12 — Read the machine** · 10h

| Task | Who | h |
|---|---|---|
| Full funnel review against §7 targets | [L] | 2 |
| Accessibility remediation pass — gold-on-cream, NOVA keyboard path, contrast sweep | [AI] | 4 |
| Core Web Vitals: move hotlinked imgur/cloudinary hero images into `public/`, re-enable `next/image` optimization | [AI] | 3 |
| Update this file: what worked, what dies, what Q2 looks like | [L+AI] | 1 |

**✅ Verify:** zero AA contrast failures site-wide · LCP < 2.5s on `/` and `/audit` · §7 scorecard filled with real numbers.

---

### ⚪ AFTER WEEK 12 — gated on revenue

| Unlock | Trigger |
|---|---|
| **THE PRIDE** client portal | ≥3 active retainers |
| **Hire enablement** — fulfillment playbooks so the first hire is a *closer*, not a fulfiller | ≥$8k MRR |
| **Google Business Profile** | A verifiable address exists |
| **i18n URL routing + hreflang** | UK/EU is actively being pursued |
| **Stripe webhooks, automated invoicing** | >5 deals/month makes manual marking painful |
| **LED glass · `/v2` revival · print catalogue** | Optional, cash-gated, never before the above |

---

## §7 — DEFINITION OF DONE

The plan worked if, at the end of Week 12:

| Metric | Target | Why this number |
|---|---|---|
| Founding Five partners signed | **3 of 5** | Real case studies, real reviews, real referrals |
| Revenue collected | **$6,000+** | 3 × Founding Five at $1,500, plus one à la carte |
| Retainers active | **1** | Proves the ascension path exists |
| Audits completed | **60+** | ~5/week; the top of the funnel is real |
| `/work` case pages live | **5** | The Leapfrog has an inventory |
| Referral partners agreed | **3** | The Orbit has started turning |
| Founder hours per week | **≤12** | If this exceeded 15, the machine failed its purpose |

**The single leading indicator to watch weekly:** completed audits. Everything downstream is a conversion rate on that number. If audits are flat, nothing else matters yet.

---

## §8 — SUPERSEDED DOCUMENTS

These are history. Read them for context, never for direction. Each has been given a header pointing here.

| File | Status |
|---|---|
| `FUNNEL_PLAN.md` | Superseded — its diagnosis survives in §2, its build phases are replaced by §6 |
| `LIONOVART_CLIENT_BRIEF.md` | Superseded — inputs absorbed into §1.6, §3 |
| `BRAND_MARKETING_HANDOFF.md` | Reference only for voice/word bank; its proof claims are governed by §4 |
| `HANDOFF.md` | **Stale and misleading** — describes a homepage that no longer exists |
| `BRANCH_WORKSTREAMS.md` | Historical; the branch it tracks is not current |
| `SERVICE_PAGES_SPEC.md` | Reference for pages already built; `/services/video` in it no longer exists |
| `PRINT_PAGE_PLAN.md` | Parked (§2.3) |
| `docs/V2_REBRAND_MASTER_PLAN.md` | **Part B.1 is law** (§0.1). Everything else is a parked concept. |
| `CLAUDE.md` build table | Stale — component list predates the current `PageBuilder` |

---

## §9 — FIELD NOTES

> Executing models: when you notice something broken that is **outside** your task, append it here with a date. Do not fix it. Do not widen scope.

- `2026-08-26` — `src/lib/i18n/locales/ja.ts` and parts of `founder-offer.ts` contain `[TODO: translate]` placeholder strings that would render literally if Japanese is ever enabled.
- `2026-08-26` — `NOVA_HARDENING_PLAN.md` §1.3 lists SSRF in `scrape_website` as unfixed, but `src/lib/scrape-website.ts` already implements `isPrivateIPv4` / `isBlockedAddress` / `isHostnameBlocked`. The open question is redirect-hop coverage (Week 3).
- `2026-08-26` — `src/lib/calcom.ts` (4.4KB) is dormant by decision (§1.4). Not dead code; do not remove.
