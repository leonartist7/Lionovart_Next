export interface NovaSkill {
  id: string;
  title: string;
  /** One line shown in the system-prompt skill index — when to load. */
  triggers: string;
  /** Full playbook returned by load_skill. Spoken-audio directives. */
  instructions: string;
}

export const NOVA_SKILLS: Record<string, NovaSkill>;
export function loadSkill(id: string): { skill_id: string; instructions: string } | { error: string; available: string[] };
export function getSkillIndexForPrompt(enabledIds?: string[]): string;
