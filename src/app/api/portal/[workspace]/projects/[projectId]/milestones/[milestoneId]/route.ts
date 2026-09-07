import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { deleteMilestone, updateMilestone } from "@/lib/portal/projects";
import type { Milestone } from "@/lib/portal/types";

type Params = {
  params: Promise<{ workspace: string; projectId: string; milestoneId: string }>;
};

const STATUSES: Milestone["status"][] = ["pending", "active", "done"];

export async function PATCH(req: NextRequest, { params }: Params) {
  const { workspace, projectId, milestoneId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.status !== undefined && !STATUSES.includes(body.status as Milestone["status"])) {
    return NextResponse.json({ error: "Unknown milestone status." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  if (title !== undefined && !title) {
    return NextResponse.json({ error: "A milestone title is required." }, { status: 400 });
  }

  await updateMilestone(access.workspace.id, projectId, milestoneId, {
    title,
    status: body.status as Milestone["status"] | undefined,
    dueAt: body.dueAt as string | undefined,
    order: body.order as number | undefined,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspace, projectId, milestoneId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  await deleteMilestone(access.workspace.id, projectId, milestoneId);
  return NextResponse.json({ ok: true });
}
