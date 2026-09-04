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
    const created = l.created_at ? Date.parse(l.created_at) : NaN;
    return !Number.isNaN(created) && now - created < weekMs;
  }).length;
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
