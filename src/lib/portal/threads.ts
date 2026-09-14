import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { listAssets } from "@/lib/portal/assets";
import { listProjects } from "@/lib/portal/projects";
import { listTasks } from "@/lib/portal/tasks";
import {
  roleAtLeast,
  type AnnotationPin,
  type Comment,
  type PortalRole,
  type Thread,
  type ThreadTarget,
} from "@/lib/portal/types";

/**
 * Threads, comments and annotation pins.
 *
 * A **pin is a thread** — one with `pin` populated and a `versionId`. There is
 * no separate pin collection, so "resolve the pin" and "resolve the
 * conversation" can never drift apart.
 *
 * Layout: `workspaces/{ws}/threads/{threadId}/comments/{commentId}`. Threads
 * sit at workspace level rather than under their target so one query serves
 * every target type, and so a thread survives if its target moves.
 *
 * Visibility is decided **here**, in the data layer, exactly like
 * `projects.ts` — a thread whose target is an `internal` project (or an asset
 * belonging to one, or an `internal` task) is never returned to a non-agency
 * caller, and creating one against a target they can't see returns 404, not
 * 403. A 403 would confirm the internal record exists.
 */

export const THREAD_TARGETS: ThreadTarget[] = ["asset", "task", "post", "project"];

function threadsRef(workspaceId: string) {
  if (!adminDb) throw new Error("Firestore is not configured");
  return adminDb.collection("workspaces").doc(workspaceId).collection("threads");
}

function commentsRef(workspaceId: string, threadId: string) {
  return threadsRef(workspaceId).doc(threadId).collection("comments");
}

function toThread(doc: FirebaseFirestore.DocumentSnapshot): Thread {
  return { id: doc.id, ...doc.data() } as Thread;
}

/**
 * A pin is only ever normalized 0–1 against the rendered image box. Anything
 * outside that range was measured against the wrong box (viewport pixels, or
 * the letterboxed container rather than the image inside it) and would land
 * somewhere else on a different screen — reject it rather than store a
 * coordinate that is already wrong.
 */
export function isValidPin(value: unknown): value is AnnotationPin {
  if (!value || typeof value !== "object") return false;
  const { x, y } = value as Partial<AnnotationPin>;
  return (
    typeof x === "number" &&
    typeof y === "number" &&
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= 0 &&
    x <= 1 &&
    y >= 0 &&
    y <= 1
  );
}

/* ── Visibility ─────────────────────────────────────────────────── */

type TargetRef = Pick<Thread, "targetType" | "targetId">;

/**
 * Builds the predicate that decides which threads this viewer may see, loading
 * only what the supplied targets actually need — a page of asset threads never
 * reads the task collections.
 */
async function buildVisibilityGate(
  workspaceId: string,
  viewerRole: PortalRole,
  targets: TargetRef[],
): Promise<(t: TargetRef) => boolean> {
  if (roleAtLeast(viewerRole, "agency")) return () => true;

  const kinds = new Set(targets.map((t) => t.targetType));
  if (!kinds.has("project") && !kinds.has("asset") && !kinds.has("task")) {
    return () => true;
  }

  // Already internal-filtered for this role — the one place that decision lives.
  const projects = await listProjects(workspaceId, viewerRole);
  const visibleProjectIds = new Set(projects.map((p) => p.id));

  const assetProject = new Map<string, string | undefined>();
  if (kinds.has("asset")) {
    for (const asset of await listAssets(workspaceId)) {
      assetProject.set(asset.id, asset.projectId);
    }
  }

  const visibleTaskIds = new Set<string>();
  if (kinds.has("task")) {
    const perProject = await Promise.all(
      projects.map((p) => listTasks(workspaceId, p.id, viewerRole)),
    );
    for (const task of perProject.flat()) visibleTaskIds.add(task.id);
  }

  return (t: TargetRef) => {
    switch (t.targetType) {
      case "project":
        return visibleProjectIds.has(t.targetId);
      case "task":
        return visibleTaskIds.has(t.targetId);
      case "asset": {
        // A deleted asset's orphan threads stay hidden rather than showing as
        // a conversation about nothing.
        if (!assetProject.has(t.targetId)) return false;
        const projectId = assetProject.get(t.targetId);
        return !projectId || visibleProjectIds.has(projectId);
      }
      case "post":
        // Content (Phase 5b) isn't built and a post has no `internal` state of
        // its own yet. Revisit here — not in a component — if it gains one.
        return true;
    }
  };
}

/* ── Reads ──────────────────────────────────────────────────────── */

export interface ThreadWithComments extends Thread {
  comments: Comment[];
}

