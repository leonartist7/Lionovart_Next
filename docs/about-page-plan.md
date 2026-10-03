# LIONOVART — About page and homepage restructuring

Prepared October 2, 2026. Status audit and executable plan. The phase-one agency About page and phase-two compact homepage are implemented and verified together on the unified PR 80 preview. Phase 3 composition review, phase 4 full integration/localization and phase 5 production release remain pending. See `docs/about-page-progress.md` for current execution evidence.

## Verified status

**The requested restructuring has not reached master or its latest production deployment.**

Repository: `leonartist7/Lionovart_Next`; default branch: `master`.
Inspected commit: `8cc0eb6ca06d9039d1f2921cbfe1d4ec27a6b0d6`.
Commit date: October 1, 2026, 13:18 UTC.

| Requirement | Evidence at the inspected commit | Status |
| --- | --- | --- |
| Dedicated About page | No About route in the repository tree; localized catch-all page map also has no `/about` entry | Not implemented |
| Founder portrait moves off the homepage | PageBuilder still renders AboutExperience, which defaults to AboutUsHalf and the founder portrait | Not implemented |
| Short Others / LIONOVART homepage comparison | Comparison still uses five provider columns, seven feature rows and a 900px minimum grid width | Not implemented |
| Detailed comparison moves to About | Full Comparison remains directly after AboutExperience on the homepage | Not implemented |
| About navigation and metadata | Destination does not exist; sitemap route registry omits `/about` | Pending |
| Deployment includes requested changes | Latest returned Vercel production deployment is READY at the same inspected master SHA | Not implemented |
| Mobile quality verified for the new experience | No new experience exists to verify | Pending |

Production deployment inspected: https://lionovartnext-qhg7k2i7f-lionovart.vercel.app
Repository baseline: https://github.com/leonartist7/Lionovart_Next/commit/8cc0eb6ca06d9039d1f2921cbfe1d4ec27a6b0d6

The October 1 `LIONOVART-About-Page-Master-Prompt.md` explicitly identifies itself as a planning handoff, with implementation as a subsequent task. It is useful input, but does not establish that code was written or pushed. The 21 open pull requests inspected contain no About-specific PR. The returned branch list has no branch specifically named for this About task. These checks cannot establish whether work remains unpushed on another computer or under an unrelated branch name.

This turn checks source and deployment metadata; it does not claim a visual browser audit, new build, code push, or deployment.

## Final experience

Homepage affected sequence: **Services → compact comparison → existing client results → existing process**.

About page: **Agency opening → agency proposition and numbers → connected expertise with imagery → LION / NOVA / ART → detailed working-model comparison → Leonardo as creative lead → contact invitation**. This agency-first order supersedes the initial founder-first composition, following the latest feedback.

Use LIONOVART throughout. Navigation label: About. English URL: `/about`.

The homepage becomes shorter where the founder and long comparison currently sit. About gives those ideas room, while remaining clear to scan on a phone. Events, audiovisual environments and experience concepts belong alongside brand, film, platforms and intelligent systems.

## Phase tracker

| Phase | Deliverable | Current status | Completion gate |
| --- | --- | --- | --- |
| 0 | Baseline and recovery audit | Complete for this planning turn | Source and deployment checked; refresh before coding |
| 1 | Functional About page, designed for phones first | Complete on preview branch | Direct route and reload work; complete story readable at 320–390px |
| 2 | Homepage restructuring and comparison migration | Implemented, reconciled and verified on unified preview | Founder moved; two-provider/four-topic homepage comparison; full detail available on About |
| 3 | Premium composition and restrained motion | About refinement built; complete phase review pending | Mobile, tablet and desktop layouts refined; reduced motion works |
| 4 | Navigation, localization, SEO and NOVA integration | Pending | Routes, links, language switching, metadata and assistant actions work together |
| 5 | Final verification, integration and release | Pending | Required checks pass; tested commit matches the deployed result |

Execute one phase at a time. Testing is part of every phase; phase 5 consolidates final evidence. Do not mark a phase complete from code changes alone.

## Phase 0 — Refresh the implementation baseline

Completed here: read the previous prompt, current master source, relevant route and layout conventions, design instructions, open PRs, branch names and Vercel deployment records.

Before phase 1, refresh remote heads and inspect the working tree. Reconcile any new About work rather than creating a duplicate implementation. Read applicable AGENTS.md and the narrowest required project skill. The current AGENTS.md requires reading relevant installed Next.js documentation before coding; package.json currently pins Next.js 16.2.1.

