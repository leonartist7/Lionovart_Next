"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Approval } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

export interface RequestApprovalTarget {
  id: string;
  /** Asset filename, or "milestone title — project name" for a milestone. */
  label: string;
}

/**
 * Agency-side "request approval". Lives on the Approvals page itself rather
 * than on the Assets or Projects pages, so this build stays inside its own
 * surface instead of touching pages another chat owns.
 */
export function RequestApprovalDialog({
  workspaceSlug,
  assets,
  milestones,
}: {
  workspaceSlug: string;
  assets: RequestApprovalTarget[];
  milestones: RequestApprovalTarget[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [targetType, setTargetType] = useState<"asset" | "milestone">("asset");
  const [targetId, setTargetId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = targetType === "asset" ? assets : milestones;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetId) return;
    setError(null);
    setSaving(true);

    const res = await fetch(`/api/portal/${workspaceSlug}/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId }),
    });
    setSaving(false);

    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Couldn't request that approval.");
      return;
    }

    setTargetId("");
    setOpen(false);
    toast.add({ title: "Approval requested" });
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setTargetId("");
          setError(null);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "border-border text-muted-foreground hover:text-foreground hover:border-primary/40 mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-sm font-medium",
          "transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.99]",
          "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
        )}
      >
        <Plus size={15} aria-hidden="true" />
        Request approval
      </button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request approval</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Target type</FieldLabel>
            <Select
              value={targetType}
              onValueChange={(v) => {
                setTargetType(v as Approval["targetType"] & ("asset" | "milestone"));
                setTargetId("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">A file</SelectItem>
                <SelectItem value="milestone">A milestone</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>{targetType === "asset" ? "File" : "Milestone"}</FieldLabel>
            <Select value={targetId} onValueChange={(v) => setTargetId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Choose one" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {error && (
            <p role="alert" className="text-destructive text-sm leading-relaxed">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" size="lg" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={saving || !targetId}>
              {saving ? "Requesting…" : "Request approval"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
