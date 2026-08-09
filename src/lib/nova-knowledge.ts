/**
 * NOVA's source-of-truth knowledge now lives in `@root/nova-brain/knowledge`
 * (a plain CJS module) so it's reachable from server.js/ws-dev.js — neither
 * runs through a TS/bundler pipeline. Re-exported here so existing imports
 * (`@/lib/nova-knowledge`) keep working unchanged.
 *
 * Points at the knowledge submodule directly, not the `@root/nova-brain`
 * barrel — the barrel also carries the system prompts, and CJS re-exports
 * don't tree-shake the way ESM does, so importing the barrel here would
 * drag the full prompt text into every bundle that imports this file.
 */
export type { NovaKnowledge } from "@root/nova-brain/knowledge";
export { NOVA_KNOWLEDGE, getKnowledgeSummaryForPrompt } from "@root/nova-brain/knowledge";
