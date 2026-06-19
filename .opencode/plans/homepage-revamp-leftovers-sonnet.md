# Homepage Revamp — ALL TASKS DONE (2026-06-16)

All 14 tasks from `homepage-revamp-2026-06.md` are **done and verified**
(typecheck clean; key changes screenshot/DOM-verified). This doc is kept as a
record. Final notes on the two formerly-deferred tasks below.

- **1.2 (docked-logo layering):** logo is **behind** the navbar while flying,
  then **on top** once docked. A `docked` flag in `HeroLogoFly.tsx` (set via
  `useMotionValueEvent` on scroll, threshold `scrollY ≥ dims.end·0.99`) toggles
  the fixed wrapper `z-30 → z-[60]`. No store, Navbar untouched. Verified:
  flying z-30 (behind), docked z-60 (over bar + dropdown).
- **2.1 (video gap):** `DisciplineSplit3D.tsx` L169 sticky frame switched
  `items-center → items-start` + `pt-[7vh] md:pt-[8vh]`. Pinned video top
  162→67px (desktop) / 57px (mobile); clears navbar, no overflow.

> **Branch:** `claude/blissful-germain-af1833` (worktree). Nothing committed yet.

---

## Tooling note — how to actually see this page (READ FIRST)

This page is heavy (4 videos + GSAP pins + Lenis smooth-scroll). Two gotchas:

1. **Screenshots time out** unless you pause video first:
   ```js
   // preview_eval before any preview_screenshot
   document.querySelectorAll('video').forEach(v => { try { v.pause(); } catch(e){} })
   ```
2. **Lenis hijacks scroll** — `window.scrollTo` / setting `scrollTop` gets
   re-smoothed away, and `window.lenis` is only a version stub (no `.scrollTo`).
   What works: `el.scrollIntoView({behavior:'instant', block:'start'})` on the
   target `[data-nova-section="..."]`, then screenshot **immediately** (Lenis
   drifts within ~300ms, so don't dawdle between the eval and the shot).

Server: `preview_list` → use the `lionovart-dev` serverId (port 3737).

Section ids: `hero · what-we-do · about · problems · offer · services · process ·
comparison · testimonials · faq · closing-cta`.

---

## Task 2.1 — Close the gap above the splitting video

**File:** `src/components/sections/what-we-do/DisciplineSplit3D.tsx`

**What's happening (measured):**
- The section is `height: 230vh` (L167) with a `sticky top-0 h-screen
  items-center` inner frame (L169). The video card is therefore **vertically
  centered** in each viewport while the section scrolls.
- Order on the page is: `hero` (ends with the trust badges, which live *inside*
  `HeroTop`) → `what-we-do` (this split section). So the "gap" the plan means is
  the **empty band at the top of the split section**, between the hero/badges
  above and the centered video.
- Measured: hero ends ≈ 945px; split section spans 945→3130px (2186px ≈ 230vh).

**Goal:** trim that top dead-space so the video sits closer (~just below) the
hero/badges instead of floating in the middle of the first viewport — "close,
not flush."

**Recommended edit (low risk, reversible):** nudge the sticky frame to align the
card toward the top instead of dead-center. At L169:
```tsx
// from:
<div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-3 md:px-4">
// to (align toward top with a controlled offset):
<div className="sticky top-0 flex h-screen items-start justify-center overflow-hidden px-3 md:px-4 pt-[12vh] md:pt-[14vh]">
```
Then, if the section now feels too tall for the (shorter) travel, reduce the
section height a notch at L167 (`230vh` → try `200vh`). **Do this second and only
if needed** — height changes the scroll-linked split timing (`p` transform at
L154 maps scroll `0.12→0.62`), so re-verify the split still completes before the
section ends.

**Verify (must do all):**
1. `scrollIntoView` `what-we-do`, screenshot: video should start near the top,
   close under the hero — not centered with a big blank band above.
2. Scroll through the section: the 3-way split + card content reveal still
   completes smoothly (no premature cut-off, no extra empty tail).
3. Mobile (`preview_resize mobile`) + desktop both look right.

**Guardrail:** don't touch the `Slice` transforms or the `bgColor`/`p` mappings.
Only the sticky-frame alignment (L169) and, if necessary, the `230vh` (L167).

---

## ✅ Task 1.2 — DONE (docked logo layering) — reference only

**Decision (user override of the original plan):** the docked logo must stay ON
TOP of the navbar **and** the dropdown menu — never behind. So `HeroLogoFly.tsx`
keeps its fixed wrapper at `z-[60]` (root) in all states; nav is `z-50` and its
dropdown panels are `-z-10` inside that context, so the logo always renders
above both. Verified: menu open → flier z-60, logo paints over the menu panel.
(An earlier attempt to sink the logo behind the open menu via a `ui-store`
`menuOpen` flag was reverted per the user; that store is deleted and
Navbar/HeroLogoFly are back to their original z-indices.) The sticky-pin
sub-part was N/A (logo docks at `0.55vh`, hero exits ~`0.9vh`).

<details><summary>Original 1.2 brief (kept for context)</summary>

**Files:** `src/components/ui/HeroLogoFly.tsx`, `src/components/sections/Navbar.tsx`

**Confirmed bug (reproduced):** scroll past the hero so the logo is docked, open
the mobile menu — the docked "LIONOVART" wordmark renders **in front of** the
white menu panel's top-left corner. Same root cause would affect the desktop
Expertise band where they overlap.

**Why it's fiddly (don't fight it the naive way):**
- The flier is `fixed ... z-[60]` at the document root (`HeroLogoFly.tsx:62`).
- The navbar is `fixed ... z-50` (`Navbar.tsx:242`). The Expertise band
  (`Navbar.tsx:428`) and mobile dropdown (`Navbar.tsx:472`) are **inside** that
  `z-50` stacking context at `-z-10`. Local z-index **cannot escape** the parent
  context, so they can never beat the root `z-[60]` flier by raising their own z.
