import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { EmptyState } from "@/components/admin/EmptyState";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { DossierPanel } from "@/components/admin/DossierPanel";
import type { LeadStatus } from "@/components/admin/StatusPill";
import type { Dossier } from "@/lib/dossier";

export const dynamic = "force-dynamic";

interface LeadDetail {
  name?: string;
  phone?: string;
  email?: string;
  contact?: string;
  business_type?: string;
  niche?: string;
  source?: string;
  status?: LeadStatus;
  score?: number;
  project_summary?: string;
  painpoints?: string;
  vision?: string;
  current_marketing?: string;
  conversation_id?: string;
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-1 text-[11px] tracking-wide text-white/35 uppercase">{label}</dt>
      <dd className="rounded-lg border border-white/8 bg-white/[0.02] p-3 text-sm text-white/80">{value}</dd>
    </div>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!adminDb) {
    return <EmptyState icon={MessageSquare} label="Firestore not configured" />;
  }

  const doc = await adminDb.collection("leads").doc(id).get();
  if (!doc.exists) notFound();
  const lead = doc.data() as LeadDetail;

  const contact = lead.phone || lead.email || lead.contact;
  const dossierSnap = await adminDb
    .collection("leads")
    .doc(id)
    .collection("dossiers")
    .orderBy("created_at", "desc")
    .limit(1)
    .get()
    .catch(() => null);
  const latestDossierDoc = dossierSnap && !dossierSnap.empty ? dossierSnap.docs[0].data() : null;
  const initialDossier = latestDossierDoc ? (latestDossierDoc as Dossier) : null;
  const initialMarkdown = (latestDossierDoc?.dossier_markdown as string | undefined) ?? null;

  let conversations: Array<{ id: string; started_at?: string }> = [];
  try {
    const byId = lead.conversation_id
      ? await adminDb.collection("conversations").doc(lead.conversation_id).get()
      : null;
    if (byId?.exists) conversations.push({ id: byId.id });

    if (contact) {
      const byContact = await adminDb
        .collection("conversations")
        .where("contact.phone", "==", lead.phone || "___")
        .limit(5)
        .get()
        .catch(() => null);
      if (byContact) {
        for (const d of byContact.docs) {
          if (!conversations.find((c) => c.id === d.id)) conversations.push({ id: d.id });
        }
      }
    }
  } catch {
    conversations = conversations;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[var(--font-clash)] text-xl tracking-[0.15em] text-white uppercase">
          {lead.name || "Unnamed lead"}
        </h1>
        <Link href="/admin/leads" className="text-xs text-white/40 hover:text-white">
          ← Back to leads
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Phone" value={lead.phone} />
            <Field label="Email" value={lead.email} />
            <Field label="Business" value={lead.business_type} />
            <Field label="Niche" value={lead.niche} />
            <Field label="Source" value={lead.source} />
          </dl>
          <Field label="Project summary" value={lead.project_summary} />
          <Field label="Pain points" value={lead.painpoints} />
          <Field label="Vision" value={lead.vision} />
          <Field label="Current marketing" value={lead.current_marketing} />

          <div>
            <dt className="mb-1 text-[11px] tracking-wide text-white/35 uppercase">Lead dossier</dt>
            <DossierPanel
              leadId={id}
              leadName={lead.name || "lead"}
              initialDossier={initialDossier}
              initialMarkdown={initialMarkdown}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <LeadStatusSelect leadId={id} status={lead.status ?? "new"} />
            {lead.phone && (
              <a
                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block rounded-md border border-white/10 px-3 py-2 text-center text-xs text-white/70 hover:bg-white/5"
              >
                Open WhatsApp
              </a>
            )}
            {lead.email && (
              <p className="mt-2 truncate text-xs text-white/40" title={lead.email}>
                {lead.email}
              </p>
            )}
          </div>

          {conversations.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <p className="mb-2 text-[11px] tracking-wide text-white/35 uppercase">Conversations</p>
              <div className="space-y-1">
                {conversations.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/conversations/${c.id}`}
                    className="block truncate text-xs text-white/60 hover:text-white"
                  >
                    {c.id}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
