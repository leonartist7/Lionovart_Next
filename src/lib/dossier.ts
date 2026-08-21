import "server-only";
import { GoogleGenAI } from "@google/genai";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { scrapeWebsite } from "@/lib/scrape-website";

/**
 * Post-call Lead Dossier — the automated diagnosis pipeline. Turns a raw
 * transcript + lead record into a structured read Leon can act on before he
 * ever picks up the phone: persona, ranked pains, a qualification score with
 * its own rubric, a draft follow-up, and an Obsidian-ready markdown export.
 *
 * Regenerates on every new conversation with a returning contact, using the
 * previous dossier as context — this IS the persona-evolution loop.
 */

export interface Dossier {
  persona: { tone: string; decision_style: string; communication_prefs: string };
  business_snapshot: string;
  pains_ranked: string[];
  desires: string[];
  objections_raised_and_state: string[];
  qualification_score: number;
  qualification_rubric: string;
  recommended_next_action: string;
  draft_follow_up_message: string;
  research_gaps: string[];
  whats_changed_since_last_time?: string;
}

interface LeadDoc {
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
  website?: string;
  business_type?: string;
  niche?: string;
  project_summary?: string;
  current_marketing?: string;
  painpoints?: string;
  vision?: string;
  /** Flattened Brand Score read, when the lead arrived through a scan. Lets a
   * lead be qualified with no call at all — the scan is the evidence. */
  brand_briefing?: string;
}

interface ConversationDoc {
  transcript?: Array<{ role: string; text: string }>;
  objection_flags?: string[];
}

const DOSSIER_SCHEMA_HINT = `{
  "persona": { "tone": string, "decision_style": string, "communication_prefs": string },
  "business_snapshot": string,
  "pains_ranked": string[],
  "desires": string[],
  "objections_raised_and_state": string[],
  "qualification_score": number (0-100),
  "qualification_rubric": string (one sentence explaining the score),
  "recommended_next_action": string,
  "draft_follow_up_message": string (2-3 sentences, first person as Leon),
  "research_gaps": string[]
}`;

