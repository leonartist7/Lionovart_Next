import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { deleteTask, listTasks, moveTask, updateTask } from "@/lib/portal/tasks";
import { TASK_COLUMNS, type Task } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string; projectId: string; taskId: string }> };

/**
 * Two request shapes on one endpoint, distinguished by whether `column` is
 * present: a drag/keyboard move (server computes the authoritative fractional
 * order from the given neighbour ids — see `moveTask`) or a plain field edit.
 * Either way this is agency-only: a client's PATCH is a 403, never a 200 that
 * silently no-ops.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { workspace, projectId, taskId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.column !== undefined) {
    if (!TASK_COLUMNS.includes(body.column as Task["column"])) {
      return NextResponse.json({ error: "Unknown column." }, { status: 400 });
    }
    const tasks = await moveTask(access.workspace.id, projectId, taskId, {
      column: body.column as Task["column"],
      prevTaskId: typeof body.prevTaskId === "string" ? body.prevTaskId : undefined,
      nextTaskId: typeof body.nextTaskId === "string" ? body.nextTaskId : undefined,
    });
    return NextResponse.json({ tasks });
  }

  if (body.visibility !== undefined && !["client", "internal"].includes(body.visibility as string)) {
    return NextResponse.json({ error: "Unknown visibility." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  if (title !== undefined && !title) {
    return NextResponse.json({ error: "A task title is required." }, { status: 400 });
  }

  await updateTask(access.workspace.id, projectId, taskId, {
    title,
    description: body.description as string | undefined,
    assigneeUid: body.assigneeUid as string | undefined,
    dueAt: body.dueAt as string | undefined,
    visibility: body.visibility as Task["visibility"] | undefined,
  });

  const tasks = await listTasks(access.workspace.id, projectId, "agency");
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ task });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspace, projectId, taskId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  await deleteTask(access.workspace.id, projectId, taskId);
  return NextResponse.json({ ok: true });
}