export interface ListThreadsFilter {
  targetType?: ThreadTarget;
  targetId?: string;
  /**
   * ISO cursor. Returns only threads whose `updatedAt` is newer — the polling
   * path. `ids` still lists every visible thread so a poller can drop ones
   * that were deleted while it wasn't looking.
   */
  since?: string;
}

export interface ThreadFeed {
  threads: ThreadWithComments[];
  ids: string[];
  /** Pass back as `since` on the next poll. Empty when there is nothing yet. */
  cursor: string;
}

async function listComments(workspaceId: string, threadId: string): Promise<Comment[]> {
  const snap = await commentsRef(workspaceId, threadId).orderBy("createdAt", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment);
}

/**
 * Threads for a target (or the whole workspace), oldest first — pin numbering
 * is creation order, so it has to be stable across reloads and viewers.
 *
 * Equality filters only, sorted in memory: a `where` pair plus an `orderBy`
 * would need a composite index, and this repo deliberately ships no index
 * configuration.
 */
export async function listThreads(
  workspaceId: string,
  viewerRole: PortalRole,
  filter: ListThreadsFilter = {},
): Promise<ThreadFeed> {
  if (!adminDb) return { threads: [], ids: [], cursor: "" };

  let query: FirebaseFirestore.Query = threadsRef(workspaceId);
  if (filter.targetType) query = query.where("targetType", "==", filter.targetType);
  if (filter.targetId) query = query.where("targetId", "==", filter.targetId);

  const snap = await query.get();
  const all = snap.docs.map(toThread);

  const gate = await buildVisibilityGate(workspaceId, viewerRole, all);
  const visible = all.filter(gate).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const cursor = visible.reduce((max, t) => (t.updatedAt > max ? t.updatedAt : max), "");
  const since = filter.since;
  const changed = since ? visible.filter((t) => t.updatedAt > since) : visible;

  const threads = await Promise.all(
    changed.map(async (t) => ({ ...t, comments: await listComments(workspaceId, t.id) })),
  );

  return { threads, ids: visible.map((t) => t.id), cursor };
}

/** One thread with its comments, or null when it doesn't exist *or* isn't visible. */
export async function getThread(
  workspaceId: string,
  threadId: string,
  viewerRole: PortalRole,
): Promise<ThreadWithComments | null> {
  if (!adminDb) return null;

  const doc = await threadsRef(workspaceId).doc(threadId).get();
  if (!doc.exists) return null;

  const thread = toThread(doc);
  const gate = await buildVisibilityGate(workspaceId, viewerRole, [thread]);
  if (!gate(thread)) return null;

  return { ...thread, comments: await listComments(workspaceId, threadId) };
}

/* ── Writes ─────────────────────────────────────────────────────── */

export type ThreadError = { error: string; status: number };

export interface CreateThreadInput {
  targetType: ThreadTarget;
  targetId: string;
  /** Required alongside `pin` — a pin belongs to one version, never the asset. */
  versionId?: number;
  pin?: AnnotationPin;
  /** The opening comment. A thread with no comment is not a thread. */
  body: string;
  authorUid: string;
  authorName: string;
}

async function writeComment(
  workspaceId: string,
  threadId: string,
  input: { body: string; authorUid: string; authorName: string },
  at: string,
): Promise<Comment> {
  const doc = {
    body: input.body,
    authorUid: input.authorUid,
    authorName: input.authorName,
    createdAt: at,
  };
  const ref = await commentsRef(workspaceId, threadId).add(doc);
  return { id: ref.id, ...doc };
}

export async function createThread(
  workspaceId: string,
  viewerRole: PortalRole,
  input: CreateThreadInput,
): Promise<{ thread: ThreadWithComments } | ThreadError> {
  if (!adminDb) throw new Error("Firestore is not configured");

  const body = input.body.trim();
  if (!body) return { error: "A comment can't be empty.", status: 400 };
  if (!THREAD_TARGETS.includes(input.targetType)) {
    return { error: "Unknown target type.", status: 400 };
  }
  if (!input.targetId) return { error: "A target is required.", status: 400 };

  if (input.pin !== undefined) {
    if (!isValidPin(input.pin)) {
      return { error: "A pin must be normalized 0–1 against the image box.", status: 400 };
    }
    if (input.targetType !== "asset" || typeof input.versionId !== "number") {
      return { error: "A pin belongs to one version of one file.", status: 400 };
    }
  }

  const gate = await buildVisibilityGate(workspaceId, viewerRole, [input]);
  if (!gate(input)) return { error: "Not found", status: 404 };

  const now = new Date().toISOString();
  const doc = {
    targetType: input.targetType,
    targetId: input.targetId,
    ...(typeof input.versionId === "number" ? { versionId: input.versionId } : {}),
    // Stored verbatim: the number the client measured against the rendered
    // image box is the number that must come back, unrounded.
    ...(input.pin ? { pin: { x: input.pin.x, y: input.pin.y } } : {}),
    status: "open" as const,
    createdBy: input.authorUid,
    createdAt: now,
    lastMessageAt: now,
    updatedAt: now,
    participants: [input.authorUid],
  };

  const ref = await threadsRef(workspaceId).add(doc);
  const comment = await writeComment(workspaceId, ref.id, { ...input, body }, now);
  return { thread: { id: ref.id, ...doc, comments: [comment] } };
}

