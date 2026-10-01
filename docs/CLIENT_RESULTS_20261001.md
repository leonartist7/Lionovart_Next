# Client results section — 2026-10-01

The typographic results preview closes the scrolling Partners Elevated / Brands
Innovated card sequence from inside its existing scene height, before the
testimonial marquee and globe. The public preview sentence was removed at the
founder's request; the dataset remains illustrative.
It uses the existing Clash Display for the heading/labels, Playfair Display
regular for the numbers, and DM Sans for supporting text. Revenue and new
customers share the first row; hours saved, conversion and returning customers
share a three-column second row. Both rows keep this composition on mobile,
with smaller responsive type. No separate visible heading repeats the chapter.

## Current data is illustrative

All five values are layout examples, **not measured LIONOVART client results**:

| Metric | Preview figure |
| --- | --- |
| Client revenue | €1.2M+ |
| New paying customers | 2,400+ |
| Hours saved | 8,500+ |
| Conversion multiplier | 2.3× |
| Growth in returning customers | +38% |

The public disclosure sentence is no longer rendered. The internal
\`data-results-kind\` marker remains illustrative. Removing display copy does not
verify the dataset. These figures must not be treated as facts
by NOVA or reused as measured outcomes elsewhere.

To publish measured results, replace the entire preview dataset in
`src/components/sections/ClientResults.tsx`, update `data-results-kind`, and
replace the preview copy in the runtime message catalogs. Each published
result needs a client or explicitly defined cohort, measurement period, metric
definition, and source. Distinguish tracked sales from incremental revenue and
counts of paying customers from enquiries. Do not average conversion changes
across incomparable funnels or mix currencies without a stated method.

## Motion and accessibility

Each counter runs once on entering the viewport, with a 1.6-second ease-out.
The visual number also rises 16px and fades in over 600ms, staggered by 50ms
within each row. Reduced motion disables the rise.
Final values are present in server-rendered HTML. Screen readers receive those
stable final values rather than frame-by-frame announcements. A hidden sizing
copy reserves the final number's width throughout the animation. Reduced
motion shows final values immediately, including preference changes during a
count. Observers and animation controls clean up on unmount.

## Integration

BrandsElevatedScrollV2 owns ClientResults inside its scroll scene. The results
are positioned at the bottom of that existing scene, above its sticky card
plane, so they rise into the viewport as the chapter closes without appending
another section's height. The scene height, scroll offsets and card motion
values are unchanged. With reduced motion the inset uses normal flow, so all
five metrics remain readable without the layered entrance. TestimonialsCarousel
no longer appends a separate ClientResults. The existing testimonials NOVA
tracking wrapper remains, so no voice-agent registry or prompts change. Runtime copy is
added to JSON message catalogs, preserving existing translation review gates.
No font, dependency, theme, About statistics, or other section changes are
required.
