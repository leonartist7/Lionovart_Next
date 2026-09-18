# LIONOVART — Discovery, Audit & Client Onboarding Handoff

**Status:** Approved product direction; implementation specification. Creating this document does not mean the application features are implemented or verified.
**Prepared:** 18 September 2026.
**Audience:** Leon, designer, and Claude/Codex implementation agent.
**Primary outcome:** Qualified strategy calls supported by useful, editable discovery briefs.

## Read this first

Build a mobile-first discovery experience that makes visitors feel:

> “LIONOVART understands what I’m trying to achieve, and I can already see a useful next step.”

Read `AGENTS.md`, `PORTAL_HANDOFF.md`, `PORTAL_DESIGN.md`, and relevant `PORTAL_PAGES.md` sections before implementation. Read the narrowest applicable project skill. Use the existing brand and component system rather than introducing a competing design system.

This document changes the earlier invitation-only product direction **only for new prospect discovery workspaces**. Existing client-workspace membership remains protected. Update conflicting documentation as implementation lands, not ahead of working behaviour.

Inspect the current branch and worktree first. There are concurrent edits in marketing components, global styles, and navigation. Do not overwrite or revert another session's changes. Coordinate shared-file changes with the active owner when possible. Do not create a second portal implementation in `master-preview-publish`.

## 1. Product intent and fixed decisions

- Serve existing businesses and new founders equally.
- Show useful initial value before requiring an account.
- Provide automated initial analysis; Leon personally reviews selected qualified opportunities.
- Make a qualified strategy call the primary commercial outcome.
- Support voice, text, and direct controls using the same underlying brief.
- Reuse the existing portal, Firebase authentication, NOVA, email, and brand foundations.
- Preserve discovery work when a prospect becomes a client.

**Journey:** Choose a starting point → receive initial insights → save a workspace → develop business context and creative direction → review the brief → book a strategy call.

Visitors may book directly or leave after receiving a summary. Completion of discovery is never a booking prerequisite. The free experience provides observations, a direction board, and a draft brief; it does not promise finished branding, bespoke production, or a complete consulting engagement.

### Success measures

Primary: qualified calls attended per discovery start, followed by won projects. Supporting measures: time to useful result, completion by device and path, step abandonment, account claims, analysis cost, delivery failures, and voice-versus-text completion. More accounts alone is not success.

## 2. Existing foundations and boundaries

The inspected application contains Firebase Google/email-link authentication, invitation-based workspaces, membership guards, project delivery surfaces, adaptive navigation, NOVA voice/transcripts, limited website extraction, internal lead dossiers, Resend email, and funnel events. These are code foundations, not evidence of production readiness.

### Required changes

- Add public prospect discovery without weakening existing invitation or membership controls.
- Add a prospect/client lifecycle independent of active/paused/archived workspace status. Existing workspaces default to client behaviour for backwards compatibility.
- Store a customer-facing review separately from internal NOVA dossiers.
- Connect discovery sessions, leads, conversations, authenticated ownership, and client workspaces through stable IDs.
- Replace audit capture-and-wait behind a feature flag; preserve old links and campaign attribution.
- Preserve existing client login and invitation behaviour.

### Known limitations to address

- The current scraper extracts bounded HTML without JavaScript rendering. It cannot substantiate visual design, full-site coverage, or broad online-presence claims by itself.
- Internal dossiers include qualification and sales notes. Never serialize them as public audit results.
- Audit lead capture and dossier code use differing website field names (`website_url` and `website`). Normalize at the integration boundary with compatibility reads; do not lose historic values.
- Existing lead endpoints can return HTTP 200 with `saved: false`. New consumers must inspect business outcomes, not treat every 200 as success.
- Some emails promise personal follow-up within a fixed timeframe. Update discovery-facing promises to match selective human review.
- Portal production documentation mentions Vercel while other project documents describe Cloud Run and a custom WebSocket server. Confirm the actual target and voice runtime before choosing audit-worker infrastructure. Do not assume long-running jobs survive a request ending.

