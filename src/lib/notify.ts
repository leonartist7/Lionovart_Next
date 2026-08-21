import "server-only";

/**
 * Owner notifications — everything meaningful that happens in the funnel
 * lands on Leon's phone as a readable briefing, not a bare "new lead" ping.
 *
 * One event type, two transports: Slack gets the full text, WhatsApp gets a
 * length-capped version (CallMeBot delivers over a GET, so the whole message
 * rides in the query string).
 */

interface LeadSummary {
  name?: string;
  phone?: string;
  email?: string;
  niche?: string;
  vision?: string;
}

export type OwnerEvent =
  | { kind: "lead_captured"; lead: LeadSummary; conversationId?: string | null; leadUrl?: string }
  | {
      kind: "scan_claimed";
      businessName: string;
      url: string;
      overall: number;
      biggestLeak: string;
      email: string;
      name?: string;
      leadUrl?: string;
    }
  | {
      kind: "dossier_ready";
      leadName: string;
      score: number;
      rubric: string;
      topPains: string[];
      nextAction: string;
      leadUrl?: string;
    }
  | { kind: "meeting_booked"; leadName: string; email: string; whenLabel: string; leadUrl?: string };

// CallMeBot delivers the message inside a URL. Well under any practical query
// limit, and short enough to read on a lock screen without expanding.
const WHATSAPP_MAX_CHARS = 900;

function formatEvent(event: OwnerEvent): string {
  switch (event.kind) {
    case "lead_captured": {
      const { lead, conversationId, leadUrl } = event;
      return [
        "*New lead captured*",
        lead.name && `*Name:* ${lead.name}`,
        lead.niche && `*Niche:* ${lead.niche}`,
        lead.vision && `*Vision:* ${lead.vision}`,
        lead.phone && `*Phone:* ${lead.phone}`,
        lead.email && `*Email:* ${lead.email}`,
        conversationId && `*Conversation:* ${conversationId}`,
        leadUrl && leadUrl,
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "scan_claimed":
      return [
        `*Brand Score claimed — ${event.overall}/100*`,
        `*Business:* ${event.businessName}`,
        `*Site:* ${event.url}`,
        event.name && `*Name:* ${event.name}`,
        `*Email:* ${event.email}`,
        `*Biggest leak:* ${event.biggestLeak}`,
        event.leadUrl && event.leadUrl,
      ]
        .filter(Boolean)
        .join("\n");
    case "dossier_ready":
      return [
        `*Qualified: ${event.leadName} — ${event.score}/100*`,
        event.rubric,
        event.topPains.length ? `\n*Pains:*\n${event.topPains.slice(0, 3).map((p) => `• ${p}`).join("\n")}` : "",
        `\n*Do next:* ${event.nextAction}`,
        event.leadUrl && `\n${event.leadUrl}`,
      ]
        .filter(Boolean)
        .join("\n");
    case "meeting_booked":
      return [
        "*Meeting booked*",
        `*Who:* ${event.leadName} (${event.email})`,
        `*When:* ${event.whenLabel}`,
        event.leadUrl && event.leadUrl,
      ]
        .filter(Boolean)
        .join("\n");
  }
}

/** WhatsApp to the owner's own number via CallMeBot — free, no business
 * account. Message CallMeBot once from your phone to get an apikey, then set
 * CALLMEBOT_PHONE/CALLMEBOT_APIKEY. No-ops cleanly when unconfigured. */
async function sendWhatsApp(text: string) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) {
    console.warn("[notify] CALLMEBOT_PHONE/CALLMEBOT_APIKEY unset — skipping WhatsApp");
    return;
  }

  const body = text.length > WHATSAPP_MAX_CHARS ? `${text.slice(0, WHATSAPP_MAX_CHARS - 1)}…` : text;
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(body)}&apikey=${encodeURIComponent(apikey)}`;
    await fetch(url);
  } catch (e) {
    console.error("[notify] WhatsApp failed", e);
  }
}

async function sendSlack(text: string) {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackUrl) {
    console.warn("[notify] SLACK_WEBHOOK_URL unset — skipping Slack");
    return;
  }
  try {
    await fetch(slackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.error("[notify] Slack failed", e);
  }
}

export async function notifyOwner(event: OwnerEvent): Promise<void> {
  const text = formatEvent(event);
  await Promise.all([sendSlack(text), sendWhatsApp(text)]);
}

/** Back-compat wrapper for the existing call sites (Nova's save_lead_data and
 * the hero lead route). */
export async function notifyLeadCaptured(lead: LeadSummary, conversationId: string | null) {
  await notifyOwner({ kind: "lead_captured", lead, conversationId });
}
