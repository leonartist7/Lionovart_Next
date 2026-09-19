import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { deleteComment } from "@/lib/portal/threads";

type Params = {
  params: Promise<{ workspace: string; threadId: string; commentId: string }>;
};

/**
 * DELETE — removes one comment. Its author, or agency staff, and nobody else:
 * the authorship check is in `deleteComment`, so every caller inherits it.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspace, threadId, commentId } = await params;
  const access = await requireWorkspace(req, workspace, "collaborator");
  if (access instanceof NextResponse) return access;

  const result = await deleteComment(access.workspace.id, threadId, commentId, {
    uid: access.session.uid,
    role: access.membership.role,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, threadDeleted: result.threadDeleted });
}
