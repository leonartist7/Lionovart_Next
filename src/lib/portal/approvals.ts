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

  const [projects, assets] = await Promise.all([
    listProjects(workspaceId, viewerRole),
    listAssets(workspaceId),
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
        targetLabel: "Social post",
      });
    }
  }
  return withContext;
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
