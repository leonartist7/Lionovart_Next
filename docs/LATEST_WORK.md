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

## Follow-up: framed opening into Imagine

- Added the supplied Cloudinary `hero_frame_1_soy84j.avif` as a decorative, viewport-fitted image in the fixed hero backdrop. It stays with the opening/film/bridge and exits at Imagine's boundary; links and controls remain interactive.
- Removed Stronger Together and the separate white vow lead-in from the homepage.
- Moved Imagine into the journey context and registered its section as the required reveal boundary, preserving the lion's opening measurements.
- Imagine now enters as a red circle against the dark opening. The ivory work canvas appears during circle contraction, preserving the paw/benefit reveals, exact logo and varied image stream.
- Removed the extra entrance spacer. Existing reduced-motion/static card behavior remains.
- Source checks cover composition and boundary wiring. Preview build and visual feel-check remain separate gates; no local browser verification is claimed.

## Local-to-cloud limitation — unresolved

The local Windows execution service failed before any filesystem or git command ran: sandbox provisioning / sandbox-bin lock failure. The Codex app project and terminal readers also failed.

Therefore this checkpoint confirms the remote commits above, including the newly pushed CTA work, but does NOT certify that every uncommitted local file, ignored asset, local-only commit, editor-localStorage setting, or other checkout has been backed up.

Before resuming in a local checkout, inspect its status and remotes, preserve uncommitted work, fetch this branch, and reconcile local-only changes. Do not reset, clean, overwrite, or delete local work to make it match this branch. Do not label local backup complete without that inspection.

## Remaining website edits

### Imagine-to-services preview — implemented 8 October

- Rebuilt Imagine as three upright, gold-edged cards on desktop, stacked on mobile. Their main benefits are always visible; each lion-paw reveal uncovers practical improvements and stays open independently.
- Introduced the positioning “Your business has evolved. Has the way people see it?” for established businesses whose image has fallen behind their work.
- Separated readable content from the circle animation. Tall cards no longer disable the creative work on phones. Reduced motion and very short viewports receive all six work images in a static grid.
- Kept the exact lion mark, contracting red circle and existing six distinct work assets in the image stream. Added pause/play and background-tab suspension.
- Shortened the partnership hold and circle stage. Services now follow the creative sequence directly; the detailed Selected Work gallery follows services.
- Added the personal-review offer with three priority fixes, linked to the existing localized audit route. Updated audit intro copy; submission delivery was not changed or tested.
- Added French copy for the new section. Other locales retain the existing English fallback for these new phrases.
- Preserved the supplied hero frame, opening film, pillar cards and gold-ribbon closing CTA.

### Remaining review decisions

- Visually review the pacing and new portrait benefit cards in the branch preview.
- The closing CTA's gold-ribbon layout remains preserved; further closing copy changes can follow review.

### Editorial choices still open

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
- Latest Imagine implementation: local production build and TypeScript passed; scoped ESLint has no errors (one existing unused-variable warning in services). Desktop and phone layouts and independent paw reveals were exercised in Chromium, with no horizontal overflow. Desktop work assets loaded and were visually inspected. Local English routing loops while the current Vercel English route returns 200; verify English again on the deployed preview. Reduced-motion uses a static six-image grid; the broader page still emits a hydration warning during local reduced-motion testing. These checks do not replace Leonardo’s visual approval.
- Keep master unchanged until Leonardo finishes the next edits and chooses to merge.
