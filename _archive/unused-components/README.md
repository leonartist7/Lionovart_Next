# Unused components archive (Phase 3)

Moved here during cleanup on `feat/cleanup-legacy-scripts-main-page`.

**Policy:** archive first — do not delete until the live site is verified.

## Why these were archived

Import-graph audit: **zero live importers** from the production landing path (`page.tsx` → `PageBuilder`), service pages, privacy/terms, or layout.

They are leftovers from earlier homepage iterations (HeroLion scene, Portfolio bento, Reality flip cards, LumaShowcase, hero marquee wrapper, A/B toggles, demo routes).

## Layout

| Folder | Contents |
|--------|----------|
| `sections/` | Old homepage sections + toggles |
| `ui/` | Hero/texture/marquee experiments only used by those sections |
| `blocks/` | Bento gallery prototypes |
| `library/` | Duplicate `ProblemsSolvedSection` (live copy stays in `src/components/sections/`) |
| `preview/` | Hero FX preview components |
| `app-routes/` | `/red-demo`, `/hero-fx-preview`, `/ink-preview` pages |

## Phase 4 additions

| Item | Notes |
|------|--------|
| `sections/about/aboutVariantStore.ts` | Locked default = portrait **bottom**; inlined in `AboutUsHalf` |
| `sections/services/servicesVariantStore.ts` | Locked default = **flat**; inlined in `Services` |
| `../liquid-buttons/` | Standalone CSS lab; not imported by Next app |

## Intentionally NOT archived (still live or product)

| Item | Why keep |
|------|----------|
| `src/app/v2/` + `src/components/v2/` | Parallel rebrand |
| `services/*` live pages + branding/content/web scenes | Service funnels |

## Restore example

```powershell
Move-Item _archive\unused-components\sections\Portfolio.tsx src\components\sections\
```

Restore matching CSS from git history if re-enabling `BackgroundTexture` (texture rules removed from `globals.css` in Phase 3).
