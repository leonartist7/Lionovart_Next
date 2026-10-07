# Work showcase — interactive UX wireframe

The gallery lives at `/work`; a personalized industry link is `/work?industry=wellness`.
The existing homepage's four-example showcase now links to it. Locale-prefixed work
routes resolve and retain their locale in navigation; wireframe labels are English.

## Review surfaces

- Desktop: two-column media-only gallery, visible industry JellyRadio categories and a quiet Filters action. No search or visible result-count row.
- Mobile: one column, fully visible industry categories wrapping into rows and a Filters button; the panel becomes a bottom sheet.
- Filters panel: two JellyRadio groups with draft selection and Apply/Reset/Cancel.
- `/work/stormlikes`: imported film, context placeholders, real film stills, related work.
- `/work/sample-14`: concept wireframe, sample context, application placeholders.
- `/work?service=ai-os`: empty results with a reset.
- Header and project actions: enquiry panel with removable project reference and a booking alternative.
- Audit invitation: sample-report placement, linked to the existing `/audit` funnel.

## Content contract

`src/components/work/catalog.ts` contains ten imported works first, followed by twenty
CSS **fixtures** to retain the large-library interaction wireframe.
`cloudinaryCollection.ts` records all ten films supplied in the user's public collection
on 2026-10-05. It stores direct versioned media URLs; page rendering does not fetch the
temporary collection, which expires 2026-10-12. Cloudinary assets must remain public.
Films are delivered at a maximum width of 1600px with automatic quality. Gallery
posters and two supporting film stills use resized Cloudinary images; the gallery
loads films only when their previews enter view. Visible previews and project films autoplay
muted and loop; offscreen films and hidden tabs pause. Each gallery preview has a pause
button, and detail films keep native controls. Reduced motion disables automatic playback.

Brand names were read from the artwork. Sector and service assignments are provisional;
OP remains uncategorized. Imported works use `kind: work` until client/concept status
is confirmed, and no outcomes are inferred. Finance is now a separate industry.
The homepage's four existing selections use their matching imported films.
Further cards use CSS wireframe artwork and illustrative classifications.

Entries now use `serviceIds: string[]`. The initial imported-film assignments are the
user-approved draft table from the cleaner-gallery plan. They are not verified claims
about delivered services; the owner will replace them with the final inventory.
All assigned services appear as normal labels in the bottom-left corner. Cards show
no brand-name caption, industry caption, status badge, film badge, or project link.
Names remain in internal data and accessible descriptions. AI operating system is a service
option with no imported film assigned yet.

`src/components/ui/jelly-radio/` contains the JS-CSS React Bits source installed via
the exact registry URL and a local TypeScript declaration. The CLI aligned `motion`
to the registry's v12 dependency range. Component JSX and base CSS are unchanged;
layout, 44px hit targets, focus rings, and reduced-motion transitions are scoped in
the Work stylesheet. A narrow ESLint exception preserves the registry's intentional
imperative MotionValue/ref pattern; application components retain normal checks.

Replace fixtures with the approved inventory, final copy, image alternatives, media,
and a real audit preview in the content phase. `verifiedOutcome` is optional and must
only contain attributable, approved results. Until then all work routes are `noindex`.
No new CMS, AI, voice, or prospect-specific private collection is introduced.

## Navigation and interaction

- Query parameters: `industry`, `service`, and `show` (visible entry count). Legacy `q` parameters no longer filter the gallery and are cleared on interaction.
- Industry categories are visible at every screen size. Service refinements live in the existing Filters panel with draft Apply/Cancel behavior. Result changes are announced to screen readers without a visible count row. The gallery introduction contains only its title.
- Start at 12; Load more adds 12, capped at the result count. Adding entries to the
  catalog does not require new navigation controls.
- Filters replace the current URL without navigation/scroll jumps. The gallery stays
  in place when artwork is clicked. Each filter group wraps into rows with no horizontal
  scrolling. Horizontal neighbor displacement and swelling are disabled because the
  registry calculates them for a single row; color and hover feedback remain.
- Existing direct project URLs still accept a local `from` gallery URL. That return
  path is validated; arbitrary redirects are rejected. Legacy stored scroll positions
  can still restore; new cards no longer leave the gallery or write return positions.
- Native modal dialogs provide inert backgrounds, Escape, focus containment and return.
- `PublicExperience` omits the site's intro, smooth-scroll, AI launcher, cursor effects,
  and decorative overlays for work routes; other public routes keep their existing behavior.

## Enquiry and measurement

The form uses `/api/strategist/lead`, `source: work_gallery`, with the optional work
reference in `project_summary`. It only confirms receipt when the endpoint returns
`saved: true`; HTTP 200 with `saved: false` displays a retry/email fallback. Actual
delivery depends on the existing Firebase configuration.

A valid HTTPS `BOOKING_URL` opens direct scheduling. Without it the panel honestly
offers a call request by email, rather than a nonfunctional calendar or mandatory AI.
The browser checks intercept lead requests; they do not send enquiries.

`funnel.work_enquiry_completed` records a saved enquiry. Audit and booking events are
explicitly named `opened`; they are not conversion completions. The existing audit
completion measurement remains in its funnel. Completed calendar bookings require
the booking provider's confirmation/webhook integration before conversion reporting.

## Verification

Start an isolated local server (use hostname `localhost` to match locale rewrites):

```powershell
$env:NEXT_BUILD_DIR = '.next-work'
node node_modules/next/dist/bin/next dev --webpack --hostname localhost --port 3125
```

Run `node scripts/verify-work-showcase.cjs` with Playwright and Chrome available.
Optionally set `PREVIEW_URL` or `PLAYWRIGHT_MODULE`. It checks media-only cards,
multiple-service matching, controlled JellyRadio/URL state, keyboard focus, mobile
draft selection and Apply/Cancel, absence of search/count rows, empty results, pagination, responsive layouts,
reduced motion, direct project/enquiry routes, and poster fallback. It submits no forms.
Screenshots and JSON results are written to ignored
`reports/work-showcase/`. This is a local review build, not a deployment.

`node scripts/verify-work-media.cjs` additionally checks real Cloudinary delivery:
all ten gallery posters, visible preview playback with offscreen pausing, decoded autoplay and
full duration for every film, supporting stills, and mobile finance-filter return.
It submits no forms and writes `media-verification.json` and preview screenshots.
