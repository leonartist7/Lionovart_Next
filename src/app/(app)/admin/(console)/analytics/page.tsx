import { BarChart3 } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { EmptyState } from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

const POSTHOG_URL = "https://us.posthog.com";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <p className="text-[11px] tracking-wide text-white/35 uppercase">{label}</p>
      <p className="mt-1 font-[var(--font-clash)] text-2xl text-white">{value}</p>
    </div>
  );
}

function countThisWeek(leads: FirebaseFirestore.DocumentData[]): number {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return leads.filter((l) => {
    const created = timestampMs(l.created_at);
    return !Number.isNaN(created) && now - created < weekMs;
  }).length;
}

function timestampMs(value: unknown): number {
  if (typeof value === "string") return Date.parse(value);
  if (value && typeof value === "object" && "toMillis" in value && typeof (value as { toMillis?: unknown }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  return NaN;
}

function currentTimeMs(): number {
  return Date.now();
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 truncate text-white/60 capitalize">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-brand-red)]" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-white/40">{count}</span>
    </div>
  );
}

export default async function AnalyticsPage() {
  if (!adminDb) {
    return (
      <div>
        <PageHeader />
        <EmptyState icon={BarChart3} label="Firestore not configured" />
      </div>
    );
  }

  const [leadsSnap, convSnap] = await Promise.all([
    adminDb.collection("leads").limit(500).get(),
    adminDb.collection("conversations").limit(500).get(),
  ]);

  const leads = leadsSnap.docs.map((d) => d.data());
  const conversations = convSnap.docs.map((d) => d.data());

  const leadsThisWeek = countThisWeek(leads);

  const totalDuration = conversations.reduce((sum, c) => sum + (c.duration_ms || 0), 0);
  const withDuration = conversations.filter((c) => typeof c.duration_ms === "number").length;
  const avgDurationSec = withDuration > 0 ? Math.round(totalDuration / withDuration / 1000) : 0;

  const handoffLeads = leads.filter((l) => l.handoff_offered).length;
  const bookedLeads = leads.filter((l) => l.status === "booked" || l.status === "won").length;
  const handoffRate = conversations.length > 0 ? Math.round((handoffLeads / conversations.length) * 100) : 0;

  const bySource: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const l of leads) {
    const source = l.source || "unknown";
    bySource[source] = (bySource[source] || 0) + 1;
    const status = l.status || "new";
    byStatus[status] = (byStatus[status] || 0) + 1;
  }
  const maxSource = Math.max(1, ...Object.values(bySource));
  const maxStatus = Math.max(1, ...Object.values(byStatus));

  const whatsappConversations = conversations.filter((conversation) => conversation.source === "whatsapp");
  const analyzedWhatsApp = whatsappConversations.filter((conversation) => conversation.intelligence).length;
  const now = currentTimeMs();
  const openReplyWindows = whatsappConversations.filter((conversation) => {
    const lastInbound = timestampMs(conversation.last_inbound_at);
    return !Number.isNaN(lastInbound) && now - lastInbound < 24 * 60 * 60 * 1000;
  }).length;
  const qualificationScores = whatsappConversations.flatMap((conversation) =>
    typeof conversation.intelligence?.qualificationScore === "number" ? [conversation.intelligence.qualificationScore] : [],
  );
  const averageQualification = qualificationScores.length
    ? Math.round(qualificationScores.reduce((sum, score) => sum + score, 0) / qualificationScores.length)
    : 0;
  const followUpsDue = whatsappConversations.filter((conversation) => {
    const followUp = timestampMs(conversation.follow_up_at);
    return !Number.isNaN(followUp) && followUp <= now;
  }).length;
  const whatsappStages: Record<string, number> = {};
  for (const conversation of whatsappConversations) {
    const stage = conversation.lead_stage || "new";
    whatsappStages[stage] = (whatsappStages[stage] || 0) + 1;
  }
  const maxWhatsAppStage = Math.max(1, ...Object.values(whatsappStages));

  return (
    <div>
      <PageHeader />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Leads total" value={String(leads.length)} />
        <StatTile label="Leads this week" value={String(leadsThisWeek)} />
        <StatTile label="Conversations" value={String(conversations.length)} />
        <StatTile label="Avg duration" value={avgDurationSec ? `${Math.round(avgDurationSec / 60)}m ${avgDurationSec % 60}s` : "—"} />
        <StatTile label="Handoff rate" value={`${handoffRate}%`} />
        <StatTile label="Booked" value={String(bookedLeads)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
          <p className="mb-4 text-[11px] tracking-wide text-white/35 uppercase">Leads by source</p>
          <div className="space-y-3">
            {Object.entries(bySource).map(([source, count]) => (
              <BarRow key={source} label={source} count={count} max={maxSource} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
          <p className="mb-4 text-[11px] tracking-wide text-white/35 uppercase">Leads by status</p>
          <div className="space-y-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <BarRow key={status} label={status} count={count} max={maxStatus} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.035] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><p className="text-[11px] tracking-wide text-emerald-200/55 uppercase">WhatsApp intelligence</p><p className="mt-1 text-sm text-white/60">Live operational health for the Cloud API inbox.</p></div>
          <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[10px] text-emerald-100">{whatsappConversations.length} threads</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Analyzed" value={`${analyzedWhatsApp}/${whatsappConversations.length}`} />
          <StatTile label="Reply windows open" value={String(openReplyWindows)} />
          <StatTile label="Avg qualification" value={averageQualification ? `${averageQualification}/100` : "—"} />
          <StatTile label="Follow-ups due" value={String(followUpsDue)} />
        </div>
        {Object.keys(whatsappStages).length > 0 ? <div className="mt-5 space-y-3">{Object.entries(whatsappStages).map(([stage, count]) => <BarRow key={stage} label={stage} count={count} max={maxWhatsAppStage} />)}</div> : null}
      </div>

      <a
        href={POSTHOG_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 block rounded-xl border border-white/8 bg-white/[0.02] p-4 text-sm text-white/60 hover:text-white"
      >
        Open full funnel &amp; event analytics in PostHog →
      </a>
    </div>
  );
}

function PageHeader() {
  return (
    <h1 className="mb-6 font-[var(--font-clash)] text-xl tracking-[0.15em] text-white uppercase">
      Analytics
    </h1>
  );
}
