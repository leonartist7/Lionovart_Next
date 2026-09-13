import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { decideApproval } from "@/lib/portal/approvals";
import type { Approval } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string; approvalId: string }> };

const DECISION_STATES: Approval["state"][] = ["approved", "changes_requested"];

/**
 * PATCH — decide an approval. Requires `approver` or above; "request changes"
 * without a note is rejected here, not just in the form, so a rejection can
 * never skip the reason.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { workspace, approvalId } = await params;
  const access = await requireWorkspace(req, workspace, "approver");
  if (access instanceof NextResponse) return access;

  let body: { state?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const state = body.state as Approval["state"];
  if (!DECISION_STATES.includes(state)) {
    return NextResponse.json({ error: "Unknown decision." }, { status: 400 });
  }

  const result = await decideApproval(access.workspace.id, approvalId, {
    state: state as "approved" | "changes_requested",
    decidedBy: access.session.uid,
    note: body.note,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ approval: result.approval });
}
