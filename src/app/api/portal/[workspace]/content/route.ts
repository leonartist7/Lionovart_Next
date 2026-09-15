import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { createPost, listPosts } from "@/lib/portal/posts";

type Params = { params: Promise<{ workspace: string }> };

/**
 * GET — the pipeline. Everyone in the workspace can read it; `listPosts`
 * drops ideas and drafts for anyone below agency in the data layer.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const posts = await listPosts(access.workspace.id, access.membership.role);
  return NextResponse.json({ posts });
}

/** POST — start an idea or a draft. Agency only; clients don't author content. */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await createPost(access.workspace.id, {
    caption: typeof body.caption === "string" ? body.caption : undefined,
    hashtags: Array.isArray(body.hashtags) ? body.hashtags.map(String) : undefined,
    platforms: Array.isArray(body.platforms) ? body.platforms.map(String) : undefined,
    assetIds: Array.isArray(body.assetIds) ? body.assetIds.map(String) : undefined,
    scheduledFor: typeof body.scheduledFor === "string" ? body.scheduledFor : undefined,
    timezone: typeof body.timezone === "string" ? body.timezone : undefined,
    state: body.state === "draft" ? "draft" : "idea",
    createdBy: access.session.uid,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ post: result.post }, { status: 201 });
}
