import type { Tool } from "@google/genai";

export type { NovaKnowledge, NovaService } from "./nova-brain/knowledge";
export { NOVA_KNOWLEDGE, getKnowledgeSummaryForPrompt } from "./nova-brain/knowledge";

export type { NovaSkill } from "./nova-brain/skills";
export { NOVA_SKILLS, loadSkill, getSkillIndexForPrompt } from "./nova-brain/skills";

export const STRATEGIST_TOOLS: Tool[];

export function getSystemPrompt(locale: string): string;
export function buildSystemInstructionText(locale: string): string;