## 3. Navigation and screen specification

### Entry points

- Primary discovery CTA: **Discover your next move**.
- Website-specific CTA: **Get your website & brand review**.
- Returning visitor: **Sign in**; authenticated visitor: **My workspace**.
- Retain a direct strategy-call route.
- Mobile: expose the primary action; place secondary navigation in the menu. Do not stack competing floating conversion controls.

Recommended route organisation: `/discover` for the new public journey, existing `/audit` as a compatible website-review entry, existing `/portal/login` for authentication, and prospect views within `/portal/[workspace]`. Reuse the existing `/call` entry. Use safe internal return destinations; never permit arbitrary redirect URLs.

### A — Choose a starting point

**Heading:** What are you building next?

Two keyboard- and touch-accessible options: **Improve an existing business** and **Build something new**. Explain the free outcome briefly. Do not ask for an account, email, or microphone permission here.

### B — Initial context

Existing businesses provide a website and primary goal: enquiries, sales, credibility, brand clarity, or other. Confirm or correct detected identity. Include **I don't have a website**, preserving compatible answers when switching paths.

Founders answer: what are you building, who is it for, and what would you like help achieving first? Use short question groups, not a long mobile questionnaire. Optional detail never blocks progress.

### C — Analysis and optional conversation

Display real processing stages such as reading accessible pages, checking available technical signals, and preparing observations. Never simulate percentages or claim unperformed checks.

Offer **Tell NOVA more** while analysis continues independently. Visitors can stay silent. Completed findings are not withheld until questions are answered. If processing is slow, offer email delivery and continuation of the brief. No completion-time promise until measured.

### D — Initial result

| Existing business | New founder |
| --- | --- |
| Editable business summary | Editable concept summary |
| Up to three supported opportunities | Initial positioning hypothesis |
| One practical next action | Suggested first launch priority |
| Coverage and missing evidence | Strategic questions still to resolve |

Show fewer findings when evidence is limited. Never invent content to fill a layout. An example must be labelled as an example, never presented as a finding about the visitor.

Primary: **Save & explore my direction**. Secondary: **Email me the summary**. Keep booking accessible.

### E — Save your workspace

Use Google and email-link authentication. Explain: **Keep your findings, save your references, and continue whenever you're ready.**

Distinguish requested summary delivery, account creation, and optional future marketing. Sending an email does not silently create consent or membership.

Preserve the result and return destination through existing-account login, provider cancellation, expired links, and cross-device completion. Anonymous claim must use a verified ownership transfer, not an email-address match.

### F — Guided discovery

| Chapter | Inputs | Output |
| --- | --- | --- |
| Your business | Audience, offer, challenge, desired outcome | Confirmed business summary |
| Your direction | References, preferences, exclusions | Saved direction board |
| Your project | Priorities, timing, investment context | Draft brief |

Prepopulate supported information. Mark AI suggestions until confirmed. Chapter completion reflects actual required answers, not an arbitrary profile score. Permit skip/return for optional questions. Budget input accepts **Not sure yet**; do not invent agency price ranges.

### G — Review the brief

Show business/audience, goals/challenges, relevant findings, creative preferences/exclusions, requested scope, timing, investment context, and open questions. Allow editing each section without restarting.

Separate confirmed answers and inferred suggestions. Primary: **Book a strategy call**. Secondary: **Keep exploring**.

### H — Booking and return visits

Reuse the established booking integration. A clicked link is not a confirmed booking. Confirm only from the provider's authoritative response or verified event. Show date, time, timezone, and call purpose.

Attach an immutable brief revision to confirmed booking. Subsequent edits remain visible as newer revisions without changing the historical snapshot. Returning prospects see their latest findings, saved direction, and one useful next action.

### Prospect navigation and client transition

