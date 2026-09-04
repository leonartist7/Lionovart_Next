import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { EmptyState } from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
}

function isSystemLine(text: string): boolean {
  return /^\[(CONTEXT|SCRAPE_RESULT)\]/.test(text);
}

export default async function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!adminDb) {
    return <EmptyState icon={MessageSquare} label="Firestore not configured" />;
  }

  const doc = await adminDb.collection("conversations").doc(id).get();
  if (!doc.exists) notFound();
  const data = doc.data() as { transcript?: TranscriptEntry[]; summary?: string };
  const transcript = data.transcript ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[var(--font-clash)] text-xl tracking-[0.15em] text-white uppercase">
          Conversation
        </h1>
        <Link href="/admin/conversations" className="text-xs text-white/40 hover:text-white">
          ← Back to conversations
        </Link>
      </div>

      {data.summary && (
        <div className="mb-6 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/70">
          {data.summary}
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-white/8 bg-white/[0.02] p-5">
        {transcript.length === 0 ? (
          <EmptyState icon={MessageSquare} label="Empty transcript" />
        ) : (
          transcript.map((entry, i) =>
            isSystemLine(entry.text) ? (
              <p key={i} className="text-xs text-white/25 italic">
                {entry.text}
              </p>
            ) : (
              <div key={i} className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-xl px-3.5 py-2 text-sm ${
                    entry.role === "user"
                      ? "bg-white/6 text-white/90"
                      : "bg-[var(--color-brand-red)]/8 text-white/90"
                  }`}
                >
                  {entry.text}
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}
