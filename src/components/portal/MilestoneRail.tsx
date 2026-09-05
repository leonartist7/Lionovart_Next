"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Milestone } from "@/lib/portal/types";
import { formatDate } from "@/lib/portal/format";
import { cn } from "@/lib/utils";

const NEXT_STATUS: Record<Milestone["status"], Milestone["status"]> = {
  pending: "active",
  active: "done",
  done: "pending",
};

const STATUS_LABEL: Record<Milestone["status"], string> = {
  pending: "Upcoming",
  active: "In progress",
  done: "Complete",
};

/**
 * The visual spine of "where are we". A vertical rail rather than a horizontal
 * stepper: milestone titles are real sentences, and a horizontal stepper either
 * truncates them or falls apart on a phone.
 *
 * `editable` turns each node into a control that cycles status — the single
 * action that moves a project's progress, so it's one tap rather than a form.
 * The client gets the identical rail with no controls; because the page decides
 * server-side, none of the editing markup reaches their browser.
 */
export function MilestoneRail({
  milestones,
  editable = false,
  workspaceSlug,
  projectId,
  demo = false,
}: {
  milestones: Milestone[];
  editable?: boolean;
  workspaceSlug?: string;
  projectId?: string;
  /** Design preview: show the controls, but never call the API. */
  demo?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const base = `/api/portal/${workspaceSlug}/projects/${projectId}/milestones`;

  /** True when the action was swallowed because this is the design preview. */
  function blockedByDemo() {
    if (!demo) return false;
    toast.add({
      title: "Preview only",
      description: "This is sample data — changes aren't saved.",
    });
    return true;
  }

  async function cycleStatus(m: Milestone) {
    if (blockedByDemo()) return;
    setBusy(m.id);
    const res = await fetch(`${base}/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: NEXT_STATUS[m.status] }),
    });
    setBusy(null);
    if (!res.ok) return toast.add({ title: "Couldn't update that milestone" });
    router.refresh();
  }

  async function remove(m: Milestone) {
    if (blockedByDemo()) return;
    setBusy(m.id);
    const res = await fetch(`${base}/${m.id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) return toast.add({ title: "Couldn't delete that milestone" });
    toast.add({ title: "Milestone deleted", description: m.title });
    router.refresh();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (blockedByDemo()) return;
    setBusy("add");
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setBusy(null);
    if (!res.ok) return toast.add({ title: "Couldn't add that milestone" });
    setTitle("");
    router.refresh();
  }

  if (milestones.length === 0 && !editable) {
    return (
      <p className="text-muted-foreground text-sm">
        No milestones yet. The studio will lay out the plan here.
      </p>
    );
  }

  return (
    <>
      <ol className="relative">
        {milestones.map((m, i) => {
          const last = i === milestones.length - 1;
          const node = (
            <>
              {/* Connector, drawn behind the node and stopped at the last item. */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-6 left-[11px] h-[calc(100%-1.5rem)] w-px",
                    m.status === "done" ? "bg-primary/40" : "bg-border",
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative z-10 mt-0.5 grid size-[23px] shrink-0 place-items-center rounded-full border-2 transition-colors duration-150",
                  m.status === "done" && "border-primary bg-primary text-primary-foreground",
                  m.status === "active" && "border-primary bg-card",
                  m.status === "pending" && "border-border bg-card",
                )}
              >
                {m.status === "done" && <Check size={12} strokeWidth={3} />}
                {m.status === "active" && <span className="bg-primary size-2 rounded-full" />}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm leading-snug",
                    m.status === "done" ? "text-muted-foreground" : "text-foreground font-medium",
                  )}
                >
                  {m.title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {STATUS_LABEL[m.status]}
                  {m.dueAt ? ` · ${formatDate(m.dueAt)}` : ""}
                </p>
              </div>
            </>
          );

          return (
            <li key={m.id} className="relative flex items-start gap-1 pb-6 last:pb-0">
              {editable ? (
                <>
                  <button
                    type="button"
                    onClick={() => cycleStatus(m)}
                    disabled={busy === m.id}
                    aria-label={`${m.title} — ${STATUS_LABEL[m.status]}. Change status.`}
                    className={cn(
                      "hover:bg-muted/60 -mx-2 flex min-w-0 flex-1 items-start gap-4 rounded-lg px-2 py-1 text-left",
                      "transition-colors duration-150 disabled:opacity-50",
                      "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
                    )}
                  >
                    {node}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    disabled={busy === m.id}
                    aria-label={`Delete milestone ${m.title}`}
                    className={cn(
                      "text-muted-foreground/60 hover:text-destructive mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                      "transition-colors duration-150 disabled:opacity-50",
                      "focus-visible:ring-destructive/40 focus-visible:ring-3 focus-visible:outline-none",
                    )}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </>
              ) : (
                <div className="flex min-w-0 flex-1 items-start gap-4">{node}</div>
              )}
            </li>
          );
        })}
      </ol>

      {editable && (
        <form onSubmit={add} className={cn("flex gap-2", milestones.length > 0 && "mt-5")}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a milestone…"
            aria-label="New milestone title"
          />
          <Button type="submit" size="lg" disabled={busy === "add" || !title.trim()}>
            <Plus size={15} aria-hidden="true" />
            Add
          </Button>
        </form>
      )}
    </>
  );
}
