# LIONOVART — SEO & AEO Master Plan

> **What this is:** the full search strategy for lionovart.com — classic SEO
> (Google rankings) **and** AEO (Answer Engine Optimization: getting cited by
> ChatGPT, Gemini, Perplexity, and Google AI Overviews). Grounded in the actual
> codebase, built for a solo founder with ~$25 and high energy.
>
> **Branch:** `claude/seo-aeo-strategy-bjil3p`
> **Status of this pass:** technical foundation **shipped** (see §6). Copy-dependent
> work is staged for the copywriting pass (see §5).

---

## 0. The copy-vs-SEO question (answered)

You asked: *"Is it important to have the copywriting perfect before this step?"*

**No — and here's the rule:** SEO splits into two halves with opposite timing.

| Half | Depends on final copy? | When |
|---|---|---|
| Technical + structured data (schema, sitemap, canonical, perf) | ❌ No — these are *facts* | **Now (done)** |
| Keyword/intent research | ❌ No — it's an **input** to copy | **Now (§4)** |
| On-page copy (H1s, body, FAQ answers, meta) | ✅ Yes | **With the copy pass** |

**The trap to avoid:** writing "perfect" copy first, then bolting keywords on.
Do it backwards — let the keyword research (§4) tell the copy what your Calgary
buyers actually type, then write copy that's great *and* already optimized.
Nothing shipped in this PR will be thrown away by the copy pass.

---

## 1. Executive summary

LIONOVART has a **beautiful, animation-heavy site with almost no search
foundation.** The good news: the bones are right (Next.js 16 App Router,
server-rendered HTML, real content in the DOM). The gaps were entirely in the
"machine-readable" layer — exactly the layer that both Google and AI engines
depend on.

**Biggest levers, in order of ROI for a $25 launch:**
1. **Google Business Profile** (free) — the #1 local-search asset. Not set up yet. **Do this first.**
2. **Structured data (JSON-LD)** — now shipped; makes the business an *entity* AI can cite.
3. **On-page copy with local keywords** — Calgary-weighted, woven in during the copy pass.
4. **Service pages as ranking pages** — each `/services/*` targets a real search.
5. **Reviews + proof** — the testimonial-for-discount play doubles as SEO/AEO fuel.

---

## 2. Improved prompt (you asked me to sharpen it)

Your original ask was broad ("full dive… master plan… everything"). Here's the
version that gets a sharper result next time you brief an AI on this:

> **Role:** Act as a senior technical-SEO lead + an AEO strategist + a local
> growth marketer who has ranked service businesses in competitive Canadian
> cities from zero.
>
> **Context:** LIONOVART, a launching Calgary creative agency (brand, web, video,
> AI, growth). Solo founder, ~$25 budget, no clients/reviews yet, zero social.
> Next.js 16 App Router, domain lionovart.com, 5 site locales, client-side i18n.
> Target: Calgary local businesses first (restaurants, salons, clinics,
> contractors, realtors), then UK/Europe.
>
> **Deliver, in this order:**
> 1. A prioritized technical-SEO audit (only real issues, each with the file/fix).
> 2. A keyword + search-intent map weighted to Calgary local intent, mapped to
>    existing routes, separating money/commercial/informational intent.
> 3. An AEO plan: how to become the entity AI engines cite for "Calgary creative
>    agency" — schema, FAQ/answer content, llms.txt, off-site signals.
> 4. A local-SEO plan centered on Google Business Profile with $0 budget.
> 5. A 0-7 / 8-30 / 31-90 day roadmap, ≤5 executable actions per phase, no theory.
> 6. The single highest-leverage action to take in the next 24 hours.
>
> **Rules:** Recommend, don't hedge. Every action executable for $0–$25.
> Tables and bullets, no paragraphs >3 lines. Flag what depends on final copy.

---

## 3. Audit — what was wrong (all grounded in the repo)

