import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { getProject } from "@/lib/portal/projects";
import { createTask, listTasks } from "@/lib/portal/tasks";
import { TASK_COLUMNS, type Task } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string; projectId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { workspace, projectId } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  // Go through getProject so an internal project's tasks aren't readable by a
  // client who can't see the project itself.
  const project = await getProject(access.workspace.id, projectId, access.membership.role);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tasks = await listTasks(access.workspace.id, projectId, access.membership.role);
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { workspace, projectId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: {
    title?: string;
    description?: string;
    column?: Task["column"];
    assigneeUid?: string;
    dueAt?: string;
    visibility?: Task["visibility"];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "A task title is required." }, { status: 400 });
  }

  if (body.column !== undefined && !TASK_COLUMNS.includes(body.column)) {
    return NextResponse.json({ error: "Unknown column." }, { status: 400 });
  }

  if (body.visibility !== undefined && !["client", "internal"].includes(body.visibility)) {
    return NextResponse.json({ error: "Unknown visibility." }, { status: 400 });
  }

  const project = await getProject(access.workspace.id, projectId, access.membership.role);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await createTask(access.workspace.id, projectId, {
    title,
    description: body.description,
    column: body.column,
    assigneeUid: body.assigneeUid,
    dueAt: body.dueAt,
    visibility: body.visibility,
  });

  return NextResponse.json({ task }, { status: 201 });
}
