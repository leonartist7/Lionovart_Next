# Testimonial Approvals

> **Why this file exists.** The quotes on the site are edited for length and clarity.
> An edited quote attributed to a named, real business is fine once that client has
> seen it and confirmed it is accurate. Until they confirm, it is a draft.
> This file is the record. Governed by `MASTERPLAN.md` §4.
>
> **The rule:** a row cannot be marked `approved` by anyone except Leon, after the
> client replies. Executing models never change a status.

---

## How to clear this list (about 30 minutes, once)

Send each client their row. One message, any channel they already use with you.

> Hi {name} — quick one. I'm putting your feedback on the new LIONOVART site and
> I tightened the wording so it reads well on the page. Before it goes live I want
> your OK on it, and on the number next to it.
>
> **Quote:** "{quote}"
> **Figure shown:** {stat} {statLabel}
>
> Accurate? Reply yes and I'll publish it. Want it changed, or would you rather I
> use just your first name or no photo? Say the word, no problem at all.

Their reply is the permission record. Save it (screenshot or forwarded email) in
`/permissions/{id}.png` and set the row to `approved` with the date.

---

## Status

`draft` = edited, not yet sent · `sent` = awaiting reply · `approved` = client confirmed

| id | Name | Business · Region | Quote status | Figure status | Approved on |
|---|---|---|---|---|---|
| `marc` | Marc | Northline Motors · Canada | draft | reported | — |
| `mateo` | Mateo | e-commerce · Canada | draft | reported | — |
| `minji` | Min-Ji | clothing label · Korea | draft | **estimated** | — |
| `haeun` | Ha-eun | lifestyle store · Korea | draft | **estimated** | — |
| `jae` | Jae | motorcycle dealership · Korea | draft | reported | — |
| `lumura` | Lumura | Realtor · Tuscany, Italy | draft | **estimated** | — |
| `odace` | Odace | Luxury Jewellery · France | draft | **estimated** | — |
| `dan` | Dan | dental clinic · UK | draft | **estimated** | — |
| `jess` | Jess | Glow Beauty Studio · UK | draft | **estimated** | — |
| `miller` | Miller & Carter | Steakhouse · UK | draft | reported | — |
| `matt` | Matt | private clinic · Canada | draft | reported | — |
| `maya` | Maya | Maison Fleur · Canada | draft | **estimated** | — |
| `sergio` | Sergio | Photographer · Spain | draft | reported | — |
| `jim` | Jim | Sakura Trails · Korea | draft | reported | — |
| `pablo` | Pablo | boutique hotel · Spain | draft | reported | — |
| `ben` | Ben | SaaS startup · UK | draft | reported | — |
| `seoyeon` | Seo-yeon | coffee shop · Korea | draft | **estimated** | — |
| `bc` | Brin de Causette | Artisan Home Decor · France | draft | **estimated** | — |
| `rocco` | CocoRocco | Restaurant | not edited | none | — |
| `fortyseven` | Forty Seven | Hotel | not edited | none | — |
| `lahaut` | Lahaut | Restaurant | not edited | none | — |
| `podium` | Podium | Restaurant | not edited | none | — |

Ids match `PAGES` in `src/components/sections/Testimonials.tsx` and `PARTNERS` in
`src/components/sections/TestimonialsCarousel.tsx`.

---

## The estimated figures — decide before launch 🔴

Eight cards carry `statKind: "estimated"` — a number LIONOVART calculated, not one
the client reported. They render under an "Est. impact" label, which is honest
labelling, but the number still reads as a claim about that named business.

Three options, in order of preference:

1. **Ask.** The approval message above already asks. If the client confirms the
   figure, flip it to `statKind: "reported"` and it becomes real proof. Best outcome.
2. **Drop the figure**, keep the quote. Remove `stat`/`statLabel` from that card.
   The card still works; the layout already handles cards without a stat.
3. **Keep it estimated.** Only acceptable while the "Est. impact" label stays
   visible and legible. Never remove that label to tidy up the design.

Never invent or raise a figure to fill a gap.
