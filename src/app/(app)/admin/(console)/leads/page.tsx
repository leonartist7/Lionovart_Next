import Link from "next/link";
import { Users } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { EmptyState } from "@/components/admin/EmptyState";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import type { LeadStatus } from "@/components/admin/StatusPill";

export const dynamic = "force-dynamic";

interface LeadDoc {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  contact?: string;
  business_type?: string;
  niche?: string;
  source?: string;
  status?: LeadStatus;
  updated_at?: string;
}

const STATUSES: LeadStatus[] = ["new", "contacted", "booked", "won", "lost"];

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const ms = Date.now() - Date.parse(iso);
  if (Number.isNaN(ms)) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string }>;
}) {
  const { status: statusFilter, source: sourceFilter } = await searchParams;

  if (!adminDb) {
    return (
      <div>
        <PageHeader />
        <EmptyState icon={Users} label="Firestore not configured" hint="Set FIREBASE_* env vars to load leads." />
      </div>
    );
  }

  const snap = await adminDb.collection("leads").orderBy("updated_at", "desc").limit(100).get();
  let leads: LeadDoc[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LeadDoc);

  const sources = Array.from(new Set(leads.map((l) => l.source).filter(Boolean))) as string[];

  if (statusFilter) leads = leads.filter((l) => (l.status ?? "new") === statusFilter);
  if (sourceFilter) leads = leads.filter((l) => l.source === sourceFilter);

  return (
    <div>
      <PageHeader />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill label="All statuses" href="/admin/leads" active={!statusFilter} />
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            label={s}
            href={`/admin/leads?status=${s}${sourceFilter ? `&source=${sourceFilter}` : ""}`}
            active={statusFilter === s}
          />
        ))}
        {sources.length > 0 && (
          <>
            <span className="mx-1 text-white/15">|</span>
            <FilterPill
              label="All sources"
              href={statusFilter ? `/admin/leads?status=${statusFilter}` : "/admin/leads"}
              active={!sourceFilter}
            />
            {sources.map((s) => (
              <FilterPill
                key={s}
                label={s}
                href={`/admin/leads?source=${s}${statusFilter ? `&status=${statusFilter}` : ""}`}
                active={sourceFilter === s}
              />
            ))}
          </>
        )}
      </div>

      {leads.length === 0 ? (
        <EmptyState icon={Users} label="No leads yet" hint="Leads captured by Nova will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-[11px] text-white/40 uppercase">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="text-white hover:underline">
                      {lead.name || "Unnamed"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/60">{lead.phone || lead.email || lead.contact || "—"}</td>
                  <td className="px-4 py-3 text-white/60">{lead.business_type || lead.niche || "—"}</td>
                  <td className="px-4 py-3 text-white/40">{lead.source || "—"}</td>
                  <td className="px-4 py-3">
                    <LeadStatusSelect leadId={lead.id} status={lead.status ?? "new"} />
                  </td>
                  <td className="px-4 py-3 text-white/40">{relativeTime(lead.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <h1 className="mb-6 font-[var(--font-clash)] text-xl tracking-[0.15em] text-white uppercase">Leads</h1>
  );
}

function FilterPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
        active
          ? "border-white/20 bg-white/10 text-white"
          : "border-white/8 text-white/40 hover:text-white/70"
      }`}
    >
      {label}
    </Link>
  );
}
