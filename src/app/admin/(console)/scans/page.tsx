import Link from "next/link";
import { Gauge } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { EmptyState } from "@/components/admin/EmptyState";

/**
 * Top of the funnel. Every Brand Score run is here, claimed or not — the
 * unclaimed rows are the part that was previously invisible: real businesses
 * that showed enough intent to scan themselves and then walked.
 */

export const dynamic = "force-dynamic";

interface ScanRow {
  id: string;
  business_name?: string;
  url?: string;
  overall?: number;
  claimed?: boolean;
  email?: string;
  lead_id?: string | null;
  degraded?: boolean;
  biggest_leak?: { title?: string };
  created_at_iso?: string;
}

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

export default async function ScansPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  if (!adminDb) {
    return (
      <div>
        <Header />
        <EmptyState icon={Gauge} label="Firestore not configured" hint="Set FIREBASE_* env vars to load scans." />
      </div>
    );
  }

  const snap = await adminDb.collection("brand_scans").orderBy("created_at", "desc").limit(100).get();
  let scans: ScanRow[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ScanRow);

  const totalCount = scans.length;
  const claimedCount = scans.filter((s) => s.claimed).length;

  if (filter === "claimed") scans = scans.filter((s) => s.claimed);
  if (filter === "abandoned") scans = scans.filter((s) => !s.claimed);

  return (
    <div>
      <Header />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Pill label={`All (${totalCount})`} href="/admin/scans" active={!filter} />
        <Pill label={`Claimed (${claimedCount})`} href="/admin/scans?filter=claimed" active={filter === "claimed"} />
        <Pill
          label={`Abandoned (${totalCount - claimedCount})`}
          href="/admin/scans?filter=abandoned"
          active={filter === "abandoned"}
        />
        {totalCount > 0 && (
          <span className="ml-auto text-xs text-white/35">
            {Math.round((claimedCount / totalCount) * 100)}% hand over an email
          </span>
        )}
      </div>

      {scans.length === 0 ? (
        <EmptyState icon={Gauge} label="No scans yet" hint="Brand Score runs from the hero will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-[11px] text-white/40 uppercase">
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Biggest leak</th>
                <th className="px-4 py-3 font-medium">Claimed</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => {
                const score = s.overall ?? 0;
                const color = score < 50 ? "text-brand-red" : score < 75 ? "text-amber-400" : "text-emerald-400";
                return (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link href={`/portal/${s.id}`} target="_blank" className="text-white hover:underline">
                        {s.business_name || "Unknown"}
                      </Link>
                      {s.degraded && (
                        <span className="ml-2 text-[10px] text-white/25" title="Scored from page signals only — the model pass didn't run">
                          heuristic
                        </span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-white/50" title={s.url}>
                      {s.url?.replace(/^https?:\/\/(www\.)?/, "") || "—"}
                    </td>
                    <td className={`px-4 py-3 tabular-nums ${color}`}>{s.overall ?? "—"}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-white/50" title={s.biggest_leak?.title}>
                      {s.biggest_leak?.title || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {s.claimed && s.lead_id ? (
                        <Link href={`/admin/leads/${s.lead_id}`} className="text-emerald-400 hover:underline">
                          {s.email}
                        </Link>
                      ) : (
                        <span className="text-white/25">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40">{relativeTime(s.created_at_iso)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <h1 className="mb-6 font-[var(--font-clash)] text-xl tracking-[0.15em] text-white uppercase">Brand scans</h1>
  );
}

function Pill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active ? "border-white/20 bg-white/10 text-white" : "border-white/8 text-white/40 hover:text-white/70"
      }`}
    >
      {label}
    </Link>
  );
}
