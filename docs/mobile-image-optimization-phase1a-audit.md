# Phase 1A — recovery and image audit

Audit date: 2026-10-20. Scope: recovery and source/asset verification only.

## Recovered state

- Review branch: `review/mobile-image-optimization`.
- Audited implementation: `3ec536675314d4c73ca3ecb76232df0a5b36d406`.
- Remote `master`: `1135d1963b8f45a24f51696d4636061922048b1c`, confirmed with `git ls-remote` during this audit.
- The review implementation is three commits ahead of that baseline. No reconstruction is required.
- Recovered into a separate worktree. The existing services redesign checkout and its untracked files were left untouched.
- Vercel confirms deployment `dpl_DD7YRtnsdrXx1AYaPijHjqARCvcW` is READY, preview environment, for the exact implementation commit above: https://lionovartnext-onrb1jnpl-lionovart.vercel.app/

## Independently repeated checks

| Check | Result |
| --- | --- |
| Manifest originals | 32, all committed |
| Manifest derivatives | 350, all committed and present |
| Generated directory inventory | Exactly 350 files |
| Content hashes | All 350 match their filename SHA-256 prefixes |
| Baseline public assets | No modified or deleted files; only 352 additions, including two posters |
| Image test suite | 11 passed, zero failures |
| Existing motion/scroll tests | 48 passed, zero failures |

Image tests repeat full decoding, expected dimensions, matching format widths, no local upscaling, embedded ICC retention where present, exact decoded RGBA for lossless WebP derivatives, and pixel-identical lion posters. They also cover crop/frame transformation order, guarded Cloudinary passthrough, eager priority without a separate WebP preload, deferred source activation order, and image styling ownership. Photographic conversions are not mathematically lossless.

The original unfinished handoff mentioned 398 derivatives and a Python generator. The committed implementation instead contains 350 derivatives and `scripts/optimize-images.mjs`, with `scripts/avif-input.mjs`. The repository's earlier Phase 1 notes explain the reconstructed width set. Current completeness is established against the committed manifest, rather than the obsolete 398-file count.

Reviewed the installed Next.js 16.3.8 image guide and image API sections on dimensions, sizes, loading, preload/priority and format selection. Reviewed the changed component diff and relevant image selectors. The added `picture` wrapper uses `display: contents`; classes, inline styles, event handlers and React 19 ref props remain on `img`. The proof-face first-child selector was explicitly adapted. Runtime layout/ref behavior still needs browser validation.

The audit tests reused an existing local dependency installation through an untracked/ignored symlink. Node is 24.19.0; the installed Next.js, React, React DOM, TypeScript and sharp versions match this review branch's lockfile (16.3.8, 19.2.4, 19.2.4, 5.9.3, 0.35.5). The entire dependency installation has not been reproduced from this branch's lockfile in this checkpoint.

## Findings for Phase 1B

1. `git diff --check 1135d19..HEAD` reports extra blank lines at EOF in `ClosingMediaWall.tsx`, `HeroCycling.tsx`, `PartnershipTiles.tsx`, `ProcessLionJourney.tsx`, and `partnership-tile-config.ts`. Remove these narrow whitespace defects.
2. Reproduce dependencies from the review lockfile before final lint/type/build gates. The prior report described a local build blocked by Google Fonts DNS and build-output permissions; those historical blockers have not been reproduced here. The READY Vercel build does not establish a successful current local production build.
3. Run targeted lint, TypeScript and a production build after cleanup, and repeat appropriate tests for any functional changes. Source review found no additional confirmed defect in the migrated active image paths; browser checks may reveal further issues.

## Phase 1C acceptance checks still pending

- Verify the final remote commit and every referenced asset after any fixes.
- Confirm the final preview build is READY and corresponds to that commit.
- Inspect homepage, About and services imagery at mobile, tablet and desktop widths; check actual `currentSrc`, broken images, cropping and transparency.
- Exercise partnership and closing gallery visibility gates, responsive source selection, image refs and animation selectors in a browser.
- Confirm response content types and immutable cache headers on generated assets; exercise WebP fallback.

No application code or image assets changed during Phase 1A. No new production build, browser layout pass, Lighthouse comparison, loading-speed benchmark, mobile FPS measurement or real-phone GPU validation is claimed. Phase 2 remains outside this checkpoint.
