"use client";

import { TaskCard } from "@/components/portal/TaskCard";
import type { Membership, Task, TaskColumn } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

export const COLUMN_LABELS: Record<TaskColumn, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  review: "In review",
  approved: "Approved",
  done: "Done",
};

/**
 * The dragged card, if any, stays inline at its original DOM position and is
 * only visually translated (see `TaskCard`) — removing it from the tree would
 * cancel the pointer capture driving the drag. So the insertion indicator is
 * positioned against an index that *skips* the dragged card, not the raw
 * array index; `KanbanBoard`'s hit-testing counts the same way.
 */
export function BoardColumn({
  column,
  tasks,
  canEdit,
  draggingId,
  dragOffset,
  dropIndex,
  members,
  addTrigger,
  onCardPointerDown,
  onCardPointerMove,
  onCardPointerUp,
  onCardPointerCancel,
  onCardKeyDown,
}: {
  column: TaskColumn;
  tasks: Task[];
  canEdit: boolean;
  draggingId: string | null;
  dragOffset: { x: number; y: number };
  dropIndex: number | null;
  members: Record<string, Membership>;
  addTrigger?: React.ReactNode;
  onCardPointerDown: (taskId: string, e: React.PointerEvent) => void;
  onCardPointerMove: (e: React.PointerEvent) => void;
  onCardPointerUp: (e: React.PointerEvent) => void;
  onCardPointerCancel: (e: React.PointerEvent) => void;
  onCardKeyDown: (taskId: string, e: React.KeyboardEvent) => void;
}) {
  const otherCount = tasks.filter((t) => t.id !== draggingId).length;
  let otherIndex = 0;

  return (
    <div className="w-[85vw] shrink-0 snap-center sm:w-72">
      <div className="mb-3 flex items-baseline justify-between gap-2 px-0.5">
        <h3 className="text-foreground text-sm font-semibold">{COLUMN_LABELS[column]}</h3>
        <span className="text-muted-foreground text-xs tabular-nums">{tasks.length}</span>
      </div>

      <div
        data-column={column}
        className="border-border bg-muted/30 flex min-h-24 flex-col gap-2 rounded-2xl border p-2"
      >
        {!draggingId && tasks.length === 0 && (
          <p className="text-muted-foreground px-2 py-4 text-center text-xs">No tasks</p>
        )}

        {tasks.map((task) => {
          const isDragging = task.id === draggingId;
          const slot = isDragging ? null : otherIndex++;
          return (
            <div key={task.id} className="relative">
              {slot !== null && dropIndex === slot && (
                <div className="bg-primary/60 -mt-2.5 mb-1 h-0.5 rounded-full" aria-hidden="true" />
              )}
              <TaskCard
                task={task}
                canEdit={canEdit}
                dragging={isDragging}
                offset={isDragging ? dragOffset : { x: 0, y: 0 }}
                assignee={task.assigneeUid ? members[task.assigneeUid] : undefined}
                onPointerDown={(e) => onCardPointerDown(task.id, e)}
                onPointerMove={onCardPointerMove}
                onPointerUp={onCardPointerUp}
                onPointerCancel={onCardPointerCancel}
                onKeyDown={(e) => onCardKeyDown(task.id, e)}
              />
            </div>
          );
        })}

        {dropIndex === otherCount && otherCount > 0 && (
          <div className="bg-primary/60 -mt-1 h-0.5 rounded-full" aria-hidden="true" />
        )}

        {canEdit && <div className={cn(tasks.length > 0 && "mt-1")}>{addTrigger}</div>}
      </div>
    </div>
  );
}
