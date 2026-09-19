import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { submitForReview } from "@/lib/portal/posts";

type Params = { params: Promise<{ workspace: string; postId: string }> };

/**
 * POST — draft → in_review, and the only route that gets there.
 *
 * `submitForReview` validates for real and creates the approval through the
 * existing Approvals primitive in one call, so a post can never be sitting in
 * review with nothing in the client's queue, and a client can never be shown
 * something that wouldn't post. A 422 carries the validation back so the
 * composer can show exactly what failed.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace, postId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  const result = await submitForReview(access.workspace.id, postId, access.session.uid);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error, validation: result.validation },
      { status: result.status },
    );
  }
  return NextResponse.json({ post: result.post, approvalId: result.approvalId }, { status: 201 });
}
