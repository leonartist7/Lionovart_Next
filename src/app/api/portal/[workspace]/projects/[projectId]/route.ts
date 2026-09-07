import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import {
  deleteProject,
  getProject,
  PROJECT_KINDS,
  PROJECT_STATUSES,
  updateProject,
} from "@/lib/portal/projects";
import type { Project, ProjectKind } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string; projectId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { workspace, projectId } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const project = await getProject(access.workspace.id, projectId, access.membership.role);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ project });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { workspace, projectId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.kind !== undefined && !PROJECT_KINDS.includes(body.kind as ProjectKind)) {
    return NextResponse.json({ error: "Unknown project type." }, { status: 400 });
  }
  if (body.status !== undefined && !PROJECT_STATUSES.includes(body.status as Project["status"])) {
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  if (name !== undefined && !name) {
    return NextResponse.json({ error: "A project name is required." }, { status: 400 });
  }

  await updateProject(access.workspace.id, projectId, {
    name,
    kind: body.kind as ProjectKind | undefined,
    status: body.status as Project["status"] | undefined,
    startAt: body.startAt as string | undefined,
    dueAt: body.dueAt as string | undefined,
    visibility: body.visibility === "internal" ? "internal" : undefined,
  });

  const project = await getProject(access.workspace.id, projectId, access.membership.role);
  return NextResponse.json({ project });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspace, projectId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  await deleteProject(access.workspace.id, projectId);
  return NextResponse.json({ ok: true });
}