/** Generates (or regenerates) a dossier for a lead from a specific conversation. */
export async function generateDossier(leadId: string, conversationId: string | null): Promise<Dossier | null> {
  if (!adminDb) return null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const leadSnap = await adminDb.collection("leads").doc(leadId).get();
  if (!leadSnap.exists) return null;
  const lead = leadSnap.data() as LeadDoc;

  let conversation: ConversationDoc | null = null;
  if (conversationId) {
    const convSnap = await adminDb.collection("conversations").doc(conversationId).get();
    if (convSnap.exists) conversation = convSnap.data() as ConversationDoc;
  }
  const transcriptText = (conversation?.transcript ?? [])
    .map((e) => `${e.role === "user" ? "User" : "Nova"}: ${e.text}`)
    .join("\n")
    .slice(0, 12_000);

  // Best-effort live re-scrape — the in-memory scrape cache from the live
  // session isn't guaranteed to survive into this (possibly separate)
  // serverless invocation, so re-fetch directly rather than assume it's warm.
  let scrapeSummary = "";
  if (lead.website) {
    try {
      const scraped = await scrapeWebsite(lead.website);
      scrapeSummary = scraped.summary || "";
    } catch {
      // non-fatal — dossier proceeds without it
    }
  }

  // Persona evolution: feed the prior dossier as context for "what's changed".
  const prevSnap = await adminDb
    .collection("leads")
    .doc(leadId)
    .collection("dossiers")
    .orderBy("created_at", "desc")
    .limit(1)
    .get()
    .catch(() => null);
  const previous = prevSnap && !prevSnap.empty ? (prevSnap.docs[0].data() as Dossier) : null;

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_DOSSIER_MODEL || "gemini-3.1-pro";

  // A lead who only ran a Brand Score has no transcript. The dossier still has
  // to produce a real qualification off the scan alone — otherwise every
  // non-voice lead lands in the Console unscored.
  const evidenceSource = transcriptText
    ? "from a call his AI concierge Nova just had"
    : "from the Brand Score scan they ran on their own site — there was no call, so judge only from the scan and the lead record, and be explicit in research_gaps about what a conversation would still need to establish";

  const prompt = `You are producing a confidential lead-diagnosis briefing for Leon, founder of LIONOVART, ${evidenceSource}. Write for one founder briefing another — direct, no fluff, no corporate hedging.

LEAD RECORD:
${JSON.stringify(lead, null, 2)}

${lead.brand_briefing ? `BRAND SCORE SCAN OF THEIR SITE:\n${lead.brand_briefing}` : ""}

OBJECTIONS NOVA FLAGGED DURING THE CALL (raw types, judge resolution yourself from the transcript): ${JSON.stringify(conversation?.objection_flags ?? [])}

WEBSITE SCRAPE SUMMARY: ${scrapeSummary || "(not available)"}

${previous ? `PREVIOUS DOSSIER FROM THEIR LAST CONVERSATION:\n${JSON.stringify(previous, null, 2)}\n\nAlso fill "whats_changed_since_last_time" — one or two sentences on what's genuinely different this time.` : ""}

TRANSCRIPT:
${transcriptText || "(no transcript available)"}

Return ONLY valid JSON matching exactly this shape, nothing else:
${DOSSIER_SCHEMA_HINT}`;

  let raw: string;
  try {
    const result = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });
    raw = result.text ?? "";
  } catch (err) {
    console.error("[dossier] generateContent failed:", err);
    return null;
  }

  let parsed: Dossier;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("[dossier] JSON parse failed:", err, raw.slice(0, 500));
    return null;
  }

  return parsed;
}

/** Obsidian-ready markdown with YAML frontmatter + wikilinks. */
export function dossierToMarkdown(dossier: Dossier, lead: LeadDoc, leadId: string): string {
  const objectionLinks = dossier.objections_raised_and_state
    .map((o) => `[[objections/${o.split(/[\s—-]/)[0].toLowerCase()}]]`)
    .join(", ");

  return `---
type: lead
lead_id: ${leadId}
name: "${lead.name || "Unknown"}"
business: "${lead.business_type || ""}"
niche: "${lead.niche || ""}"
qualification_score: ${dossier.qualification_score}
generated_at: ${new Date().toISOString()}
---

# ${lead.name || "Unnamed lead"} — ${lead.business_type || "Unknown business"}

## Persona
- **Tone:** ${dossier.persona.tone}
- **Decision style:** ${dossier.persona.decision_style}
- **Communication preferences:** ${dossier.persona.communication_prefs}

## Business snapshot
${dossier.business_snapshot}

## Pains (ranked)
${dossier.pains_ranked.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## Desires
${dossier.desires.map((d) => `- ${d}`).join("\n")}

## Objections raised
${dossier.objections_raised_and_state.map((o) => `- ${o}`).join("\n")}
${objectionLinks ? `\nRelated: ${objectionLinks}` : ""}

## Qualification: ${dossier.qualification_score}/100
${dossier.qualification_rubric}

## Recommended next action
${dossier.recommended_next_action}

## Draft follow-up
> ${dossier.draft_follow_up_message}

## Research gaps
${dossier.research_gaps.length ? dossier.research_gaps.map((g) => `- ${g}`).join("\n") : "- None"}

${dossier.whats_changed_since_last_time ? `## What's changed since last time\n${dossier.whats_changed_since_last_time}\n` : ""}
Related: [[services]]
`;
}

/** Persists a dossier to leads/{id}/dossiers and returns the new doc id. */
export async function saveDossier(leadId: string, dossier: Dossier, markdown: string): Promise<string | null> {
  if (!adminDb) return null;
  const ref = await adminDb
    .collection("leads")
    .doc(leadId)
    .collection("dossiers")
    .add({
      ...dossier,
      dossier_markdown: markdown,
      created_at: FieldValue.serverTimestamp(),
    });
  return ref.id;
}
