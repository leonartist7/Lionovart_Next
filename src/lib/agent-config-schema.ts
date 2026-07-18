/**
 * Shared shape for the Firestore-backed agent config (`agent_config/live` /
 * `agent_config/draft`) — mirrors `nova-agent-config.js` DEFAULTS exactly.
 * Used by both the Agent Studio form and the /api/admin/config route's
 * server-side validation, so the two never drift apart.
 *
 * Note: thinkingLevel and the VAD sensitivity enums use the exact string
 * values the Gemini Live API / `@google/genai` SDK expects (uppercase,
 * `START_SENSITIVITY_*` / `END_SENSITIVITY_*` prefixes) — not the shorthand
 * used in the original plan doc.
 */

export const THINKING_LEVELS = ["MINIMAL", "LOW", "MEDIUM", "HIGH"] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

export const START_SENSITIVITIES = [
  "START_SENSITIVITY_UNSPECIFIED",
  "START_SENSITIVITY_LOW",
  "START_SENSITIVITY_HIGH",
] as const;
export type StartSensitivity = (typeof START_SENSITIVITIES)[number];

export const END_SENSITIVITIES = [
  "END_SENSITIVITY_UNSPECIFIED",
  "END_SENSITIVITY_LOW",
  "END_SENSITIVITY_HIGH",
] as const;
export type EndSensitivity = (typeof END_SENSITIVITIES)[number];