Preserve newer work on global SEO, globe markers, the client counters within the Brands Elevated scene, navigation, footer, hero and ongoing Imagine work. Do not merge unrelated PRs as part of this task.

Output: baseline SHA, relevant existing changes, selected implementation branch and any genuinely blocking issue. No approval pause is needed for routine layout decisions within the approved direction.

## Phase 1 — Build the complete About story on mobile

Goal: a working page with useful content before decorative polish.

Likely implementation targets, subject to refreshed source:

- New `src/app/(site)/about/page.tsx`.
- Focused About components under a suitable existing component directory.
- `src/app/[locale]/[[...slug]]/page.tsx` route registration, because public localized URLs use an explicit page map.
- Existing site navbar, footer, language and contact conventions. The site root layout does not currently mount navbar/footer directly; follow the existing page composition and avoid duplicating them.

The initial chapter brief below is retained as history. The latest revision prioritizes the agency over the founder, uses Playfair Display for selected phrases and large numbers, and fills the detailed comparison earlier at the user’s request.

Build these chapters:

1. **The mind behind the work.** Dark opening; eyebrow, H1 and a short proposition. Do not reuse the heavy homepage hero scene.
2. **Leonardo, founder and creative director.** Warm ivory portrait chapter using `/images/Leon-Studioshot.avif`; a concise first-person introduction. On phones: name and role, photograph, then story. On wide screens: portrait beside copy.
3. **A brand should feel connected.** Explain how identity, film, websites/apps, intelligent systems and physical experiences express one idea. Describe event concept, creative direction and coordination with appropriate production partners.
4. **LION / NOVA / ART.** Three editorial chapters. Reconcile the approved meanings from current project documents rather than publishing invented definitions.
5. **The difference is in how the work comes together.** Four principles: direct creative relationship, shared direction, practical execution, work with a purpose.
6. A clearly reserved destination for the detailed comparison, populated in phase 2. Do not show an empty placeholder to visitors.
7. **Let's make your next chapter unmistakable.** Reuse the actual contact/booking flow.

Copy must be human and specific. Do not invent a team, biography, awards, projects, testimonials or delivery guarantees. Existing source claims such as 15+ years, 10+ industries and 100% on-time delivery are not verified merely by being in the old component; omit unsupported figures from the new About copy.

Mobile layout contract:

- Start at 390px, then prove that 320px works before adding larger-screen layouts.
- Single-column reading order; use normal document flow and content-driven heights.
- Approximately 16–20px horizontal gutters on small phones, scaled to the available width.
- Body copy normally 16–18px with comfortable leading; never shrink paragraphs to force a composition to fit.
- Fluid headings with explicit line-break review at 320, 375 and 390px. No chopped letters or forced single-line titles.
- Portrait has an explicit aspect ratio and tested focal placement; face and chin remain visible.
- No critical information behind hover, animation, scroll pinning or a hidden experiment control.
- Contact links and controls remain reachable with the fixed navigation, NOVA panel and bottom overlays present.
- Primary controls target at least 44px touch height and have visible keyboard focus.

Completion gate: `/about` opens directly and after reload, the localized routing arrangement does not intercept it into a 404, images load, the full story and contact action work, and 320/390px screenshots show no horizontal overflow. Complete a project-appropriate build/check and publish a functional phase preview using the established Vercel workflow.

## Phase 2 — Move content and shorten the homepage

Goal: make the requested homepage change only after its new destination works.

Update PageBuilder to remove the prominent AboutExperience portrait/story chapter. Replace the full homepage Comparison with a dedicated compact presentation. Reuse shared comparison content where useful, but give the two presentations separate layout responsibilities.

Homepage compact comparison (follow the newer `LIONOVART-Compact-Homepage-Section-Plan.md` for the final composition):

- One compact ivory chapter: headline, copy and three-number strip on the left; comparison on the right at desktop sizes. Mobile order: headline, copy, numbers, comparison, scope note and About link. No founder photo.
- Reuse verified agency-structure numbers unless substantiated outcome figures are supplied. Preserve the existing client-results scene without duplicating its metrics.

- Heading: **Innovation is not a choice. It’s a necessity.** Keep “necessity” red. This supersedes the earlier “One direction. Every touchpoint.” proposal in line with the newer compact-homepage plan.
- Supporting line: **A connected approach to your brand, content, platforms, and experiences.**
- Exactly two provider headings: **Others** and **LIONOVART**.
- Four topics maximum: creative direction, brand consistency, connected creative/technical work, direct collaboration.
- Topic label spans its pair of entries; do not create a third provider/feature column.
- Link: **Meet LIONOVART →** to the working About route.