Desktop prospect navigation: **Overview · My review · My direction · My brief · Book a call**. On mobile use four tabs (Overview, Review, Direction, Brief), with booking as the relevant page action. During a focused wizard, replace portal tabs with the single step-action area.

For founders, label review content **Launch direction** where appropriate. Do not show empty delivery modules. Agency conversion unlocks relevant client features while retaining the same account and discovery history.

## 4. Visual direction and mobile-first behaviour

**Design character:** Calm, editorial, precise, recognisably LIONOVART. Preserve Clash Display headings, DM Sans body, semantic tokens, restrained red primary emphasis, gold review accents, and neutral surfaces. Retain both portal themes. Discovery remains calm even when the marketing site is cinematic.

### Composition

- One H1 and one visually dominant action per screen.
- Left-aligned questions and readable prose.
- Main content approximately 1,024px maximum; question forms approximately 560px; prose approximately 65 characters per line.
- Use spacing for grouping. Cards should represent meaningful groups, not wrap every sentence.
- Reuse existing Lucide icons, controls, radii, and spacing scale.
- No generic statistic rows, mysterious brand scores, decorative dashboards, excessive glass, generated avatars, or fake activity.

### Responsive contract

| Width | Behaviour |
| --- | --- |
| 320–639px | Single column, compact header, full-width primary controls; short overlays become sheets |
| 640–1023px | Single reading column with more breathing room; reference gallery may use two columns |
| 1024px+ | Main content plus optional contextual sidebar; existing desktop portal shell |
| Wide desktop | Preserve content widths; increase surrounding space rather than stretching prose |

Build the smallest layout first. Content order and meaning do not change at breakpoints. Sidebars must reflow into the reading order, not hide essential information.

### Phone layout sketch

```text
[LIONOVART]                         [Close]
[Back]                    [Chapter 1 of 3]

What would you like to change?
One short sentence explaining why this matters.

[Question / evidence / reference content]
[Optional help or NOVA entry]

[Save status or actionable recovery]
[              Continue                ]
[            Safe-area space           ]
```

Do not lock this to a fixed height. Let content grow with text size and translated copy. Closing returns to an overview; browser back returns to the previous meaningful step.

### Mobile interaction requirements

- Targets at least 44×44px; primary controls approximately 48–52px tall.
- Editable text at least 16px; page padding starts at 16px.
- Respect safe areas and dynamic viewport height.
- No horizontal page overflow at 320px.
- No essential hover-only controls or required drag/swipe gestures.
- Long forms and conversations use full pages; sheets are for short tasks.
- Keep one bottom action region. Never stack a wizard footer, tab bar, and voice dock.
- Keep focused fields visible when the keyboard opens. Move sticky actions into document flow when needed. Avoid nested scrolling.
- Preserve meaningful back navigation, entered values, and scroll position.
- Long names, URLs, and unbroken strings wrap safely; full values remain accessible.

### Typography and motion

Use approximately 28–32px mobile titles, scaling to the portal desktop hierarchy. Main discovery prose is 16px with comfortable line height. Keep metadata readable and preserve the existing spacing scale.

Animate opacity and transforms briefly. Remove spatial motion for reduced-motion users. Pointer-down may show press feedback; submissions and consequential actions occur on normal click/keyboard activation. Do not import marketing scroll hijacking or continuous WebGL effects.

### Three signature moments

1. A supported finding appears with its evidence.
2. A chosen reference joins the saved direction board.
3. Answers resolve into a coherent, editable brief.

Each must work without animation and without delaying task completion. Use original or licensed reference imagery; no new decorative image generation is required to make the core flow usable.

## 5. Creative direction and NOVA

### Reference gallery

Start with six curated, properly licensed directions, each combining typography, layout, colour, and imagery. Suggested editorial categories: restrained editorial, bold expressive, warm human, precise technical, refined premium, and playful independent. These are exploration prompts, not fixed brand templates.

