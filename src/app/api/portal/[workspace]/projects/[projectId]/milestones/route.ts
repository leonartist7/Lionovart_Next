import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { createMilestone, getProject, listMilestones } from "@/lib/portal/projects";

type Params = { params: Promise<{ workspace: string; projectId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { workspace, projectId } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  // Go through getProject so an internal project's milestones aren't readable
  // by a client who can't see the project itself.
  const project = await getProject(access.workspace.id, projectId, access.membership.role);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const milestones = await listMilestones(access.workspace.id, projectId);
  return NextResponse.json({ milestones });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { workspace, projectId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: { title?: string; dueAt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "A milestone title is required." }, { status: 400 });
  }

  const project = await getProject(access.workspace.id, projectId, access.membership.role);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const milestone = await createMilestone(access.workspace.id, projectId, {
    title,
    dueAt: body.dueAt,
  });

  return NextResponse.json({ milestone }, { status: 201 });
}
