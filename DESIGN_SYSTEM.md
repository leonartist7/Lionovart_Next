# LIONOVART — Website design system

Version 1.0 · 7 October 2026 · Owner references and conversation decisions

## 1. Authority and scope

This is the current design direction for LIONOVART’s public website and its Work page. Use it alongside the four original reference images. It supersedes conflicting aesthetic instructions in the earlier design files. The website itself is not changed by this document.

**Confirmed:** font families and roles; cream/black/red/metallic visual direction; clean, accessible browsing; the approved Work interactions; the requirement to review changes inside the complete page.

**Specified here for implementation:** exact color roles, responsive sizes, spacing, radii, focus treatments and motion limits. These are deliberate working values, not claims of exact measurements from the raster references. Refine them through actual page previews while keeping the confirmed identity.

**Content status:** the owner cleared existing client testimonials and results for use on 6 October. Preserve exact attribution and qualifiers. A statement such as “nearly doubled” must not become an exact “2×”. Reference-image statistics and generated promotional text are not a separate content inventory.

The owner’s objection to the isolated results preview concerned its separation from the Work page. Do not record that incident as rejection of the result-card aesthetic or of the approved outcomes.

## 2. The visual character

**Confident. Expressive. Precise. Human.**

Clash Display gives the identity its authority. Playfair Display Italic adds a softer, expressive voice. Warm cream supports reading and browsing. Near-black gives key brand statements depth. Vivid red points to action and selected emphasis. Gold and silver contribute material detail around the edges.

Minimalism means a clear reading order, limited competing actions and useful content. Preserve the richness of the brand where it serves the composition. Strong imagery, generous space and bold typography do most of the work.

### What each reference teaches

| Reference | Observable features | Reusable principle |
| --- | --- | --- |
| 01 · Transition | A broad dark curve, layered gold and silver edges, fine red filament, warm cream opening, compact headline | Use a material transition at a meaningful change of chapter. Leave the reading area calm. |
| 02 · Information | Left-aligned short headline, red emphasis, concise description, compact comparison with one red column | Information can be dense and useful without becoming visually noisy. Align shared rows and distinguish one priority. |
| 03 · Hero | Deep black, very heavy white uppercase text, gold italic accent, metallic side framing, red capsule action | Concentrate drama in a clear central statement. The decoration frames the message and the action. |
| 04 · Services | Large rounded work image, spacious cream surface, bold centered heading, gray description, restrained pills and faint edge filaments | Give the work physical presence. Support it with compact text and quiet controls. |

These are related treatments within one identity. A Work gallery can be predominantly cream while the homepage opening and a closing invitation use the dark treatment.

## 3. Typography — owner confirmed

| Role | Typeface | Weight | Treatment |
| --- | --- | --- | --- |
| Major headings | Clash Display | 700 | Bold, compact, intentional line breaks; uppercase for short major statements |
| Subheadings | Clash Display | 500 or 700 | Sentence case where it improves reading |
| Descriptions and body | Clash Display | 400 | Comfortable line height, normal tracking |
| Navigation, controls and labels | Clash Display | 500 | Clear, concise; uppercase only for small sectional labels |
| Expressive secondary phrase | Playfair Display Italic | 400 | One short phrase or subline; sentence case |

Do not replace the body font with DM Sans. Do not simulate a 900 weight when the supplied bold is 700. Use actual font files rather than treating a fallback as a finished match.

### Responsive scale

| Role | Desktop starting range | Mobile starting range | Line height | Tracking |
| --- | --- | --- | --- | --- |
| Brand hero | 88–132px | 44–64px | 0.96–1.02 | −0.025em |
| Section heading | 48–72px | 32–44px | 1.00–1.08 | −0.025em |
| Compact Work introduction | 48–64px | 32–40px | 1.05–1.12 | −0.02em |
| Expressive italic | 60–78% of paired heading | Adjust to fit a complete phrase | 1.12–1.22 | −0.02em |
| Subheading | 22–28px | 20–24px | 1.18–1.30 | −0.01em |
| Body | 18px; 20px for a short introduction | 16–18px | 1.50–1.65 | Normal |
| Controls | 14–16px | 14–16px | 1.25–1.40 | Normal |
| Utility / media label | 12–13px | 12px | 1.35–1.50 | Normal; uppercase eyebrow +0.08em |

