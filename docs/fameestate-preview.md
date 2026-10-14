# FameEstate alternative preview

Base: `codex/latest-unified-20261008`, commit `fcddf5bcc7c71082be1a16c094ff3d5e02995b1a`.
Preview branch: `codex/fameestate-scroll-preview-20261014`.

Sequence: existing pinned hero/video/3D cards → centred Imagine benefit cards on dark → centre line directly over Imagine → three cascading project images → expanding red circle with “One partnership / Designing your legacy” → transparent circular aperture exposing the real Services already held in place.

Adapted in Next.js/React with CSS Modules, existing translations, existing GSAP and existing Lenis provider. No Vite or second Lenis/RAF loop. APIs used are available in the project's GSAP 3.14.x; the supplied demo declares ^3.15.0 but no newer APIs are needed. Desktop animation travel 400svh; phone animation travel 300svh. Services are visually held at the viewport top from aperture start (.82) through completion, with a transform compensating their remaining native arrival distance. The transform returns to zero at completion, preserving the first service and subsequent native service scrolling. Mobile shows complete project images using contain framing. Reduced motion and short landscape viewports use ordinary document flow with a project gallery, one partnership heading and services. Setup, image/font refresh callbacks, ResizeObserver, matchMedia and ScrollTriggers are scoped and disposed on unmount. There is one partnership heading; no split clone. Services are inert until the circular aperture begins, and Imagine becomes inert after the line has covered it. The centre-out radial mask uses standard and WebKit mask properties; browsers without mask support use static flow.

## Source attribution and access limitation

Motion reference: Codegrid, FameEstate Scroll Animation, Awwwards Pack / Scroll Animation / 68 / code.zip, selected asset `scroll-animation-68`.
Supplied original package name: `codegrid-fameestate-scroll-animation`, version 1.0.0, license field `ISC`.

The complete attached archive could not be downloaded in the current sandbox. This preview was adapted from the full entry-point excerpts supplied by the user and the current repository source. Original archive images are replaced by the repository's existing SHOWCASE_IMAGES. The archive's additional assets and any separate license/copyright text are unverified; do not describe this as a full archive audit. No reference video was attached. Preserve any additional notices when the archive becomes accessible.

This is an isolated alternative preview; the original transition component remains in the repository.