- **Do NOT just lower the flier's z.** If the flier drops below the nav, the
  bar's dark glass layer (`Navbar.tsx:263`, `rgba(0,0,0,0.20)` + blur, opacity 1
  once past hero) paints over the docked logo and dims/blurs it — the nav's own
  logo sits *above* that glass, so the two would mismatch.

**Recommended fix (smallest blast radius): drop the flier's z ONLY while a menu
is open.** A dimmed logo for the brief moment a menu is open is acceptable — the
menu is the foreground then.

1. Add a tiny shared flag. New file `src/lib/stores/ui-store.ts`:
   ```ts
   import { create } from "zustand";
   type UiStore = { menuOpen: boolean; setMenuOpen: (v: boolean) => void };
   export const useUiStore = create<UiStore>((set) => ({
     menuOpen: false,
     setMenuOpen: (v) => set({ menuOpen: v }),
   }));
   ```
   (zustand is already a dependency — see `src/lib/stores/nova-store.ts`.)

2. In `Navbar.tsx`, mirror the menu state into the store. After the existing
   state hooks, add:
   ```ts
   const setMenuOpen = useUiStore((s) => s.setMenuOpen);
   useEffect(() => {
     setMenuOpen(isMobileOpen || expertiseOpen || mobileExpertiseOpen);
   }, [isMobileOpen, expertiseOpen, mobileExpertiseOpen, setMenuOpen]);
   ```
   (Confirm those three state vars exist — grep `isMobileOpen`, `expertiseOpen`,
   `mobileExpertiseOpen`. Import `useEffect` and `useUiStore`.)

3. In `HeroLogoFly.tsx`, read it and lower the wrapper z when a menu is open. The
   wrapper at L62 is `... z-[60] ...`; make it dynamic:
   ```tsx
   const menuOpen = useUiStore((s) => s.menuOpen);
   // ...
   <div className={`fixed top-[11vh] left-1/2 -translate-x-1/2 ${menuOpen ? "z-30" : "z-[60]"} pointer-events-none select-none`}>
   ```
   `z-30` is below the nav's `z-50`, so the open panel covers the logo.

**Verify (all four states):**
1. Hero, before scroll: logo flies/docks normally, rides above the (transparent)
   bar — unchanged.
2. Docked + mobile menu open: menu panel now renders **over** the logo. ✅
3. Docked + desktop Expertise band (hover the Expertise nav item in hero mode):
   panel over logo. Note: the band only shows in `heroMode`, so this overlaps the
   *flying* logo, not the docked one — confirm it still looks right.
4. Close menu: logo returns to crisp `z-[60]`, no dimming.

### 1.2 part two — hero sticky pin (verify first, probably skip)
Plan wanted a short sticky hold so the logo docks before the hero releases.
**Measured: likely already fine** — the flier finishes docking at
`scrollY = vh * 0.55` (`HeroLogoFly.tsx:33`), while the hero (`min-h-[90vh]`)
doesn't leave until ~`0.9 vh`. So docking completes well before the hero exits.
**Action:** scroll the hero slowly and watch — if the logo clearly lands before
the hero scrolls away (it should), do nothing and mark this part N/A. Only if it
lags, add a short pin; keep it ≤ 0.4 viewport and verify it doesn't shove the
`what-we-do` section or fight Lenis.
</details>

---

## Done-already (do not redo) — for context
1.1 hero CTA copy · 1.3 scarcity pill · 1.4 hero bottom black · 3.1 about top pad
· 3.2 bold headline · 3.3 clip-mask reveal · 3.4 paint crop · 4.1 lion-circle
emblem · 4.2 imagine card +15% · 4.3 mobile stat trim · 4.4 3-point rewrite
(EN+FR) · 4.5 in-card marquee removed + X-cross band.

Final check after your two tasks: `npx tsc --noEmit` (must be exit 0).
