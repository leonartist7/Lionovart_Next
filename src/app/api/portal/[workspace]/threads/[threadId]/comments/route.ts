import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { addComment } from "@/lib/portal/threads";

type Params = { params: Promise<{ workspace: string; threadId: string }> };

/** POST — replies to a thread. `collaborator` and above, clients included. */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace, threadId } = await params;
  const access = await requireWorkspace(req, workspace, "collaborator");
  if (access instanceof NextResponse) return access;

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await addComment(access.workspace.id, threadId, access.membership.role, {
    body: body.body ?? "",
    authorUid: access.session.uid,
    authorName: access.session.name,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ comment: result.comment }, { status: 201 });
}
