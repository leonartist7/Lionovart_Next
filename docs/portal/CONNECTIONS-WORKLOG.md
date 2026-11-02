# LIONOVART portal: connections worklog

## Target and boundaries
- Repository: `leonartist7/Lionovart_Next` (NOT the standalone `Agency` repository).
- Review branch: `review/portal-connections-20261102`.
- Verified starting master: `1135d1963b8f45a24f51696d4636061922048b1c`.
- The requested Studio/Client switch is `/portal/demo?view=studio` or `?view=client`.
- Do not merge, force-push, rewrite other work, deploy to production, migrate data, send client messages, publish content, charge money, rotate credentials, or enable paid services during this sprint.
- A preview is not production certification. Never label a provider connected based only on a saved URL or environment variable.

## Batch 1 — implemented November 2, 2026
1. Connections section in the existing portal shell. The five primary mobile tabs stay unchanged.
2. Workspace resource library for Google Drive, Figma, Notion, GitHub and Vercel URLs. These are bookmarks, not OAuth integrations. Studio adds/removes; clients receive only shared records. New links default to Studio-only. HTTPS/host validation, credential-query rejection, same-origin writes, 8 KiB streamed-body limit, bounded resource count, transactional persistence and append-only change audit.
3. Calendar .ics snapshot export: existing role-filtered projects/milestones/scheduled content, stable workspace/project-scoped identities, escaping, UTF-8 line folding, timezone-aware timestamps, date-only all-day events, invalid/duplicate count. No account access, invitations, feed tokens, or background synchronization.
4. Studio-only provider configuration indicators for existing Resend/Firebase integrations. Configuration presence is explicitly not a verified delivery/upload result. No secrets or readiness information are exposed by the public demo.
5. Demo resource interactions are temporary in-memory state and reset on reload. Demo exports use sample data only. Secure endpoints do not use the demo view query to authorize anything.

## Validation evidence
- `node scripts/portal/verify-connections.cjs`: **24 tests passed**, using Node 22.16.0 and the installed TypeScript transpiler. The actual new route handlers run with mocked authentication and storage boundaries.
- Strict TypeScript compilation passed for calendar-export.ts, resource-links.ts and private-response.ts with ES2022 + DOM libraries.
- Tests cover UTF-8 folding, line injection, timezone offsets, leap/year boundaries, invalid dates, stable/isolated UIDs, unsafe URLs, visibility filtering, byte limits, same-origin writes, authenticated-role propagation and cache headers.
- These tests do NOT establish real Firebase authorization, deployed Firestore rules, transaction contention, provider availability, actual calendar-app import behavior, a full Next.js build, or visual/device correctness.
- Full build, emulator/end-to-end and responsive browser verification: **pending** at this checkpoint. Append actual outcomes below; do not replace pending with inferred success.

## Data and API contract
- Firestore document: `workspaces/{workspaceId}/connections/resources` contains a bounded `links` array and `updatedAt`.
- Audit subcollection: `workspaces/{workspaceId}/connections/resources/audit/{eventId}` records action, actor UID, resource ID and timestamp. No tokens or copied file contents.
- Save/delete are a single Firestore transaction with the audit event. Duplicate URL and capacity conflicts return 409.
- Secure mutation route: `/portal/{slug}/connections/resources` (POST, DELETE), `requireWorkspace(..., "agency")`.
- Secure export: `/portal/{slug}/calendar/export`, `requireWorkspace` plus the existing role-filtered calendar query.
- All data/error responses from these handlers use `private, no-store`, `Vary: Cookie`, and `nosniff`.
- Workspace links are not project-scoped in this batch. Shared means EVERY member of that workspace. Provider permissions remain separate; a portal link does not grant access to the remote file.
- Never store passwords, provider access/refresh tokens, signed URLs, or Vercel protection bypass URLs in resource records. Allowlist validation is defense-in-depth, not a secret scanner.
- `firestore.rules` was not present at the repository root during this audit. Locate actual rules/IAM and verify that browser clients cannot directly read internal links or their audit collection before production activation. Do not claim this check passed.
- No dependencies or credentials were added, changed, or fetched. No real workspace data was seeded or mutated during implementation.

## Bounded continuation queue
Each scheduled run reads the live branch and this log, handles one coherent unfinished item, then records commit, checks actually executed, blockers and next step. Stop rather than overwrite concurrent work. Use the same review branch and PR. Do not interpret this document as permission for production or external side effects.

