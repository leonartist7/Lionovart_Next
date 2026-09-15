export const LEAD_STAGES = ["new", "qualifying", "discovery", "proposal", "negotiating", "won", "lost", "nurture"] as const;
export const AUTOMATION_MODES = ["human", "assisted", "autopilot"] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];
export type AutomationMode = (typeof AUTOMATION_MODES)[number];

export type WhatsAppIntelligence = {
  summary: string;
  stage: LeadStage;
  intent: string;
  sentiment: "positive" | "neutral" | "hesitant" | "negative";
  urgency: "low" | "medium" | "high";
  qualificationScore: number;
  opportunity: string;
  objection: string;
  nextBestAction: string;
  actionReason: string;
  memory: string[];
  tags: string[];
  suggestedReplies: Array<{ label: string; text: string }>;
};