| # | Finding | Impact | Status |
|---|---|---|---|
| 1 | No `robots.txt` / `robots.ts` | Crawlers had no directives | ✅ Fixed (`src/app/robots.ts`) |
| 2 | No `sitemap.xml` | Google had to guess the URL set | ✅ Fixed (`src/app/sitemap.ts`) |
| 3 | No `metadataBase` | OG/canonical URLs resolved relative → broken social previews | ✅ Fixed (layout) |
| 4 | Title default was literally `"lionovart.com"` | Zero keywords, zero pull in SERP | ✅ Fixed (v1, refine in copy) |
| 5 | **Zero JSON-LD structured data anywhere** | Invisible as an *entity* to Google rich results + all AI engines | ✅ Fixed (Org, LocalBusiness, WebSite, Service, FAQ, Breadcrumb) |
| 6 | No canonical / `alternates` | Duplicate-URL risk, weaker consolidation | ✅ Fixed (home + service pages) |
| 7 | FAQ content existed but no `FAQPage` schema | Missed the single biggest AEO win | ✅ Fixed (`page.tsx`) |
| 8 | No `manifest`, no theme-color | Weak PWA/mobile signals | ✅ Fixed (`src/app/manifest.ts`) |
| 9 | No `llms.txt` | No AI-engine-friendly summary of the business | ✅ Fixed (`public/llms.txt`) |
| 10 | `images.unoptimized: true` + hotlinked imgur/cloudinary | Core Web Vitals / LCP risk → ranking + UX | ⏳ §7 (perf track) |
| 11 | i18n via `localStorage` (client-only), not URL-based | 5 locales of content are **invisible** to search & AI; no hreflang | ⏳ §8 (structural, separate pass) |
| 12 | `HeroCycling` renders multiple `<h1>` in a loop | Diluted primary-heading signal | ⏳ §7 (copy pass) |
| 13 | Schema/OG referenced image paths that 404 | Social shares + schema `logo`/`image` broken | ✅ Fixed — pointed at real assets (`LOGO.svg`, `LION-CIRCLE.avif`); TODO: dedicated 1200×630 |
| 15 | No `viewport`/`theme-color`, no canonicals on privacy/terms | Minor mobile + duplicate-URL signals | ✅ Fixed (`viewport` export, canonicals) |
| 16 | No `Review`/`aggregateRating` schema | Missing rich-result stars | ⏸ Intentionally deferred — **no real reviews yet; faking them risks a manual penalty.** Add when reviews exist. |
| 14 | Google Business Profile not created | Losing the #1 local lever entirely | 🔴 §9 — **do first** |

---

## 4. Keyword & search-intent map (the input to your copy)

Weight everything to **Calgary local intent first.** Three intent tiers:

### Money / commercial-intent (put these in titles, H1s, service pages)
| Keyword | Target page | Notes |
|---|---|---|
| creative agency Calgary | `/` | Primary brand term |
| brand identity Calgary / logo design Calgary | `/services/brand` | Highest local volume |
| web design Calgary / website developer Calgary | `/services/web` | Strong commercial intent |
| small business website Calgary | `/services/web` | Matches your ICP exactly |
| video production Calgary | `/services/content-studio` | |
| social media management Calgary | `/services/content-studio` | Recurring-revenue intent |
| branding agency Alberta | `/` + `/services/brand` | Regional broadening |

### Informational / AEO (blog/FAQ/answer content — pulls AI citations + top-funnel)
- "how much does a logo cost in Calgary"
- "how much does a website cost for a small business"
- "do I need a rebrand" / "signs your brand looks outdated"
- "freelancer vs agency for branding"
- "what is AEO / how to get found by ChatGPT" (you *sell* this — own the answer)

### Long-tail / near-me (GBP + local pages do the heavy lifting)
- "[restaurant/salon/clinic] branding Calgary", "logo designer near me",
  "affordable web designer Calgary"

**Copy-pass instruction:** weave the money terms into H1/H2/first-100-words of
each matching page *naturally*. One primary term per page. Don't stuff.

---

## 5. What's staged for the copywriting pass

These are **ready to drop in** the moment copy is locked — no research needed,
it's already in this plan:

