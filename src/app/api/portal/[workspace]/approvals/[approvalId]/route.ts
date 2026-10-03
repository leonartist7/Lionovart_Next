import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { decideApproval } from "@/lib/portal/approvals";
import { applyApprovalDecision } from "@/lib/portal/posts";
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

  // A decision on a post moves the post. This is the *only* place that edge of
  // the content state machine is taken: `transitionPost` refuses
  // `in_review → approved | rejected` outright and points the caller back here,
  // so Content has no approval flow of its own to drift out of step with this
  // one. The decision itself — who, when, the note — stays in the approvals
  // collection; the post only mirrors the resulting state.
  if (result.approval.targetType === "post") {
    await applyApprovalDecision(
      access.workspace.id,
      result.approval.targetId,
      result.approval.state as "approved" | "changes_requested",
    );
  }

  return NextResponse.json({ approval: result.approval });
}
