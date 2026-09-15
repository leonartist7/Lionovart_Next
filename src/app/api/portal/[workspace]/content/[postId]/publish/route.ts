import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { getPost, markPublished, mediaForPost } from "@/lib/portal/posts";
import { getSocialPublisher } from "@/lib/portal/providers/social";
import { isPlatform } from "@/lib/portal/platforms";
import type { Platform } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string; postId: string }> };

/**
 * POST — record that a post went out.
 *
 * Runs the publisher's real validation first, so "mark as posted" can't be
 * used to record something the platform would have rejected. `ManualPublisher`
 * needs the studio to have actually posted it by hand; the confirmation is
 * what this endpoint records, and the result is append-only per platform.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace, postId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: { platforms?: unknown; urls?: unknown; confirmed?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.confirmed !== true) {
    return NextResponse.json(
      { error: "Confirm the post actually went out before recording it." },
      { status: 400 },
    );
  }

  const post = await getPost(access.workspace.id, postId, access.membership.role);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (post.state !== "approved" && post.state !== "scheduled" && post.state !== "published") {
    return NextResponse.json(
      { error: "Only an approved post can be marked as posted." },
      { status: 409 },
    );
  }

  const platforms = (Array.isArray(body.platforms) ? body.platforms.map(String) : []).filter(
    isPlatform,
  );
  const rawUrls = (body.urls ?? {}) as Record<string, unknown>;
  const urls: Partial<Record<Platform, string>> = {};
  for (const [key, value] of Object.entries(rawUrls)) {
    if (isPlatform(key) && typeof value === "string") urls[key] = value;
  }

  const publisher = getSocialPublisher();
  const media = await mediaForPost(access.workspace.id, post);
  const outcome = await publisher.publish({
    post,
    media,
    platforms: platforms.length > 0 ? platforms : post.platforms,
    urls,
    actorUid: access.session.uid,
  });

  if (!outcome.ok) {
    return NextResponse.json(
      { error: outcome.error, validation: outcome.validation },
      { status: outcome.validation ? 422 : 400 },
    );
  }

  const result = await markPublished(access.workspace.id, postId, outcome.results);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ post: result.post });
}
