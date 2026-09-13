"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Membership, Task, TaskColumn } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

type CommonProps = {
  workspaceSlug: string;
  projectId: string;
  members: Record<string, Membership>;
  /** Design preview: show the controls, but never call the API. */
  demo?: boolean;
};

type Props =
  | (CommonProps & {
      mode: "create";
      column: TaskColumn;
      onCreated: (task: Task) => void;
    })
  | (CommonProps & {
      mode: "edit";
      task: Task;
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSaved: (task: Task) => void;
      onDeleted: () => void;
    });

/**
 * One dialog, two modes — mirrors the "one component, editable prop" pattern
 * elsewhere in the portal rather than duplicating the form. Create renders
 * its own dashed-box trigger inline in a column; edit is externally
 * controlled by `KanbanBoard` (opened by tapping a card).
 */
export function TaskFormDialog(props: Props) {
  const toast = useToast();
  const isEdit = props.mode === "edit";
  const existing = isEdit ? props.task : undefined;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isEdit ? props.open : internalOpen;
  const setOpen = isEdit ? props.onOpenChange : setInternalOpen;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [dueAt, setDueAt] = useState(existing?.dueAt ?? "");
  const [assigneeUid, setAssigneeUid] = useState(existing?.assigneeUid ?? "");
  const [visibility, setVisibility] = useState<Task["visibility"]>(existing?.visibility ?? "client");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetToExisting() {
    setTitle(existing?.title ?? "");
    setDescription(existing?.description ?? "");
    setDueAt(existing?.dueAt ?? "");
    setAssigneeUid(existing?.assigneeUid ?? "");
    setVisibility(existing?.visibility ?? "client");
    setError(null);
  }

  function blockedByDemo() {
    if (!props.demo) return false;
    toast.add({ title: "Preview only", description: "This is sample data — changes aren't saved." });
    return true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (blockedByDemo()) return;
    setError(null);
    setSaving(true);

    const body = {
      title,
      description: description || undefined,
      dueAt: dueAt || undefined,
      assigneeUid: assigneeUid || undefined,
      visibility,
      ...(props.mode === "create" ? { column: props.column } : {}),
    };

    const url = isEdit
      ? `/api/portal/${props.workspaceSlug}/projects/${props.projectId}/tasks/${props.task.id}`
      : `/api/portal/${props.workspaceSlug}/projects/${props.projectId}/tasks`;

    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);

    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Couldn't save that task.");
      return;
    }

    const data = (await res.json()) as { task: Task };
    setOpen(false);
    if (isEdit) {
      props.onSaved(data.task);
    } else {
      props.onCreated(data.task);
      setTitle("");
      setDescription("");
      setDueAt("");
      setAssigneeUid("");
      setVisibility("client");
    }
  }

  async function remove() {
    if (!isEdit) return;
    if (blockedByDemo()) return;
    setSaving(true);
    const res = await fetch(
      `/api/portal/${props.workspaceSlug}/projects/${props.projectId}/tasks/${props.task.id}`,
      { method: "DELETE" },
    );
    setSaving(false);
    if (!res.ok) return toast.add({ title: "Couldn't delete that task" });
    setOpen(false);
    props.onDeleted();
  }

  const members = Object.entries(props.members);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetToExisting();
      }}
    >
      {!isEdit && (
        <DialogTrigger
          className={cn(
            "border-border text-muted-foreground hover:text-foreground hover:border-primary/40 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-xs font-medium",
            "transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.99]",
            "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
          )}
        >
          <Plus size={14} aria-hidden="true" />
          Add a task
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Draft the homepage hero"
              required
              autoFocus
            />
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional detail for the studio"
            />
          </Field>

          <Field>
            <FieldLabel>Due date</FieldLabel>
            <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </Field>

          <Field>
            <FieldLabel>Assignee</FieldLabel>
            <Select
              value={assigneeUid || "unassigned"}
              onValueChange={(v) => setAssigneeUid(!v || v === "unassigned" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members.map(([uid, member]) => (
                  <SelectItem key={uid} value={uid}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Visibility</FieldLabel>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as Task["visibility"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="internal">Internal only</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* A server-side failure, not field validation — Base UI's FieldError
              only renders for its own validity state. */}
          {error && (
            <p role="alert" className="text-destructive text-sm leading-relaxed">
              {error}
            </p>
          )}

          <DialogFooter>
            {isEdit && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="text-destructive hover:text-destructive sm:mr-auto"
                onClick={remove}
                disabled={saving}
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="ghost" size="lg" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={saving || !title.trim()}>
              {saving ? "Saving…" : isEdit ? "Save" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
