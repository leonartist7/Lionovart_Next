import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { compareTasks, roleAtLeast, type PortalRole, type Task, type TaskColumn } from "@/lib/portal/types";

/**
 * Task reads/writes for the kanban board.
 *
 * `order` is a fractional index: inserting between two tasks writes
 * `(prev.order + next.order) / 2` and touches exactly one document. The one
 * documented exception is a rebalance, which touches every task in a column
 * — that only happens when float precision has collapsed between a specific
 * pair (see `moveTask`), never on an ordinary move.
 */

/** Gap left between tasks so future inserts have headroom before they collide. */
const ORDER_STEP = 1000;
/** Below this gap, floating-point precision has effectively collapsed. */
const ORDER_EPSILON = 1e-6;

function tasksRef(workspaceId: string, projectId: string) {
  if (!adminDb) throw new Error("Firestore is not configured");
  return adminDb
    .collection("workspaces")
    .doc(workspaceId)
    .collection("projects")
    .doc(projectId)
    .collection("tasks");
}

function toTask(doc: FirebaseFirestore.QueryDocumentSnapshot): Task {
  return { id: doc.id, ...doc.data() } as Task;
}

/**
 * Internal-visibility tasks are filtered out here, server-side, for anyone
 * below `agency` — never rendered and then hidden with CSS.
 */
export async function listTasks(
  workspaceId: string,
  projectId: string,
  viewerRole: PortalRole,
): Promise<Task[]> {
  if (!adminDb) return [];

  const snap = await tasksRef(workspaceId, projectId).get();
  const canSeeInternal = roleAtLeast(viewerRole, "agency");

  return snap.docs
    .map(toTask)
    .filter((t) => canSeeInternal || t.visibility !== "internal")
    .sort(compareTasks);
}

export async function getTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  viewerRole: PortalRole,
): Promise<Task | null> {
  if (!adminDb) return null;

  const doc = await tasksRef(workspaceId, projectId).doc(taskId).get();
  if (!doc.exists) return null;

  const task = toTask(doc as FirebaseFirestore.QueryDocumentSnapshot);
  if (task.visibility === "internal" && !roleAtLeast(viewerRole, "agency")) {
    return null;
  }
  return task;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  column?: TaskColumn;
  assigneeUid?: string;
  dueAt?: string;
  visibility?: "client" | "internal";
}

export async function createTask(
  workspaceId: string,
  projectId: string,
  input: CreateTaskInput,
): Promise<Task> {
  const column = input.column ?? "backlog";
  const ref = tasksRef(workspaceId, projectId);

  // Append to the end of the column using the same fractional step a drag
  // would use — never `Math.max(...) + 1` (that's the integer-order pattern
  // `createMilestone` uses; a task created that way would sit inside the
  // headroom a later drag-insert needs, defeating the point of the step).
  const snap = await ref.where("column", "==", column).get();
  const existing = snap.docs.map(toTask);
  const order = existing.length > 0 ? Math.max(...existing.map((t) => t.order)) + ORDER_STEP : ORDER_STEP;

  const now = new Date().toISOString();
  const doc = {
    title: input.title,
    description: input.description ?? null,
    column,
    order,
    assigneeUid: input.assigneeUid ?? null,
    dueAt: input.dueAt ?? null,
    visibility: input.visibility ?? "client",
    createdAt: now,
    updatedAt: now,
  };
  const created = await ref.add(doc);
  return { id: created.id, ...doc } as unknown as Task;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigneeUid?: string;
  dueAt?: string;
  visibility?: "client" | "internal";
}

export async function updateTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  patch: UpdateTaskInput,
): Promise<void> {
  const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  if (Object.keys(clean).length === 0) return;
  await tasksRef(workspaceId, projectId)
    .doc(taskId)
    .update({ ...clean, updatedAt: new Date().toISOString() });
}

export async function deleteTask(workspaceId: string, projectId: string, taskId: string): Promise<void> {
  await tasksRef(workspaceId, projectId).doc(taskId).delete();
}

export interface MoveTaskInput {
  column: TaskColumn;
  /** The task that should end up immediately before the moved task. */
  prevTaskId?: string;
  /** The task that should end up immediately after the moved task. */
  nextTaskId?: string;
}

/**
 * Moves (or reorders within) a column. The client never computes or sends a
 * raw `order` float — it names the two neighbours the task should land
 * between, and the server derives the authoritative value from a fresh read.
 * This is deliberate: under concurrent drags, two agency members moving
 * *different* tasks into the *same* slot both resolve the same neighbour
 * pair and can legitimately compute the same midpoint — nothing (not even a
 * Firestore transaction, which only serialises writes to the *same*
 * document) prevents that. `compareTasks`'s id tiebreak is what keeps every
 * viewer's render identical when it happens; it is not a leftover from a
 * race this design already prevents.
 *
 * Returns the fresh, full task list (agency-scoped) so the caller can
 * reconcile — a rebalance can touch several documents, and a partial merge
 * on the client is more failure-prone than replacing state outright.
 */
export async function moveTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  input: MoveTaskInput,
): Promise<Task[]> {
  if (!adminDb) throw new Error("Firestore is not configured");
  const ref = tasksRef(workspaceId, projectId);

  const snap = await ref.get();
  const all = snap.docs.map(toTask);
  const moved = all.find((t) => t.id === taskId);
  if (!moved) throw new Error("Task not found");

  const siblings = all.filter((t) => t.column === input.column && t.id !== taskId).sort(compareTasks);
  let prev = input.prevTaskId ? siblings.find((t) => t.id === input.prevTaskId) : undefined;
  let next = input.nextTaskId ? siblings.find((t) => t.id === input.nextTaskId) : undefined;

  // Both explicit neighbours were stale (e.g. concurrently deleted) — land at
  // the end of the column, never at a hardcoded absolute value that could be
  // far outside this column's real order range.
  if (input.prevTaskId && input.nextTaskId && !prev && !next) {
    prev = siblings.at(-1);
    next = undefined;
  }

  const computeOrder = () => {
    if (prev && next) return (prev.order + next.order) / 2;
    if (prev) return prev.order + ORDER_STEP;
    if (next) return next.order - ORDER_STEP;
    return ORDER_STEP;
  };

  let order = computeOrder();

  if (prev && next && Math.abs(next.order - prev.order) < ORDER_EPSILON) {
    // Precision has collapsed between this exact pair. Rebalance the column
    // — the one documented exception to "touch one document per move" — then
    // recompute against the rebalanced neighbours.
    const batch = adminDb.batch();
    siblings.forEach((t, i) => {
      const rebalanced = (i + 1) * ORDER_STEP;
      t.order = rebalanced;
      batch.update(ref.doc(t.id), { order: rebalanced });
    });
    order = computeOrder();
    await batch.commit();
  }

  const columnChanged = input.column !== moved.column;
  const orderChanged = Math.abs(order - moved.order) >= ORDER_EPSILON;
  if (columnChanged || orderChanged) {
    await ref.doc(taskId).update({
      column: input.column,
      order,
      updatedAt: new Date().toISOString(),
    });
  }

  return listTasks(workspaceId, projectId, "agency");
}
