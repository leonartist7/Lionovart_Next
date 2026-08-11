/**
 * NOVA skills now live in `@root/nova-brain/skills` (a plain CJS module) so
 * they're reachable from server.js/ws-dev.js — neither runs through a
 * TS/bundler pipeline. Re-exported here so existing imports
 * (`@/lib/nova-skills`) keep working unchanged.
 *
 * Points at the skills submodule directly, not the `@root/nova-brain`
 * barrel — the barrel also carries the system prompts, and CJS re-exports
 * don't tree-shake the way ESM does, so importing the barrel here would
 * drag the full prompt text into every bundle that imports this file,
 * including the admin Studio client component that renders the skill list.
 */
export type { NovaSkill } from "@root/nova-brain/skills";
export { NOVA_SKILLS, loadSkill, getSkillIndexForPrompt } from "@root/nova-brain/skills";
