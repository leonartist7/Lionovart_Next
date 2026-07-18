import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { EmptyState } from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

interface ConversationDoc {
  id: string;
  started_at?: FirebaseFirestore.Timestamp;
  contact?: { name?: string; phone?: string; email?: string } | null;
  transcript?: Array<{ role: string; text: string }>;
  duration_ms?: number | null;
  source?: string;
}

function formatDuration(ms?: number | null): string {
  if (!ms || ms < 0) return "—";
  const totalSec = Math.round(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(ts?: FirebaseFirestore.Timestamp): string {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ConversationsPage() {
  if (!adminDb) {
    return (
      <div>
        <PageHeader />
        <EmptyState icon={MessageSquare} label="Firestore not configured" hint="Set FIREBASE_* env vars to load conversations." />
      </div>
    );
  }

  const snap = await adminDb.collection("conversations").orderBy("started_at", "desc").limit(50).get();
  const conversations: ConversationDoc[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ConversationDoc);

  return (
    <div>
      <PageHeader />
      {conversations.length === 0 ? (
        <EmptyState icon={MessageSquare} label="No conversations yet" hint="Voice and chat sessions will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-[11px] text-white/40 uppercase">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Messages</th>
                <th className="px-4 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/conversations/${c.id}`} className="text-white hover:underline">
                      {formatDate(c.started_at)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {c.contact?.name || c.contact?.phone || c.contact?.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/40">{formatDuration(c.duration_ms)}</td>
                  <td className="px-4 py-3 text-white/40">{c.transcript?.length ?? 0}</td>
                  <td className="px-4 py-3 text-white/40">{c.source || "—"}</td>
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
    <h1 className="mb-6 font-[var(--font-clash)] text-xl tracking-[0.15em] text-white uppercase">
      Conversations
    </h1>
  );
}
