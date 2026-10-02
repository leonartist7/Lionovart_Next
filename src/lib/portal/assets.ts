import "server-only";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { visibleProjectIds } from "@/lib/portal/projects";
import type { Asset, AssetKind, AssetVersion, PortalRole } from "@/lib/portal/types";

/**
 * Asset and version reads/writes, plus the signed-upload flow.
 *
 * Bytes never route through this server: a client asks for a signed PUT URL,
 * uploads straight to Storage, then confirms — at which point this module
 * checks the object actually exists before writing anything to Firestore.
 * That confirm step is what stops a client from fabricating a version record
 * for a file that was never uploaded.
 *
 * **Visibility.** A file belongs to a project (`projectId`, optional) and
 * inherits its `internal` visibility: a client never sees, reads, lists or
 * touches a file whose project they can't see. The viewer's role is a required
 * argument on every read and write below, so a caller can't forget the filter
 * — the same stance `projects.ts` takes. A file whose project no longer exists
 * fails closed (hidden from clients) rather than open.
 */

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const MIME_ALLOWLIST = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
];

export function isAllowedMime(mime: string): boolean {
  return MIME_ALLOWLIST.includes(mime);
}

export function kindForMime(mime: string): AssetKind {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf" || mime.includes("word") || mime.includes("sheet")) return "doc";
  return "other";
}

function assetsRef(workspaceId: string) {
  if (!adminDb) throw new Error("Firestore is not configured");
  return adminDb.collection("workspaces").doc(workspaceId).collection("assets");
}

function versionsRef(workspaceId: string, assetId: string) {
  return assetsRef(workspaceId).doc(assetId).collection("versions");
}

/** `visible === null` means "every project" (agency) — nothing to filter. */
function canSee(asset: Pick<Asset, "projectId">, visible: Set<string> | null): boolean {
  if (visible === null) return true;
  return !asset.projectId || visible.has(asset.projectId);
}

/** Whether this viewer may attach a file to `projectId` — it must exist and be one they can see. */
async function projectUsable(workspaceId: string, viewerRole: PortalRole, projectId: string): Promise<boolean> {
  if (!adminDb) return false;
  const visible = await visibleProjectIds(workspaceId, viewerRole);
  if (visible) return visible.has(projectId);
  const doc = await adminDb.collection("workspaces").doc(workspaceId).collection("projects").doc(projectId).get();
  return doc.exists;
}

/** No Storage emulator is wired up in this repo (see PORTAL_HANDOFF.md) — under
 * the Firestore/Auth emulators, uploads are mocked so the validation and
 * permission logic can still be verified without moving real bytes. */
function isEmulated(): boolean {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST);
}

function storagePath(workspaceId: string, assetId: string, version: number, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  return `portal/${workspaceId}/assets/${assetId}/v${version}/${safe}`;
}

async function signUploadUrl(path: string, mime: string): Promise<string> {
  if (isEmulated()) return `http://mock-upload.local/${encodeURIComponent(path)}`;
  if (!adminStorage) throw new Error("Storage is not configured");
  const [url] = await adminStorage.bucket().file(path).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 10 * 60 * 1000,
    contentType: mime,
  });
  return url;
}

async function objectExists(path: string): Promise<boolean> {
  if (isEmulated()) return true;
  if (!adminStorage) return false;
  const [exists] = await adminStorage.bucket().file(path).exists();
  return exists;
}

/** Short-lived signed read URL — assets are private, never a public bucket. */
export async function signReadUrl(path: string): Promise<string> {
  if (isEmulated()) return `http://mock-download.local/${encodeURIComponent(path)}`;
  if (!adminStorage) throw new Error("Storage is not configured");
  const [url] = await adminStorage.bucket().file(path).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
  });
  return url;
}

export interface SignUploadInput {
  /** Omit to start a new asset; pass an existing id to add a version to it. */
  assetId?: string;
  name: string;
  mime: string;
  sizeBytes: number;
}

export interface SignUploadResult {
  uploadUrl: string;
  storagePath: string;
  assetId: string;
  version: number;
}

/**
 * Validates the upload before handing out a URL — the mime allowlist and size
 * cap are enforced here, server-side, never trusting what the client claims
 * once bytes actually land.
 */
export async function signUpload(
  workspaceId: string,
  input: SignUploadInput,
  viewerRole: PortalRole,
): Promise<SignUploadResult | { error: string }> {
  if (!isAllowedMime(input.mime)) {
    return { error: `File type "${input.mime}" isn't supported.` };
  }
  if (input.sizeBytes > MAX_UPLOAD_BYTES) {
    return { error: "Files are limited to 25MB." };
  }
  if (input.sizeBytes <= 0) {
    return { error: "Empty file." };
  }

  let assetId = input.assetId;
  let version = 1;

  if (assetId) {
    // A file the viewer can't see answers exactly like one that doesn't exist.
    const existing = await getAsset(workspaceId, assetId, viewerRole);
    if (!existing) return { error: "Asset not found." };
    version = (existing.currentVersion ?? 0) + 1;
  } else {
    assetId = assetsRef(workspaceId).doc().id;
  }

  const path = storagePath(workspaceId, assetId, version, input.name);
  const uploadUrl = await signUploadUrl(path, input.mime);

  return { uploadUrl, storagePath: path, assetId, version };
}

