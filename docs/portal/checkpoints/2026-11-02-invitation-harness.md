# Invitation verification harness follow-up — November 2, 2026

This supplements the invitation-creation checkpoint in `../CONNECTIONS-WORKLOG.md` (documentation commit `fe04ca11c87ac5156c5635ff5727523ee5637df0`; application commit `3e517a538883304d5d5e4dc78bf29cd3cb336162`). Same review branch and draft PR #92. No production changes.

## Attributable compatibility issue found during final source review

The older emulator harness issued authenticated JSON requests without an Origin header. The production-like local runner also set NODE_ENV=production while reusing its HTTP localhost fetch base as the invitation-link origin. Those fixture choices conflict with the new same-origin guard and HTTPS invitation requirement. The integrated emulator stage has not run because the existing dependency advisory gate fails first; this was found by source inspection, not reported as an observed end-to-end failure.

## Fix without weakening the application

- Fixture JSON headers now include the browser-equivalent Origin derived from the local BASE.
- The spawned test server keeps production build mode but uses `https://portal-fixture.example.test` only for generated invitation links. The parent HTTP test client retains its localhost BASE and extracts bearer tokens locally rather than visiting that fixture hostname.
- The test server explicitly clears RESEND_API_KEY and inherited preview hostname hints, so this verification path cannot deliver invitation emails through Resend. No deployed Vercel environment or permission is changed.
- Existing production route guards, HTTPS policy, admin identity checks and data access remain unchanged.

## Actual evidence

- The two original harness files were matched against remote Git blob hashes before patching: `174189099954f077a8f5a60a0dd948abd0601076` and `2223fbbabe6d71f3da48867678d912e91844246f`.
- `node scripts/portal/verify-invite-creation.cjs`: **23/23 passed locally**. The two additional tests execute the actual source configuration statements in an isolated VM with a fake spawn function, asserting Origin, trusted fixture origin, disabled email and unchanged parent environment. They do not start a server, access Firebase or send requests.
- `node --check` passed for both modified harness files.
- Prior application commit CI run `41430034958` passed 90 isolated portal tests and its exact Vercel preview was READY; those results must not be attributed to this follow-up SHA. Inspect this follow-up's own CI and automatic preview and record exact results on PR #92.

## Open gates

Deployed Firestore rules, preview/production isolation, real transaction retries, authenticated/interactive browser behavior, physical devices and provider consent remain unverified. Chromium navigation returned ERR_BLOCKED_BY_ADMINISTRATOR. Existing critical dependency advisories and unrelated marketing-component lint errors remain visible. Next: authorized read-only Firebase configuration/rules verification and sample-data browser checks with an available authorized browser. Do not send real invitations or weaken preview protection.
