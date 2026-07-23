# Cleanup log — Lionovart

Branch: `feat/cleanup-legacy-scripts-main-page`  
Started: 2026-07-16  
Policy: **archive first, delete only after confirmation**

---

## Phase 0 — Inventory

- Root had **58** one-off `*.js` files + `test-perspectives.mjs` + `test-raw.cjs`.
- Production-relevant root JS: `server.js`, `ws-dev.js` only.
- None of the one-off scripts were imported by the Next app or referenced in Dockerfile/`package.json` (except the two kept files).

## Phase 1 — Legacy scripts archiving (done)

**Action:** Move (not delete) one-off scripts and log dumps into `_archive/legacy-scripts/`.

| Metric | Value |
|--------|--------|
| Files archived | 61 (+ README) |
| Root `*.js` remaining | `server.js`, `ws-dev.js` |
| Expected Lighthouse change | None (never in client/server bundles) |
| Expected maintainability | High — root declutter, lower risk of re-running codemods |

### Archived categories

1. **Codemods** — `apply-*`, `fix-*`, `update-*`, `remove-*`, `optimize-*`, `replace-*`, `clean-*`, `tighten-*`, etc.
2. **Smoke tests** — `direct-test*`, `run-test.js`, `test-client.js`, `test-sanity*`, `test-perspectives.mjs`, `test-raw.cjs`
3. **Log dumps** — `dev.log`, `dev_output.txt`, `lint_output.txt`

### Not archived (kept)

- `server.js`, `ws-dev.js`
- All of `src/`, `public/`, `docs/`, skills, config files

### Note

Windows reserved file `nul` at repo root could not be moved via normal paths; leave for a later OS-specific cleanup if still present.

---

## Phase 2 — Main page code cleanup (done)

### `src/app/layout.tsx`

| Change | Reason | Impact |
|--------|--------|--------|
| Removed commented `BackgroundTexture` import + JSX | Dead; component unused by request | Maintainability |
| Removed 3 global `<link rel="preload">` tags | Imgur URLs unused in `src/`; lion emblem only mid-page (Comparison/etc.), not LCP | **LCP / network** |
| Trimmed redundant JSX comments | Noise only | Maintainability |

### `src/app/page.tsx` / `PageBuilder.tsx`

Comment tidy only; section order and imports unchanged.

### `src/app/globals.css` (Phase 2)

| Removed | Reason |
|---------|--------|
| `@keyframes metal-shimmer` | No references |
| `@utility glass-panel` | Unused |
| `@utility glass-surface-light` | Unused |
| `@keyframes speaking-ring` | Unused |

---

## Phase 3 — Unused components archive (done)

**Action:** Import-graph audit → move orphans to `_archive/unused-components/` (not delete).  
**Also:** strip CSS only used by archived components from `globals.css`.

### Archive inventory (~30 files, ~224 KB source)

| Category | Files |
|----------|--------|
| Old sections | `About`, `HeroLion`, `LumaShowcase`, `Portfolio`, `Reality`, `HeroRevealWrapper`, `VideoCurtainReveal` |
| Eval toggles | `AboutVariantToggle`, `ServicesVariantToggle` (stores **kept** — still used) |
| Orphan service/what-we-do | `BrandSystemReveal`, `MonogramDrawScene`, `VariantCards` |
| Orphan UI | `BackgroundTexture`, `HeroDecree/Monogram/Wordmark`, `HeroFocalPicker`, `HeroImageCycler`, `ImageMarquee`, `SectionReveal`, `InkRevealCurtain` |
| Blocks / library | `expandable-bento-grid`, `interactive-bento-gallery`, duplicate `library/ProblemsSolvedSection` |
| Demo routes | `/red-demo`, `/hero-fx-preview`, `/ink-preview` + `components/preview/*` |

### CSS removed with archive

| Removed from `globals.css` | Reason |
|----------------------------|--------|
| `@keyframes carousel-spin` | Only `ImageMarquee` (archived) |
| `--luma-accent` root token | Only `LumaShowcase` (archived) |
| Texture CSS vars + `.bg-texture-*` | Only `BackgroundTexture` (archived) |
| `body.no-herobg .hero-bg-layer` | Only `HeroRevealWrapper` (archived) |

