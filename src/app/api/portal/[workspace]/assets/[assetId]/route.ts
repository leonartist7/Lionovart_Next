import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { deleteAsset, getAsset, listVersions } from "@/lib/portal/assets";
import { deleteThreadsForTarget } from "@/lib/portal/threads";

type Params = { params: Promise<{ workspace: string; assetId: string }> };

/** GET — one asset with its version history, newest first. */
export async function GET(req: NextRequest, { params }: Params) {
  const { workspace, assetId } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const asset = await getAsset(access.workspace.id, assetId);
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const versions = await listVersions(access.workspace.id, assetId);
  return NextResponse.json({ asset, versions });
}

/** DELETE — agency only. Removes the asset, its versions, their Storage objects, and its threads. */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspace, assetId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  const asset = await getAsset(access.workspace.id, assetId);
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteAsset(access.workspace.id, assetId);
  // Firestore does not cascade, and threads live at workspace level rather
  // than under the asset — delete them here or the conversation outlives the
  // file it was about.
  await deleteThreadsForTarget(access.workspace.id, "asset", assetId);
  return NextResponse.json({ ok: true });
}
