# 🎨 Client Portal — Design System

> Read this before writing any portal UI. "Premium", "sleek" and "modern" are not instructions — they produce the generic result they're trying to avoid. What follows are **decisions**. Follow them and the portal stays one coherent product; deviate only with a reason you could defend out loud.

---

## The thesis

> **The client should feel the studio is ahead of them.**

Not "powerful software". Not "a dashboard". The feeling to engineer is *calm certainty* — opening the portal should answer "where are we?" before they finish reading the first line, and never make them hunt.

Three consequences that decide real arguments:

1. **Information before interface.** A number, a name, a date — before a card, a chip, or an icon. If a screen's chrome outweighs its content, the screen is wrong.
2. **The studio never looks busy.** No spinners where a skeleton will do, no "syncing…", no progress theatre. Work appears finished because it is.
3. **Nothing that isn't true.** No fake activity, no placeholder avatars, no "3 people viewing". An honest empty state beats a populated fake one, always.

---

## Foundations

### Type

Clash Display for headings, DM Sans for everything else. Both already loaded via `@/lib/fonts`.

| Role | Class | Why |
|---|---|---|
| Page title | `font-heading text-3xl md:text-4xl font-bold tracking-[-0.025em] leading-[1.05]` | Tracking tightens as size grows — large type reads too loose at default |
| Section title | `font-heading text-lg font-semibold` | |
| Section label | `text-muted-foreground text-sm font-medium` | The quiet header above a group |
| Eyebrow | `text-[13px] font-medium tracking-[0.16em] uppercase text-muted-foreground` | Sparingly — one per page at most |
| Body | `text-[15px] leading-relaxed` | 15px, not 14 — this is read, not scanned |
| Meta | `text-xs text-muted-foreground` | Dates, counts, states |
| Numbers | add `tabular-nums` | **Always.** Percentages that shift width as they change look broken |

**Never** set `letter-spacing` once for everything. Tighten display type, leave body at zero.

### Space

A 4px grid, but only these steps: **4 · 8 · 12 · 16 · 20 · 24 · 32 · 40**. Vertical rhythm inside a page:

```
Page title → 28px (mt-7) → first section
Section    → 32px (mt-8) → next section
Label      → 12px (mb-3) → its content
Card       → 20px (p-5) mobile · 24px (p-6) desktop
```

Consistent rhythm is most of what reads as "designed". Arbitrary gaps are most of what reads as generated.

### Surface & depth

Depth comes from **borders and background**, not shadow. Shadows are for things that genuinely float — dialogs, popovers, toasts.

| Layer | Treatment |
|---|---|
| Page | `bg-background` |
| Card | `bg-card border border-border rounded-2xl` — no shadow |
| Floating | `+ shadow-lg` |
| Chrome | `.portal-glass` — translucent, content scrolls under |

`--radius: 0.625rem` in the portal scope. `rounded-2xl` for cards, `rounded-xl` for controls, `rounded-full` for pills and status dots. **A 52px control at the marketing site's radius becomes a capsule** — that's why the portal retunes it.

### Colour

Black · red `#e5192a` · gold · off-white. Everything through semantic tokens (`bg-card`, `text-muted-foreground`) — **never a hardcoded hex in a component**, or light mode breaks silently.

**Red is scarce and it means something:** work in flight, the primary action on a screen, the active nav marker. A red badge on every chip destroys the signal. If two things on screen are red, one of them is probably wrong.

Status colour carries information: `active` → red, `review` → gold, `delivered` → green, everything else → neutral. See `statusBadgeVariant()`.

---

## Composition

Every page follows the same skeleton. A client should never have to relearn where things are.

```
[eyebrow — desktop only, workspace name]
[H1 — the answer to "where am I"]

[section label]
[content]

[section label]
[content]
```

Rules that keep it honest:

- **One H1 per page**, and it says something. "Welcome back, Dana." beats "Dashboard".
- **Content column caps at `max-w-5xl`.** Prose and empty states cap tighter (`max-w-xl`) — a two-line paragraph stretched to 1500px looks broken. This was a real bug in Phase 2.
- **The most important thing is highest.** On Overview that's progress; on a project it's the rail. Never open with filters or toolbars.
- **Sections separated by space, not dividers.** Reach for a border only when two things would otherwise be mistaken for one.

---

## Motion

From `apple-design`. Motion explains change; it is never decoration.

| Situation | Spring | Note |
|---|---|---|
| Default UI | `bounce: 0, duration: 0.3–0.4` | Critically damped, no overshoot |
| After a real gesture | `bounce: 0.2` | **Only** when a flick or drag preceded it |
| Colour/opacity | `duration-150 ease-out` | |

**Non-negotiable:**