### Kept (still live)

| Item | Reason |
|------|--------|
| `aboutVariantStore.ts` | Used by `AboutUsHalf` |
| `servicesVariantStore.ts` | Used by `Services` |
| `src/app/v2` + `components/v2` | Rebrand track |
| Service pages + shared scenes | Funnel pages |
| Live `ProblemsSolvedSection` in `sections/` | On homepage |

### Expected impact

| Area | Expected |
|------|----------|
| Landing visual | **Identical** (orphans were never imported by `PageBuilder`) |
| Maintainability | High — fewer false “which About?” files |
| Bundle (dev/IDE) | Faster navigation; production already tree-shook unreferenced modules |
| CSS payload | Smaller (texture + dead keyframes gone) |
| Routes | `/red-demo`, `/hero-fx-preview`, `/ink-preview` no longer exist |

---

## Phase 4 — Lock defaults + final archive (done)

### Code

| File | Change |
|------|--------|
| `AboutUsHalf.tsx` | Removed `useImagePos`; locked mobile portrait **below** text (was default `"bottom"`) |
| `Services.tsx` | Removed `useServicesStyle` / neumorphic branches; locked **flat** style |
| Stores | Moved to `_archive/unused-components/sections/...` |
| `liquid-buttons/` | Moved to `_archive/liquid-buttons/` (never imported by app) |

### Expected visual impact

| Area | Impact |
|------|--------|
| About mobile | Same as previous default (portrait bottom) |
| Services | Same as previous default (flat, not neumorphic) |
| Rest of site | Unchanged |

### Still deferred (user / later project)

1. Hard-delete `_archive/` after stable deploys + explicit OK  
2. Image / video Core Web Vitals pass  
3. v2 rebrand merge or retirement  
4. Permanent `nul` Windows artifact at root  

### Config

| File | Change |
|------|--------|
| `tsconfig.json` | `exclude: ["node_modules", "_archive"]` so archived TSX is not typechecked |

### Verification

- `npm run build` — **passed** (exit 0). Live routes: `/`, `/services/*`, `/privacy`, `/terms`, `/v2`. Demo routes gone.
- Recommend: `npm run dev` visual QA for About mobile + Services + full scroll.

---

## Phase 5 — Broken testimonial asset paths (done)

JPGs under `public/images/Testimonials/` were already deleted in the working tree and replaced with `.avif` (Marc moved to `Northlinemotors/`). Live components mostly pointed at AVIF already; **hero badges + `en.ts` still pointed at missing JPGs**.

| File | Change |
|------|--------|
| `TrustedBadgesSection.tsx` | Avatar stack → existing `.avif` / Marc path |
| `src/lib/i18n/locales/en.ts` | All review `image` fields → on-disk assets |
| Defne portrait | No file remains → `Italy/Lumura/Team2025.avif` stand-in |

**Expected impact:** Hero trust badges no longer 404; slightly better LCP/network (AVIF where available).  
**Note:** Staging deleted JPGs as part of this branch is correct once paths are updated.

---

## Phase 6 — Finish remaining follow-ups (done)

| Item | Resolution |
|------|------------|
| **CWV / media** | Scene video mounts only after scroll-arm; `VideoBackdrop` `preload=metadata`; Services images → Cloudinary `f_auto,q_auto,w_900`; Clash font drop 200/300 weights; Unsplash avatars → local testimonial assets |
| **next.config** | Drop unused Imgur/Unsplash remotePatterns (Cloudinary only) |
| **PageBuilder** | Static-only layout; dead CMS `blocks` switch removed |
| **docs/v2-screenshots** | gitignored (local dumps, ~11MB) |
| **scripts/** | `scripts/README.md` — convention for future one-offs |
| **`_archive/`** | **Kept** (user declined hard-delete; still excluded from TS) |
| **`/v2`** | **Kept** parallel rebrand track |
| **Visual editor APIs** | **Kept** for local tooling |
| **Defne photo** | Still Lumura stand-in until a real asset exists |
| **Ship** | Branch pushed + PR (see git/gh) |