Headlines must retain visible word spaces. With the supplied Clash files, add around `0.08em` word spacing to bold uppercase display text so words remain distinct at tight tracking. Do not use aggressive negative tracking to force a sentence onto one line. Allow a new line, shorten approved copy, or reduce size within its role instead. Keep body copy around 45–65 characters per line.

The sans/italic pairing is a signature, not a requirement for every heading. Alternate bold-only explanatory headings, selective red emphasis and occasional italic moments to avoid a repetitive template.

### English and French specimen

**YOUR VISION. YOUR IMPACT.**  
*Their trust. Their loyalty.*

**VOTRE VISION. VOTRE IMPACT.**  
*Leur confiance. Leur fidélité.*

This is the direction discussed with the owner. It is a typography specimen, not proof that this headline has already been applied to every page. Compose English and French line breaks separately. Preserve French accents in uppercase text and allow buttons to grow for longer translations.

## 4. Color roles

| Token | Value | Purpose |
| --- | --- | --- |
| Canvas | `#F5F0EB` | Main warm cream surface |
| Paper | `#F7F4EF` | A lighter cream variation, within the same family |
| Raised surface | `#FCF9F5` | Quiet optional panels and forms |
| Ink | `#111111` | Primary text on cream |
| Muted ink | `#66615B` | Body support and secondary descriptions |
| Night | `#0D0D0D` | Main dark scene |
| Deep night | `#080909` | Deeper background at scene edges |
| Inverse text | `#FFFFFF` | Main dark-scene and red-button text |
| Muted inverse | `#C9C1B7` | Supporting text on dark |
| Brand red | `#E5192A` | Primary actions, large emphasis and purposeful feature panels |
| Red text / hover | `#C51625` | Small red text on cream; darker interaction state |
| Bronze | `#6F4E2A` | Metallic shadow; decoration |
| Champagne | `#D6AE68` | Gold midtone; expressive text on dark |
| Pale gold | `#F3DEB2` | Narrow metallic highlight |
| Silver | `#DDD6CC` | Secondary reflective highlight |
| Soft divider | `#D9D2C9` | Nonessential separators |
| Control edge | `#8A8177` | Boundaries when required to identify an input |

Use red selectively: an action, a short emphasized phrase, or one information column. Do not give every card the same saturated red weight. Gold behaves as a material with light and shadow; it is not the default body-text color or a flat yellow fill.

### Checked combinations

Calculated from solid sRGB tokens, rounded here for readability:

| Foreground / background | Contrast | Use |
| --- | --- | --- |
| White / brand red | 4.66:1 | Primary button text |
| Muted ink / canvas | 5.41:1 | Secondary body text |
| Red text / canvas | 5.28:1 | Small red links and labels |
| Champagne / night | 9.36:1 | Gold words on dark |
| Brand red / canvas | 4.12:1 | Large emphasis or non-text accents; use red-text token for small copy |
| Champagne / canvas | 1.83:1 | Decorative filaments only |

Do not lighten a red button to `#F02133` beneath small white text: that pairing is about 4.23:1. A subtle CTA gradient can run from brand red to a darker red; check its lightest stop.

Text targets: 4.5:1 for normal text, 3:1 for qualifying large text. Required control indicators target 3:1 against adjacent colors. Decorative dividers have a different role from essential control outlines. See [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). These token checks do not certify the whole website.

## 5. Layout and spacing

- Use a shared desktop container up to **1328px**, with **56px** outer gutters at a 1440px viewport. Use **32px** gutters at tablet sizes and **20px** on mobile; allow **16px** at 320px.
- Use a **4px base** with the working scale: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128.
- Separate major content chapters by **80–112px** on desktop and **48–64px** on mobile. The Work introduction is more compact: **32–56px**.
- Headline to description: **20–28px**. Description to action: **24–32px**. Gallery gaps: **24px** desktop, **16px** mobile.
- Work media uses **two equal columns** on desktop and **one** below the content breakpoint, initially 760px. Breakpoints follow content fit, not a device name.
- Use a centered composition for a singular brand statement; use an editorial split for explanations and comparison. Maintain a shared alignment within each section.
- Give each section one main job. The reading order should be visible before someone reads every word.

