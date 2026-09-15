import "server-only";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import type { Asset, AssetKind, AssetVersion } from "@/lib/portal/types";

/**
 * Asset and version reads/writes, plus the signed-upload flow.
 *
 * Bytes never route through this server: a client asks for a signed PUT URL,
 * uploads straight to Storage, then confirms — at which point this module
 * checks the object actually exists before writing anything to Firestore.
 * That confirm step is what stops a client from fabricating a version record
 * for a file that was never uploaded.
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

/**
 * Writes bytes the server already holds straight into Storage.
 *
 * The signed-PUT flow exists so a *client's* bytes never route through this
 * server. A generated image is different: it is produced here, so a round trip
 * back out to a signed URL would add a hop and a failure mode for nothing.
 * Mocked under the emulator for the same reason the rest of this module is —
 * no Storage emulator is wired up.
 */
export async function writeServerObject(path: string, bytes: Buffer, mime: string): Promise<void> {
  if (isEmulated()) return;
  if (!adminStorage) throw new Error("Storage is not configured");
  await adminStorage.bucket().file(path).save(bytes, { contentType: mime });
}

/** The canonical object path for an asset version — shared with server-side writers. */
export function assetStoragePath(
  workspaceId: string,
  assetId: string,
  version: number,
  filename: string,
): string {
  return storagePath(workspaceId, assetId, version, filename);
}

/** A fresh asset id, so a server-side writer can name its object before writing. */
export function newAssetId(workspaceId: string): string {
  return assetsRef(workspaceId).doc().id;
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
    const doc = await assetsRef(workspaceId).doc(assetId).get();
    if (!doc.exists) return { error: "Asset not found." };
    version = ((doc.data()?.currentVersion as number) ?? 0) + 1;
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
  /** Known only when the server produced the image; uploads don't carry it. */
  width?: number;
  height?: number;
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
    ...(input.width && input.height ? { width: input.width, height: input.height } : {}),
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

export async function listAssets(workspaceId: string): Promise<Asset[]> {
  if (!adminDb) return [];
  const snap = await assetsRef(workspaceId).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Asset);
}

export interface AssetWithVersion extends Asset {
  /** The current version's record, for a thumbnail — null only if it's somehow missing. */
  version: AssetVersion | null;
}

/** Assets plus their current version, for the grid — one extra read per asset, not per render. */
export async function listAssetsWithVersions(workspaceId: string): Promise<AssetWithVersion[]> {
  const assets = await listAssets(workspaceId);
  return Promise.all(
    assets.map(async (asset) => {
      const doc = await versionsRef(workspaceId, asset.id).doc(String(asset.currentVersion)).get();
      return { ...asset, version: doc.exists ? (doc.data() as AssetVersion) : null };
    }),
  );
}

export async function getAsset(workspaceId: string, assetId: string): Promise<Asset | null> {
  if (!adminDb) return null;
  const doc = await assetsRef(workspaceId).doc(assetId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Asset;
}

export async function listVersions(workspaceId: string, assetId: string): Promise<AssetVersion[]> {
  if (!adminDb) return [];
  const snap = await versionsRef(workspaceId, assetId).orderBy("n", "desc").get();
  return snap.docs.map((d) => d.data() as AssetVersion);
}

/** Deletes the asset, its version records, and the underlying objects in Storage. */
export async function deleteAsset(workspaceId: string, assetId: string): Promise<void> {
  if (!adminDb) return;
  const versions = await listVersions(workspaceId, assetId);

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
