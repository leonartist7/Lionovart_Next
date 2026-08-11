// NOVA skills — on-demand expertise modules.
//
// The Live API system prompt is fixed at session setup, so deep playbooks
// can't be swapped per-turn. Instead the core prompt carries a one-line
// index of these skills and a rule: when the conversation enters a skill's
// territory, silently call load_skill(skill_id). The tool response returns
// the full instructions, which the model absorbs and applies.
//
// Keeps the always-on prompt lean and the deep expertise sharp.
// Skill instructions are English regardless of session locale — the model
// applies them in whatever language the user is speaking.

const { OBJECTIONS_SKILL } = require("./objections");
const { FAQ_SKILL } = require("./faq");
const { SCHEDULING_SKILL } = require("./scheduling");
const { QUALIFICATION_SKILL } = require("./qualification");

const NOVA_SKILLS = {
  [OBJECTIONS_SKILL.id]: OBJECTIONS_SKILL,
  [FAQ_SKILL.id]: FAQ_SKILL,
  [SCHEDULING_SKILL.id]: SCHEDULING_SKILL,
  [QUALIFICATION_SKILL.id]: QUALIFICATION_SKILL,
};

function loadSkill(id) {
  const skill = NOVA_SKILLS[id];
  if (!skill) {
    return { error: `Unknown skill '${id}'`, available: Object.keys(NOVA_SKILLS) };
  }
  return { skill_id: skill.id, instructions: skill.instructions };
}

// Compact index injected into the core system prompt. When `enabledIds` is
// passed (Agent Studio's `skills_enabled`), only those skills are listed —
// disabled skills' lines drop out of the prompt entirely. Omit to list all
// skills (default / no Agent Studio config yet).
function getSkillIndexForPrompt(enabledIds) {
  return Object.values(NOVA_SKILLS)
    .filter((s) => !enabledIds || enabledIds.includes(s.id))
    .map((s) => `- ${s.id}: ${s.triggers}`)
    .join("\n");
}

module.exports = { NOVA_SKILLS, loadSkill, getSkillIndexForPrompt };