### 1. Build and security verification (first priority)
- Inspect the preview deployment for the exact commit and resolve attributable build/type/lint failures only.
- Run the existing portal test/emulator workflow if available; add real cross-workspace, revoked-session, client-write, internal-link and concurrent-add tests.
- Verify actual Firestore client rules deny direct access to private connection documents; investigate preview/production data separation without changing production settings.
- Test mobile widths 360/390, tablet 768, desktop 1440, keyboard flow, theme, loading/error/empty states, export download and Studio/Client navigation. Record missing device access honestly.

### 2. Resource workflow refinements
- Add safe edit/visibility-change flow with explicit share confirmation, transactional audit and conflict handling.
- Consider project-scoped resources only by inheriting existing project visibility and reusing its authorization helpers. Do not invent a second role system.
- Improve focus return and long-list navigation based on actual UI evidence, not decorative complexity.

### 3. Notification center / connection diagnostics
- Inspect existing notifications outbox and invitation workflows first; reuse them rather than duplicating.
- Add a read-only Studio delivery/failure history and client-appropriate activity inbox with safe field projection and pagination.
- No test emails, retries or live sends without explicit recipient authorization. Sending acceptance is not delivery.

### 4. Account integrations, prepared safely
- Research official current Google Calendar/Drive OAuth docs; use minimum scopes and explicit workspace/account consent.
- Build typed adapters, revocation, encrypted server-only token storage, callback/state checks and test harness only when their configuration can be verified. Do not invent credentials or mark fixtures as connected.
- If OAuth application credentials/consent are unavailable, document the exact setup blocker and advance another testable item. ChatGPT connector access is NOT authorization for the deployed app.
- Payments and automated publishing remain disabled until provider/account and business rules are explicitly authorized. No placeholder Connect buttons.

### 5. Onboarding and quality
- Audit client invitation acceptance, expired links, first project handoff, empty states and notification preferences against existing implementation.
- Add improvements with tests, maintain rem/em responsive sizing, reduced-motion support, clear contrast and touch targets.
- Keep existing marketing pages, animations, unrelated repository branches and dependency versions unchanged.

### 6. Final checkpoint
- Record exact branch HEAD, PR and preview URL, build state, test results, unresolved blockers and the smallest remaining decisions.
- Never describe scheduled work as continuous execution or as already completed.

## Reference standards
- RFC 5545: https://www.rfc-editor.org/rfc/rfc5545.html (snapshot file format; not a sync protocol).
- Next.js route handlers: https://nextjs.org/docs/app/api-reference/file-conventions/route (explicit handler authentication; promise-based params).

## Subsequent run log
Append verified results here.

### November 2, 2026 — isolated resource authorization and transaction verification
- Starting remote HEAD: `91fda6b9b8b76d567cbc2ca2f2a353a4b1bb7cf6`; draft PR #92 had no substantive review threads; its Vercel deployment `dpl_AFEczjCiEemZTc8Zh297jVy4PhjV` was confirmed `READY` for that **exact** starting SHA (not a browser/device acceptance test).
- Added `scripts/portal/verify-resource-security.cjs` in **`19f327f965c153b16e75d7908ae5cdb265c94940`**. Eight tests exercise the real portal session/workspace guard, resource mutation route, storage transaction routines and link projection with isolated fake Auth and Firestore boundaries. They cover revoked/expired sessions, unauthorized client create/delete despite a forged Studio query, indistinguishable nonmember/unknown-workspace 404, verified workspace ID and actor attribution, exclusion of Studio-only resources, duplicate concurrent add conflicts, distinct simultaneous saves, and cross-workspace delete/audit isolation.
- Local assembled-source checks: `node scripts/portal/verify-connections.cjs` **24/24 passed**; `node scripts/portal/verify-connection-view-isolation.cjs` **2/2 passed**; `node scripts/portal/verify-resource-security.cjs` **8/8 passed**; total **34 targeted passing tests** on Node 22.16.0 with the installed TypeScript transpiler. Tests were executed with source files from this review branch before publishing the new test script. This was not a full repository install or production-like build; the simulated serial transaction does not test Firestore retries or real rules.
- Actual `firebase.json` contains emulator ports but no rules file declaration; `firestore.rules` was absent at repository root. **Deployed Firestore browser rules and preview-vs-production data isolation remain unverified.** No access to customer data, service credentials, OAuth consent, or real providers was assumed.
- No production merge, email send, live-data mutation, new provider connection, DNS change, or deployment trigger by an API was performed. The new test commit's automatic Vercel preview must be inspected by its own SHA before claiming a new build outcome.
- **Next checkpoint:** verify automatic deployment for this test SHA; locate authoritative deployed Firestore rules / check preview data isolation through authorized read-only configuration; if inaccessible, advance safe transactional resource edit/share functionality with explicit confirmation and tests. Device/browser validation stays outstanding.