## 6. Material, imagery and decoration

**Metallic ribbons:** broad, sculptural curves with dark bronze, champagne and pale highlights. Silver can share the edge. A very fine red filament ties the treatment back to the action color. Keep the central text and control areas clear. Use at a hero edge, chapter transition or final invitation; avoid repeating a full ribbon enclosure around every section.

**Cream filaments:** thin, low-contrast gold/silver lines at the outer edges. They may nearly disappear into the cream. They carry no essential information.

**Photography and work media:** preserve the client’s own colors and recognizable applications. Use clean, generous frames. Do not tint all client work gold or red to force it into the agency palette. Avoid crops that remove key text, devices, products or logos; inspect each asset’s fit. A consistent frame does not require identical cropping.

**Depth:** a soft warm shadow may lift an image; use a restrained starting value such as `0 16px 44px rgb(35 24 12 / 10%)`. Most text sections need no shadow or enclosing card. Avoid repeated nested borders, glass panels and floating boxes without a compositional reason.

**Marks:** reuse the approved logo and supplied wordmark artwork where available. Do not redraw the monogram, add a registration symbol, distort the mark or create a new lion. Use the lion only as an intentional brand image, not a repeating UI icon. Existing web assets are implementation candidates until checked against the approved mark.

## 7. Components and their states

### Primary action

Red capsule, white Clash Display 500 text, 52–56px high on desktop and at least 48px on mobile. Horizontal padding 24–28px. Optional fine pale inner edge. A small simple arrow may sit alongside the label. Hover darkens the red; press can scale to 0.98. Do not nest the arrow in an extra circle unless a specific reference requires it.

Focus is a visible 2px ring with a 4px offset. Use the dark-theme gold focus token on dark surfaces. Disabled controls show a distinct inactive appearance and remain correctly disabled; loading actions retain their dimensions and communicate status.

### Secondary action and text link

Use an ink outline or an underlined text action. Keep a 44px interactive target even when the visible label is small. A secondary booking route is available beside or below the primary enquiry, with less visual weight.

### Industry and service pills

Use the imported React Bits JellyRadio component. Industry is single-select, with an obvious All reset. In the current cream treatment, the selected pill is near-black with white text; inactive pills use cream, muted ink and a quiet outline. This cream treatment supersedes the earlier dark-chip/light-active color example for this page.

Keep **all industries visible in wrapping rows**. No horizontal filter scrollbar. Keep service refinement in a labeled panel with separate Industry and Service groups and explicit Apply/Cancel. Show selected service and an easy reset outside the panel.

Retain an elastic selection response. Original spring settings: stiffness 580, jelly 1, bounce 0.25, stagger 22ms. For wrapped rows, use an effective selected swell of **8%**, **zero neighbor displacement**, **12px gaps** and **7px / 8px group padding**; do not shrink inactive touch targets. The original 20% expansion and sideways displacement assume one line and are inappropriate for tightly wrapped rows. Resize notifications must not cancel an active selection spring. Reduced motion gives an immediate, static selection.

Use radio-group semantics, arrow-key selection, Home/End, visible focus, and targets at least 44px high. The responsive adaptation changes motion amplitude, not selection behavior.

### Work frame

Media only, with all assigned service labels at bottom left and pause/play at top right. No caption row, visible brand-name label, Film badge, duration, industry caption, project arrow or click-through. Brand names remain in accessible descriptions and internal data. Existing project URLs can remain directly accessible independently.

Frame radius: **24px desktop / 18px mobile**. Informational service-label radius: **6px** with a warm opaque or nearly opaque backing and readable text. Labels wrap; they do not behave like filter controls. Media uses muted looping autoplay, offscreen/hidden-page pausing, manual pause, poster fallback and reduced-motion support. Nothing starts with sound.

### Results and proof