export interface ConfirmUploadInput {
  assetId: string;
  version: number;
  storagePath: string;
  name: string;
  mime: string;
  sizeBytes: number;
  uploadedBy: string;
  note?: string;
  projectId?: string;
  /** Required: confirming a version onto a file is a write to it, and a file you can't see is a file you can't touch. */
  viewerRole: PortalRole;
}

/**
 * Finalizes an upload once the client reports the PUT succeeded. Verifies the
 * object is actually there — a client cannot write a version record for a
 * file that was never sent.
 */
export async function confirmUpload(
  workspaceId: string,
  input: ConfirmUploadInput,
): Promise<{ asset: Asset; version: AssetVersion } | { error: string }> {
  // Gate before touching Storage or Firestore. Both rejections read the same
  // as a genuinely missing record, so they confirm nothing.
  if (input.version > 1 && !(await getAsset(workspaceId, input.assetId, input.viewerRole))) {
    return { error: "Asset not found." };
  }
  if (input.projectId && !(await projectUsable(workspaceId, input.viewerRole, input.projectId))) {
    return { error: "Project not found." };
  }

  if (!(await objectExists(input.storagePath))) {
    return { error: "Upload not found — try again." };
  }

  const now = new Date().toISOString();
  const versionDoc: AssetVersion = {
    n: input.version,
    storagePath: input.storagePath,
    sizeBytes: input.sizeBytes,
    uploadedBy: input.uploadedBy,
    createdAt: now,
    ...(input.note ? { note: input.note } : {}),
  };
  await versionsRef(workspaceId, input.assetId).doc(String(input.version)).set(versionDoc);

  const assetRef = assetsRef(workspaceId).doc(input.assetId);
  if (input.version === 1) {
    const asset: Omit<Asset, "id"> = {
      name: input.name,
      mime: input.mime,
      kind: kindForMime(input.mime),
      currentVersion: 1,
      uploadedBy: input.uploadedBy,
      createdAt: now,
      tags: [],
      ...(input.projectId ? { projectId: input.projectId } : {}),
    };
    await assetRef.set(asset);
    return { asset: { id: input.assetId, ...asset }, version: versionDoc };
  }

  await assetRef.update({ currentVersion: input.version });
  const doc = await assetRef.get();
  return { asset: { id: doc.id, ...doc.data() } as Asset, version: versionDoc };
}

export async function listAssets(workspaceId: string, viewerRole: PortalRole): Promise<Asset[]> {
  if (!adminDb) return [];
  const [snap, visible] = await Promise.all([
    assetsRef(workspaceId).orderBy("createdAt", "desc").get(),
    visibleProjectIds(workspaceId, viewerRole),
  ]);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Asset).filter((a) => canSee(a, visible));
}

export interface AssetWithVersion extends Asset {
  /** The current version's record, for a thumbnail — null only if it's somehow missing. */
  version: AssetVersion | null;
}

/** Assets plus their current version, for the grid — one extra read per asset, not per render. */
export async function listAssetsWithVersions(
  workspaceId: string,
  viewerRole: PortalRole,
): Promise<AssetWithVersion[]> {
  const assets = await listAssets(workspaceId, viewerRole);
  return Promise.all(
    assets.map(async (asset) => {
      const doc = await versionsRef(workspaceId, asset.id).doc(String(asset.currentVersion)).get();
      return { ...asset, version: doc.exists ? (doc.data() as AssetVersion) : null };
    }),
  );
}

/** The asset, or null when it doesn't exist *or* this viewer can't see it — callers 404 on null, never 403. */
export async function getAsset(
  workspaceId: string,
  assetId: string,
  viewerRole: PortalRole,
): Promise<Asset | null> {
  if (!adminDb) return null;
  const doc = await assetsRef(workspaceId).doc(assetId).get();
  if (!doc.exists) return null;
  const asset = { id: doc.id, ...doc.data() } as Asset;
  if (!canSee(asset, await visibleProjectIds(workspaceId, viewerRole))) return null;
  return asset;
}

/** Version history. A file the viewer can't see has none as far as they're concerned. */
export async function listVersions(
  workspaceId: string,
  assetId: string,
  viewerRole: PortalRole,
): Promise<AssetVersion[]> {
  if (!(await getAsset(workspaceId, assetId, viewerRole))) return [];
  return readVersions(workspaceId, assetId);
}

/** Unfiltered — only for callers that have already decided the viewer may see this asset (or are deleting it). */
async function readVersions(workspaceId: string, assetId: string): Promise<AssetVersion[]> {
  if (!adminDb) return [];
  const snap = await versionsRef(workspaceId, assetId).orderBy("n", "desc").get();
  return snap.docs.map((d) => d.data() as AssetVersion);
}

/** Deletes the asset, its version records, and the underlying objects in Storage. */
export async function deleteAsset(workspaceId: string, assetId: string): Promise<void> {
  if (!adminDb) return;
  const versions = await readVersions(workspaceId, assetId);

  const storage = adminStorage;
  if (!isEmulated() && storage) {
    await Promise.all(
      versions.map((v) => storage.bucket().file(v.storagePath).delete({ ignoreNotFound: true })),
    );
  }

  const batch = adminDb.batch();
  const versionsSnap = await versionsRef(workspaceId, assetId).get();
  versionsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(assetsRef(workspaceId).doc(assetId));
  await batch.commit();
}
