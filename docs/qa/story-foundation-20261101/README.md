# Phase 0 — responsive story foundation

Review branch: `codex/services-world-phase1-20261019`. No merge or production promotion.

## Source reconciliation

The attached plan started at `5819aa0`. The branch had already advanced to `5172945a5b6ae3b48f299ccb002bf347b9cc747e`, including the statement/doorway/five-world implementation (`af0c37e`) and Escape/focus fix (`4ba2927`). This work preserves those changes. The old eight-project direction is superseded by five rows / ten projects.

Baseline runtime: https://lionovartnext-l7apg04r6-lionovart.vercel.app/ (runtime `4ba2927`, before the documentation-only `5172945`). Baseline check: 1363×936, root 16px, horizontal gallery, no document overflow. 171 Node tests passed before changes. Baseline already emitted WebGL/OGL/Three context errors in the cloud browser. These are not treated as new foundation regressions or as evidence of successful GPU rendering. A complete retrospective EN/FR baseline matrix was not captured.

## Implementation ledger

| Concern | Current source and decision |
| --- | --- |
| Fonts | `src/lib/fonts.ts` loads Clash Display, **DM Sans**, Playfair Display. The attached plan's Manrope reference is stale; retained actual font family. |
| Red | Existing `--color-brand-red: #e5192a` and secondary `#db0000`; unchanged. |
| Root size | No fixed pixel root introduced. Browser font preferences remain authoritative. |
| Typography | Scoped REM-bounded fluid heading/body tokens; unitless leading; EM tag padding; wrapping captions. No global restyle. |
| Gallery axis | `gallery-layout.ts`: vertical through 1024 CSS px, horizontal above. CSS and arrows consume `data-gallery-axis`; geometry remains measured CSS pixels. |
| Layout ownership | `PinnedScene` provides one shared static/animated decision. Short-height/reduced-motion preference plus measured gallery/service/statement fit. Initial render is static. |
| Fit measurement | Caption clones, copy/media heights, nav/control reserves; resize, locale/content and font events. Failure latched until environment changes to prevent observer oscillation. |
| Media ownership | Existing ScenePortal and active chapter gates retained. No new renderer/library/assets. |
| Layers | Shared viewport z2; opening z3, services z4, gallery z5; existing global service rail z90. Static service rail now returns to document flow. |
| Semantics | Existing page H1 retained; statement/expertise/gallery remain chapter headings. Signature is not a new H1. |
| Static path | Statement, service content, category controls, ten project cards, captions and partnership action remain in reading order. |
| Mode transition | Gallery snapshots the current project/pair before portal ownership changes and restores a corresponding reading anchor; transfers retired focus only when necessary. |
| Review fixture | `/qa/story-responsive.html`: real iframe viewport sizing, root-font preference and spacing controls. It does not emulate physical touch or browser zoom. |

## Verification

Runtime review commit: `ba0311a939d73d24680f4b0488454a6296a2c003`.

- 175 Node tests passed, including breakpoint, caption gutter, fit reserve, ordinary vertical pair and enlarged-text fallback checks (`tests.log`).
- TypeScript `npx tsc --noEmit --incremental false` passed.
- Scoped ESLint passed for touched TypeScript components.
- Production build `NEXT_BUILD_DIR=.next-phase0 npm run build` passed (`build.log`). Temporary build-directory changes to tsconfig were restored.
- First candidate exposed an overconservative fit budget; revised before checkpoint.
- French 200% text stress test exposed the separately portaled category rail; changed to wrapping document flow for the shared static layout.
- Phone gallery arrow next/back reached second/first pair. At the first reading stop, artworks and captions fit between navigation and gallery controls. Text enlargement on pair 2 retained Blastup in view.

Preview (Vercel READY, preview target, exact runtime SHA above):
https://lionovartnext-hestnn14k-lionovart.vercel.app/qa/story-responsive.html

| Locale | Viewport | Text preference | Observed mode / axis | Document overflow | Project count |
| --- | --- | --- | --- | --- | --- |
| EN | 390×844 | 100% | animated / vertical | none | 10 |
| EN | 768×1024 | 100% | animated / vertical | none | 10 |
| EN | 1023×768 | 100% | animated / vertical | none | 10 |
| EN | 1024×768 | 100% | animated / vertical | none | 10 |
| EN | 1025×768 | 100% | animated / horizontal | none | 10 |
| EN | 1440×900 | 100% | animated / horizontal | none | 10 |
| EN | 844×390 | 100% | short-height fallback / vertical | none | 10 |
| EN | 320×568 | 100% | content-fit fallback / vertical | none | 10 |
| EN | 390×844 | 200% + expanded spacing | content-fit fallback / vertical | none | 10 |
| FR | 390×844 | 100% | animated / vertical | none | 10 |
| FR | 768×1024 | 100% | animated / vertical | none | 10 |
| FR | 1025×768 | 100% | animated / horizontal | none | 10 |
| FR | 390×844 | 200% + expanded spacing | content-fit fallback / vertical | none | 10 |

French stress test: service category controls are relative in document flow, 275px wide × 88px tall at 32px root, with distinct rows and 24px label text. Selecting **Marque** changed `data-service-current` to `branding`. Statement and signature had separate non-overlapping flow boxes (statement bottom 732px; signature top 796px at the reading stop), with no document overflow. The statement can continue below a small viewport by native scrolling. Existing gallery taxonomy strings still include English in the French route; this checkpoint does not claim complete translation coverage.

Screenshots captured from the final runtime:
- `phone-fr.jpg` — normal phone vertical pair.
- `horizontal-fr.jpg` — horizontal pair at 1025px.
- `french-200-services.jpg` — French controls at 200% root text with expanded spacing.

These are iframe viewport tests in Chromium, not device emulation or actual browser zoom. Document overflow checks do not prove that every transformed decorative layer fits; reading stops were additionally visually inspected.

## Remaining acceptance scope

This is a Phase 0 checkpoint, not an all-device certification. Physical iOS Safari / Android touch, actual browser zoom, OS reduced-motion switching, safe-area hardware, GPU rendering, frame pacing, round-trip layout changes at every chapter, exhaustive service-selection/focus transitions and contrast through every animated background require integrated review. The cloud browser does not provide a working WebGL context. Hero/global navigation at enlarged text still needs separate review; scoped changes do not claim to fix the entire website. No later creative phase is started by this checkpoint.