### Exact-commit automatic preview verification
- Vercel deployment `dpl_3h9a19SJjtM6GVY5aPAcmNSpfh7k` for worklog commit `fea413bb086187e0417b2b890a7e4c709358b310` reported `READY`; its build events included `Build Completed in /vercel/output [44s]` and `Deployment completed`.
- Review preview: https://lionovartnext-pemmzyqhr-lionovart.vercel.app/portal/demo?view=studio (Client: `?view=client`). Retrieval from the external browsing tool failed, so **interactive browser and protected-preview access remain unverified**. Vercel build/deploy success is not functional acceptance.
- This evidence-only worklog commit changes no executable code. No duplicate Vercel deployment was requested and production was not touched.


### November 2, 2026 — audited Studio resource editing and share confirmation
- Starting remote HEAD was `41f89afd0c6caf99ebb6eaa61ec42d1b99390675`. The executable edits are `7c9b7f71e9c68405187a88c2a523958498bded48` (PATCH/store/tests), `60244a1f72f02e006104d1bd63fe6e35a18dfbe5` (Studio editor), `c830095bb8ad64b3ec3a1c166bb3063bb948cae5` (CI), `f250b36b325f6207dae8a726f2ab9854eb311ffd` (edit focus return) and `1f89c2403f02be59581071d98e7ffd8766d8f6fc` (move regression tests ahead of unrelated advisory gate).
- Studio can now edit labels, provider URLs and shared/internal visibility in the existing Connections resource panel; client view has no editing controls. A share prompt explains workspace-wide visibility and external provider permissions. Demo edits remain temporary, in-memory sample changes only.
- The authenticated, same-origin `PATCH /portal/{slug}/connections/resources` verifies agency role and server-derived workspace/actor, validates both expected and new resource, and uses one Firestore transaction for compare-and-swap, duplicate URL check, internal-to-shared explicit-confirmation guard, record update and append-only audit. A URL change re-keys its SHA-256 resource ID while retaining `createdAt`. Audit logs include only IDs, actor, timestamps and visibility changes (no provider URLs or tokens). Stale editors and duplicate URLs fail with 409; unsafe input fails with 400.
- **Real GitHub Actions evidence for exact application commit `1f89c240...`:** `Integrated verification` run [41374502488](https://github.com/leonartist7/Lionovart_Next/actions/runs/41374502488), verify job `125051815279`, completed the portal regression step successfully: `verify-connections.cjs` **24/24**, `verify-connection-view-isolation.cjs` **2/2**, `verify-resource-security.cjs` **14/14**, total **40/40 passed** on CI Node 22 against this branch. Six new cases cover PATCH validation, client denial, explicit sharing, stale versions, duplicate/cross-workspace protection and concurrent updates, all with fake Auth/Firestore. These are isolated tests, **not** a Firebase emulator or live-rules acceptance.
- **Exact-commit Vercel evidence:** `dpl_B2jEs1FGapgw8GaJAsk6jpij9GrF` for `1f89c240...` reported `READY` on preview target; build events include `Compiled successfully in 11.8s`, `Finished TypeScript in 4.3s`, `Build Completed in /vercel/output [39s]` and `Deployment completed`. [Studio preview](https://lionovartnext-8606nm1yq-lionovart.vercel.app/portal/demo/connections?view=studio) · [Client preview](https://lionovartnext-8606nm1yq-lionovart.vercel.app/portal/demo/connections?view=client). Browser interaction and access through Vercel protection were **not** verified.
- **Full GitHub CI remains red for pre-existing independent gates:** source lint reports two errors in unrelated `src/components/sections/AuditCapture.tsx` and `src/components/ui/ExitIntentModal.tsx`; advisory check reports critical dependency findings for locked `next@16.3.8` and transitive `dompurify`. Both failures predate this checkpoint and were not suppressed or modified. The advisory check still stops the verify job before its full build, Firebase emulator and Playwright steps. Docker container job was running at this writing; do not infer its outcome. Do not claim CI fully green or production-ready. Dependency changes and unrelated marketing-page edits were deliberately avoided.
- **Still blocked/unverified:** deployed Firestore rules and direct browser read denial, preview-production data isolation, real Firebase transaction contention, user-device responsiveness, protected-preview browser acceptance, calendar-app import, and Google account OAuth consent/configuration. No real customer data, provider calls, sends, account grants, production deployment, merge or DNS edits.
- **Next checkpoint:** inspect current automatic preview and CI for this worklog commit; determine authorized Firestore rules / preview data isolation; if still inaccessible advance read-only notification/outbox visibility using existing portal authorization and notification store. Keep advisory and lint findings visible for a separately authorized dependency/marketing remediation.


### November 2, 2026 — Studio-only notification history and bounded pagination
- Starting review HEAD: `50e2d4bfa9338def8cd781bd844a237c131f9fb9`. Application feature commit: **`8dfddc907ffb398eeaa8296b0a2beaeb14a597ff`**. A follow-up compatibility fix for the existing view-isolation harness is **`011549bca71bb67adac3a845bcb7236a6fe43e0b`**. No production merge.
- Reused the existing notification dispatcher’s `workspaces/{workspaceId}/notifications` outbox. Added `src/lib/portal/outbox-history.ts` for **read-only** recent delivery-decision history with a ten-record page, one lookahead record and same-workspace Firestore document-snapshot cursor. Records are allowlisted to status, file-activity type, ISO timestamp and a masked recipient. Provider error messages, full email addresses, raw subject lines, messages and sender credentials are never projected.
- The authenticated workspace Connections page loads this history **only after confirmed agency-role access**. Client view never issues an outbox query; the public demo displays a plain “not loaded” note. The existing visual language is preserved, with older/latest pagination, empty state and failure state. `sent` is labeled “Accepted by email provider,” not “delivered.” No email or provider call was made by this feature. Official cursor reference: https://firebase.google.com/docs/firestore/query-data/query-cursors.
- GitHub Actions [run 41379285370](https://github.com/leonartist7/Lionovart_Next/actions/runs/41379285370), verify job `125066387171`, successfully ran the **Portal connection regressions** step at the exact final application SHA `011549bc...`: core **24/24**, view isolation **3/3**, resource security **14/14**, outbox history/access **8/8** — **49/49 passing targeted tests** using fake Firestore/Auth and source-transpiled page code. The first attempt [run 41379089419](https://github.com/leonartist7/Lionovart_Next/actions/runs/41379089419) failed because the older view-isolation harness did not mock the new component import; fixed with a regression case and re-run passed. These are not deployed-rule, emulator, live-provider, or browser tests.
- Vercel automatic preview deployment **`dpl_DsKQXsTUKWsf32tQ14YFXfYn7j46`** was checked for exact application SHA `011549bca71bb67adac3a845bcb7236a6fe43e0b`; it reported **READY** (preview target). Build events show `Compiled successfully in 12.1s`, `Finished TypeScript in 3.8s`, `Build Completed in /vercel/output [41s]` and `Deployment completed`. Review: https://lionovartnext-cou7hhrrp-lionovart.vercel.app/portal/demo/connections?view=studio ; Client: `?view=client`. External web preview retrieval failed: **no protected-browser, device or functional UI acceptance claimed**. The subsequent ledger-only commit must be checked separately for its own automatic deployment.
- Full GitHub CI is **not green**: its existing critical application dependency advisory step fails (Next.js / transitive DOMPurify); full CI build/emulator/browser steps are gated behind it. The lint and container jobs were still in progress at time of verification, so their outcomes are not assumed. Earlier unrelated marketing-component lint issues remain outside this portal scope.
- **Unverified/blocked:** deployed Firestore browser rules, client direct-read denial for the private notification outbox, production/preview Firebase separation, actual email delivery, real provider consent, browser/device interaction, and calendar app import. Root `firebase.json` declares emulator ports but no authoritative rules file. No real customer data was viewed/modified, no messages were sent, and no production configuration changed.
- **Next checkpoint:** inspect latest CI/preview outcomes and authoritative Firestore rule/data isolation configuration if available. If inaccessible, add a client-appropriate activity inbox using the existing server-side file/thread visibility gate, never exposing raw outbox records to clients; test cross-project internal visibility and revoked sessions.


### November 2, 2026 — visibility-filtered recent file feedback for Studio and Client
- Starting verified remote HEAD: `8055dd9a8186abb2fdb037398d5df1d9286c6caa`. Application changes: `0f9d576d461d4339f155b935fb9a9e9737f2d42f` (server-side read projection), `02b79ffdbb19e952d742495d0b491728ec021394` (authenticated Connections loader), `0d18e35d7fc77a721c943348b20fdb9f48d2f27a` (existing Hub UI), `550b7744abc46f97ae0a4f81b3e3dd4962f369e7` (regression tests).
- Added recent file feedback to authenticated Studio and Client Connections. The server queries at most 60 most recently updated workspace thread documents, projects up to 8 visible asset conversations, and reuses **existing `getAsset(workspaceId, assetId, viewerRole)`** as the project-visibility gate; deleted/internal-project files are not shown to unauthorized clients. Permission checks happen before output. Results contain only permitted file name, thread/asset IDs for navigation, feedback kind, open/resolved status and update time. Raw comments, author identities, notification outbox, email content, recipients, provider responses and credentials are not read into this projection. A public demo does not read live activity. No messages are sent.
- The feed is explicitly a **bounded recent snapshot, not a comprehensive inbox**. It uses one `orderBy("updatedAt","desc").limit(60)` query to avoid composite-index requirements and unbounded reads, caches asset authorization lookups, and links to existing file conversations. Missing storage appears as an error state, not a claim of zero activity. Existing project/client authorization is unchanged.
- **Exact application-SHA CI evidence:** [Integrated verification run 41383694267](https://github.com/leonartist7/Lionovart_Next/actions/runs/41383694267), verify job `125079850115`, completed its `Portal connection regressions` step successfully on `550b7744...`: core **24/24**, view-isolation **3/3**, resource security **14/14**, extended outbox/visible-activity harness **13/13**, total **54/54 passing targeted tests**. New cases exercise client-vs-Studio projections, cross-workspace role forwarding, malformed/deleted/non-file entries, hidden-field exclusion, 60-document query/8-record display limit, cached asset permission, and missing storage. These are isolated source tests with mock data/auth and **not** deployed Firestore rules, end-to-end browser, or physical-device validation.
- **Exact application-SHA automatic Vercel preview:** `dpl_3ML8rSWHSwj2vrPrZ9McNFEpcgJ2` for `550b7744...` reported **READY** on preview target; the build events included `Compiled successfully in 16.5s` and `Finished TypeScript in 4.9s`. [Studio Connections](https://lionovartnext-hz21g2rg9-lionovart.vercel.app/portal/demo/connections?view=studio) · [Client Connections](https://lionovartnext-hz21g2rg9-lionovart.vercel.app/portal/demo/connections?view=client). External retrieval could not access protected preview, so **no browser, keyboard, responsive or device acceptance is claimed**. This worklog-only follow-up SHA needs separate exact-commit preview verification.
- **Full CI remains blocked by existing critical dependency advisories** (`next`, transitive `dompurify`); the advisory step fails after portal tests and prevents full CI build/emulator/browser stages. Existing unrelated lint findings are outside this portal checkpoint. We did not change dependencies, marketing pages, production, permissions, OAuth settings, or customer records.
- Investigated rule authority without secrets: root `firebase.json` declares emulators but no rules file; `.firebaserc`, root `firestore.rules`, and `firestore.indexes.json` are absent. **Deployed Firestore browser rules and preview/production Firebase isolation remain unverified.** Official Firebase docs confirm server Admin libraries bypass client Firestore Security Rules: https://firebase.google.com/docs/firestore/security/rules-query. The new mocks therefore cannot establish direct-browser read denial. Real Google OAuth consent/configuration and email delivery are likewise not claimed.
- **Next checkpoint:** obtain authorized read-only confirmation of authoritative deployed Firestore rules and preview database isolation; otherwise audit client invitation/onboarding failure states and improve the earliest testable case. Preserve existing portal design and authorization; no production activation.
