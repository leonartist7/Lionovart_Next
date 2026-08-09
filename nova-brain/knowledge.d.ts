export interface NovaService {
  id: string;
  title: string;
  summary: string;
  deliverables: string[];
}

export interface NovaKnowledge {
  founder: { name: string; nickname: string; short: string; credibility: string };
  brand: { name: string; tagline: string; positioning: string; base: string };
  philosophy: Record<string, string>;
  services: NovaService[];
  niche_insights: Record<string, string>;
  value_bombs: string[];
  faq: Array<{ q: string; a: string }>;
  call_offer: { duration_min: number; framing: string; description: string; cta_phrasing: string[] };
  page_sections: Array<{ id: string; label: string }>;
}

export const NOVA_KNOWLEDGE: NovaKnowledge;
export function getKnowledgeSummaryForPrompt(): string;