| Topic | Others — illustrative working arrangements | LIONOVART — verify scope |
| --- | --- | --- |
| Creative direction | May be split across suppliers | One direction across the agreed work |
| Brand consistency | Depends on coordination between contributors | A shared system across selected touchpoints |
| Creative and technical work | May require separate specialists | Disciplines connected around the brief |
| Collaboration | Depends on the provider's setup | Work directly with Leonardo |

Use restrained lines, clear type and selective brand emphasis. Avoid a large checkmark matrix. Add a short readable qualifier about scope varying by provider and project; these are illustrative arrangements, not researched claims about every competitor.

On mobile each topic must keep both provider labels associated with its answers. Two equal columns are acceptable only when comfortably readable; at narrower widths, stack the pair within the topic group. Never reuse the old 900px/1120px minimum table widths or require sideways scrolling. Desktop height is content-driven; aim for a genuinely short chapter rather than a fixed pixel constraint.

Detailed About comparison:

- Transfer useful subject matter from the old five-provider, seven-topic comparison.
- Replace blanket pass/fail scoring with short descriptions of different working models.
- On phones, use topic groups with explicitly labeled provider entries. Optional native disclosures can reduce secondary depth; key benefits remain visible.
- If a desktop table is retained, provide semantic headers and an equally complete readable mobile presentation.
- Avoid universal 48-hour delivery, universal flat pricing or guaranteed competitor shortcomings.

Update or remove old homepage About anchors and hidden experiment behavior as appropriate. The old AboutExperience currently exposes an invisible click control that switches layouts; do not carry that into the new public About page. Remove only unused code whose callers have been checked.

Completion gate: homepage shows Services → compact comparison → current results → process; founder story and detailed comparison are accessible on About; related anchors are valid; actual homepage chapter height is recorded before/after at the same viewport; 320/390px layouts are readable. Verify that shortening the page does not disrupt Lenis/ScrollTrigger spacing, pinned result cards or counters.

## Phase 3 — Refine the premium visual experience

Goal: make the functional structure feel unmistakably LIONOVART across screen sizes.

Use current brand tokens: black, warm ivory, selective red actions and gold accents. Confirm exact token values in current source. The amber globe change does not imply a global palette replacement.

Keep installed fonts. Current source loads Clash Display, DM Sans and Playfair Display; older documentation says Clash throughout. Resolve this against the latest approved implementation, recording the choice. Do not introduce a new display family or a global typography migration for this page.

Composition:

- Dark typographic opening and closing, an ivory founder chapter, deliberate chapter transitions.
- A generous portrait, asymmetry on wide screens, simple reading order on phones.
- Numbered editorial pillar rows, varied image placement and fine separators instead of repeated generic cards.
- Real work assets only; no invented portfolio projects or stock meeting imagery.
- Keep paragraph measures comfortable and the content width around the existing 1200–1400px system.
- Examine intermediate tablet widths explicitly; do not jump straight from phone to desktop.

Motion:

- Brief opacity/transform reveals and restrained imagery movement.
- Static content remains visible if motion fails or is disabled.
- Respect reduced motion; disable parallax and nonessential movement.
- No desktop cursor effects on touch devices, no mandatory pinned storytelling, no autoplay media bundle on initial load.
- Load below-fold images lazily with accurate sizes and reserved space. Use video only when the story benefits and playback is controlled near the viewport.
- Clean up observers, listeners and animations during route changes.

The separately discussed golden diagonal background lines are a different enhancement. Preserve any approved implementation, but do not expand this About task to redesign the whole homepage background.

Completion gate: review screenshots at 320, 390, 768, 1024 and 1440px, plus reduced motion. Typography, photograph crop, image loading, spacing and CTA visibility all pass. Motion adds polish without hiding information or trapping scroll.

## Phase 4 — Connect navigation, languages, SEO and NOVA

Goal: treat About as a real part of the website.

Navigation:

- Add About to the current desktop/mobile menu and appropriate footer navigation.
- Replace founder-story `#about` actions with the About destination. Preserve `#comparison` for the compact homepage chapter if it remains useful.
- Use locale-aware links and existing active/focus states. Check direct entry, homepage entry, browser back and forward, menu closure and language switching.
- Confirm whether the standard or compact footer is appropriate on About; avoid two competing closing CTAs or duplicated footers.

Localization:

- Reuse the existing six-locale architecture: en, fr, es, it, ja, ko.
- Keep English copy as the source of truth. Complete new content through the current translation and review workflow before offering a localized About destination.
- Do not render English-only new paragraphs inside a page that otherwise claims another language without an explicit fallback treatment.
- Do not list unfinished localized About URLs in sitemap or alternate metadata. Verify longer translations, Japanese/Korean line breaking and the language dropdown.

