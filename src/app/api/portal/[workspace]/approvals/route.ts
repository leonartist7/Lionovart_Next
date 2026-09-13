import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { APPROVAL_TARGET_TYPES, createApproval, listPendingApprovals } from "@/lib/portal/approvals";
import type { Approval } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string }> };

/** GET — the pending queue, visible to anyone in the workspace. */
export async function GET(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const approvals = await listPendingApprovals(access.workspace.id, access.membership.role);
  return NextResponse.json({ approvals });
}

/** POST — request an approval. Agency only; clients don't request sign-off on their own work. */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: { targetType?: string; targetId?: string; versionId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetType = body.targetType as Approval["targetType"];
  if (!APPROVAL_TARGET_TYPES.includes(targetType)) {
    return NextResponse.json({ error: "Unknown target type." }, { status: 400 });
  }
  const targetId = body.targetId?.trim();
  if (!targetId) {
    return NextResponse.json({ error: "A target is required." }, { status: 400 });
  }

  const approval = await createApproval(access.workspace.id, {
    targetType,
    targetId,
    versionId: typeof body.versionId === "number" ? body.versionId : undefined,
    requestedBy: access.session.uid,
  });

  return NextResponse.json({ approval }, { status: 201 });
}
