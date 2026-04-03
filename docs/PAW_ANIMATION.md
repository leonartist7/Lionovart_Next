# Lion Paw Swing Animation — Design & Implementation

## Component
`src/components/sections/ProblemsSolvedSection.tsx`

## Visual Goal
- When the user clicks a problem card to reveal the solution:
  1. A lion paw image **slides in from the left edge** of the card (horizontal, 0° rotation)
  2. It **swings clockwise** (~40° arc) and drops slightly, like it's tearing the card open
  3. After a **0.5s delay**, the black problem card slides down, and the paw goes with it (disappears below)
- On clicking again to collapse:
  1. The card rises back up first
  2. The paw **retracts** to the left edge (reverse animation), returning to its hidden tucked state

## Structure
```
card wrapper (relative)
└── masked area (overflow-hidden)
    ├── solution layer (base)
    └── problem layer (absolute, slides down/up)
        ├── lion paw (absolute, top-left)
        │   └── slides right → rotates 0→40° → scales 0.7→1
        └── problem text (below paw)
```

## Key Decisions

### Paw MUST live inside the problem layer
- The paw is a sibling to the problem text **inside** the sliding problem `motion.div`
- This means the paw automatically disappears when the card slides down (no manual opacity tricks needed)
- The paw reappears when the card rises back during collapse

### Paw slides from the card's LEFT edge
- Hidden state: `x: -70%, scale: 0.7` — fully clipped by `overflow-hidden` on the masked area
- Revealed state: `x: 0%, rotate: 40, scale: 1` — swings right into view, rotates clockwise
- Collapse: reverse (`x: -70%, rotate: 0, scale: 0.7`)

### Timing sequence (reveal)
```
t=0.0s   paw starts sliding from left (0px visible)
t=0.8s   paw finishes at card's left edge, fully swung
t=0.5s   problem card starts sliding down (0.5s delay after paw starts)
t=1.9s   card fully down, paw out of view (clipped)
```

### Timing sequence (collapse)
```
t=0.0s   card starts rising (no delay)
t=1.4s   card finishes rising, paw becomes visible again
t=0.5s   (during card rise) paw starts retracting left (x: -70%)
```

Wait — collapse timing is wrong. The problem layer currently has `delay: 0.5` on reveal but `delay: 0` on collapse. This means:
- Reveal: paw goes first (0s), card goes at 0.5s ✓
- Collapse: card goes at 0s, paw... needs to finish retracting BEFORE card appears

The paw animation runs on the same duration (0.8s) as the card slide (1.4s). Need to verify that the retract finishes before the card fully rises.

**TODO**: If timing feels off on collapse, change problem collapse delay to `delay: 0.5` so paw finishes retracting first, then card rises.

## Failed Approaches (Don't Do These)

### 1. Paw on the card wrapper level (outside masked area)
- **Problem**: Paw stays visible after card slides down — overlaps the solution card
- **Fix**: Move paw inside the problem layer so it clips with `overflow-hidden`

### 2. Paw starts visible/tucked in the card
- **Problem**: User wants paw to **slide in** from the left edge (from hidden), not be visible initially
- **Fix**: Hidden state is `x: -70%` (clipped) + `scale: 0.7`, not visible/tucked

### 3. Paw fades to opacity 0 to "disappear"
- **Problem**: Fading looks disconnected — the paw should physically go away with the card
- **Fix**: No opacity animation — paw goes with the sliding problem layer (clipped by overflow-hidden)

### 4. Paw rotates from the start
- **Problem**: User specifically wants image starting horizontal (0° rotation), not pre-rotated
- **Fix**: Initial `rotate: 0`, animate through `[0, 0, 20, 40]` keyframes

### 5. Paw using Next.js Image component with external URL, causing network issues
- **Problem**: Large image loading causes flickering/blur
- **Fix**: Image is at `180px/220px` (smaller), no blur prop, `object-contain`

## Current Asset
```
src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png"
```

## Tailwind Context
- Tokens in `globals.css` (Tailwind v4 CSS-first config)
- Framer Motion for paw animation (`motion.div`)
- `overflow-hidden` on masked container clips the paw at `-70%` left offset
