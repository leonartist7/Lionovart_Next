import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { listAssets } from "@/lib/portal/assets";
import { listProjects } from "@/lib/portal/projects";
import type { Approval, PortalRole } from "@/lib/portal/types";

/**
 * Approval reads/writes.
 *
 * A target's display name (an asset's filename, a milestone's title and its
 * project's name) is resolved at read time from the existing project/asset
 * data — never denormalized onto the Approval doc — the same "derived, not
 * stored" stance `deriveProgress` already takes for progress.
 */

export const APPROVAL_TARGET_TYPES: Approval["targetType"][] = ["asset", "post", "milestone"];

function approvalsRef(workspaceId: string) {
  if (!adminDb) throw new Error("Firestore is not configured");
  return adminDb.collection("workspaces").doc(workspaceId).collection("approvals");
}

/**
 * The caption line behind a `post` approval, read directly rather than through
 * `listPosts`.
 *
 * `posts.ts` imports `createApproval` from this module — that direction is the
 * important one, because it is what makes Content use the real approval
 * primitive instead of a second flow. Importing back the other way for a
 * display string would close the cycle, so this reads the one field it needs.
 * There is no visibility decision here to duplicate: a post only has a pending
 * approval while it is `in_review`, which every member of the workspace can
 * already see.
 */
async function postCaptions(workspaceId: string, ids: readonly string[]): Promise<Map<string, string>> {
  const labels = new Map<string, string>();
  if (!adminDb || ids.length === 0) return labels;
  const posts = adminDb.collection("workspaces").doc(workspaceId).collection("posts");
  const docs = await Promise.all([...new Set(ids)].map((id) => posts.doc(id).get()));
  for (const doc of docs) {
    if (!doc.exists) continue;
    const caption = String(doc.data()?.caption ?? "").trim().split("\n")[0] ?? "";
    labels.set(doc.id, caption.length > 70 ? `${caption.slice(0, 69)}\u2026` : caption);
  }
  return labels;
}

export interface CreateApprovalInput {
  targetType: Approval["targetType"];
  targetId: string;
  versionId?: number;
  requestedBy: string;
}

export async function createApproval(
  workspaceId: string,
  input: CreateApprovalInput,
): Promise<Approval> {
  const doc = {
    targetType: input.targetType,
    targetId: input.targetId,
    versionId: input.versionId ?? null,
    state: "pending" as const,
    requestedBy: input.requestedBy,
    requestedAt: new Date().toISOString(),
  };
  const ref = await approvalsRef(workspaceId).add(doc);
  return { id: ref.id, ...doc } as unknown as Approval;
}

export interface ApprovalWithContext {
  id: string;
  targetType: Approval["targetType"];
  targetId: string;
  versionId?: number;
  requestedAt: string;
  targetLabel: string;
  contextLabel?: string;
}

/**
 * The pending queue, with display labels resolved — the one query behind both
 * the Approvals page and the Overview's "awaiting you" slot.
 *
 * A milestone approval whose project is `internal` and invisible to this
 * viewer is dropped entirely, not shown with a blank label — the same
 * "absent, not hidden" rule internal visibility gets everywhere else.
 */
export async function listPendingApprovals(
  workspaceId: string,
  viewerRole: PortalRole,
): Promise<ApprovalWithContext[]> {
  if (!adminDb) return [];

  const snap = await approvalsRef(workspaceId).orderBy("requestedAt", "desc").get();
  const pending = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Approval)
    .filter((a) => a.state === "pending");

  if (pending.length === 0) return [];

  const [projects, assets, captions] = await Promise.all([
    listProjects(workspaceId, viewerRole),
    listAssets(workspaceId),
    postCaptions(
      workspaceId,
      pending.filter((a) => a.targetType === "post").map((a) => a.targetId),
    ),
  ]);

  const milestoneById = new Map(
    projects.flatMap((p) => p.milestones.map((m) => [m.id, { milestone: m, project: p }] as const)),
  );
  const assetById = new Map(assets.map((a) => [a.id, a]));

  const withContext: ApprovalWithContext[] = [];
  for (const a of pending) {
    if (a.targetType === "milestone") {
      const hit = milestoneById.get(a.targetId);
      if (!hit) continue; // hidden (internal project) or deleted — drop, don't leak a blank row
      withContext.push({
        id: a.id,
        targetType: a.targetType,
        targetId: a.targetId,
        versionId: a.versionId,
        requestedAt: a.requestedAt,
        targetLabel: hit.milestone.title,
        contextLabel: hit.project.name,
      });
    } else if (a.targetType === "asset") {
      const asset = assetById.get(a.targetId);
      withContext.push({
        id: a.id,
        targetType: a.targetType,
        targetId: a.targetId,
        versionId: a.versionId,
        requestedAt: a.requestedAt,
        targetLabel: asset?.name ?? "File",
        contextLabel: a.versionId ? `Version ${a.versionId}` : undefined,
      });
    } else {
      withContext.push({
        id: a.id,
        targetType: a.targetType,
        targetId: a.targetId,
        versionId: a.versionId,
        requestedAt: a.requestedAt,
        targetLabel: captions.get(a.targetId) || "Social post",
        contextLabel: "Social post",
      });
    }
  }
  return withContext;
}

/**
 * Decisions already made about one target, newest first.
 *
 * `listPendingApprovals` deliberately only returns what is still pending — it
 * is the "what needs me" queue. A post that came back with changes requested
 * needs the opposite: the note that explains why. Same collection, same
 * append-only history, read from the other end.
 */
export async function listDecisionsFor(
  workspaceId: string,
  targetType: Approval["targetType"],
  targetId: string,
): Promise<Approval[]> {
  if (!adminDb) return [];
  const snap = await approvalsRef(workspaceId)
    .where("targetType", "==", targetType)
    .where("targetId", "==", targetId)
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Approval)
    .filter((a) => a.state !== "pending")
    .sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? ""));
}

export type DecideApprovalResult = { approval: Approval } | { error: string; status: number };

export interface DecideApprovalInput {
  state: "approved" | "changes_requested";
  decidedBy: string;
  note?: string;
}

/**
 * Decisions are append-only: a pending approval can be decided exactly once,
 * and `decidedBy`/`decidedAt` are never rewritten by a later call.
 */
export async function decideApproval(
  workspaceId: string,
  approvalId: string,
  input: DecideApprovalInput,
): Promise<DecideApprovalResult> {
  if (input.state === "changes_requested" && !input.note?.trim()) {
    return { error: "A note is required when requesting changes.", status: 400 };
  }

  const ref = approvalsRef(workspaceId).doc(approvalId);
  const doc = await ref.get();
  if (!doc.exists) return { error: "Not found", status: 404 };

  const current = { id: doc.id, ...doc.data() } as Approval;
  if (current.state !== "pending") {
    return { error: "This approval has already been decided.", status: 409 };
  }

  const patch = {
    state: input.state,
    decidedBy: input.decidedBy,
    decidedAt: new Date().toISOString(),
    ...(input.note ? { note: input.note } : {}),
  };
  await ref.update(patch);
  return { approval: { ...current, ...patch } };
}
