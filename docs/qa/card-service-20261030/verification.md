# Opening cards → services verification — 30 October 2026

Implementation: `e084be78be526ba18ca2737568fffaa27900614b` on `codex/services-world-phase1-20261019`.

Verified immutable preview: https://lionovartnext-h6aekfgv8-lionovart.vercel.app/

The homepage carries the same three opening cards into the service triptych. The invitation begins with card separation, clicks remain eligible throughout the reading hold, and the painted artwork clears before the frame changes aspect ratio. Independent sculptures move into the frame centers without stretching. The existing scroll-driven colored backing and service dissolve provide continuous surfaces; no additional renderer or idle loop was added.

## Automated checks

- `node --test scripts/*.test.mjs`: 173 passed, zero failed.
- Changed TypeScript/TSX files passed ESLint.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build`: passed after the implementation and again after the final spacing correction.
- Final Vercel deployment: READY, commit `e084be78be526ba18ca2737568fffaa27900614b`, staging/preview target.
- Geometry tests include phone, tablet, laptop, desktop and short-screen inputs; they establish mathematical bounds, not live-device behavior.

## Browser evidence

Desktop Chromium viewport: approximately 1363 × 936 CSS pixels, including its scrollbar.

| Check | Observed result |
| --- | --- |
| Invitation timing | At scroll 903 px, trust opacity was zero, invitation opacity 0.4612, and outer card translations approximately ±1.075 px. |
| All paw controls | Each of the three cards accepted pointer clicks and revealed its benefit. |
| Interruption | Rapid open/close reversals settled to the latest requested state. |
| Keyboard | Enter and Space closed the selected cards; final covers matched their `aria-expanded` states. |
| Clicks during handoff reading hold | Reverse scroll to handoff progress 0.240 restored all painted faces to opacity one, with no inert/disabled ancestor; a paw click succeeded. |
| Sculpture proportions | At progress 0.548, all three sculptures measured approximately 95.406 × 95.406 px. Their centers matched their frame centers within 0.2 px. |
| Reshaping content | At that same midpoint, painted faces had opacity zero and SVG filters were released. |
| Rear frame alignment | Rear service frames both measured top 42.214 px, foreground top 74.875 px; changing the foreground variant retained this alignment. |
| Playback | Sampled service state had one playing service video; other service videos were paused. |
| Decorative activity | Pointer and color motion were disabled during handoff and after leaving the opening. |
| Canvas stability | Final preview retained three opening crop canvases and seven total page canvases across the sampled reading/service/reverse cycle. This is a bounded count check, not heap or GPU profiling. |
| Horizontal document overflow | None at the tested desktop viewport. |
| Text clearance | Final midpoint heading bounds were top 724.672 px and bottom 870.484 px, below all card frames; the lower statement remained inside the viewport. |

## Screenshots

- [Reading and paw reveal](reading-stable-e084be7.jpg)
- [Filled transformation midpoint](transition-e084be7.jpg)
- [Settled service triptych](services-e084be7.jpg)

The first implementation preview was also used for interaction, timing and variant checks. The final preview changes only the desktop innovation-statement spacing; its new composition, all three card controls, keyboard closure, settled services and reverse restoration were checked again.

## Verification limits

Live touch, tablet/phone rendering, resizing/orientation changes, reduced-motion/data-saver toggles, Safari/Firefox, failed-media simulation and long-session profiling were not exercised in this browser. Existing responsive/fallback code and geometry tests were reviewed; these do not replace device testing.

This cloud browser reported WebGL initialization failures from unchanged shader code, so GPU effects and GPU performance remain unverified. Browser-extension metadata errors were also present and were not treated as application errors. No database, account, production deployment or unrelated feature was changed.