1. **Final titles & meta descriptions** — I shipped strong v1s (keyword + Calgary).
   Refine the wording to match brand voice; keep the keyword + location.
2. **One `<h1>` per page**, containing the page's primary money keyword.
   Fix `HeroCycling`'s multiple-`<h1>` loop → make the first an `<h1>`, rest `<p>`/`<span>`.
3. **First 100 words** of home + each service page should contain the primary
   keyword and "Calgary" once, conversationally.
4. **FAQ expansion** — add the §4 informational questions (logo cost, website
   cost, freelancer-vs-agency) as real FAQ items. They auto-flow into `FAQPage`
   schema (already wired) → instant AEO surface area.
5. **Alt text** on every meaningful image (describe + occasionally include a keyword).

> **Handoff rule:** when you write copy, keep this plan open. Every headline is a
> chance to land a keyword without sounding like SEO.

---

## 6. What this PR shipped (technical foundation)

All **copy-independent**. New/changed files:

```
src/lib/seo/config.ts     ← single source of truth: NAP, services, locales, socials
src/lib/seo/schema.ts     ← JSON-LD builders (Org, LocalBusiness, WebSite, Service, FAQ, Breadcrumb)
src/lib/seo/JsonLd.tsx     ← server component that emits <script type="application/ld+json">
src/app/robots.ts          ← robots directives + sitemap pointer
src/app/sitemap.ts         ← all indexable routes + service pages
src/app/manifest.ts        ← PWA manifest + theme color
public/llms.txt            ← AI-engine-readable business summary (AEO)
src/app/layout.tsx         ← metadataBase, real title/desc/OG/Twitter, site-wide entity graph
src/app/page.tsx           ← FAQPage schema from live EN FAQ copy
src/app/services/*         ← Service + Breadcrumb schema, canonicals, sharper titles
```

Schema/OG now point at **real existing assets** (`LOGO_PATH`, `OG_IMAGE` in
`config.ts`) so nothing 404s. Remaining polish (optional, not blocking):
- Add a dedicated `public/images/og-default.jpg` (1200×630 JPG/PNG) and swap
  `OG_IMAGE` → it, for the best social previews (AVIF support in scrapers is spotty).
- When social accounts go live, uncomment handles in `SOCIAL_PROFILES`
  (`src/lib/seo/config.ts`) → they flow into schema `sameAs` automatically.

> **Deploy pipeline note:** this project ships via **Google Cloud Build**
> (`cloudbuild.yaml` + `Dockerfile` + custom `server.js`), not Vercel. The Vercel
> preview attached to the PR fails because Vercel can't run a custom-server Next
> app — that's a platform mismatch, **not a code error.** Cloud Build is the
> source of truth for build health.

**Verify after deploy:** `/{robots.txt, sitemap.xml, manifest.webmanifest, llms.txt}`
resolve, and paste the homepage into Google's Rich Results Test → expect
Organization + ProfessionalService + WebSite + FAQPage.

---

## 7. Performance & crawlability track (no-copy-needed, after foundation)

- **Images:** `next.config.ts` has `images.unoptimized: true` and hero images are
  hotlinked from imgur/cloudinary. Move hero/LCP images into `public/`, serve via
  `next/image`, and turn optimization back on. Target LCP < 2.5s.
- **Single H1:** fix the `HeroCycling` multi-`<h1>` loop (§5.2).
- **Reduced-motion:** already respected (good for UX + bots).
- **Lighthouse SEO + CWV** as the pre/post check — make passing the success criterion.

---

## 8. International SEO (deliberately deferred — it's structural)

The site has 5 locales (en/es/fr/it/ko) but switches via `localStorage` —
**search engines and AI only ever see English.** To unlock the other four:

- Move to URL-based locales (`/es`, `/fr`, …) via Next.js i18n routing.
- Emit `hreflang` alternates per locale.
- Localize titles/descriptions/schema per locale.

**Why deferred:** it's a multi-file structural change with real risk, and the
Calgary/English market is the priority for first cash. Revisit when chasing
UK/Europe or Spanish-speaking markets. Tracked as its own workstream.

