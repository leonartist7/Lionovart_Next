import fs from "node:fs";
import path from "node:path";
import { ShieldAlert } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { EmptyState } from "@/components/admin/EmptyState";
import { ObjectionSkillViewer } from "@/components/admin/ObjectionSkillViewer";

export const dynamic = "force-dynamic";

// Maps each flag_objection type (src/lib/strategist-config.ts tool enum) to
// its display label and the exact heading that opens its section in
// src/lib/nova-skills/objections.ts — read-only, never auto-written.
const OBJECTION_TYPES: { id: string; label: string; heading: string }[] = [
  { id: "price", label: "Price / cost", heading: '### "How much does it cost?"' },
  { id: "needs-time", label: "Needs time to think", heading: '### "I need to think about it"' },
  { id: "has-agency", label: "Already has an agency", heading: '### "I already have an agency"' },
  { id: "diy", label: "DIY / freelancer / AI tools", heading: '### "Can\'t I just hire a freelancer' },
  { id: "no-time", label: "No time right now", heading: '### "I don\'t have time for this right now"' },
  { id: "ai-trust", label: "AI trust / skepticism", heading: '### "Is this AI thing even reliable?"' },
  { id: "past-failure", label: "Past agency failure", heading: '### "We tried an agency before' },
  { id: "send-info", label: "\"Just send info\"", heading: '### "Just send me some info"' },
  { id: "too-small", label: "\"Too small / not ready\"", heading: '### "I\'m too small for this"' },
];

interface ConversationDoc {
  id: string;
  started_at?: FirebaseFirestore.Timestamp;
  contact?: { name?: string; phone?: string; email?: string } | null;
  transcript?: Array<{ role: string; text: string }>;
  objection_flags?: string[];
}

function excerptForType(transcript: ConversationDoc["transcript"]): string {
  // The transcript has no per-turn objection tag (flag_objection only marks
  // the conversation), so we surface the most recent user turn as the
  // best-effort excerpt — good enough to jog memory when reviewing patterns.
  if (!transcript?.length) return "";
  const userTurns = transcript.filter((t) => t.role === "user");
  return userTurns[userTurns.length - 1]?.text ?? "";
}

function readObjectionsSkillSource(): string {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), "src/lib/nova-skills/objections.ts"),
      "utf8",
    );
  } catch {
    return "";
  }
}

function extractSection(source: string, heading: string): string {
  const start = source.indexOf(heading);
  if (start === -1) return "(Section not found — objections.ts may have changed.)";
  const nextHeadingIdx = source.indexOf("\n### ", start + heading.length);
  return source.slice(start, nextHeadingIdx === -1 ? source.length : nextHeadingIdx).trim();
}

export default async function ObjectionsPage() {
  if (!adminDb) {
    return (
      <div>
        <PageHeader />
        <EmptyState icon={ShieldAlert} label="Firestore not configured" hint="Set FIREBASE_* env vars to load conversations." />
      </div>
    );
  }

  const snap = await adminDb.collection("conversations").orderBy("started_at", "desc").limit(200).get();
  const conversations: ConversationDoc[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ConversationDoc);
  const flagged = conversations.filter((c) => c.objection_flags && c.objection_flags.length > 0);

  const skillSource = readObjectionsSkillSource();

  const byType = OBJECTION_TYPES.map((t) => {
    const matches = flagged.filter((c) => c.objection_flags!.includes(t.id));
    const recent = matches.slice(0, 3).map((c) => ({
      conversationId: c.id,
      contact: c.contact?.name || c.contact?.phone || c.contact?.email || "—",
      excerpt: excerptForType(c.transcript),
    }));
    return { ...t, count: matches.length, recent, skillSection: extractSection(skillSource, t.heading) };
  }).sort((a, b) => b.count - a.count);

  const totalFlagged = flagged.length;

  return (
    <div>
      <PageHeader />
      {totalFlagged === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          label="No objections flagged yet"
          hint="Nova silently flags objection types via flag_objection during live conversations — they'll cluster here."
        />
      ) : (
        <div className="space-y-3">
          {byType.map((t) => (
            <div key={t.id} className="rounded-xl border border-white/8">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white/6 px-2.5 py-0.5 text-xs font-medium text-white/80 tabular-nums">
                    {t.count}
                  </span>
                  <span className="text-sm text-white/85">{t.label}</span>
                </div>
              </div>
              {t.count > 0 && (
                <div className="border-t border-white/5 px-4 py-3">
                  <div className="mb-3 space-y-2">
                    {t.recent.map((r) => (
                      <div key={r.conversationId} className="rounded-lg bg-white/[0.02] px-3 py-2">
                        <p className="mb-0.5 text-[11px] text-white/30">{r.contact}</p>
                        <p className="text-xs leading-relaxed text-white/60">
                          {r.excerpt || <span className="text-white/25">(no transcript excerpt)</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                  <ObjectionSkillViewer label={t.label} section={t.skillSection} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <h1 className="mb-6 font-[var(--font-clash)] text-xl tracking-[0.15em] text-white uppercase">Objections</h1>
  );
}
