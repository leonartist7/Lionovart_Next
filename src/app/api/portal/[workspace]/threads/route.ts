import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { THREAD_TARGETS, createThread, listThreads } from "@/lib/portal/threads";
import type { AnnotationPin, ThreadTarget } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string }> };

/**
 * GET — threads for a target, or the whole workspace.
 *
 * `?since=<iso>` is the realtime path: it returns only threads that changed,
 * plus `ids` (every visible thread) so a poller can drop deleted ones, plus
 * `cursor` to pass back next time. Cursor polling, not a held connection —
 * see PORTAL_HANDOFF.md §6: this app runs on Cloud Run *and* Vercel, and a
 * held SSE stream behaves differently on each.
 *
 * Internal-visibility filtering happens in `listThreads`, server-side.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const sp = req.nextUrl.searchParams;
  const targetType = sp.get("targetType") as ThreadTarget | null;
  if (targetType && !THREAD_TARGETS.includes(targetType)) {
    return NextResponse.json({ error: "Unknown target type." }, { status: 400 });
  }

  const feed = await listThreads(access.workspace.id, access.membership.role, {
    targetType: targetType ?? undefined,
    targetId: sp.get("targetId") ?? undefined,
    since: sp.get("since") ?? undefined,
  });

  return NextResponse.json(feed);
}

/**
 * POST — opens a thread with its first comment. A pin is a thread with `pin`
 * populated; the coordinates are validated (and stored) exactly as measured.
 *
 * `collaborator` and above, so a client can raise feedback — the whole point.
 * A target they can't see returns 404, never 403.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace, "collaborator");
  if (access instanceof NextResponse) return access;

  let body: {
    targetType?: string;
    targetId?: string;
    versionId?: number;
    pin?: AnnotationPin;
    body?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await createThread(access.workspace.id, access.membership.role, {
    targetType: body.targetType as ThreadTarget,
    targetId: body.targetId?.trim() ?? "",
    versionId: typeof body.versionId === "number" ? body.versionId : undefined,
    pin: body.pin,
    body: body.body ?? "",
    authorUid: access.session.uid,
    authorName: access.session.name,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ thread: result.thread }, { status: 201 });
}
