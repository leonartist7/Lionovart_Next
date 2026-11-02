import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { getAsset } from "@/lib/portal/assets";
import type { PortalRole } from "@/lib/portal/types";

/** Bounded, read-only file feedback projected through the existing asset visibility gate. */
export interface VisibleFileActivity {
  assetId: string;
  threadId: string;
  assetName: string;
  kind: "Pinned feedback" | "File discussion";
  status: "open" | "resolved";
  updatedAt: string;
}
export const FILE_ACTIVITY_SCAN_LIMIT = 60;
export const FILE_ACTIVITY_DISPLAY_LIMIT = 8;
const safeId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);

/**
 * Call only after portal session/workspace authorization. Never reads raw
 * comments, author data, outbox, or provider records. getAsset enforces the
 * existing project visibility policy (including internal-project files).
 * This is a limited recent snapshot, not an exhaustive inbox or notification.
 */
export async function listVisibleFileActivity(
  workspaceId: string,
  viewerRole: PortalRole,
): Promise<VisibleFileActivity[]> {
  if (!adminDb) throw new Error("Workspace storage is unavailable");
  const snapshot = await adminDb.collection("workspaces").doc(workspaceId)
    .collection("threads").orderBy("updatedAt", "desc")
    .limit(FILE_ACTIVITY_SCAN_LIMIT).get();
  const visible: VisibleFileActivity[] = [];
  const assets = new Map<string, Awaited<ReturnType<typeof getAsset>>>();
  for (const doc of snapshot.docs) {
    if (visible.length >= FILE_ACTIVITY_DISPLAY_LIMIT) break;
    const data = doc.data();
    if (data?.targetType !== "asset" || !safeId(doc.id) || !safeId(data.targetId)) continue;
    if (data.status !== "open" && data.status !== "resolved") continue;
    if (typeof data.updatedAt !== "string") continue;
    const parsed = new Date(data.updatedAt);
    if (!Number.isFinite(parsed.valueOf())) continue;
    if (!assets.has(data.targetId)) {
      assets.set(data.targetId, await getAsset(workspaceId, data.targetId, viewerRole));
    }
    const asset = assets.get(data.targetId);
    if (!asset) continue;
    visible.push({
      assetId: asset.id,
      threadId: doc.id,
      assetName: typeof asset.name === "string" ? asset.name.slice(0, 120) : "Workspace file",
      kind: data.pin ? "Pinned feedback" : "File discussion",
      status: data.status,
      updatedAt: parsed.toISOString(),
    });
  }
  return visible;
}
