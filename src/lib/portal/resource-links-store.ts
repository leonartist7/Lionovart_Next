import "server-only";
import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { MAX_RESOURCE_LINKS, visibleResourceLinks, type ResourceLink, type ResourceLinkInput } from "./resource-links";

export class ResourceLinkConflict extends Error {}
function resourcesRef(workspaceId: string) {
  if (!adminDb) throw new Error("Workspace storage is unavailable");
  return adminDb.collection("workspaces").doc(workspaceId).collection("connections").doc("resources");
}
export async function listResourceLinks(workspaceId: string, isAgency: boolean): Promise<ResourceLink[]> {
  const snapshot = await resourcesRef(workspaceId).get();
  return visibleResourceLinks(snapshot.data()?.links, isAgency);
}
export async function addResourceLink(workspaceId: string, actorUid: string, input: ResourceLinkInput): Promise<ResourceLink> {
  if (!adminDb) throw new Error("Workspace storage is unavailable");
  const ref = resourcesRef(workspaceId);
  const link: ResourceLink = { ...input, id: createHash("sha256").update(input.url).digest("hex"), createdAt: new Date().toISOString() };
  const audit = ref.collection("audit").doc();
  await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const links = visibleResourceLinks(snapshot.data()?.links, true);
    if (links.some(existing => existing.url === link.url)) throw new ResourceLinkConflict("This resource is already saved.");
    if (links.length >= MAX_RESOURCE_LINKS) throw new ResourceLinkConflict("This workspace has reached its 40-resource limit.");
    transaction.set(ref, { links: [...links, link], updatedAt: link.createdAt });
    transaction.set(audit, { action: "created", linkId: link.id, actorUid, at: link.createdAt });
  });
  return link;
}
export async function removeResourceLink(workspaceId: string, actorUid: string, id: string): Promise<void> {
  if (!adminDb) throw new Error("Workspace storage is unavailable");
  const ref = resourcesRef(workspaceId);
  const audit = ref.collection("audit").doc();
  await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const links = visibleResourceLinks(snapshot.data()?.links, true);
    if (!links.some(link => link.id === id)) throw new ResourceLinkConflict("This resource is no longer available. Refresh the page.");
    const at = new Date().toISOString();
    transaction.set(ref, { links: links.filter(link => link.id !== id), updatedAt: at });
    transaction.set(audit, { action: "removed", linkId: id, actorUid, at });
  });
}
