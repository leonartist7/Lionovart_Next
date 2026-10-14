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
