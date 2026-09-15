import { adminDb } from "@/lib/firebase-admin";
import { getWhatsAppAppearance } from "@/lib/whatsapp-appearance";
import { parseStoredIntelligence } from "@/lib/whatsapp-intelligence";
import type { AutomationMode, LeadStage } from "@/lib/whatsapp-intelligence-shared";
import { WhatsAppWorkspace, type InboxConversation } from "@/components/admin/WhatsAppWorkspace";

export const dynamic = "force-dynamic";

type WhatsAppConversation = {
  id: string;
  contact?: { name?: string; phone?: string };
  transcript?: Array<{ role?: string; text?: string }>;
  last_message_at?: FirebaseFirestore.Timestamp;
  last_inbound_at?: FirebaseFirestore.Timestamp;
  follow_up_at?: FirebaseFirestore.Timestamp;
  intelligence_analyzed_at?: FirebaseFirestore.Timestamp;
  intelligence?: unknown;
  lead_stage?: LeadStage;
  automation_mode?: AutomationMode;
  admin_notes?: string;
};

function isServiceWindowOpen(lastInboundAt?: FirebaseFirestore.Timestamp) {
  const date = lastInboundAt?.toDate?.();
  return Boolean(date && Date.now() - date.getTime() < 24 * 60 * 60 * 1000);
}

export default async function WhatsAppPage() {
  const connectionReady = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_VERIFY_TOKEN &&
      process.env.WHATSAPP_APP_SECRET,
  );
  if (!adminDb) {
    return (
      <WhatsAppWorkspace
        conversations={[]}
        initialAppearance={getWhatsAppAppearance(null)}
        canPersistAppearance={false}
        connectionReady={connectionReady}
      />
    );
  }

  const [conversationSnapshot, appearanceSnapshot] = await Promise.all([
    adminDb.collection("conversations").where("source", "==", "whatsapp").limit(100).get(),
    adminDb.collection("console_settings").doc("whatsapp_appearance").get(),
  ]);

  const conversations = conversationSnapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }) as WhatsAppConversation)
    .sort((a, b) => (b.last_message_at?.toMillis?.() ?? 0) - (a.last_message_at?.toMillis?.() ?? 0))
    .map<InboxConversation>((conversation) => ({
      id: conversation.id,
      name: conversation.contact?.name || conversation.contact?.phone || "WhatsApp contact",
      phone: conversation.contact?.phone || conversation.id.replace(/^wa_/, ""),
      messages: (conversation.transcript ?? []).map((entry) => ({
        role: entry.role === "user" ? "user" : "agent",
        text: entry.text || "Unsupported message type",
      })),
      lastMessageAt: conversation.last_message_at?.toDate?.().toISOString(),
      replyWindowOpen: isServiceWindowOpen(conversation.last_inbound_at),
      followUpAt: conversation.follow_up_at?.toDate?.().toISOString(),
      intelligenceAnalyzedAt: conversation.intelligence_analyzed_at?.toDate?.().toISOString(),
      intelligence: parseStoredIntelligence(conversation.intelligence),
      leadStage: conversation.lead_stage || "new",
      automationMode: conversation.automation_mode || "human",
      notes: conversation.admin_notes || "",
    }));

  return (
    <WhatsAppWorkspace
      conversations={conversations}
      initialAppearance={getWhatsAppAppearance(appearanceSnapshot.data())}
      canPersistAppearance
      connectionReady={connectionReady}
    />
  );
}
