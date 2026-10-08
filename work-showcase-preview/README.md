# LIONOVART Work — current complete preview

This folder preserves the complete Work page reviewed by the owner: 53 media entries, glass filter dock, smooth gallery filtering, client results, founder section, booking/audit choices, loader and return-to-website link. Open LIONOVART-results-preview.html directly in a browser. LIONOVART-work.html is the same complete page.

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

The public Google Calendar appointment URL has not been supplied, so booking is intentionally disabled. Audit requests use the existing /api/strategist/lead endpoint and require the hosted application; the owner reviews and emails audits manually. The static file does not provide a working backend. All supplied new examples are currently client work by the owner’s instruction; individual public IDs can be marked concept in workStatusOverrides.

## Local gallery review

Open the same preview with ?review=1 (or append &review=1 to an existing filter link). This mode is enabled only for file://, localhost, 127.0.0.1 and ::1 previews. Numbers are fixed against asset IDs in work-review-ids.json; append new numbers when adding future assets and never renumber existing records. Marks save in localStorage for this browser/origin and are recommendations, not publishing actions. Copy review includes every current example under Keep, Improve preview, Archive or Not reviewed. Exit review preserves the saved marks. Run node work-showcase-preview/verify-work-review.cjs for validation.
