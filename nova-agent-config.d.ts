import type { LiveConnectConfig } from "@google/genai";

export interface AgentConfig {
  model: string;
  voice: string;
  [key: string]: unknown;
}
export const DEFAULTS: AgentConfig;
export function getAgentConfig(docId?: "live" | "draft"): Promise<AgentConfig>;
export function buildLiveConfig(config: LiveConnectConfig, agent: AgentConfig, locale: string, conversationId: string): {
  model: string;
  config: LiveConnectConfig;
  resolvedVoice: string;
};
export function modelSupportsAffectiveProactive(model: string): boolean;
