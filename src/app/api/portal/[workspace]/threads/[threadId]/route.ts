import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { deleteThread, getThread, resolveThread } from "@/lib/portal/threads";
import { roleAtLeast } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string; threadId: string }> };

/**
 * PATCH — resolve or reopen.
 *
 * Either the person who raised it or agency staff. A client closing the
 * studio's open question (or vice versa) would quietly drop the thing it was
 * asking about, so the toggle stays with the author and the studio.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { workspace, threadId } = await params;
  const access = await requireWorkspace(req, workspace, "collaborator");
  if (access instanceof NextResponse) return access;

  let body: { resolved?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.resolved !== "boolean") {
    return NextResponse.json({ error: "Unknown change." }, { status: 400 });
  }

  const existing = await getThread(access.workspace.id, threadId, access.membership.role);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAuthor = existing.createdBy === access.session.uid;
  if (!isAuthor && !roleAtLeast(access.membership.role, "agency")) {
    return NextResponse.json(
      { error: "Only the person who raised this can close it." },
      { status: 403 },
    );
  }

  const result = await resolveThread(access.workspace.id, threadId, access.membership.role, {
    resolved: body.resolved,
    uid: access.session.uid,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ thread: result.thread });
}

/** DELETE — removes the thread and every comment on it. Agency only. */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspace, threadId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  const existing = await getThread(access.workspace.id, threadId, access.membership.role);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteThread(access.workspace.id, threadId);
  return NextResponse.json({ ok: true });
}
