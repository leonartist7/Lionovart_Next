// NOVA's brain: system prompt, knowledge, skills, and tool declarations —
// all owned server-side. Required directly by server.js / ws-dev.js (plain
// CJS, no build step) and re-exported by the TS modules under src/lib/ so
// the rest of the app has exactly one source of truth to import from.
//
// Before this module existed, the browser sent systemInstruction + tools in
// the WS setup frame and the proxy relayed them to Gemini as-is — the full
// playbook shipped in the client bundle, and a forged prompt was accepted
// outright. Nothing here should ever be built from client-supplied text.
const { NOVA_KNOWLEDGE, getKnowledgeSummaryForPrompt } = require("./nova-brain/knowledge");
const { NOVA_SKILLS, loadSkill, getSkillIndexForPrompt } = require("./nova-brain/skills");
const { STRATEGIST_TOOLS } = require("./nova-brain/tools");

const PROMPTS = {
  en: require("./nova-brain/prompts/en").SYSTEM_PROMPT,
  es: require("./nova-brain/prompts/es").SYSTEM_PROMPT,
  fr: require("./nova-brain/prompts/fr").SYSTEM_PROMPT,
  it: require("./nova-brain/prompts/it").SYSTEM_PROMPT,
  ko: require("./nova-brain/prompts/ko").SYSTEM_PROMPT,
};

function getSystemPrompt(locale) {
  return PROMPTS[locale] || PROMPTS.en;
}

// Appended server-side at connect time — was previously tacked on
// client-side in useStrategistSession.ts's setup payload.
const GREETING_DIRECTIVE =
  "\n\nCRITICAL DIRECTIVE: Your very first action immediately upon connecting must be a brief 1-sentence verbal greeting from Stage 0. Pick one of the rotation options. Do not wait for the user to speak first.";

function buildSystemInstructionText(locale) {
  return getSystemPrompt(locale) + GREETING_DIRECTIVE;
}

module.exports = {
  NOVA_KNOWLEDGE,
  getKnowledgeSummaryForPrompt,
  NOVA_SKILLS,
  loadSkill,
  getSkillIndexForPrompt,
  STRATEGIST_TOOLS,
  getSystemPrompt,
  buildSystemInstructionText,
};
