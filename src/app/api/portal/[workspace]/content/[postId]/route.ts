import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import {
  deletePost,
  getPost,
  transitionPost,
  updatePost,
  validateStoredPost,
} from "@/lib/portal/posts";
import type { PostState } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string; postId: string }> };

const STATES: PostState[] = [
  "idea",
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "rejected",
];

/** GET — one post, with its live validation. 404s for a client on a draft. */
export async function GET(req: NextRequest, { params }: Params) {
  const { workspace, postId } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const post = await getPost(access.workspace.id, postId, access.membership.role);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const validation = await validateStoredPost(access.workspace.id, post);
  return NextResponse.json({ post, validation });
}

/**
 * PATCH — edit the content, or take an agency-owned edge of the state machine.
 *
 * Agency only, including the state change: the client's single lever on a post
 * is their decision in Approvals, and `transitionPost` refuses the
 * approval-owned edges regardless of who is asking.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { workspace, postId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.state === "string") {
    const state = body.state as PostState;
    if (!STATES.includes(state)) {
      return NextResponse.json({ error: "Unknown state." }, { status: 400 });
    }
    const moved = await transitionPost(access.workspace.id, postId, state);
    if ("error" in moved) {
      return NextResponse.json({ error: moved.error }, { status: moved.status });
    }
    return NextResponse.json({ post: moved.post });
  }

  const result = await updatePost(access.workspace.id, postId, {
    caption: typeof body.caption === "string" ? body.caption : undefined,
    hashtags: Array.isArray(body.hashtags) ? body.hashtags.map(String) : undefined,
    platforms: Array.isArray(body.platforms) ? body.platforms.map(String) : undefined,
    assetIds: Array.isArray(body.assetIds) ? body.assetIds.map(String) : undefined,
    scheduledFor:
      body.scheduledFor === null
        ? null
        : typeof body.scheduledFor === "string"
          ? body.scheduledFor
          : undefined,
    timezone: typeof body.timezone === "string" ? body.timezone : undefined,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const validation = await validateStoredPost(access.workspace.id, result.post);
  return NextResponse.json({ post: result.post, validation });
}

/** DELETE — agency only, and never a published post. */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspace, postId } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  const failure = await deletePost(access.workspace.id, postId);
  if (failure) return NextResponse.json({ error: failure.error }, { status: failure.status });
  return NextResponse.json({ ok: true });
}