SEO:

- Add accurate page title, description, canonical, social metadata and relevant route metadata entries.
- Register `/about` in `src/lib/seo/config.ts` and ensure sitemap generation agrees with the routes actually available.
- Inspect `src/lib/i18n/seo.ts`: localized catch-all pages generate their own metadata, so page-level metadata alone is insufficient.
- Keep primary positioning city-neutral and preserve the recent SEO change.
- Current source canonical origin is `https://lionovart.com`; historical project context also mentions `lionovart.group`. Verify actual Vercel domain configuration before changing the origin. An About task is not authorization to perform a domain migration.

NOVA:

- Review `src/lib/nova-knowledge.ts`, `nova-brain/knowledge.js`, section registries and navigation/tool execution paths.
- Stop pointing assistant About actions to a removed homepage section.
- Support page-aware navigation before section scrolling; keep real targets synchronized with `data-nova-section` markers.
- Update founder/working-method knowledge accurately, while keeping existing homepage comparison and results actions useful.

Completion gate: desktop/mobile/footer links work; registered language destinations render correctly; canonical and sitemap match available routes; NOVA can reach About and the relevant real section; contact actions still work. Run meaningful targeted integration checks as well as build/type/lint checks appropriate to the touched code.

## Phase 5 — Verify and integrate the tested result

Use this final matrix on both the homepage and About. No phase completion claim based only on a green deployment badge.

| Check | Required evidence |
| --- | --- |
| Responsive widths | 320, 375, 390, 768, 1024, 1280 and 1440px; no document overflow or clipped copy |
| Short phone heights | 390×667 and a narrow short phone; natural scroll and reachable actions |
| Text enlargement | 200% zoom/text enlargement; content and controls remain usable |
| Navigation | Direct load/reload, logo, About links, mobile menu, back/forward and language switch |
| Comparison | Four compact topics; both providers clearly labeled; detailed mobile version complete |
| Portrait/media | Face crop checked; correct aspect ratios; no broken assets or disruptive layout shifts |
| Accessibility | Heading hierarchy, table/disclosure semantics, contrast, focus, keyboard, touch and reduced motion |
| Integration | Contact/booking, NOVA overlay, section actions, footer and existing fixed controls |
| Homepage regression | Hero, services, Brands Elevated cards, counter placement, process and footer retain approved behavior |
| Technical checks | Changed-file lint, type checks and build; distinguish existing baseline failures from new regressions |
| Performance | Compare mobile loading against baseline; no unnecessary new WebGL/video startup or oversized image transfer |
| Release | Preview is READY, inspected SHA is recorded, final integration SHA and deployment metadata agree |

Use available browser tooling to capture real screenshots and perform real interactions. Any unavailable device/browser check remains explicitly unverified; do not invent results. Where available, check a WebKit/mobile Safari rendering as well as Chromium because portrait layouts, menus and viewport heights can differ.

Integrate using the user's existing authorization for this About/homepage work, with normal repository requirements. Never force-push over concurrent master changes. If master advances, reconcile changes and repeat the affected checks before integration. Do not merge unrelated PRs. Verify the actual resulting Vercel deployment rather than assuming push equals publication.

Final deliverable: working About URL and homepage URL, short changed-behavior summary, tested commit, actual check results, mobile/desktop screenshots and any remaining concrete limitation.

## Continuity and completion rules

At the start of each implementation phase, read this plan, the previous master prompt and current source. Refresh the remote baseline. Select the next incomplete phase and finish its scope without expanding into unrelated redesigns.

At the end of every phase, record:

- Phase number and status: pending, in progress, complete or blocked.
- Exact source commit and changed-file summary.
- Tests/checks actually run and their results.
- Preview deployment URL and state, when available.
- Screenshot paths and widths inspected.
- Remaining issue and the next phase.

Maintain one repository progress document during implementation, for example `docs/about-page-progress.md`, rather than competing status files across chats. Store this implementation plan there when starting the build. This planning turn creates the handoff document; it does not push website code or claim the repository progress file already exists.

Use this continuation instruction for each phase:

> Continue the LIONOVART About/homepage restructuring from the phased plan and previous master prompt. Read current master, applicable AGENTS.md and the last progress entry. Execute only the next incomplete phase. Build for mobile first, verify at 320 and 390px before larger widths, preserve newer approved work, and finish the phase's completion gate. Update the progress document with the exact commit, checks, screenshots and working preview URL. Distinguish implementation, verification and integration; do not mark any of them complete without evidence.

