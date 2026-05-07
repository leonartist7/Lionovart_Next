import "server-only";

interface LeadSummary {
  name?: string;
  phone?: string;
  email?: string;
  niche?: string;
  vision?: string;
}

export async function notifyLeadCaptured(lead: LeadSummary, conversationId: string | null) {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackUrl) {
    console.warn("[nova] SLACK_WEBHOOK_URL unset — skipping notification");
    return;
  }

  const lines = [
    "*New NOVA lead captured*",
    lead.name && `*Name:* ${lead.name}`,
    lead.niche && `*Niche:* ${lead.niche}`,
    lead.vision && `*Vision:* ${lead.vision}`,
    lead.phone && `*Phone:* ${lead.phone}`,
    lead.email && `*Email:* ${lead.email}`,
    conversationId && `*Conversation ID:* \`${conversationId}\``,
  ].filter(Boolean);

  try {
    await fetch(slackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n") }),
    });
  } catch (e) {
    console.error("[nova] Slack notify failed", e);
  }
}
