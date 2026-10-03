import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { generateIdeas } from "@/lib/portal/content-ai";
import { isPlatform } from "@/lib/portal/platforms";
import { PLATFORMS } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string }> };

/**
 * POST — generate post ideas from this workspace's real state. Agency only:
 * ideas are the studio's raw material, and a client never sees one until it
 * has been drafted and sent for review.
 *
 * Returns ideas; it does not write them. Saving one is an ordinary
 * `POST /content`, so there is one write path for a post, not two.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: { platforms?: unknown; brief?: unknown; count?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const platforms = (Array.isArray(body.platforms) ? body.platforms.map(String) : []).filter(
    isPlatform,
  );
  const count = typeof body.count === "number" ? Math.min(Math.max(body.count, 1), 6) : 4;

  const result = await generateIdeas({
    workspaceId: access.workspace.id,
    workspaceName: access.workspace.name,
    viewerRole: access.membership.role,
    platforms: platforms.length > 0 ? platforms : [...PLATFORMS],
    brief: typeof body.brief === "string" ? body.brief.trim() || undefined : undefined,
    count,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ideas: result.value });
}