Attach every outcome to its actual client and project context. Pair the reported change with delivered work and a concise, attributed testimonial. Preserve “over”, “nearly”, timeframes and estimated status. Use client experience language rather than implying isolated causal proof when only a testimonial is available.

Show two or three stories at a time. Relevant industry stories can come first; identify cross-industry examples honestly when there is no match. A red feature card is allowed when it creates a clear hierarchy. Results are a chapter within the Work page, not a separate destination or duplicate gallery.

### Enquiry panel

Short fields for contact details and project message, a clear action, optional removable browsing/project context and a visible booking alternative. Modal focus stays within the panel; Escape closes it and focus returns to the opener. At 320px the panel fits the viewport and scrolls internally when necessary. Labels remain visible above fields. Do not claim a message was sent when an email draft was merely opened.

### Comparison

The red-column comparison in reference 02 is a valid information pattern, not a mandatory section on every page. Use it for a distinct decision with clear criteria. On the current Work journey, results and next steps replace the repeated approach/comparison content.

## 8. Motion and accessibility

Controls respond immediately to intent. Use short 160–220ms color transitions and measured spring movement. Optional ambient ribbon motion is slow and confined to edges. Do not hide the gallery behind an introductory animation, voice interaction, questionnaire or scroll reveal.

Use native controls and semantic landmarks. Maintain visible focus. Do not make hover the only way to discover information. All essential content is visible with reduced motion. Prefer opacity and transform for movement; avoid decorative motion that shifts reading positions. Verify at 320, 390 and 1440px, with keyboard navigation, text zoom and reduced motion.

## 9. Page composition

**Homepage:** expressive opening, curated four-work preview, concise capability/value sections, attributable proof and clear contact. Route to the full collection. The screenshot’s audit button is a style reference; it does not override enquiry as the Work page’s primary conversion route.

**Work:** compact introduction → visible industry choices → relevant media → client outcomes → a short next-step sequence → founder/contact context → closing enquiry. Audit is optional and subordinate. No search bar or collection-count/curated-order row. Keep URL-driven filters and pagination in increments of 12 as the inventory grows; do not add fictional entries to reach a count.

**Next steps:** understand the ambition → recommend a direction → define scope, deliverables, timing and investment. Explain what happens after contact instead of repeating broad claims about design quality.

Always review section changes inside the complete page. A component specimen can support a design-system discussion, but it does not replace the requested full-page review.

## 10. Content, tone and growth

Write directly to the prospect and connect the brand’s ambition to its customer’s experience. Prefer a specific statement to repeated declarations of “innovation”, “premium” or “excellence”. Keep evocative headings short and practical explanations clear. Never repeat the same argument under different section titles.

English and French receive equivalent meaning, not forced literal word order. Do not mix languages inside a page unintentionally. Actual service and industry names come from the inventory. Keep client/project names available to assistive technology even where the visible card is deliberately minimal.

Success is evaluated through completed enquiries, bookings and audit requests once real tracking exists. This system organizes a plausible conversion journey; it does not claim a measured conversion lift from the design alone.

## 11. Guardrails for future design work

1. Start with the current page and these four references. Preserve existing edits.
2. Name each section’s distinct purpose before changing its layout.
3. Apply confirmed typography and semantic colors before decorative details.
4. Keep the gallery and filters immediately usable; retain the specified motion behavior.
5. Check heading word spaces and French line breaks at actual viewport sizes.
6. Distinguish decorative faint lines from essential control boundaries.
7. Review desktop and mobile views in the full page context.
8. Record what changed, what was checked, and whether it is local, in MagicPath or live.

Avoid substituting a generic SaaS dashboard, an all-black page, or uniform cream minimalism for the reference-led identity. Avoid yellow-gold everywhere, compulsory italic sublines, oversized introductions on gallery pages, repeated three-column claims and ornamental card wrappers that compete with the work.

## Deliverables

The companion visual guide demonstrates the four references, typography, semantic palette, light/dark treatments, media framing and working JellyRadio controls. `tokens.css` contains scoped implementation tokens and starter component classes. `MAGICPATH_BRIEF.md` is the condensed handoff. The exact files and values are reusable; further aesthetic changes should be reflected here rather than held only in chat history.
