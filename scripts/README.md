# scripts/

Put **one-off** Node/shell tools here (codemods, probes, migrations).  
Do **not** drop them in the repo root.

- Prefer disposable scripts; delete after use when possible.
- Never import scripts from `src/` or wire them into `package.json` unless long-lived.
- Production entrypoints stay at root: `server.js`, `ws-dev.js`.
