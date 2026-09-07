import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { deleteAsset, getAsset, listVersions } from "@/lib/portal/assets";

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

/** DELETE — agency only. Removes the asset, its versions, and their Storage objects. */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspace, assetId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  const asset = await getAsset(access.workspace.id, assetId);
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteAsset(access.workspace.id, assetId);
  return NextResponse.json({ ok: true });
}
