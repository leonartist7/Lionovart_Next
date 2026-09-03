<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Codex Agent Skills

Project skills are installed in `.agents/skills/` and are available to Codex.

Before working on UI, UX, frontend architecture, motion, animation, WebGL/Three.js, performance, visual design, redesigns, or reference-to-code tasks:

1. Identify the narrowest skill or small set of skills that directly matches the task.
2. Read the matching `.agents/skills/<skill-name>/SKILL.md` before implementation.
3. Follow linked references/scripts only when the selected skill calls for them.
4. Do not preload or combine the entire skill library; keep context focused.
5. Project requirements, existing architecture, accessibility, performance, and these `AGENTS.md` instructions override any conflicting generic skill guidance.

High-value defaults for LIONOVART include:
- `design-taste-frontend`, `gpt-taste`, `high-end-visual-design`, `redesign-existing-projects`
- `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`
- `optimize-web-animations`, `gsap`, `cinematic-gsap-lenis-motion-system`, `animation-on-scroll`
- `threejs`, `build-threejs-scroll-worlds`, `webgl-3d-object`, `cobejs`
- `image-to-code`, `imagegen-frontend-web`, `brandkit`
- `build-awwwards-quality-sites`, `design-first-ui-prompting`, `no-ai-design-slop`, `audit-ai-design-slop`

When several skills overlap, prefer the most task-specific skill and use a general taste/design skill only as a secondary quality pass.
