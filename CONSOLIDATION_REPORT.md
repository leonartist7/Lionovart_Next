# LIONOVART local consolidation

This checkout starts at fetched `origin/master` (`0ff7d70`) and combines only the reviewed homepage changes. The source checkouts and their uncommitted work remain untouched. No push or deployment was requested.

| Area | Source | Integration decision |
| --- | --- | --- |
| Intro, homepage structure, typography foundation | `origin/master` / `release-cinematic` | Kept the newer intro lifecycle, splash readiness, navbar gating, Clash/Playfair fonts, and published section order. |
| Selected Work | `release-cinematic` working tree | Added the immersive four-project gallery and corrected glass shader, including `colorspace_fragment` on all shader paths. Kept its reel at `/demo/selected-work`. |
| Stronger Together | `release-cinematic` working tree | Added the responsive benefits ribbon, local crown/high-five artwork, and localized benefit phrases already in the catalogs. |
| Closing CTA | `master-preview` working tree | Added the compact image-stream close, cycling title treatment, motion control, CTA-compatible button options, and compact footer. Preserved the newer intro gate in the shared shader button. |
| Section colors | `master-preview` working tree | Unified ivory/dark tokens and the affected homepage section surfaces while preserving the newer intro animation rule. |
| Typography comparison | `master-preview` working tree | Kept the Playfair/Clash foundation already in the base and copied the isolated `/demo/typography` comparison route. |

Port `3100` serves the `master-preview` development checkout. Port `3112` serves its `.next-closing-check` production build. They are not distinct source branches. Both original servers remain running. Port `3120` serves this checkout's production build and is the canonical local preview.

The older `master-preview` also contains ongoing discovery/admin work outside this homepage reconciliation. It remains in that original checkout. Its older intro, splash, and navbar revisions were deliberately excluded because they would replace the published intro lifecycle. The gallery's fine section divider follows the latest accepted Selected Work composition.

The first localization audit found that `marquee.items` had six benefits in English, eight older phrases in French/Spanish, and industry names in Italian/Japanese/Korean. Those five catalogs now express the same six benefit ideas. The published language approval gate and existing English CTA copy remain unchanged.

Verification:

- Locked dependency installation, image decoding, TypeScript, focused ESLint, and the production build passed. The first build was blocked only by the sandbox's Google Fonts network restriction; the same build passed with network permission.
- The homepage browser matrix passed at 320, 390, 768, 1024, 1440, 1920, 2560, and 3840 CSS pixels and at 844×390. No horizontal overflow, missing gallery poster, or console error was found. Clash Display loaded in the browser. Direct `/#selected-work` and `?workTheme=dark#selected-work` loaded.
- Manual and rapid gallery selection, reduced-motion behavior, CTA pointer/keyboard activation, the CTA's pause/resume/offscreen behavior, 200% zoom reflow, and its full word/card cycle passed. The refraction was observed during live project changes; its colors did not show the prior full-frame shift in the inspected transition.
- Local screenshots are in `../previews/consolidated-homepage/`; machine-readable browser results are in `../reports/consolidated-homepage-verification.json`.

No missing or corrupt local poster/high-five assets were found. `npm ci` reported 15 dependency advisories (10 moderate, 4 high, 1 critical) from the unchanged lockfile; these are pre-existing dependency findings, not consolidation regressions. Real project films are still absent, so Selected Work is a poster gallery until footage is supplied.

## Homepage scroll refinement

The later local refinement keeps the navbar hidden during downward scrolling and reveals it on a deliberate upward movement, while an open menu or keyboard focus holds it visible. Imagine now keeps its gold solution contour mounted through the pull, uses Playfair on ivory solution headings, shows all three stats on desktop, sizes its circle from the viewport, and holds the partnership statement and moving-image sequence longer. The chapter's large trailing pad and the gallery's top pad were reduced. The Stronger Together bloom, chapter background, and subsequent sections use the same ivory surface.

The updated browser matrix passed at 320–3840px, short landscape, all five non-English locales, reduced motion, manual/rapid project selection, and both Selected Work themes. Focused lint, type, and a production build passed. A normal build initially hit `ENOSPC` in Webpack's persistent cache; the failed generated `.next` output was cleared, and the production build passed using the new `LIONOVART_DISABLE_WEBPACK_CACHE=1` local build option. The drive had roughly 350 MB free after verification, so future builds may need more free space. No source or artwork corruption was found.
