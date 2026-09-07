import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { confirmUpload, listVersions } from "@/lib/portal/assets";

type Params = { params: Promise<{ workspace: string; assetId: string }> };

/** GET — version history for one asset, newest first. */
export async function GET(req: NextRequest, { params }: Params) {
  const { workspace, assetId } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const versions = await listVersions(access.workspace.id, assetId);
  return NextResponse.json({ versions });
}

/**
 * POST — confirms an upload after the client PUTs bytes to the signed URL.
 * Checks the object actually exists in Storage before writing anything, so a
 * client can't fabricate a version record for a file it never sent.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace, assetId } = await params;
  const access = await requireWorkspace(req, workspace, "collaborator");
  if (access instanceof NextResponse) return access;

  let body: {
    version?: number;
    storagePath?: string;
    name?: string;
    mime?: string;
    sizeBytes?: number;
    note?: string;
    projectId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body.version !== "number" ||
    !body.storagePath ||
    !body.name ||
    !body.mime ||
    typeof body.sizeBytes !== "number"
  ) {
    return NextResponse.json({ error: "Missing upload details." }, { status: 400 });
  }

  const result = await confirmUpload(access.workspace.id, {
    assetId,
    version: body.version,
    storagePath: body.storagePath,
    name: body.name,
    mime: body.mime,
    sizeBytes: body.sizeBytes,
    uploadedBy: access.session.uid,
    note: body.note,
    projectId: body.projectId,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
