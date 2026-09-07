import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { createProject, listProjects, PROJECT_KINDS } from "@/lib/portal/projects";
import type { ProjectKind } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string }> };

/** GET — projects visible to the caller. Internal ones are filtered server-side. */
export async function GET(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const projects = await listProjects(access.workspace.id, access.membership.role);
  return NextResponse.json({ projects });
}

/** POST — create a project. Agency only; clients never author their own work. */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: {
    name?: string;
    kind?: string;
    status?: string;
    startAt?: string;
    dueAt?: string;
    visibility?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "A project name is required." }, { status: 400 });
  }

  const kind = (body.kind ?? "brand") as ProjectKind;
  if (!PROJECT_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Unknown project type." }, { status: 400 });
  }

  const project = await createProject(access.workspace.id, {
    name,
    kind,
    status: body.status as never,
    startAt: body.startAt,
    dueAt: body.dueAt,
    visibility: body.visibility === "internal" ? "internal" : "client",
  });

  return NextResponse.json({ project }, { status: 201 });
}