- One column on narrow phones; two when readable; three on desktop.
- Select up to three initial directions.
- Separate **View larger** from selection to avoid accidental changes.
- Include **Help me decide** and **None of these**.
- Ask what appeals: typography, colour, imagery, clarity, energy, or a written reason.
- Permit reference links and written exclusions in the first release.
- Use visible selected states with text/check indicators, not colour alone.
- Record asset origin/license in the curated asset manifest.

Selections express preferences, not binding design requirements. Never imply examples are completed work for the visitor or copy a competitor's identity.

### Shared conversation context

NOVA receives the active step, confirmed profile, approved audit findings, existing answers, and pending suggestions. It asks one relevant question at a time and avoids repetition.

Voice, text, and direct controls update the same draft through authenticated or anonymous-owner-validated server operations. Suggestions remain reviewable. Explicit corrections take precedence over old inference. NOVA may not bypass permissions or silently submit a booking or confirmed brief.

### Voice behaviour

- Explicit start, mute, stop, and switch-to-text controls.
- Microphone permission only after choosing voice; identify NOVA as AI.
- Visible listening, processing, speaking, paused, and error states.
- Readable transcript, interruption, and stop-playback support.
- Text/direct controls remain complete without microphone access.
- Stop capture and release media resources at session end or departure.
- Require explicit resume after interruption; never unexpectedly resume audio.
- No autoplay on entry and no default raw-audio storage for this feature.

If the model or voice connection fails, preserve accepted answers, show a recovery action, and allow the brief to continue normally.

## 6. Audit quality and delivery

### Analysis layers

**Initial snapshot:** Accessible website content, a bounded set of relevant pages, and available technical checks. Generate only supported findings.

**Expanded review:** Additional pages, visitor-confirmed social profiles, selected competitors, and business context. Run after workspace creation with bounded cost. Mark inaccessible sources unanalysed.

**Human strategic review:** Leon selects opportunities for personal review. Maintain independent not-requested/requested/in-review/reviewed status; AI completion never means human reviewed.

### Finding contract

Each customer-facing finding contains a plain-language observation, source URL, retrieval timestamp, evidence or measurement, why it may matter, recommended action, measured/observed/inferred classification, and material limitations.

For founder hypotheses without external evidence, identify the user-supplied inputs and label the output as a hypothesis. Do not invent a citation.

Do not fabricate revenue losses, conversion rates, rankings, competitor performance, or analytics access. Separate technical measurements from creative judgement. Missing real-user performance data is unavailable, not a poor result. Display analysed pages and coverage explicitly.

### Durable processing

Use a durable job/worker mechanism, not browser-dependent work or an unawaited promise after returning a response. Jobs require queued, running, partial, completed, and failed states, persisted stage outputs, attempt counts, and timestamps.

- Preserve partial results and retry only failed work where possible.
- Bound pages, redirects, bytes, runtime, retries, concurrency, and provider spend.
- Use idempotency to prevent duplicate jobs from repeated taps.
- Version rerun results instead of silently replacing history.
- Mark stale/expired work honestly and allow recovery.
- Keep rendering and conversation independent of analysis completion.

Protect the fetcher against unsafe schemes, private/local/reserved addresses, redirect escapes, and DNS rebinding using connection-level address validation/pinning or an equivalent controlled fetch service. The current preflight-only approach is not enough for the expanded public worker. Treat retrieved text as untrusted evidence, never agent instructions. Do not crawl authenticated/private content supplied through credentials.

## 7. Data and permission contracts

Retain Firebase and existing server-side guards. Introduce these logical records; map them to the current repository's schema consistently.

| Record | Responsibility |
| --- | --- |
| Discovery session | Anonymous path, progress, attribution, expiration |
| Business profile | Confirmed facts and editable goals |
| Audit job/result | State, evidence, coverage, revisions |
| Direction board | Selections, reasons, exclusions |
| Discovery brief | Confirmed inputs, suggestions, revisions |
| Communication preference | Requested delivery and separate marketing choice |
| Booking reference | Provider confirmation and immutable brief revision |

