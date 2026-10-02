# About page — execution progress

## Phase 1 — implementation checkpoint

Date: October 2, 2026.
Base: `master` at `8cc0eb6ca06d9039d1f2921cbfe1d4ec27a6b0d6`.
Branch: `codex/about-phase-one-20261002`.
Status: **Phase 1 complete** on its preview branch. Integration to master remains phase 5.

Implemented `/about` with an English founder story, full-proportion existing portrait, connected-brand philosophy, LION / NOVA / ART chapters, four working principles and the existing `/call` contact action plus direct email. Pillar framing follows `src/components/demo/PillarsDemo.tsx` and the brand discipline framing. Styling uses current Clash Display headings, DM Sans body tokens, black/ivory, red actions and selective gold; no global font changes or new assets/dependencies.

The localized route map registers About; non-English About URLs redirect to English until phase-four translations are complete. About metadata includes only the English language alternate. About-specific navbar fallback sends sections absent on this page to their existing homepage anchors. The homepage layout and long comparison have not moved yet; that is phase 2.

The new page opts out of the global word-fading title effect. Headings stay readable without motion, hover or pinned scroll. The detailed comparison is reserved in source without an empty visitor-facing placeholder.

Initial production build and TypeScript compilation passed. Changed-file ESLint passed after supplying a local-only symlink to the already installed nested Zod dependency: the current lockfile places `zod-validation-error` at the root while its Zod peer is nested. No dependency or lockfile change was committed. Final checks after the heading adjustment are recorded in the next checkpoint.

Contact verification checks navigation and NOVA's dialog, not a real appointment submission. Local voice startup returned the existing service error state; no booking or outbound message was sent. Direct email remains available. Live service readiness is outside this page-build phase.

Remaining phases: 2 homepage migration/comparison; 3 composition and motion refinement; 4 full navigation/localization/SEO/NOVA integration; 5 final integration/release.

See `docs/about-page-plan.md` for scope and completion gates. The verified checkpoint and evidence are recorded below.


## Verified phase-one checkpoint

- Implementation commit: `a35b3c3045defb4e4d5b5752e42d35a8ad68b22e`.
- Implementation tree: `ad3f1e5e8e56030b37cead3914a0defa72dd1808`; matches the locally built and browser-checked tree exactly.
- Preview: https://lionovartnext-h1stk5nbt-lionovart.vercel.app/about
- Vercel deployment: `dpl_GyzjDcuHBWoEnW76dYFpu87irdwa`, READY, at the implementation commit above.
- Hosted About response: HTTP 200, with the expected heading, portrait asset and contact link in its HTML.
- Draft PR: https://github.com/leonartist7/Lionovart_Next/pull/78
- Build: `npm run build` passed, including TypeScript compilation and page generation.
- Lint: changed-file ESLint passed, with the local dependency workaround described above.
- Browser: Chromium production-server checks passed at 320, 375, 390, 768, 1024 and 1440px. No document overflow or offscreen text bounds, one H1, loaded portrait with a 1:1 ratio, correct English title/canonical and no page errors.
- Additional interactions: direct load/reload, 390×667 contact section, reduced motion, `/fr/about` redirect to `/about`, `/call` navigation and NOVA dialog opening passed.
- Booking limitation: local voice startup displayed its service error state; this phase does not certify the external voice/booking service or an appointment submission.
- Scope remaining: full localization, shared About navigation and NOVA section-knowledge changes remain phase 4. Sitemap registration and non-English alternates are not added before that phase.
- Device limitation: viewport emulation uses Chromium; real-device Safari and WebKit are not verified in this phase.

Evidence:

- [Viewport and interaction results](../reports/about-phase-one/checks.json)
- [390px opening](../reports/about-phase-one/about-390-hero.webp)
- [390px founder](../reports/about-phase-one/about-390-founder.webp)
- [1440px founder](../reports/about-phase-one/about-1440-founder.webp)

These screenshots were captured from the production build of the identical implementation tree. Hosted verification checked deployment metadata and the About HTML; it did not perform a separate hosted viewport run.

**Next: phase 2.** Continue from this branch/current source, move the homepage portrait/story into the completed About destination, replace the homepage matrix with the compact Others/LIONOVART presentation, and add its detailed working-model comparison to About. Preserve the current client-results scene, process, SEO and footer. Integrate any newer approved master changes deliberately; do not discard another preview branch's work.