---

## 9. Local SEO playbook — your single biggest free lever 🔴

You're a **local service business.** For "creative agency Calgary" and every
"near me" search, **Google Business Profile (GBP) > everything on this list.**

1. **Create & verify GBP** (free). Category: "Marketing agency" + secondary
   "Graphic designer", "Website designer", "Video production service".
2. **NAP consistency:** name *LIONOVART*, phone +1-587-897-4772, email
   connect@lionovart.com — **identical** everywhere (site schema already matches).
3. **Get the first 3–5 reviews** via the testimonial-for-discount play in your
   brief. Reviews are the #1 local ranking factor *and* AEO trust signal.
4. **Citations (free):** list LIONOVART on Yelp, Bing Places, Apple Business
   Connect, local Calgary directories, BBB — same NAP each time.
5. **Add street address to schema** once GBP is set up → update `NAP` in
   `src/lib/seo/config.ts` (locality-only is in place now).

---

## 10. AEO playbook — get cited by ChatGPT / Gemini / Perplexity

AI engines cite **entities they understand and trust.** You now have the entity
graph; here's how to win citations:

| Move | Why it works | Status |
|---|---|---|
| `Organization` + `ProfessionalService` schema | Defines LIONOVART as a citable entity with services, area, languages | ✅ Shipped |
| `FAQPage` schema with real Q&As | AI quotes Q&A pairs near-verbatim | ✅ Wired — expand questions (§5.4) |
| `llms.txt` | Gives AI crawlers a clean, factual business summary | ✅ Shipped |
| Answer-style content | Pages that *directly answer* a question rank in AI Overviews | ⏳ Copy/blog |
| Consistent off-site facts (GBP, directories, socials) | AI cross-checks entities across the web before citing | ⏳ §9 |
| Get mentioned on 3rd-party sites (directories, press, partners) | External corroboration → trust | ⏳ Outreach |

**AEO copy pattern for the blog/FAQ:** lead with the answer in the first
sentence, then expand. ("A small-business logo in Calgary typically costs
$300–800. Here's what changes the price…")

---

## 11. Phased roadmap (executable, ≤5 per phase)

### Phase 1 — Foundation & Local (Days 0–7)
- [ ] Merge this PR; deploy; confirm robots/sitemap/llms.txt/manifest resolve.
- [ ] Create + verify **Google Business Profile** (the one move — §12).
- [ ] Add `og-default.jpg` + `lionovart-logo.png` to `public/images/`.
- [ ] Submit `sitemap.xml` in Google Search Console + Bing Webmaster Tools.
- [ ] Validate homepage in Rich Results Test (expect 4 schema types).

### Phase 2 — Copy + Proof (Days 8–30)
- [ ] Copywriting pass using §4 keyword map (one primary term per page).
- [ ] Fix single-`<h1>` + add alt text (§5, §7).
- [ ] Expand FAQ with §4 informational questions → auto-feeds `FAQPage`.
- [ ] Land first 3–5 reviews (testimonial-for-discount) → GBP + a testimonials page.
- [ ] Publish 2 answer-style posts ("logo cost Calgary", "freelancer vs agency").

### Phase 3 — System & Scale (Days 31–90)
- [ ] Optimize images / Core Web Vitals; re-run Lighthouse (§7).
- [ ] Build local landing intent (e.g. "branding for Calgary restaurants").
- [ ] Citations + directory listings (§9.4); monitor GBP insights.
- [ ] Activate social handles → uncomment `SOCIAL_PROFILES` → schema `sameAs`.
- [ ] Decide on i18n URL routing (§8) if pursuing UK/EU or Spanish markets.

---

## 12. The one move (next 24 hours)

**Create and verify the Google Business Profile** — it's free, it's the single
highest-leverage search asset for a Calgary service business, and the site's
schema is already built to match it.

---

*Measurement: track Search Console impressions/clicks/avg-position, GBP
calls/direction-requests, and "branded vs non-branded" query split monthly.
Pre/post Lighthouse SEO score is the technical success criterion.*
