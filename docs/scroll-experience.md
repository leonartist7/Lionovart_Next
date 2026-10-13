# Homepage scroll study

Three treatments use the same current homepage, imagery, video and 3D scenes.
Open the homepage with `?scrollPreview=1&scrollMode=flow`, `settle`, or `cinema`.
The comparison panel is available only with `scrollPreview=1`. Soft settle is the default.

| Treatment | Interaction | Best fit |
| --- | --- | --- |
| Free flow | Natural scrolling, with optional Continue shortcuts | Visitors who prefer direct control |
| Soft settle | Finishes an approaching boundary or committed card transition after release | Recommended agency homepage |
| Scene by scene | A fresh gesture advances to the next visual resting point | A more directed portfolio presentation |

The opening has three distinct beats: the hero, the intact film, and the readable
LION/NOVA/ART cards. The film stops moving at 30% of the opening timeline and
stays intact until 48%. The cards finish at 80%, leaving a reading hold before
Imagine arrives. Mobile gets a longer runway, with its existing stacked card layout.

The guided option can then carry the visitor to Imagine, and from the partnership
scene to services. Tall content and the existing service/work navigation keep
their normal scrolling and interactions. A small Continue button offers the
same shortcuts in all three treatments without requiring repeated scroll gestures.

## Input rules

- One Lenis instance and its existing GSAP bridge drive the page.
- Touch keeps native scrolling (`syncTouch: false`); settling waits for release and momentum to stop.
- Wheel speed is capped only inside the opening, in the two assisted treatments.
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
Browser verification covers treatment switching, Continue and scene shortcuts,
the stationary film hold, complete cards, opt-in sound, phone layout, and reduced
motion. Final feel should also be reviewed on a physical iPhone and Android,
especially native flick momentum and media playback under low-power mode.
