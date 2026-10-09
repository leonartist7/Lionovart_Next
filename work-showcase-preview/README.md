# LIONOVART Work — current complete preview

This folder preserves the complete Work page reviewed by the owner: 53 source media records with 40 published examples, glass filter dock, smooth gallery filtering, client results, founder section, booking/audit choices, loader and return-to-website link. Open LIONOVART-results-preview.html directly in a browser. LIONOVART-work.html is the same complete page.

This is the latest reviewed design. The application route in src/components/work is the earlier wireframe implementation; this commit preserves both without replacing the homepage or claiming the newer preview is deployed at /work.

## Rebuild

Install the website dependencies from the repository root with npm ci, then run:

    node work-showcase-preview/check-types.cjs
    node work-showcase-preview/build-full-preview.cjs

The build uses this repository’s existing React, TypeScript, Next webpack, GSAP and framer-motion dependencies. Source is in src/components; assets/legacy stores the exact posters and founder portrait required by the build. New collection media uses permanent Cloudinary delivery URLs. No runtime collection lookup is required.

## Browser checks

Checks require Playwright and Microsoft Edge. Make Playwright available as a Node module, or set PLAYWRIGHT_MODULE to its installed module directory. For example:

    node work-showcase-preview/verify-collection-gallery.cjs
    node work-showcase-preview/verify-gallery-fade.cjs
    node work-showcase-preview/verify-filter-dock.cjs

Review screenshots and temporary bundles are ignored. Existing STATUS.md records the completed validation and design iterations; later entries supersede earlier designs.

## Integration still needed

All three Book a call actions are enabled and use the owner’s public Google Calendar appointment URL: https://calendar.app.google/vjKnyMFNsjjRGZSn6. Audit requests use the existing /api/strategist/lead endpoint and require the hosted application; the owner reviews and emails audits manually. The static file does not provide a working backend. The owner-confirmed client/concept assignments are stored in work-approved-tags.json; individual status overrides remain supported.

## Local gallery review

Open the same preview with ?review=1 (or append &review=1 to an existing filter link). This mode is enabled only for file://, localhost, 127.0.0.1 and ::1 previews. Numbers are fixed against asset IDs in work-review-ids.json; append new numbers when adding future assets and never renumber existing records. Marks save in localStorage for this browser/origin and are recommendations, not publishing actions. Copy review includes every current example under Keep, Improve preview, Archive or Not reviewed. Exit review preserves the saved marks. Run node work-showcase-preview/verify-work-review.cjs for validation.

## Approved curation and tag review

The approved archive list hides 13 examples; 40 remain published, including the two unreviewed examples. All 53 source records and fixed numbers are preserved. Open the existing preview with ?review=tags to assign multiple service tags and independent Concept status, then Confirm tags for each example. Copy review exports both confirmed and pending entries for handoff. Draft tag assignments affect only local tag review and persist separately from curation marks. The media-card backing is transparent; artwork remains uncropped. Original ?review=1 still exposes the full 53-entry curation collection. Run verify-tag-review.cjs and verify-collection-gallery.cjs for current curation checks.

## Confirmed tags applied

work-approved-tags.json records the owner’s complete 40-entry tag/status report. The public preview renders these assignments and six Concept labels. Both legacy web-dev/app-dev queries resolve to the combined Web/App dev tag. Fresh local tag review starts with the applied assignments confirmed; subsequent local changes remain drafts until sent back. verify-approved-tags.cjs checks every rendered assignment and status.

## Current prospect journey

The gallery ends with Book a call and a same-page See client results link. Proof uses one featured result and two shorter quotes, preserving approved wording and qualifiers. Leonardo’s compact introduction links to the main studio homepage. The closing gives booking priority; the manual audit form is behind an accessible disclosure. The public Google Calendar appointment URL is connected to the header, gallery-end and closing actions. Run verify-post-gallery.cjs for responsive, keyboard, mocked audit and configured-booking-fixture checks.

## Homepage liquid-metal CTAs

The Work preview reuses the visual layers and Paper liquid-metal shader from src/components/ui/liquid-metal-button.tsx in the homepage. Its standalone adapter is src/components/ui/liquid-metal-button.tsx inside this folder, supporting native links, submit buttons and disabled states. Metal motion starts after the loader and runs only in view; hidden tabs, live reduced-motion preferences and disabled buttons use a static metallic skin. Canvas resolution is capped and cleanup releases WebGL resources. Uses already-installed dependencies. Run verify-metal-cta.cjs for behavior, fallback and resource checks.

## Live booking link

The owner supplied the public calendar URL on 9 October 2026. A read-only click-through confirmed it opens Google Calendar’s Creative Discovery Call | 15 min scheduling page. verify-booking.cjs checks all three enabled links and the destination without reserving an appointment.
