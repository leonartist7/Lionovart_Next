> ⚠️ **SUPERSEDED by `MASTERPLAN.md`.** Its diagnosis survives in MASTERPLAN §2; its build phases are replaced by §6.
> Read this file for history only, never for direction.

# LIONOVART — Conversion Funnel Plan

> **Primary goal:** Book a call — captured *through NOVA* (the AI strategist).
> **Lead magnet:** Free audit. Visitor leaves **website URL + email + socials**; Leon sends back a personalized audit (website + social + brand).
> **This doc:** the funnel spine, page map, lead-magnet mechanics, and a phased build order. Code comes after sign-off.

---

## 1. The problem we're fixing

The site is beautiful but **showcase-shaped, not funnel-shaped**:

- One CTA path (NOVA chat / WhatsApp). No low-friction fallback → not-ready visitors leave with nothing.
- No lead magnet → no reason to give contact before they're sales-ready.
- Cinematic scroll (curtain, sticky hero, title cards) delays the offer and buries CTAs.
- No single narrative spine: pain → outcome → proof → offer → action.
- Missing: case studies, pricing, dedicated booking endpoint, thank-you page (= no tracking).

**Decision:** keep the cinematic art, but bolt a **clear conversion layer** on top of it. Beauty stays; clarity gets added, not traded away.

---

## 2. The funnel spine

Every section, every page, every CTA serves one of these six stages. If a section serves none → cut or demote it.

```
1. PAIN FELT      → visitor sees their own problem in our words
2. OUTCOME SHOWN  → the after-state they want, made vivid
3. PROOF          → case studies + testimonials + numbers
4. OFFER CLEAR    → what we do, for whom, what it costs (range)
5. ACTION         → ONE primary CTA + ONE soft fallback, repeated
6. NURTURE        → email captured via magnet → audit → follow-up → call
```

**Two CTAs, everywhere, ranked:**

| Tier | CTA | Mechanism | For whom |
|------|-----|-----------|----------|
| **Primary (hot)** | "Talk to NOVA / Book a call" | opens NOVA → books call | sales-ready visitors |
| **Soft (warm)** | "Get your free audit" | URL + email form → Firestore | not-ready visitors |

The soft CTA is the new keystone. It converts the 90%+ who won't chat yet, and feeds them into NOVA later.

---

## 3. Page map (information architecture)

### Existing
- `/` — homepage (long cinematic scroll) ✅
- `/services` + `/services/{brand,web,content-studio}` ✅
- `/privacy` ✅

### New pages to add (priority order)

| # | Page | Route | Purpose | Stage |
|---|------|-------|---------|-------|
| 1 | **Free Audit landing** | `/audit` | dedicated magnet capture page (URL+email+socials) | ACTION/NURTURE |
| 2 | **Thank-you** | `/audit/thanks` | confirms submission, sets expectation, soft-pitches the call | NURTURE |
| 3 | **Book a call** | `/call` | NOVA-first booking endpoint (fallback: direct calendar) | ACTION |
| 4 | **Case studies index + detail** | `/work`, `/work/[slug]` | deep proof: before/after, numbers, process | PROOF |
| 5 | **Pricing / packages** | `/pricing` | kills #1 objection, pre-qualifies leads | OFFER |

> Case studies + pricing can pull from Sanity (already wired) instead of hardcoding.

---

## 4. Lead magnet — mechanics

**Offer name (draft):** *"Free 5-minute Brand & Conversion Teardown"*
**What they give:** name, email, website URL, (optional) main social handle.
**What they get:** a personalized Loom/PDF audit of website + socials + brand within 48h.

### Why this works
- Specific + low-effort for them, high-value perceived.
- Demonstrates expertise *before* the sale (reciprocity).
- The audit IS the pitch — ends with "book a call with NOVA to fix this."

### Wiring (reuse existing infra — no new backend)
`/api/strategist/lead` already writes to Firestore `leads`. Extend the `LeadBody` interface:

```ts
// add to LeadBody in src/app/api/strategist/lead/route.ts
website_url?: string;
socials?: string;
// and persist them in the adminDb.collection("leads").add({...})
```

Submit from `/audit` with `source: "audit_magnet"`, `contact_type: "email"`.
Leads land in the same dashboard as NOVA leads, tagged by source → one inbox.

### Flow
```
/audit  →  submit (name,email,url,socials)  →  POST /api/strategist/lead {source:"audit_magnet"}
        →  /audit/thanks  →  "We'll send your audit in 48h. Want it faster? Talk to NOVA now →"
        →  (offline) Leon sends audit  →  audit ends in "Book a call" CTA  →  NOVA  →  booked
```

---

## 5. Homepage changes (surgical, keep the art)

Don't rebuild the scroll. Add a conversion layer:

1. **Sticky CTA bar / button** — persistent "Free Audit" + "Talk to NOVA" once hero scrolls past. Catches scroll-and-leave.
2. **Hero soft CTA** — hero currently has ONLY the NOVA button. Add secondary text link: "or get a free audit first →".
3. **Mid-scroll magnet block** — one `/audit` capture strip after the Proof/Testimonials section (peak trust = peak conversion).
4. **Exit-intent** (desktop) — modal offering the audit when cursor leaves viewport.
5. **Sharpen Problems section copy** — make PAIN FELT explicit and in the visitor's words.

---

## 6. Build phases

```
Phase A — Magnet core (highest ROI)
  A1. Extend /api/strategist/lead with website_url + socials   → verify: lead doc has fields
  A2. Build /audit landing + capture form                      → verify: submit writes to Firestore
  A3. Build /audit/thanks                                      → verify: redirect after submit
  A4. Add sticky CTA bar + hero soft-CTA link                  → verify: visible after hero scroll

Phase B — Conversion endpoints
  B1. /call page (NOVA-first, calendar fallback)
  B2. Mid-scroll magnet strip on homepage
  B3. Exit-intent modal (desktop)

Phase C — Proof + offer depth
  C1. /work case studies (Sanity-backed)
  C2. /pricing packages page

Phase D — Measure
  D1. Event tracking on every CTA (audit submit, NOVA open, call booked)
  D2. Funnel dashboard: visitors → audit leads → NOVA convos → calls booked
```

**Recommended start: Phase A.** Smallest change, biggest conversion lift, reuses existing backend.

---

## 7. Success criteria (so we know it worked)

- Audit-magnet form submits and writes a Firestore lead tagged `audit_magnet`. ✅ verifiable
- Every page exposes both CTAs (primary NOVA + soft audit) above the fold. ✅ verifiable
- Funnel is measurable end-to-end: visitor → lead → NOVA → call. ✅ verifiable
- Target metric: **email-capture rate** (audit submits ÷ visitors). Baseline today ≈ 0 (no capture). Any number > 0 is progress; aim 2–5%.

---

## 8. Open questions for Leon

1. **Calendar tool** for `/call` — Calendly, Cal.com, or NOVA-only (no external)?
2. **Audit delivery** — manual Loom by you, or semi-automated PDF?
3. **Pricing** — show real numbers, "starting at" ranges, or "request quote"?
4. **Case studies** — do you have 2–3 real projects with metrics we can publish?
```
