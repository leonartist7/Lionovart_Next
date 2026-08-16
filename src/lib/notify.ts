import "server-only";

interface LeadSummary {
  name?: string;
  phone?: string;
  email?: string;
  niche?: string;
  vision?: string;
}

/** Sends a WhatsApp message to the owner's own number via CallMeBot
 * (https://www.callmebot.com/blog/free-api-whatsapp-messages/). Free,
 * no business account needed — message CallMeBot's number once from your
 * phone to get an apikey, then set CALLMEBOT_PHONE/CALLMEBOT_APIKEY. */
async function sendWhatsAppNotification(text: string) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) {
    console.warn("[nova] CALLMEBOT_PHONE/CALLMEBOT_APIKEY unset — skipping WhatsApp notification");
    return;
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
    await fetch(url);
  } catch (e) {
    console.error("[nova] WhatsApp notify failed", e);
  }
}

export async function notifyLeadCaptured(lead: LeadSummary, conversationId: string | null) {
  const lines = [
    "*New NOVA lead captured*",
    lead.name && `*Name:* ${lead.name}`,
    lead.niche && `*Niche:* ${lead.niche}`,
    lead.vision && `*Vision:* ${lead.vision}`,
    lead.phone && `*Phone:* ${lead.phone}`,
    lead.email && `*Email:* ${lead.email}`,
    conversationId && `*Conversation ID:* \`${conversationId}\``,
  ].filter(Boolean);
  const text = lines.join("\n");

  await Promise.all([
    (async () => {
      const slackUrl = process.env.SLACK_WEBHOOK_URL;
      if (!slackUrl) {
        console.warn("[nova] SLACK_WEBHOOK_URL unset — skipping notification");
        return;
      }
      try {
        await fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      } catch (e) {
        console.error("[nova] Slack notify failed", e);
      }
    })(),
    sendWhatsAppNotification(text),
  ]);
}
