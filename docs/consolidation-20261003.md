# Website consolidation — 3 October 2026

Baseline: `e1723e35b215dc34b478c326b6791e866ae2b8f5`.
Integration: [PR #83](https://github.com/leonartist7/Lionovart_Next/pull/83).

## Sources

| Change | Original head |
| --- | --- |
| Portal file permissions, #81 | `619727225fef986dcde090f9432f2b8f535f220d` |
| About and compact introduction, #80 | `a86870819dacc2fbb81670f9cb3d40dc842307b1` |
| Persistent Imagine, #71 | `7a8c76dac3087c82fbf34236379c2f37088c815a` |
| Portal collaboration, #69 | `b9e69fcf42d887dbe699cd5583f4a388a059398f` |
| Portal content, #70 | `23465c9933c61b3fdec69cd29e50668ff1e4bf08` |
| Selected gold decoration | `78492fe63a533d2bd1649b1d8fe3da496a4d6f4c` |

The first five heads are parents of the integration commit, preserving their history. Gold decoration is selectively ported into the retained layout. The current opening film and card crossfade retain the baseline blobs. Existing footer, careers and SEO work remains in the first-parent history.

## Conflict resolutions

New file consumers pass the viewer's role. A client's content attachments cannot resolve an internal file, and review rejects inaccessible attachments. Draft and idea discussion threads inherit the post's visibility. Approval decisions enforce target visibility by id and commit exactly one outcome in a transaction. Upload confirmation reads and creates asset/version records in a transaction: a version-one replay cannot replace an existing asset and concurrent confirmations cannot replace a version or skip the current version.

The compact introduction retains the comparison anchor used by NOVA. Gold decoration is isolated inside the surviving chapter owners, pauses offscreen, and respects reduced motion.

## Cleanup

A complete scan of 475 source modules and literal imports found no runtime import of the four retired homepage sections: AboutExperience, AboutUsHalf, Comparison and AboutPaintTransition. They are removed after the replacement layout is integrated. The two gallery demos now use the canonical English JSON catalog, allowing all six duplicate TypeScript catalogs to be removed. Historical prototypes and library/demo components are retained. The accidentally tracked local worktree gitlink is removed from the repository index; its commit remains in history.

Docker copies the repository's `.npmrc` (which specifies `legacy-peer-deps=true`) and uses `npm ci` with the committed lockfile so Cloud Run and Vercel resolve the same application dependencies. The container check also reproduced a fatal Next CLI conflict between Docker's old `TURBOPACK=0` environment variable and the current `--webpack` build script. Those duplicate Docker flags are removed; the package script is the single bundler choice. Earlier Google build logs remain unavailable, so this is a reproduced container failure rather than a claim based on those logs.

## Dependency refresh

Next.js and its ESLint configuration are pinned to 16.3.8, addressing the critical advisory reported for the old pin and other published Next.js fixes. The project already uses the Next 16 async request APIs and explicit Webpack script, so no major-version codemod applies. npm regenerated the lockfile and applied compatible advisory fixes without `--force`; shadcn remains available as a development tool. React stays on the existing supported 19.2.4 pin. Docker moves to Node 22 to match CI.

The audit report records any remaining noncritical SDK/tool advisories. It is a dependency inventory, not a claim that every reported code path is reachable. CI fails if a critical application advisory remains.

## Verification and release

The workflow runs the existing motion tests, production build/type checking, the combined portal suite with emulator-only providers, cross-feature upload/visibility regressions, authenticated NOVA WebSocket upgrade, and browser checks at 320, 390, 768 and 1440 pixels, including Imagine results remaining open after scrolling away and back. Browser screenshots and structured results are attached to the workflow run.

Runtime checks explicitly start `server.js` with `NODE_ENV=production`; Next development mode must not reuse a production build directory. No real email, WhatsApp or Gemini request is made by these checks.

The public domain was serving an older Google Frontend deployment during the audit. Vercel's newer build alone does not change that route. Keep the Cloud Run/custom-server voice endpoint operational; retire covered source branches only after the tested revision is deployed and the public site is confirmed.

The full branch inventory and release phases are recorded in the [consolidation audit](https://chatgpt.com/space/page_dbd859c877fc8191b3f97100d49dde5c). Exploratory AI designs, old locale PRs, pricing changes and separate feature proposals remain outside this integration.