Link records with stable discovery, lead, conversation, workspace, user, and booking identifiers. Private contact details and free-text answers do not belong in public URLs or analytics payloads.

### Ownership

- Anonymous sessions use an opaque server-validated credential, not a guessable ID alone.
- Account claiming requires verified identity plus a single-use ownership transfer. Cross-device email-link completion carries a securely scoped transfer reference, not a reusable secret in analytics-visible navigation.
- Never claim by matching an unverified supplied email.
- Prospect signup grants only a new owned prospect workspace; never access to an existing client workspace.
- Existing invitations and server membership checks continue to govern client access.
- Do not merge businesses by domain or silently attach one prospect's work to another account.
- Internal qualification, dossiers, notes, and projects remain agency-only.
- Agency conversion changes lifecycle, preserves IDs/history, and records who performed it.
- Anonymous-access credentials cease granting access once work is claimed.

### Required server operations

Start/resume discovery; start/poll/retry analysis; update profile/preferences; claim after authentication; save/revise brief; request summary delivery; record verified bookings; convert prospect to client.

Validate every write and enforce ownership on every read. Use revision checks for edits and idempotency for expensive or externally visible operations. Apply persistent abuse controls appropriate to multiple server instances. Do not rely solely on per-process counters for a public expensive endpoint.

### Save and recovery

- Autosave signed-in drafts after short idle periods and at step transitions.
- Show discreet saving/saved feedback and actionable save failures.
- Preserve unsaved edits through temporary outages without falsely marking them saved.
- Reject conflicting stale revisions; offer reload/review rather than silently overwriting.
- Resume the last meaningful step and distinguish expired authentication from missing data.
- Anonymous drafts expire after seven days; disclose this and enforce server-side expiry. Cleanup delays must not extend access.
- Reuse established account retention/deletion behaviour. If none exists, resolve it before production and do not promise an unsupported retention period.

## 8. Email, qualification, and analytics

### Email summary

Include business/concept, useful findings or priorities, limitations, a return action, and optional call link. The summary is readable in the email without account creation. Private workspace access still requires authentication.

Send only requested transactional messages in release one. Marketing opt-in remains separate and unselected by default. No automatic nurture sequence is included.

Track requested, provider-accepted, confirmed-delivered, and failed separately. Escape untrusted content in HTML email. Deduplicate retries. A provider acceptance response is not proof of delivery. Summary failure must not delete or block the on-screen result.

### Qualification

Use stated needs, service fit, timing, investment context, and readiness. AI can recommend prioritisation to Leon, never infer wealth from voice, appearance, or unrelated traits. A low AI score alone cannot block booking.

### Analytics

Extend existing funnel events with discovery start/path, analysis lifecycle, result viewed, summary requested, workspace claimed, chapter completed, brief reviewed, booking started/confirmed, call attended, and opportunity outcome.

Use opaque identifiers and coarse properties. Exclude emails, transcripts, URLs containing sensitive query data, free-text answers, and report contents. Record booked versus attended separately. Instrument actual outcomes, not inferred clicks.

## 9. Failure-state design matrix

| Situation | User-facing behaviour | Data behaviour |
| --- | --- | --- |
| Invalid or unsafe website | Explain correction; allow founder path | Do not start unsafe fetch |
| Site blocked or JS-only | State coverage limitation; offer context entry | Preserve all supplied information |
| Partial analysis | Show supported findings and missing stages | Keep completed stage outputs |
| Slow job | Continue brief or request email | Job continues independently |
| Microphone denied | Offer text immediately | Preserve shared context |
| Voice disconnect | Explicit reconnect; no automatic capture | Keep accepted answers |
| Expired sign-in link | Request another link | Keep available discovery state |
| Existing account | Sign in and claim explicitly | Avoid duplicate owned workspace |
| Save conflict | Review newer version and unsaved edits | No silent overwrite |
| Offline | Clear unsaved state; retry on reconnect | Do not mark unacknowledged edits saved |
| Email failure | Retry delivery; retain on-screen report | Deduplicate provider retries |
| Booking abandoned | Return to brief with booking available | No false confirmed appointment |
| Job or spend limit | Explain analysis is unavailable; continue discovery | No repeated expensive calls |
| Anonymous session expired | Explain expiry and offer restart/sign-in | No access after expiry |

