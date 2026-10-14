# Homepage scroll study

Three treatments use the same current homepage, imagery, video and 3D scenes.
Open the homepage with `?scrollPreview=1&scrollMode=flow`, `settle`, or `cinema`.
The comparison panel is available only with `scrollPreview=1`. Soft settle is the
selected public experience; other mode parameters are honored only in the comparison preview.

| Treatment | Interaction | Best fit |
| --- | --- | --- |
| Free flow | Natural scrolling, with optional Continue shortcuts | Visitors who prefer direct control |
| Soft settle | Finishes an approaching boundary or committed card transition after release | Recommended agency homepage |
| Scene by scene | A fresh gesture advances to the next visual resting point | A more directed portfolio presentation |

The opening has three distinct beats: the hero, the intact film, and the readable
LION/NOVA/ART cards. The film stops moving at 30% of the opening timeline and
stays intact until 48%. The cards finish at 80%, leaving a reading hold before
Imagine arrives. Below 920px width, the film uses its portrait source and cards stack vertically.
The benefit cards use the same 920px breakpoint. Height only tunes spacing and sizing.

The guided option can then carry the visitor to Imagine, and from the partnership
scene to services. Tall content and the existing service/work navigation keep
their normal scrolling and interactions. The public Continue button has been removed; scene shortcuts remain in the comparison panel only.

## Input rules

- One stable Lenis instance and one GSAP ticker drive the page, with GSAP lag smoothing disabled as recommended by Lenis.
- Profile and reduced-motion changes do not recreate Lenis. The library handles live reduced-motion preferences internally.
- The opening film/cards and partnership timelines consume the Lenis scroll event directly; they do not add another scroll RAF.
- Touch keeps native scrolling (`syncTouch: false`); settling waits for release and momentum to stop.
- Soft settle keeps the complete wheel delta. Only the older cinematic comparison has an opening speed cap.
- A single release timer checks physical intent and Lenis inertia; scroll frames do not continually postpone the timer.
- Automatic corrections take 0.42–0.95 seconds according to distance. Comparison-panel journeys take 0.45–1.15 seconds. Wheel damping is 0.115 for a slightly longer release.
- No current/next section state or public floating navigation is updated on scroll.
- Every release in the film/card split range completes to cards going down or the joined film going up; intact-film and complete-card reading holds remain free.
- Trust badges and flags fade in with the settled film and are fully present before the split. Film sizing reserves their space.
- Imagine and the shrinking circle use the footer red palette in a centered radial gradient; the arc and section body share gradient coordinates.
- Service controls and anchor links use Lenis rather than a competing browser smooth-scroll animation.
- Testimonial marquees pause offscreen and in hidden tabs, resuming their existing position on return.
- No timer advances the story by itself, and no gesture is locked.
- New wheel, touch, keyboard, pointer or navigation input cancels an automatic move.
- Dialogs, the open navigation menu, selected text and focused form inputs suppress settling.
- Reduced motion and short landscape viewports disable automatic settling.
- Observer, event, timer, frame and AudioContext resources are cleaned up on departure.

## Sound trial

The navigation has an explicit sound toggle. Every new visit starts silent.
AudioContext is created only by enabling sound. Locally synthesized, low-volume
warm notes accompany selected scene arrivals and a brief click accompanies a
benefit reveal. There is no music bed, hover sound or automatic video audio.
Scene cues play at most once per scene and are spaced by at least 2.8 seconds.
Hidden tabs suspend audio; disabling sound suspends the context immediately.

## Verification

`node scripts/scroll-experience.test.mjs` checks reading holds, forward/reverse
intent, boundary proximity, bounded easing and the fresh-gesture requirement.
Browser verification covers treatment switching and comparison-panel scene shortcuts,
the stationary film hold, complete cards, opt-in sound, phone layout, and reduced
motion. Final feel should also be reviewed on a physical iPhone and Android,
especially native flick momentum and media playback under low-power mode.
