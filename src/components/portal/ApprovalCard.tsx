"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Image as ImageIcon, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { relativeDate } from "@/lib/portal/format";
import { cn } from "@/lib/utils";

export interface ApprovalCardData {
  id: string;
  targetType: "asset" | "post" | "milestone";
  targetLabel: string;
  contextLabel?: string;
  requestedAt: string;
}

const TARGET_ICON = {
  asset: ImageIcon,
  post: Megaphone,
  milestone: CheckCircle2,
} as const;

/**
 * One row in the "what needs me" queue. Approve is a single tap — no dialog,
 * committed on pointer-down so it never feels like it's waiting for a click
 * to land. Request changes opens an inline composer instead: a rejection
 * with no reason costs a round trip, so the form can't submit without one.
 */
export function ApprovalCard({
  approval,
  workspaceSlug,
  canDecide,
  demo = false,
}: {
  approval: ApprovalCardData;
  workspaceSlug: string;
  canDecide: boolean;
  demo?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [composerOpen, setComposerOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const Icon = TARGET_ICON[approval.targetType];
  const base = `/api/portal/${workspaceSlug}/approvals/${approval.id}`;

  function blockedByDemo() {
    if (!demo) return false;
    toast.add({
      title: "Preview only",
      description: "This is sample data — decisions aren't saved.",
    });
    return true;
  }

  async function decide(state: "approved" | "changes_requested", decisionNote?: string) {
    if (blockedByDemo()) return;
    setBusy(true);
    const res = await fetch(base, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, note: decisionNote }),
    });
    setBusy(false);
    if (!res.ok) return toast.add({ title: "Couldn't record that decision" });
    toast.add({
      title: state === "approved" ? "Approved" : "Changes requested",
      description: approval.targetLabel,
    });
    router.refresh();
  }

  return (
    <li className="border-border bg-card rounded-2xl border p-5">
      <div className="flex items-start gap-3">
        <span className="bg-muted text-muted-foreground mt-0.5 grid size-9 shrink-0 place-items-center rounded-full">
          <Icon size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">{approval.targetLabel}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {approval.contextLabel ? `${approval.contextLabel} · ` : ""}
            requested {relativeDate(approval.requestedAt)}
          </p>
        </div>
      </div>

      {canDecide && (
        <div className="mt-4">
          {composerOpen ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What needs to change?"
                aria-label={`Reason for requesting changes on ${approval.targetLabel}`}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setComposerOpen(false);
                    setNote("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={busy || !note.trim()}
                  onClick={() => decide("changes_requested", note)}
                >
                  Send
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                size="lg"
                disabled={busy}
                // Commit on pointer-down so it never feels like it's waiting
                // for the click to resolve; onKeyDown keeps it reachable
                // without a pointer at all.
                onPointerDown={() => decide("approved")}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    decide("approved");
                  }
                }}
                className={cn("flex-1", "active:scale-[0.985]")}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={busy}
                onClick={() => setComposerOpen(true)}
                className="flex-1"
              >
                Request changes
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