export const LOCALES = ["en", "es", "fr", "it", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const VOICE_OPTIONS = ["Aoede", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Zephyr"] as const;

export const MODEL_PRESETS = [
  { value: "models/gemini-3.1-flash-live-preview", label: "Gemini 3.1 Flash Live (Recommended)" },
  { value: "models/gemini-2.5-flash-native-audio-preview", label: "Gemini 2.5 Flash Native Audio (Affective-capable)" },
] as const;

export const ORB_ENGINES = ["auto", "webgpu", "webgl", "css"] as const;

export interface AgentConfigVad {
  startOfSpeechSensitivity: StartSensitivity;
  endOfSpeechSensitivity: EndSensitivity;
  prefixPaddingMs: number;
  silenceDurationMs: number;
}

export interface AgentConfigEnrichment {
  // GMB/Places lookups are on by default (public data, cheap, no
  // compliance risk). Social scraping stays off — most platforms
  // rate-limit/ban it and it's legally grayer than Places data; the flag
  // exists so Leon can flip it on later once a compliant provider is wired in.
  social_scraping: boolean;
}

export interface AgentConfigVoiceExperiment {
  enabled: boolean;
  variants: string[];
  split: number[];
}

export type OrbEngine = "auto" | "webgpu" | "webgl" | "css";
export const BOOKING_MODES = ["calcom", "link"] as const;
export type BookingMode = (typeof BOOKING_MODES)[number];

export interface AgentConfig {
  model: string;
  voice: string;
  temperature: number;
  thinkingLevel: ThinkingLevel;
  vad: AgentConfigVad;
  enableAffectiveDialog: boolean;
  proactiveAudio: boolean;
  locale_default: Locale;
  skills_enabled: string[];
  prompt_overrides: Partial<Record<Locale, string>>;
  enrichment: AgentConfigEnrichment;
  voice_experiment: AgentConfigVoiceExperiment;
  orb_engine: OrbEngine;
  booking_mode: BookingMode;
}

// gemini-3.1-flash-live doesn't support enableAffectiveDialog / proactiveAudio.
// Kept in sync with nova-agent-config.js's modelSupportsAffectiveProactive.
export function modelSupportsAffectiveProactive(model: string): boolean {
  return !/3\.1-flash-live/i.test(model || "");
}

export function validateAgentConfig(input: unknown): { ok: true; config: AgentConfig } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Config must be an object" };
  const c = input as Record<string, unknown>;

  if (typeof c.model !== "string" || !c.model.trim()) return { ok: false, error: "model is required" };
  if (typeof c.voice !== "string" || !c.voice.trim()) return { ok: false, error: "voice is required" };

  const temperature = typeof c.temperature === "number" ? c.temperature : 1;
  if (temperature < 0 || temperature > 2) return { ok: false, error: "temperature must be 0-2" };

  const thinkingLevel = c.thinkingLevel as ThinkingLevel;
  if (!THINKING_LEVELS.includes(thinkingLevel)) return { ok: false, error: "invalid thinkingLevel" };

  const vadInput = (c.vad ?? {}) as Record<string, unknown>;
  const startOfSpeechSensitivity = vadInput.startOfSpeechSensitivity as StartSensitivity;
  const endOfSpeechSensitivity = vadInput.endOfSpeechSensitivity as EndSensitivity;
  if (!START_SENSITIVITIES.includes(startOfSpeechSensitivity)) return { ok: false, error: "invalid vad.startOfSpeechSensitivity" };
  if (!END_SENSITIVITIES.includes(endOfSpeechSensitivity)) return { ok: false, error: "invalid vad.endOfSpeechSensitivity" };
  const prefixPaddingMs = Number(vadInput.prefixPaddingMs);
  if (!Number.isFinite(prefixPaddingMs) || prefixPaddingMs < 0 || prefixPaddingMs > 500) {
    return { ok: false, error: "vad.prefixPaddingMs must be 0-500" };
  }
  const silenceDurationMs = Number(vadInput.silenceDurationMs);
  if (!Number.isFinite(silenceDurationMs) || silenceDurationMs < 100 || silenceDurationMs > 2000) {
    return { ok: false, error: "vad.silenceDurationMs must be 100-2000" };
  }

  const localeDefault = c.locale_default as Locale;
  if (!LOCALES.includes(localeDefault)) return { ok: false, error: "invalid locale_default" };

  const skillsEnabled = Array.isArray(c.skills_enabled) ? c.skills_enabled.filter((s) => typeof s === "string") : [];

  const promptOverridesInput = (c.prompt_overrides ?? {}) as Record<string, unknown>;
  const promptOverrides: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) {
    const v = promptOverridesInput[locale];
    if (typeof v === "string") promptOverrides[locale] = v;
  }

  const enrichmentInput = (c.enrichment ?? {}) as Record<string, unknown>;
  const enrichment: AgentConfigEnrichment = {
    social_scraping: Boolean(enrichmentInput.social_scraping),
  };

  const voiceExpInput = (c.voice_experiment ?? {}) as Record<string, unknown>;
  const rawVariants = Array.isArray(voiceExpInput.variants)
    ? voiceExpInput.variants.filter((v) => typeof v === "string")
    : [];
  const rawSplit = Array.isArray(voiceExpInput.split)
    ? voiceExpInput.split.filter((n) => typeof n === "number" && Number.isFinite(n))
    : [];
  const voiceExperiment: AgentConfigVoiceExperiment = {
    enabled: Boolean(voiceExpInput.enabled) && rawVariants.length >= 2 && rawVariants.length === rawSplit.length,
    variants: rawVariants,
    split: rawSplit,
  };
  if (voiceExperiment.enabled) {
    const splitSum = voiceExperiment.split.reduce((a, b) => a + b, 0);
    if (Math.abs(splitSum - 1) > 0.01) {
      return { ok: false, error: "voice_experiment.split must sum to 1" };
    }
  }

  const orbEngine = (typeof c.orb_engine === "string" ? c.orb_engine : "auto") as OrbEngine;
  if (!ORB_ENGINES.includes(orbEngine)) return { ok: false, error: "invalid orb_engine" };

  const bookingMode = (typeof c.booking_mode === "string" ? c.booking_mode : "link") as BookingMode;
  if (!BOOKING_MODES.includes(bookingMode)) return { ok: false, error: "invalid booking_mode" };

  return {
    ok: true,
    config: {
      model: c.model,
      voice: c.voice,
      temperature,
      thinkingLevel,
      vad: { startOfSpeechSensitivity, endOfSpeechSensitivity, prefixPaddingMs, silenceDurationMs },
      enableAffectiveDialog: Boolean(c.enableAffectiveDialog),
      proactiveAudio: Boolean(c.proactiveAudio),
      locale_default: localeDefault,
      skills_enabled: skillsEnabled,
      prompt_overrides: promptOverrides,
      enrichment,
      voice_experiment: voiceExperiment,
      orb_engine: orbEngine,
      booking_mode: bookingMode,
    },
  };
}

export const AGENT_CONFIG_DEFAULTS: AgentConfig = {
  model: "models/gemini-3.1-flash-live-preview",
  voice: "Aoede",
  temperature: 1,
  thinkingLevel: "MINIMAL",
  vad: {
    startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
    endOfSpeechSensitivity: "END_SENSITIVITY_LOW",
    prefixPaddingMs: 40,
    silenceDurationMs: 600,
  },
  enableAffectiveDialog: false,
  proactiveAudio: false,
  locale_default: "en",
  skills_enabled: ["objections", "faq", "scheduling", "qualification"],
  prompt_overrides: {},
  enrichment: { social_scraping: false },
  voice_experiment: { enabled: false, variants: [], split: [] },
  orb_engine: "auto",
  // Safe default — stays "link" (current BOOKING_URL handoff) until Leon
  // actually sets up Cal.com and flips this in Studio, even if the API key
  // happens to be present (e.g. mid-migration/testing).
  booking_mode: "link",
};
