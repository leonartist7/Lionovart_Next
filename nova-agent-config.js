// Reads Firestore doc agent_config/live (or agent_config/draft for Studio
// draft test-calls) to hot-swap model/voice/VAD/etc without a redeploy.
// Shared by server.js (prod) and ws-dev.js (dev) so both proxies apply the
// same config. Falls back to hardcoded defaults if Firebase isn't configured
// or the doc doesn't exist — never crashes a conversation over a missing
// config doc (same graceful-degradation pattern as src/lib/firebase-admin.ts).
let admin;
try {
  admin = require("firebase-admin");
} catch {
  admin = null;
}

const { buildSystemInstructionText, STRATEGIST_TOOLS } = require("./nova-brain");

const LIVE_CACHE_TTL_MS = 60_000;
const DRAFT_CACHE_TTL_MS = 10_000;
const cache = new Map(); // docId -> { config, cachedAt }

// Mirrors the ids in nova-brain/skills' NOVA_SKILLS. Used only to know which
// "- id: ..." index lines to strip when Agent Studio disables a skill.
const ALL_SKILL_IDS = ["objections", "faq", "scheduling", "qualification"];

const DEFAULTS = {
  model: process.env.GEMINI_LIVE_MODEL || "models/gemini-3.1-flash-live-preview",
  voice: "Aoede",
  thinkingLevel: "MINIMAL",
  vad: {
    startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
    endOfSpeechSensitivity: "END_SENSITIVITY_LOW",
    prefixPaddingMs: 40,
    silenceDurationMs: 600,
  },
  enableAffectiveDialog: false,
  proactiveAudio: false,
  voice_experiment: { enabled: false, variants: [], split: [] },
};

// Deterministic 0..1 hash of a string (same conversationId always maps to the
// same value — a visitor's voice variant never changes across reconnects).
function hashToUnit(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0) / 4294967295;
}

// Picks a voice variant for this conversationId per the experiment's split.
// Returns null if the experiment isn't enabled/well-formed — caller falls
// back to agentConfig.voice.
function assignVoiceVariant(conversationId, experiment) {
  if (!experiment?.enabled || !Array.isArray(experiment.variants) || experiment.variants.length < 2) return null;
  const u = hashToUnit(conversationId || "");
  let cumulative = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.split[i] ?? 1 / experiment.variants.length;
    if (u <= cumulative) return experiment.variants[i];
  }
  return experiment.variants[experiment.variants.length - 1];
}

let adminDb = null;
function getAdminDb() {
  if (adminDb) return adminDb;
  if (!admin) return null;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;

  try {
    const app = admin.apps.length > 0 ? admin.apps[0] : admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    adminDb = admin.firestore(app);
    return adminDb;
  } catch (err) {
    console.error("[nova-agent-config] Firebase admin init failed:", err.message);
    return null;
  }
}

// docId: "live" (default, 60s cache) or "draft" (Agent Studio test-call, 10s
// cache — shorter because it's actively being iterated on).
async function getAgentConfig(docId = "live") {
  const ttl = docId === "draft" ? DRAFT_CACHE_TTL_MS : LIVE_CACHE_TTL_MS;
  const now = Date.now();
  const cached = cache.get(docId);
  if (cached && now - cached.cachedAt < ttl) return cached.config;

  const db = getAdminDb();
  if (!db) {
    cache.set(docId, { config: DEFAULTS, cachedAt: now });
    return DEFAULTS;
  }

  let config;
  try {
    const snap = await db.collection("agent_config").doc(docId).get();
    config = snap.exists ? { ...DEFAULTS, ...snap.data() } : DEFAULTS;
  } catch (err) {
    console.error(`[nova-agent-config] Firestore read failed (${docId}), using defaults:`, err.message);
    config = DEFAULTS;
  }
  cache.set(docId, { config, cachedAt: now });
  return config;
}

// gemini-3.1-flash-live doesn't support enableAffectiveDialog / proactiveAudio
// (those are Gemini 2.5 native-audio-model flags) — drop them silently.
function modelSupportsAffectiveProactive(model) {
  return !/3\.1-flash-live/i.test(model || "");
}

// Removes "- <id>: ..." skill-index lines for skills not in enabledIds from
// the system prompt text. No-op if skills_enabled isn't configured (all
// skills stay listed, matching current default behavior).
function filterSkillIndex(promptText, enabledIds) {
  if (!Array.isArray(enabledIds) || typeof promptText !== "string") return promptText;
  let text = promptText;
  for (const id of ALL_SKILL_IDS) {
    if (!enabledIds.includes(id)) {
      text = text
        .split("\n")
        .filter((line) => !new RegExp(`^-\\s*${id}\\s*:`).test(line.trim()))
        .join("\n");
    }
  }
  return text;
}

// Merges the Firestore-backed agent config onto the client's setup config
// before opening the Gemini Live session. `locale` selects the per-locale
// prompt override, if any, from agentConfig.prompt_overrides. `conversationId`
// deterministically assigns a voice-A/B variant when one is configured — same
// visitor always gets the same voice across reconnects, never re-rolled.
//
// systemInstruction and tools are always built here from nova-brain, never
// taken from clientConfig — the client stopped sending them, and even if a
// forged setup frame included them, they're overwritten below before this
// config ever reaches Gemini.
function buildLiveConfig(clientConfig, agentConfig, locale, conversationId) {
  const model = agentConfig.model || DEFAULTS.model;
  const config = { ...(clientConfig || {}) };
  config.tools = STRATEGIST_TOOLS;

  const resolvedVoice = assignVoiceVariant(conversationId, agentConfig.voice_experiment) || agentConfig.voice;
  if (resolvedVoice) {
    config.speechConfig = {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: resolvedVoice } },
    };
  }

  if (typeof agentConfig.temperature === "number") {
    config.temperature = agentConfig.temperature;
  }

  config.thinkingConfig = { thinkingLevel: agentConfig.thinkingLevel || DEFAULTS.thinkingLevel };

  const vad = { ...DEFAULTS.vad, ...(agentConfig.vad || {}) };
  config.realtimeInputConfig = {
    automaticActivityDetection: {
      startOfSpeechSensitivity: vad.startOfSpeechSensitivity,
      endOfSpeechSensitivity: vad.endOfSpeechSensitivity,
      prefixPaddingMs: vad.prefixPaddingMs,
      silenceDurationMs: vad.silenceDurationMs,
    },
  };

  // Session resumption handle (if the client is reconnecting) + sliding
  // context window compression so long conversations don't die.
  config.sessionResumption = (clientConfig && clientConfig.sessionResumption) || {};
  config.contextWindowCompression = { slidingWindow: {} };

  if (modelSupportsAffectiveProactive(model)) {
    if (agentConfig.enableAffectiveDialog) config.enableAffectiveDialog = true;
    if (agentConfig.proactiveAudio) {
      config.proactivity = { proactiveAudio: true };
    }
  }

  // Prompt overrides + skill-index filtering, applied to the server-built
  // base text for this locale (never the client's).
  const override = locale && agentConfig.prompt_overrides ? agentConfig.prompt_overrides[locale] : null;
  let text = override && override.trim() ? override : buildSystemInstructionText(locale);
  text = filterSkillIndex(text, agentConfig.skills_enabled);
  config.systemInstruction = { parts: [{ text }] };

  return { model, config, resolvedVoice };
}

module.exports = { getAgentConfig, buildLiveConfig, modelSupportsAffectiveProactive, DEFAULTS, ALL_SKILL_IDS };