export async function addComment(
  workspaceId: string,
  threadId: string,
  viewerRole: PortalRole,
  input: { body: string; authorUid: string; authorName: string },
): Promise<{ comment: Comment } | ThreadError> {
  const body = input.body.trim();
  if (!body) return { error: "A comment can't be empty.", status: 400 };

  const thread = await getThread(workspaceId, threadId, viewerRole);
  if (!thread) return { error: "Not found", status: 404 };

  const now = new Date().toISOString();
  const comment = await writeComment(workspaceId, threadId, { ...input, body }, now);
  await threadsRef(workspaceId).doc(threadId).update({
    lastMessageAt: now,
    updatedAt: now,
    participants: FieldValue.arrayUnion(input.authorUid),
  });
  return { comment };
}

/**
 * Resolve or reopen. Both directions are one call so the button is a toggle —
 * a resolved thread that can't be reopened turns a misclick into lost feedback.
 */
export async function resolveThread(
  workspaceId: string,
  threadId: string,
  viewerRole: PortalRole,
  input: { resolved: boolean; uid: string },
): Promise<{ thread: Thread } | ThreadError> {
  const thread = await getThread(workspaceId, threadId, viewerRole);
  if (!thread) return { error: "Not found", status: 404 };

  const now = new Date().toISOString();
  const patch = input.resolved
    ? { status: "resolved" as const, resolvedBy: input.uid, resolvedAt: now, updatedAt: now }
    : {
        status: "open" as const,
        resolvedBy: FieldValue.delete(),
        resolvedAt: FieldValue.delete(),
        updatedAt: now,
      };

  await threadsRef(workspaceId).doc(threadId).update(patch);

  const { comments: _comments, ...rest } = thread;
  return {
    thread: input.resolved
      ? { ...rest, status: "resolved", resolvedBy: input.uid, resolvedAt: now, updatedAt: now }
      : { ...rest, status: "open", resolvedBy: undefined, resolvedAt: undefined, updatedAt: now },
  };
}

/**
 * Deletes a comment. **Only its author, or agency staff.** A client can say
 * their piece and take it back; they can never remove someone else's words
 * from a thread they happen to be in.
 *
 * Removing the last comment removes the thread (and its pin) — an empty thread
 * would render as a pin that opens onto nothing.
 */
export async function deleteComment(
  workspaceId: string,
  threadId: string,
  commentId: string,
  viewer: { uid: string; role: PortalRole },
): Promise<{ threadDeleted: boolean } | ThreadError> {
  if (!adminDb) throw new Error("Firestore is not configured");

  const thread = await getThread(workspaceId, threadId, viewer.role);
  if (!thread) return { error: "Not found", status: 404 };

  const comment = thread.comments.find((c) => c.id === commentId);
  if (!comment) return { error: "Not found", status: 404 };

  if (comment.authorUid !== viewer.uid && !roleAtLeast(viewer.role, "agency")) {
    return { error: "You can only delete your own comments.", status: 403 };
  }

  await commentsRef(workspaceId, threadId).doc(commentId).delete();

  const remaining = thread.comments.filter((c) => c.id !== commentId);
  if (remaining.length === 0) {
    await threadsRef(workspaceId).doc(threadId).delete();
    return { threadDeleted: true };
  }

  const last = remaining[remaining.length - 1];
  await threadsRef(workspaceId)
    .doc(threadId)
    .update({ lastMessageAt: last.createdAt, updatedAt: new Date().toISOString() });
  return { threadDeleted: false };
}

/** Deletes a thread and every comment on it. Agency only — enforced by the route. */
export async function deleteThread(workspaceId: string, threadId: string): Promise<void> {
  if (!adminDb) return;
  const snap = await commentsRef(workspaceId, threadId).get();
  const batch = adminDb.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(threadsRef(workspaceId).doc(threadId));
  await batch.commit();
}
