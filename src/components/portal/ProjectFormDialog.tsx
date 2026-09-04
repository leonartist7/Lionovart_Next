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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { ProjectKind } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

const KINDS: { value: ProjectKind; label: string }[] = [
  { value: "brand", label: "Brand" },
  { value: "web", label: "Web" },
  { value: "content", label: "Content" },
  { value: "marketing", label: "Marketing" },
];

/**
 * Agency-side project creation, rendered inline in the client's own workspace
 * so Leon authors from exactly the view the client sees.
 */
export function ProjectFormDialog({ workspaceSlug }: { workspaceSlug: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ProjectKind>("brand");
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch(`/api/portal/${workspaceSlug}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, kind, dueAt: dueAt || undefined }),
    });
    setSaving(false);

    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Couldn't create the project.");
      return;
    }

    setName("");
    setDueAt("");
    setOpen(false);
    toast.add({ title: "Project created", description: name });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          "border-border text-muted-foreground hover:text-foreground hover:border-primary/40 flex min-h-[7rem] w-full items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-sm font-medium",
          "transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.99]",
          "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
        )}
      >
        <Plus size={16} aria-hidden="true" />
        Add a project
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Brand identity system"
              required
              autoFocus
            />
          </Field>

          <Field>
            <FieldLabel>Type</FieldLabel>
            <Select value={kind} onValueChange={(v) => setKind(v as ProjectKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Target date</FieldLabel>
            <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </Field>

          {/* A server-side failure, not field validation — Base UI's FieldError
              only renders for its own validity state. */}
          {error && (
            <p role="alert" className="text-destructive text-sm leading-relaxed">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" size="lg" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={saving || !name.trim()}>
              {saving ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
