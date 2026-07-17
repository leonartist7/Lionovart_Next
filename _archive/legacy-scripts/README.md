# Legacy scripts archive

Moved here during **Phase 1** of the repo cleanup (`feat/cleanup-legacy-scripts-main-page`).

## What these are

One-off Node codemods and smoke tests from iterative landing-page builds ("I built 5"). They are **not** part of the Next.js production build.

Typical pattern:

- `fs.readFileSync` → string replace → write to component sources
- Gemini Live / Sanity API probe scripts

Many hardcode obsolete paths such as `.claude/worktrees/crazy-taussig/...`.

## Do not re-run against current `src/`

Re-running these can corrupt live components if string matches still exist.

## Kept at repo root (intentionally)

| File | Reason |
|------|--------|
| `server.js` | `npm start` + Docker / Cloud Run entry |
| `ws-dev.js` | `npm run dev:ws` (local Gemini Live proxy) |

## Restore

```powershell
Move-Item _archive\legacy-scripts\<filename> .\
```

Delete this folder only after the landing page and production deploy have been verified and the team agrees these are no longer needed.
