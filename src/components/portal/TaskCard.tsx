"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/portal/format";
import type { Membership, Task } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

/**
 * Presentational only — every pointer and keyboard decision lives in
 * `KanbanBoard`, which is the one place that knows about every card, every
 * column, and the drag/keyboard state machine. This card just renders and
 * forwards native events.
 */
export function TaskCard({
  task,
  canEdit,
  dragging,
  offset,
  assignee,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
}: {
  task: Task;
  canEdit: boolean;
  dragging: boolean;
  offset: { x: number; y: number };
  assignee?: Membership;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onPointerCancel?: (e: React.PointerEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div
      id={`task-card-${task.id}`}
      data-task-id={task.id}
      tabIndex={canEdit ? 0 : -1}
      role={canEdit ? "button" : undefined}
      aria-label={
        canEdit
          ? `${task.title}. Press arrow keys to move between cards and columns.`
          : undefined
      }
      onPointerDown={canEdit ? onPointerDown : undefined}
      onPointerMove={canEdit ? onPointerMove : undefined}
      onPointerUp={canEdit ? onPointerUp : undefined}
      onPointerCancel={canEdit ? onPointerCancel : undefined}
      onKeyDown={canEdit ? onKeyDown : undefined}
      style={
        dragging
          ? { transform: `translate(${offset.x}px, ${offset.y}px)`, touchAction: "none" }
          : undefined
      }
      className={cn(
        "border-border bg-card relative rounded-xl border p-3 text-left select-none",
        "[-webkit-touch-callout:none]",
        "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
        canEdit && "cursor-grab active:cursor-grabbing",
        dragging ? "z-20 shadow-lg" : "z-0",
        !dragging && "transition-[box-shadow,transform] duration-150 ease-out",
      )}
    >
      <p className="text-foreground text-sm leading-snug font-medium">{task.title}</p>
      {task.description && (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {canEdit && task.visibility === "internal" && <Badge variant="warning">Internal</Badge>}
        {task.dueAt && (
          <span className="text-muted-foreground text-xs">{formatDate(task.dueAt)}</span>
        )}
        {assignee && (
          <span className="text-muted-foreground truncate text-xs">{assignee.name}</span>
        )}
      </div>
    </div>
  );
}
