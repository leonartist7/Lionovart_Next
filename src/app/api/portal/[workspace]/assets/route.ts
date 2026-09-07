import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { listAssets } from "@/lib/portal/assets";

type Params = { params: Promise<{ workspace: string }> };

/** GET — every asset in the workspace, newest first. */
export async function GET(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const assets = await listAssets(access.workspace.id);
  return NextResponse.json({ assets });
}
