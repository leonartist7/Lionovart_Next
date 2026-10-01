# Client results section — 2026-10-01

The approved typographic results preview follows testimonials, before Process.
It uses the existing Clash Display for the heading/labels, Playfair Display
regular for the numbers, and DM Sans for supporting text. Revenue is featured
above four supporting figures in a responsive two-column grid.

## Current data is illustrative

All five values are layout examples, **not measured LIONOVART client results**:

| Metric | Preview figure |
| --- | --- |
| Client revenue | €1.2M+ |
| New paying customers | 2,400+ |
| Hours saved | 8,500+ |
| Conversion multiplier | 2.3× |
| Growth in returning customers | +38% |

The public section clearly identifies itself as a results preview and discloses
the illustrative status above the figures. It contains no fictional client
names or unsupported attribution. These figures must not be treated as facts
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
Final values are present in server-rendered HTML. Screen readers receive those
stable final values rather than frame-by-frame announcements. A hidden sizing
copy reserves the final number's width throughout the animation. Reduced
motion shows final values immediately, including preference changes during a
count. Observers and animation controls clean up on unmount.

## Integration

The section stays inside the existing testimonials NOVA tracking wrapper, so
no unrelated voice-agent section registry or prompts change. Runtime copy is
added to JSON message catalogs, preserving existing translation review gates.
No font, dependency, theme, About statistics, or other section changes are
required.
