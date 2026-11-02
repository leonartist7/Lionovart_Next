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
