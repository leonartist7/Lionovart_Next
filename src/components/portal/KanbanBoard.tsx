"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BoardColumn, COLUMN_LABELS } from "@/components/portal/BoardColumn";
import { TaskFormDialog } from "@/components/portal/TaskFormDialog";
import { useToast } from "@/components/ui/toast";
import { TASK_COLUMNS, compareTasks, type Membership, type Task, type TaskColumn } from "@/lib/portal/types";

/** Pointer-move distance, in px, before a mouse drag is considered "armed". */
const MOUSE_ARM_DISTANCE = 4;
/** Pointer-move distance, in px, that cancels a pending touch long-press. */
const TOUCH_CANCEL_DISTANCE = 8;
/** How long a still touch has to be held before it becomes a drag. */
const LONG_PRESS_MS = 350;
/** Distance from a board edge, in px, that triggers auto-scroll. */
const AUTO_SCROLL_EDGE = 56;
const AUTO_SCROLL_SPEED = 12;

interface PointerState {
  pointerId: number;
  taskId: string;
  startX: number;
  startY: number;
  armed: boolean;
  longPressTimer: number | null;
  cardEl: HTMLElement;
}

interface DropTarget {
  column: TaskColumn;
  /** Index among the column's *other* tasks — the dragged card is excluded. */
  index: number;
}

/**
 * Drag, touch and keyboard reorder for the kanban board. This is the one
 * place that knows about every card, every column, and the move contract —
 * see `src/lib/portal/tasks.ts` for why the server, not this component,
 * computes the authoritative fractional order.
 */
