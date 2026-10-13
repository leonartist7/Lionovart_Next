# FameEstate alternative preview

Base: `codex/latest-unified-20261008`, commit `fcddf5bcc7c71082be1a16c094ff3d5e02995b1a`.
Preview branch: `codex/fameestate-scroll-preview-20261014`.

Sequence: existing pinned hero/video/3D cards → Imagine benefit cards (flat red arrival, no circle) → stationary Imagine exit → centre slit expanding to red → three cascading project images → red “One partnership / Designing your legacy” → split red halves exposing the real white Services section.

Adapted in Next.js/React with CSS Modules, existing translations, existing GSAP and existing Lenis provider. No Vite or second Lenis/RAF loop. APIs used are available in the project's GSAP 3.14.x; the supplied demo declares ^3.15.0 but no newer APIs are needed. Desktop animation travel 440svh; phone animation travel 340svh. The runway includes one extra viewport for the real Services overlap; animation ends when Services reach the viewport top. Mobile shows complete project images using contain framing. Reduced motion and short landscape viewports use ordinary document flow with a project gallery, one partnership heading and services. Setup, image/font refresh callbacks, ResizeObserver, matchMedia and ScrollTriggers are scoped and disposed on unmount. The right split copy is decorative and hidden from assistive technology.

## Source attribution and access limitation

Motion reference: Codegrid, FameEstate Scroll Animation, Awwwards Pack / Scroll Animation / 68 / code.zip, selected asset `scroll-animation-68`.
Supplied original package name: `codegrid-fameestate-scroll-animation`, version 1.0.0, license field `ISC`.

The complete attached archive could not be downloaded in the current sandbox. This preview was adapted from the full entry-point excerpts supplied by the user and the current repository source. Original archive images are replaced by the repository's existing SHOWCASE_IMAGES. The archive's additional assets and any separate license/copyright text are unverified; do not describe this as a full archive audit. No reference video was attached. Preserve any additional notices when the archive becomes accessible.

This is an isolated alternative preview; the original transition component remains in the repository.