## 10. Accessibility and performance

Target WCAG 2.2 AA. Every core task must be keyboard-complete, screen-reader understandable, and operable without voice. Use semantic labels, visible focus, appropriate focus return, announced errors, and polite status updates. Do not announce every transcript token or polling response.

Measure text contrast (4.5:1 normal text, 3:1 large text) and relevant non-text contrast. Selection/error meaning is not conveyed by colour alone. Sheets trap focus and restore it; normal page transitions move focus to a useful heading without disrupting typing. Reflow must work at 320 CSS pixels. Sticky content cannot obscure focused controls. Keep the project's 44px touch-target minimum.

Performance goals at the 75th percentile where field data exists: LCP ≤2.5 seconds, INP ≤200ms, CLS ≤0.1. Prelaunch lab measurements are not equivalent to field validation.

Lazy-load voice and heavy reference assets. Reserve media dimensions, use responsive sizes, avoid downloading all enlarged images up front, and keep essential actions independent of decorative media. Separate analysis completion time from page responsiveness.

## 11. Acceptance tests and visual QA

### Journey tests

- [ ] Existing business gets supported findings, saves a brief, and books.
- [ ] Founder without a website receives a useful launch brief.
- [ ] Summary email works without account creation.
- [ ] Account claim resumes on another device without leaking ownership.
- [ ] Existing clients and invitations still work.
- [ ] Prospect conversion preserves findings, references, revisions, and identity.
- [ ] Every task works without voice or microphone permission.
- [ ] Partial/failed analysis does not block the brief.
- [ ] Email, auth, and booking failures provide recovery.
- [ ] Repeated taps/retries do not duplicate jobs or messages.
- [ ] Cross-user report/workspace access and internal-note exposure are rejected.
- [ ] Unsafe URLs, redirect escapes, rebinding, and retrieved prompt injection are handled.
- [ ] Concurrent device edits cannot silently overwrite newer work.
- [ ] Deleting or expiring a session removes access as specified.

### Device matrix

Check 320, 375, 390, 430, 768, 1024, and 1440px widths. Include portrait/landscape where relevant, iOS Safari and Android Chrome on real phones, and desktop Chrome/Safari/Edge/Firefox.

Check both themes; keyboard-only; VoiceOver/TalkBack core journeys; reduced motion; enlarged text and desktop zoom; open keyboards; long names/URLs; slow connections; offline recovery; and background/resume. Emulation is useful but does not count as physical-device testing.

### Visual review evidence

Capture entry, initial result, reference selection, brief review, and returning workspace at mobile and desktop widths. Include at least one partial-result and one error-state capture. Verify actual content density and bottom control clearance, not merely absence of console errors.

Run the existing portal verification suite (`node scripts/portal-verify/verify.mjs`), appropriate build/type checks, and focused integration tests. Establish baseline failures before changes. Add ownership, prospect navigation, claim, and client-conversion assertions. Record results truthfully; unperformed checks remain unchecked.

## 12. Delivery phases and release gate

### Phase 1 — Establish the design

Create reviewable mobile layouts for entry, initial results, direction selection, brief review, and returning workspace. Include loading, empty, partial, and error variants. Derive desktop layouts from these. Reuse existing brand tokens and components.

### Phase 2 — Complete the basic journey

Implement both paths, durable initial analysis, requested summary email, secure account claim, saved brief, and booking handoff. Preserve existing client flows and old audit attribution.

