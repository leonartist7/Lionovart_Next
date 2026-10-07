# Latest unified working version — 8 October 2026

## Start here

Canonical editing branch: `codex/latest-unified-20261008`.
Target after Leonardo reviews the next edits: `master`.
Do not merge, promote to production, or delete source branches as part of this checkpoint.

This branch combines the latest pushed hero work and the recent separately pushed closing-CTA work. It preserves both source histories in a merge commit.

## Exact sources

| Source | Commit | Included |
| --- | --- | --- |
| Latest hero branch | `7542b2db71503ebc5e45e7c37a5dfc38c45333a7` | Complete tree, including all current master changes, October 5 French work, October 7 hero cleanup and latest square LION/NOVA/ART images |
| Recent closing CTA | `1a9366602a6eb74182b8d5d3cf89db5b7ae1a9b5` | Gold ribbon image, closing layout, responsive type and liquid-button sizing |
| Master baseline | `84f0624cb36293f9857fafcc08e8b373f84813cb` | Already an ancestor of the hero head |
| Earlier audit revision | `109698631515bcd8adb1327832a62f254f8cd920` | Already included; superseded by the two newer hero commits |

The CTA branch starts from older common ancestor `5c5317110bb9a956dc9a7f4c43685047dba9181c`. Only its five changed files are reconciled; older whole-page files are not copied over the latest site. ClosingCTA.tsx is resolved by preserving the gold-ribbon layout and restoring the latest usePublicCopy translations in both closing variants. The other three source files are unchanged between the common ancestor and latest hero, so their incoming blobs can be preserved exactly. The binary ribbon asset is preserved by its Git blob.

PR #85 describes an older combined preview. Do not use its head as the current source. The new draft PR for this branch is the review entry point.

## Included completed work

- Latest hero cleanup, centered bridge, scene/editor controls and October 7 square pillar artwork with matching film handoff.
- Continuous responsive opening film into LION/NOVA/ART cards.
- Clash Display hero statement, higher layout, fluid hero typography, static side laurels and gold/red rays.
- French public-page translations and localized AI-calculator formatting.
- Earlier consolidated About page, compact comparison, gold decoration, persistent Imagine reveals, results/footer and portal work.
- Recent closing CTA with gold ribbons and responsive type/button sizing.

## Local-to-cloud limitation — unresolved

The local Windows execution service failed before any filesystem or git command ran: sandbox provisioning / sandbox-bin lock failure. The Codex app project and terminal readers also failed.

Therefore this checkpoint confirms the remote commits above, including the newly pushed CTA work, but does NOT certify that every uncommitted local file, ignored asset, local-only commit, editor-localStorage setting, or other checkout has been backed up.

Before resuming in a local checkout, inspect its status and remotes, preserve uncommitted work, fetch this branch, and reconcile local-only changes. Do not reset, clean, overwrite, or delete local work to make it match this branch. Do not label local backup complete without that inspection.

## Remaining website edits

### 1. Reproduce and correct the missing circle/carousel

The source already has circle contraction, lion logo and ImageStreamHero in PawRevealStack.tsx. The staticScene condition includes reduced motion, viewport height below 500px, or measured content above 1.2 times viewport height. The work stream and logo are entirely suppressed in that mode.

This is a source-level explanation to verify in a browser, not a confirmed reproduction. Decouple tall-content layout from the existence of creative work. Reduced-motion users should receive a readable static equivalent. Keep the ordinary-motion circle-to-logo-to-varied-work transition.

### 2. Implement the agreed benefit-card direction

- Three upright portrait benefit cards side by side on desktop; stacked on mobile.
- Keep the fine golden outline and lion-paw reveal.
- Preserve substantial benefits: clear problem, outcome and practical improvements.
- Explain why established businesses should align their image with the quality of their work.
- Keep benefits available without forcing visitors through three interactions.
- Do not replace benefit cards with full-image portfolio tiles.
- Use existing brand assets and Clash Display; generated mockups are direction references, not production screenshots.

### 3. Compact the route to services

Keep hero → opening film → pillar cards → partnership → benefit/circle chapter → varied work → services.
Shorten repeated statements and empty holds. Let services enter while the work opens.
Use multiple distinct projects/industries/styles, not one fictional case study repeated.
The original Imagine chapter occupies roughly five viewport heights plus entry/exit space; tune a shorter sequence through actual mobile/desktop playback.

### 4. Resolve the final CTA

The recent gold-ribbon closing is preserved in this checkpoint.
The proposed personal review with three priority fixes remains a future copy/flow edit.
Reuse the existing /audit capture and thank-you route where appropriate, verifying the actual submission path before claiming end-to-end delivery.
Do not lose the new ribbon asset when refining the CTA.

### 5. Confirm remaining editorial choices

- Consider placing a small amount of verified client results earlier; exact placement is not yet settled.
- Consider moving the full FAQ to About; this was discussed, not finally decided.
- Review wider rem typography and English/French wrapping beyond the already adjusted hero.
- Cookie-consent work discussed in another thread must be separately located/verified before claiming it is integrated. No additional cookie branch was present in this remote inventory.

## Validation and release gates

- Both source heads had READY Vercel deployments when inspected.
- Verify the combined preview build for this branch.
- Run the repository's integration checks through its draft PR.
- Check 390px mobile, tablet, desktop and 4K; normal and reduced motion; expanded benefits; EN and FR.
- Inspect the hero/film handoff, circle-to-images transition, gold-ribbon close, button alignment and audit navigation.
- The local sandbox and interactive browser were unavailable in this checkpoint. Do not equate build success with visual approval.
- Keep master unchanged until Leonardo finishes the next edits and chooses to merge.