export function KanbanBoard({
  workspaceSlug,
  projectId,
  initialTasks,
  canEdit,
  members,
  demo = false,
}: {
  workspaceSlug: string;
  projectId: string;
  initialTasks: Task[];
  canEdit: boolean;
  members: Record<string, Membership>;
  /** Design preview: show the controls, but never call the API. */
  demo?: boolean;
}) {
  const toast = useToast();
  const [tasks, setTasks] = useState(initialTasks);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [lastMoved, setLastMoved] = useState<{ id: string; column: TaskColumn; index: number } | null>(
    null,
  );

  const pointerRef = useRef<PointerState | null>(null);
  const rafRef = useRef<number | null>(null);
  const scrollDirRef = useRef(0);
  const boardScrollRef = useRef<HTMLDivElement>(null);

  const base = `/api/portal/${workspaceSlug}/projects/${projectId}/tasks`;

  const columns = useMemo(() => {
    const map = new Map<TaskColumn, Task[]>();
    TASK_COLUMNS.forEach((c) => map.set(c, []));
    for (const task of tasks) map.get(task.column)?.push(task);
    map.forEach((list) => list.sort(compareTasks));
    return map;
  }, [tasks]);

  function blockedByDemo() {
    if (!demo) return false;
    toast.add({ title: "Preview only", description: "This is sample data — changes aren't saved." });
    return true;
  }

  function announce(title: string, column: TaskColumn, index: number, total: number) {
    setAnnouncement(`Moved ${title} to ${COLUMN_LABELS[column]}, position ${index + 1} of ${total}.`);
  }

  /** Finds which column and insertion slot a point is over, right now — never from rects cached at drag start, which desync the moment auto-scroll moves the board. */
  function hitTest(x: number, y: number, excludeTaskId: string): DropTarget | null {
    const els = document.elementsFromPoint(x, y);
    const columnEl = els.find(
      (el): el is HTMLElement => el instanceof HTMLElement && !!el.dataset.column,
    );
    if (!columnEl) return null;
    const column = columnEl.dataset.column as TaskColumn;

    const cardEls = Array.from(columnEl.querySelectorAll<HTMLElement>("[data-task-id]")).filter(
      (el) => el.dataset.taskId !== excludeTaskId,
    );
    let index = cardEls.length;
    for (let i = 0; i < cardEls.length; i++) {
      const rect = cardEls[i].getBoundingClientRect();
      if (y < rect.top + rect.height / 2) {
        index = i;
        break;
      }
    }
    return { column, index };
  }

  function autoScroll(clientX: number) {
    const el = boardScrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (clientX < rect.left + AUTO_SCROLL_EDGE) scrollDirRef.current = -1;
    else if (clientX > rect.right - AUTO_SCROLL_EDGE) scrollDirRef.current = 1;
    else scrollDirRef.current = 0;

    if (scrollDirRef.current !== 0 && rafRef.current === null) {
      const step = () => {
        const board = boardScrollRef.current;
        if (scrollDirRef.current === 0 || !board) {
          rafRef.current = null;
          return;
        }
        board.scrollLeft += scrollDirRef.current * AUTO_SCROLL_SPEED;
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    }
  }

  function stopAutoScroll() {
    scrollDirRef.current = 0;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function armDrag(state: PointerState, x: number, y: number) {
    state.armed = true;
    try {
      state.cardEl.setPointerCapture(state.pointerId);
    } catch {
      // Capture can fail if the pointer was already released; the drag still
      // works from move/up events targeting the same element.
    }
    state.cardEl.style.touchAction = "none";
    setDraggingId(state.taskId);
    setDragOffset({ x: 0, y: 0 });
    setDropTarget(hitTest(x, y, state.taskId));
  }

  function cleanupDrag(state: PointerState) {
    if (state.longPressTimer !== null) clearTimeout(state.longPressTimer);
    if (state.armed) {
      state.cardEl.style.touchAction = "";
      try {
        state.cardEl.releasePointerCapture(state.pointerId);
      } catch {
        // Already released (e.g. by pointercancel) — nothing to do.
      }
    }
    pointerRef.current = null;
    stopAutoScroll();
    setDraggingId(null);
    setDragOffset({ x: 0, y: 0 });
    setDropTarget(null);
  }

  function handleCardPointerDown(taskId: string, e: React.PointerEvent) {
    if (!canEdit || pointerRef.current) return;
    const cardEl = e.currentTarget as HTMLElement;
    const state: PointerState = {
      pointerId: e.pointerId,
      taskId,
      startX: e.clientX,
      startY: e.clientY,
      armed: false,
      longPressTimer: null,
      cardEl,
    };
    pointerRef.current = state;
    if (e.pointerType === "touch") {
      state.longPressTimer = window.setTimeout(() => {
        state.longPressTimer = null;
        armDrag(state, state.startX, state.startY);
      }, LONG_PRESS_MS);
    }
    // No capture / preventDefault yet: the card must stay tappable and the
    // column must stay scrollable until a drag is actually armed.
  }

  function handleCardPointerMove(e: React.PointerEvent) {
    const state = pointerRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    if (!state.armed) {
      const isTouch = e.pointerType === "touch";
      const distance = Math.hypot(dx, dy);
      if (isTouch) {
        if (distance > TOUCH_CANCEL_DISTANCE) {
          // The browser is claiming this as a scroll — abandon the drag
          // candidate rather than racing it.
          if (state.longPressTimer !== null) clearTimeout(state.longPressTimer);
          pointerRef.current = null;
        }
      } else if (distance > MOUSE_ARM_DISTANCE) {
        armDrag(state, e.clientX, e.clientY);
      }
      return;
    }

    e.preventDefault(); // belt-and-suspenders alongside the touchAction toggle
    setDragOffset({ x: dx, y: dy });
    setDropTarget(hitTest(e.clientX, e.clientY, state.taskId));
    autoScroll(e.clientX);
  }

  function handleCardPointerUp(e: React.PointerEvent) {
    const state = pointerRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    const wasArmed = state.armed;
    const target = dropTarget;
    cleanupDrag(state);
    if (wasArmed && target) {
      commitMove(state.taskId, target);
    } else if (!wasArmed) {
      openEdit(state.taskId);
    }
  }

  function handleCardPointerCancel(e: React.PointerEvent) {
    const state = pointerRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    // Authoritative "the browser took this gesture" signal — never commit.
    cleanupDrag(state);
  }

  function commitMove(taskId: string, target: DropTarget) {
    const siblings = (columns.get(target.column) ?? []).filter((t) => t.id !== taskId);
    const prevTaskId = siblings[target.index - 1]?.id;
    const nextTaskId = siblings[target.index]?.id;
    applyMove(taskId, target.column, prevTaskId, nextTaskId);
  }

  async function applyMove(
    taskId: string,
    column: TaskColumn,
    prevTaskId: string | undefined,
    nextTaskId: string | undefined,
  ) {
    if (blockedByDemo()) return;
    const moved = tasks.find((t) => t.id === taskId);
    if (!moved) return;
    const previousTasks = tasks;

    // Optimistic, single-shot placement — instant feedback, no float math on
    // this side: the server derives the authoritative order.
    const withoutMoved = tasks.filter((t) => t.id !== taskId);
    const targetSiblings = withoutMoved.filter((t) => t.column === column).sort(compareTasks);
    const insertAt = prevTaskId
      ? targetSiblings.findIndex((t) => t.id === prevTaskId) + 1
      : nextTaskId
        ? targetSiblings.findIndex((t) => t.id === nextTaskId)
        : targetSiblings.length;
    const nextSiblings = [...targetSiblings];
    nextSiblings.splice(Math.max(insertAt, 0), 0, { ...moved, column });

    setTasks([...withoutMoved.filter((t) => t.column !== column), ...nextSiblings]);
    const optimisticIndex = nextSiblings.findIndex((t) => t.id === taskId);
    announce(moved.title, column, optimisticIndex, nextSiblings.length);
    setLastMoved({ id: taskId, column, index: optimisticIndex });

    try {
      const res = await fetch(`${base}/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column, prevTaskId, nextTaskId }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { tasks: Task[] };
      setTasks(data.tasks);
      const settled = data.tasks.filter((t) => t.column === column).sort(compareTasks);
      const settledIndex = settled.findIndex((t) => t.id === taskId);
      if (settledIndex >= 0) setLastMoved({ id: taskId, column, index: settledIndex });
    } catch {
      setTasks(previousTasks);
      toast.add({ title: "Couldn't move that task" });
    }
  }

  function handleCardKeyDown(taskId: string, e: React.KeyboardEvent) {
    if (!canEdit) return;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();

    const moved = tasks.find((t) => t.id === taskId);
    if (!moved) return;

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const siblings = (columns.get(moved.column) ?? []).filter((t) => t.id !== taskId);
      const currentIndex = (columns.get(moved.column) ?? []).findIndex((t) => t.id === taskId);
      const targetIndex = currentIndex + (e.key === "ArrowUp" ? -1 : 1);
      if (targetIndex < 0 || targetIndex > siblings.length) return;
      applyMove(taskId, moved.column, siblings[targetIndex - 1]?.id, siblings[targetIndex]?.id);
      return;
    }

    const colIndex = TASK_COLUMNS.indexOf(moved.column);
    const targetColIndex = colIndex + (e.key === "ArrowLeft" ? -1 : 1);
    if (targetColIndex < 0 || targetColIndex >= TASK_COLUMNS.length) return;
    const targetColumn = TASK_COLUMNS[targetColIndex];
    // Append at the end of the target column — explicitly, via its last
    // task's id, never by omitting both neighbours (that reads as "empty
    // column" server-side and would land at a flat constant instead).
    const targetSiblings = columns.get(targetColumn) ?? [];
    applyMove(taskId, targetColumn, targetSiblings.at(-1)?.id, undefined);
  }

  function openEdit(taskId: string) {
    setEditingTaskId(taskId);
  }

  useLayoutEffect(() => {
    if (!lastMoved) return;
    document.getElementById(`task-card-${lastMoved.id}`)?.focus();
  }, [lastMoved?.id, lastMoved?.column, lastMoved?.index]);

  // Tear the auto-scroll loop and any pending long-press timer down on
  // unmount too — not just on pointerup/pointercancel — or a drag interrupted
  // by navigation leaves the board scrolling or a timer firing into nothing.
  useEffect(() => {
    return () => {
      stopAutoScroll();
      const state = pointerRef.current;
      if (state?.longPressTimer !== null && state?.longPressTimer !== undefined) {
        clearTimeout(state.longPressTimer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : undefined;

  return (
    <div>
      <div
        ref={boardScrollRef}
        className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scroll-snap-type:x_mandatory] sm:mx-0 sm:px-0"
      >
        {TASK_COLUMNS.map((column) => (
          <BoardColumn
            key={column}
            column={column}
            tasks={columns.get(column) ?? []}
            canEdit={canEdit}
            draggingId={draggingId}
            dragOffset={dragOffset}
            dropIndex={dropTarget?.column === column ? dropTarget.index : null}
            members={members}
            addTrigger={
              canEdit ? (
                <TaskFormDialog
                  mode="create"
                  workspaceSlug={workspaceSlug}
                  projectId={projectId}
                  column={column}
                  members={members}
                  demo={demo}
                  onCreated={(task) => setTasks((prev) => [...prev, task])}
                />
              ) : undefined
            }
            onCardPointerDown={handleCardPointerDown}
            onCardPointerMove={handleCardPointerMove}
            onCardPointerUp={handleCardPointerUp}
            onCardPointerCancel={handleCardPointerCancel}
            onCardKeyDown={handleCardKeyDown}
          />
        ))}
      </div>

      {canEdit && editingTask && (
        <TaskFormDialog
          mode="edit"
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          task={editingTask}
          members={members}
          demo={demo}
          open={editingTaskId === editingTask.id}
          onOpenChange={(open) => setEditingTaskId(open ? editingTask.id : null)}
          onSaved={(task) => setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))}
          onDeleted={() => {
            setTasks((prev) => prev.filter((t) => t.id !== editingTask.id));
            setEditingTaskId(null);
          }}
        />
      )}

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