- **Feedback on `pointerdown`, not click.** Waiting for release feels dead. The `ThemeToggle` commits on pointer-down for exactly this reason.
- **`active:scale-[0.985]`** on pressable surfaces. Small enough to feel physical, not bouncy.
- **Every `layoutId` gets a `useId()` suffix.** Two instances sharing one makes the indicator fly across the screen. This shipped once already.
- **Reduced motion** — cross-fade, don't shorten. `useReducedMotion()` → `{ duration: 0 }`.
- Animate **`transform` and `opacity`** only. Anything else drops frames on a mid-range Android.

---

## Mobile is the real target

Most clients open this on a phone, standing up, between other things.

- **Thumb reach.** Primary actions in the lower half. The tab bar and sheet actions are there for a reason; a top-right "Save" is a stretch.
- **44px minimum** touch target. The tab bar is 56px.
- **Safe areas always** — `env(safe-area-inset-bottom)` on anything fixed to the bottom, `dvh` not `vh`.
- **16px minimum font on inputs**, or iOS Safari zooms the viewport on focus and the layout jumps. `Input` already handles this.
- **Sheets, not centre modals.** `DialogContent` is already a bottom sheet below `sm`.
- **No hover-only affordances.** Anything reachable only by hover doesn't exist on a phone.

---

## The three signature moments

Most of a product is competent. What makes it feel crafted is a small number of interactions that are *unusually good*. Spend disproportionate effort here.

**1 · Tapping a milestone node.** *(built)* One tap moves the project forward. The node fills, the connector colours, the percentage counts up. No form, no dialog. This is the studio's most frequent action — it should feel like flicking a switch.

**2 · Dropping a pin on a design.** *(Phase 4)* Touch the image, a pin lands *under the finger* on pointer-down, a composer rises from the bottom. Zero chrome between "I see a problem" and "I've said it". This is the feature clients will describe to other people — it has to be effortless.

**3 · The approval decision.** *(Phase 4)* Two buttons, unmistakable, no dialog for approve. Requesting changes opens a composer, because a rejection without a reason costs a round trip. The moment of decision should feel weighty and take one tap.

---

## Forbidden — the anti-slop list

`PRODUCT.md` bans the generic-SaaS look. Concretely, do not ship:

| ❌ | Instead |
|---|---|
| Gradient hero banners, pastel washes | Flat brand surfaces |
| Cards floating on shadow with no border | Border-defined cards |
| A "stats row" of four big meaningless numbers | One number that matters, in context |
| Emoji as UI icons | Lucide, sized `14–19px` |
| Generated avatars, initials circles, illustrated blobs | Real photos or nothing |
| Fake activity, sample names in production | Honest empty states |
| Glass on everything | Glass on chrome only |
| Confetti, celebration animation | The result, stated plainly |
| Three font weights in one paragraph | Two weights per screen |
| Icon + label + badge + chevron on every row | Whatever the row actually needs |
| "Loading…" spinner on a full page | Skeleton matching the real layout |

**The test:** if a screenshot could belong to any B2B SaaS, it's wrong. It should be recognisably LIONOVART.

---

## Accessibility is part of the design

Not a pass at the end. Non-negotiable per screen:

- **Visible focus everywhere** — `focus-visible:ring-3 focus-visible:ring-primary/50`. Never remove an outline without replacing it.
- **AA contrast**: 4.5:1 body, 3:1 large. Measure, don't eyeball — the badge bug in Phase 2 was invisible by eye and obvious in `getComputedStyle`.
- **Keyboard-complete.** Every drag has a keyboard equivalent. Every dialog traps focus and returns it.
- **Semantic first.** A button that navigates is a link. A list is a `<ul>`. `aria-*` patches what markup can't express — it isn't a substitute for the right element.
- **Names that make sense alone.** "Delete milestone Discovery", not "Delete".
- **Not-yet-built items** get an `sr-only` "Coming soon" — the tab bar has no room for a visible marker.

---

## Writing

The interface's voice is the studio's voice: direct, unhurried, never chirpy.

- **Say the thing.** "Nothing needs you right now." not "You're all caught up! 🎉"
- **Empty states state a fact and, if there's an action, offer it.** Never apologise.
- **Errors say what happened and what to do.** "Couldn't update that milestone" — not "Something went wrong".
- **Buttons are verbs.** "Create project", "Request changes". Never "Submit", never "OK".
- **No exclamation marks.** No "Oops". No "Awesome".
- **Sentence case** everywhere except the uppercase eyebrow.

---

## Before you call a screen done

- [ ] Reads as LIONOVART, not generic SaaS — check it against the forbidden list
- [ ] 375px → 1440px, no horizontal scroll, both themes
- [ ] Keyboard-complete, visible focus, AA contrast **measured**
- [ ] Empty, loading and error states all designed — not afterthoughts
- [ ] Motion respects `prefers-reduced-motion`; no `layoutId` collisions
- [ ] Touch targets ≥44px; nothing important above the thumb line on mobile
- [ ] Numbers are `tabular-nums`; no hardcoded colour anywhere
- [ ] One H1, one primary action, red used once
