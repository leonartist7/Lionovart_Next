"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Dossier } from "@/lib/dossier";

interface DossierPanelProps {
  leadId: string;
  leadName: string;
  initialDossier: Dossier | null;
  initialMarkdown: string | null;
}

/** Renders the lead dossier — generates on demand, downloads Obsidian-ready markdown. */
export function DossierPanel({ leadId, leadName, initialDossier, initialMarkdown }: DossierPanelProps) {
  const [dossier, setDossier] = useState(initialDossier);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed");
        return;
      }
      setDossier(data.dossier);
      setMarkdown(data.markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadMd() {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${leadName.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "lead"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!dossier) {
    return (
      <div className="rounded-lg border border-white/8 bg-white/[0.02] p-4">
        <p className="mb-3 text-sm text-white/50">No dossier generated yet.</p>
        <Button size="sm" onClick={generate} disabled={loading}>
          {loading ? "Generating…" : "Generate dossier"}
        </Button>
        {error && <p className="mt-2 text-xs text-[var(--color-brand-red)]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/6 px-2.5 py-0.5 text-xs font-medium text-white/80 tabular-nums">
          {dossier.qualification_score}/100
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadMd} disabled={!markdown}>
            Download .md
          </Button>
          <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
            {loading ? "Regenerating…" : "Regenerate"}
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Persona</p>
        <p className="text-sm text-white/70">
          {dossier.persona.tone} · {dossier.persona.decision_style} · {dossier.persona.communication_prefs}
        </p>
      </div>

      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Business snapshot</p>
        <p className="text-sm text-white/70">{dossier.business_snapshot}</p>
      </div>

      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Pains, ranked</p>
        <ol className="list-decimal space-y-0.5 pl-4 text-sm text-white/70">
          {dossier.pains_ranked.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      </div>

      {dossier.objections_raised_and_state.length > 0 && (
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Objections</p>
          <ul className="list-disc space-y-0.5 pl-4 text-sm text-white/70">
            {dossier.objections_raised_and_state.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Recommended next action</p>
        <p className="text-sm text-white/70">{dossier.recommended_next_action}</p>
      </div>

      <div className="rounded-lg bg-white/[0.02] p-3">
        <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Draft follow-up</p>
        <p className="text-sm text-white/60 italic">{dossier.draft_follow_up_message}</p>
      </div>

      {dossier.whats_changed_since_last_time && (
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">What&apos;s changed</p>
          <p className="text-sm text-white/70">{dossier.whats_changed_since_last_time}</p>
        </div>
      )}

      {error && <p className="text-xs text-[var(--color-brand-red)]">{error}</p>}
    </div>
  );
}