### Phase 3 — Add guided depth

Connect NOVA shared context, voice/text switching, curated references, and bounded expanded analysis. Keep all steps usable without voice.

### Phase 4 — Verify and release gradually

Default the new feature flag off; use internal test accounts first. Confirm auth domains/providers, email sender, worker lifecycle, provider limits, booking confirmations, and monitoring before public exposure. Do not deploy unconfigured integrations behind optimistic success screens.

Rollback hides new public entry points and restores legacy audit intake while preserving collected data and access to saved workspaces. Never roll back by deleting discovery records.

### Infrastructure evidence required before launch

| Dependency | Evidence |
| --- | --- |
| Firebase | Real project identified; providers/domains/session flow tested; membership boundaries verified |
| Audit worker | Deployment target identified; durable retry/resume demonstrated after request/browser exit |
| Analysis services | Coverage, timeout, quota, and spending limits documented |
| Email | Verified sender; idempotency; accepted/failure handling; delivery events if reported |
| Booking | Provider identified; verified confirmation source; timezone and revision linkage tested |
| Voice | Production transport works on target host and supported phones; text fallback verified |
| Assets | Six curated directions with origin/license evidence |
| Observability | Error, job-age, cost, and conversion signals available without sensitive analytics payloads |

### Definition of done

- [ ] Both audiences can obtain useful value and reach a strategy call.
- [ ] Authentication, device changes, and interruptions preserve discovery.
- [ ] Every screen works on a small phone and with keyboard navigation.
- [ ] AI claims remain within their evidence boundaries.
- [ ] Prospect access cannot expose other clients or internal information.
- [ ] Leon receives an editable brief before the call.
- [ ] Representative users can complete core tasks without designer coaching.
- [ ] No placeholder integrations, invented findings, or unverified success messages remain.
- [ ] Delivery includes mobile/desktop captures, test results, dependency configuration status, and explicit limitations.

## 13. Research rationale

These references support the design direction; they do not prove a conversion lift for LIONOVART. Validate the flow with actual visitors.

- [NN/G: Login walls](https://www.nngroup.com/articles/login-walls/) — provide understandable value before requiring registration.
- [NN/G: Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) — introduce complexity when relevant.
- [Baymard: Cart abandonment](https://baymard.com/blog/reduce-cart-abandonment) — forced accounts are a documented ecommerce friction source, not an agency conversion forecast.
- [HubSpot: Website tests](https://www.hubspot.com/tests) — example of a concrete diagnostic entry experience.
- [NN/G: Chatbot user experience](https://www.nngroup.com/articles/chatbots/) — selectable controls can reduce conversational interaction cost; older research is not a benchmark of current voice models.
- [Superside: Submit a brief](https://help.superside.com/en/articles/13257567-submit-a-brief) and [ManyPixels: Workflow](https://www.manypixels.co/help/how-manypixels-works) — examples of reusable brand context and creative briefs.
- [Google: PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about) — measurement coverage and real-user data limitations.
- [W3C: WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — accessibility baseline.
- [Web Vitals](https://web.dev/articles/vitals) — responsiveness, loading, and stability targets.

## 14. Copy-ready implementation prompt

> Read DISCOVERY_ONBOARDING_HANDOFF.md, AGENTS.md, PORTAL_HANDOFF.md, and PORTAL_DESIGN.md. Inspect the current branch and preserve concurrent work. Implement this discovery experience in the existing application, starting with mobile layouts and the complete basic journey. Reuse Firebase, NOVA, portal components, and existing booking/email integrations. Keep prospect access distinct from client membership and public findings distinct from internal dossiers. Do not claim completion until the journey, ownership boundaries, recovery states, and responsive behaviour have been verified. Document real configuration blockers and unperformed checks rather than simulating integrations. Deliver screenshots, verification results, and remaining limitations with the implementation.
