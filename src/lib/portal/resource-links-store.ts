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

/**
 * Audited optimistic update. An editor must supply its previously displayed
 * record, avoiding silent overwrites if a teammate updated the resource.
 * URL changes re-key the existing URL-hash identifier.
 */
export async function updateResourceLink(
  workspaceId: string,
  actorUid: string,
  id: string,
  expected: ResourceLinkInput,
  input: ResourceLinkInput,
  confirmShare: boolean,
): Promise<ResourceLink> {
  if (!adminDb) throw new Error("Workspace storage is unavailable");
  const ref = resourcesRef(workspaceId);
  const audit = ref.collection("audit").doc();
  const updatedId = createHash("sha256").update(input.url).digest("hex");
  let result: ResourceLink | undefined;
  await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const links = visibleResourceLinks(snapshot.data()?.links, true);
    const current = links.find(link => link.id === id);
    if (!current) throw new ResourceLinkConflict("This resource was removed. Refresh the page.");
    if (current.label !== expected.label || current.url !== expected.url || current.visibility !== expected.visibility) {
      throw new ResourceLinkConflict("This resource changed in another session. Refresh before editing again.");
    }
    if (current.visibility === "internal" && input.visibility === "shared" && !confirmShare) {
      throw new ResourceLinkConflict("Confirm that everyone in this workspace may see this link before sharing.");
    }
    if (links.some(link => link.id !== id && (link.url === input.url || link.id === updatedId))) {
      throw new ResourceLinkConflict("Another resource already uses that URL.");
    }
    if (current.label === input.label && current.url === input.url && current.visibility === input.visibility) {
      result = current;
      return;
    }
    const at = new Date().toISOString();
    result = { ...input, id: updatedId, createdAt: current.createdAt };
    transaction.set(ref, { links: links.map(link => link.id === id ? result : link), updatedAt: at });
    transaction.set(audit, {
      action: "updated", actorUid, at, linkId: updatedId, previousLinkId: id,
      visibilityFrom: current.visibility, visibilityTo: input.visibility,
    });
  });
  if (!result) throw new Error("Resource update was not confirmed");
  return result;
}
