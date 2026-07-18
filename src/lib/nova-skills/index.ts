/**
 * NOVA skills — on-demand expertise modules.
 *
 * The Live API system prompt is fixed at session setup, so deep playbooks
 * can't be swapped per-turn. Instead the core prompt carries a one-line
 * index of these skills and a rule: when the conversation enters a skill's
 * territory, silently call `load_skill(skill_id)`. The tool response returns
 * the full instructions, which the model absorbs and applies.
 *
 * Keeps the always-on prompt lean and the deep expertise sharp.
 * Skill instructions are English regardless of session locale — the model
 * applies them in whatever language the user is speaking.
 */

import { OBJECTIONS_SKILL } from "./objections";
import { FAQ_SKILL } from "./faq";
import { SCHEDULING_SKILL } from "./scheduling";
import { QUALIFICATION_SKILL } from "./qualification";

export interface NovaSkill {
  id: string;
  title: string;
  /** One line shown in the system-prompt skill index — when to load. */
  triggers: string;
  /** Full playbook returned by load_skill. Spoken-audio directives. */
  instructions: string;
}

export const NOVA_SKILLS: Record<string, NovaSkill> = {
  [OBJECTIONS_SKILL.id]: OBJECTIONS_SKILL,
  [FAQ_SKILL.id]: FAQ_SKILL,
  [SCHEDULING_SKILL.id]: SCHEDULING_SKILL,
  [QUALIFICATION_SKILL.id]: QUALIFICATION_SKILL,
};

export function loadSkill(id: string): { skill_id: string; instructions: string } | { error: string; available: string[] } {
  const skill = NOVA_SKILLS[id];
  if (!skill) {
    return { error: `Unknown skill '${id}'`, available: Object.keys(NOVA_SKILLS) };
  }
  return { skill_id: skill.id, instructions: skill.instructions };
}

/**
 * Compact index injected into the core system prompt. When `enabledIds` is
 * passed (Agent Studio's `skills_enabled`), only those skills are listed —
 * disabled skills' lines drop out of the prompt entirely. Omit to list all
 * skills (default / no Agent Studio config yet).
 */
export function getSkillIndexForPrompt(enabledIds?: string[]): string {
  return Object.values(NOVA_SKILLS)
    .filter((s) => !enabledIds || enabledIds.includes(s.id))
    .map((s) => `- ${s.id}: ${s.triggers}`)
    .join("\n");
}
