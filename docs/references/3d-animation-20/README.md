# 3D Animation 20 — closing CTA

Attribution: **Awwwards Pack**, asset ID `3d-animation-20`, original folder `Awwwards Pack/3D Animation/20`.

Reference supplied by the user: `20-20261014T202241Z-1-001.zip`, containing `20/3d-20-650.mp4` (3.35 seconds, 1166×650, 120 fps). The outer archive also contained `code.zip`; this was inspected, rather than assumed to exist. The supplied package.json declares `"license": "ISC"`, with an empty author field. No separate copyright or license file was supplied. Preserve these notices with the adaptation.

The video is the visual reference: curved media planes, individual panel rotations, a central typographic focal point, and pointer-driven camera depth. The demo source differs visually (white background, "Framecast" heading) and was used to understand its parabolic placement and damped pointer motion.

The homepage adaptation uses the site's ivory closing surface, gold caption rules and existing Cloudinary showcase imagery. Six shared 480 px `q_auto:eco` image resources replace 49 simultaneous video elements. Unrelated original film clips are not shipped. There are no new package dependencies.

Implementation: `ClosingMediaWall.tsx` and its CSS module. The gallery is decorative and cannot intercept taps, scrolling, keyboard focus or the Nova CTA. The existing lion dock and CTA positions are preserved. It reveals using the existing process handoff progress.

- Desktop: 18 curved planes, damped pointer movement and restrained ambient drift.
- Phone: 12 visible planes, reduced travel, no touch-move listener or gesture interception.
- Reduced motion / Save-Data: static composition; no animation loop.
- Offscreen / hidden tab / pre-reveal: no animation loop. Images load only when revealed.
- Unmount: observers, motion subscription, listeners and animation frame are released.
- CSS perspective also works without WebGL.

## Framework adaptation

The supplied standalone demo uses Three.js r128 and dat.GUI 0.7.9 as CDN globals, with Vite ^8.1.3 as a development dependency. Those globals and the demo's full-page canvas/overflow rules are not suitable for this section-scoped Next.js integration. The project already has Three.js ^0.185.1 for the lion; the gallery uses CSS perspective and existing React APIs, with no additional dependency or WebGL context.

All runtime images are existing project Cloudinary showcase assets, requested at 480 px with automatic format and eco quality. The reference's unrelated MOV films and font names are not required by this adaptation.

## Verification

Production build/type checking and changed-component ESLint passed. Playwright passed at 320×740, 390×844, 768×1024, 1366×768 and 1440×900, including a separate 390×844 touch configuration. Verified image loading, the real keyboard-activated Nova CTA, desktop pointer perspective, responsive plane counts, zero horizontal overflow, no uncaught browser errors, offscreen pausing and static reduced motion.

Full interaction run: https://github.com/leonartist7/Lionovart_Next/actions/runs/38636319490

Unobstructed phone/laptop visual review: https://github.com/leonartist7/Lionovart_Next/actions/runs/38636978092

The temporary branch-only CI workflow was removed after verification. To rerun the retained test with the application dependencies installed:

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install chromium
node scripts/verify-closing-cta.mjs
```

The test starts its own local development server on port 3000, closes the existing exit prompt through its real dismiss button, saves screenshots under verification-output/closing-cta, and stops the server and browser afterward.
