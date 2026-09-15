import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { createApproval } from "@/lib/portal/approvals";
import { listAssetsWithVersions } from "@/lib/portal/assets";
import { validatePost, type MediaInfo, type PostValidation } from "@/lib/portal/platforms";
export { CLIENT_VISIBLE_STATES } from "@/lib/portal/platforms";
import { CLIENT_VISIBLE_STATES, isPlatform } from "@/lib/portal/platforms";
import { roleAtLeast, type Platform, type PortalRole, type Post, type PostState, type PublishResult } from "@/lib/portal/types";

/**
 * Post reads/writes and the state machine.
 *
 * Three rules are load-bearing, and all three are enforced here rather than in
 * a route or a form, because there is more than one caller:
 *
 * 1. **A client never sees an idea or a draft.** Filtered in the data layer,
 *    the same way `internal` projects are — absent, not hidden, and a direct
 *    URL 404s rather than 403s.
 * 2. **`in_review → approved | rejected` cannot be written from here.** It is
 *    reachable only through `applyApprovalDecision`, which the approvals route
 *    calls after the real `decideApproval` has run. There is exactly one
 *    approval flow in this codebase and this module is not it.
 * 3. **`published` is terminal and append-only.** No transition out, no edit,
 *    and `publishResults` merge — a platform that already published is never
 *    un-published by a later write.
 */

/** Every legal edge, and who is allowed to take it. The full truth of the machine. */
export const POST_TRANSITIONS: Record<PostState, Partial<Record<PostState, "agency" | "approval" | "publisher">>> = {
  idea: { draft: "agency" },
  // draft → in_review runs through `submitForReview`, never a bare transition:
  // validation and the approval row have to land together or a post can sit in
  // review with nothing in the client's queue.
  draft: { in_review: "agency" },
  in_review: { approved: "approval", rejected: "approval" },
  approved: { scheduled: "agency", draft: "agency", published: "publisher" },
  scheduled: { approved: "agency", published: "publisher" },
  rejected: { draft: "agency" },
  published: {},
};

/** States whose *content* may still be edited. */
export const EDITABLE_STATES: PostState[] = ["idea", "draft", "rejected"];

/**
 * States whose *schedule* may still be changed.
 *
 * Deliberately wider than `EDITABLE_STATES`: the client approved a caption, a
 * set of platforms and an image — not a send time. Moving an approved post
 * from Tuesday to Thursday changes nothing they decided on, so it must not
 * cost a fresh approval round. Changing a word of the caption must.
 */
export const SCHEDULABLE_STATES: PostState[] = [
  "idea",
  "draft",
  "rejected",
  "approved",
  "scheduled",
];

export function canTransition(from: PostState, to: PostState): boolean {
  return Boolean(POST_TRANSITIONS[from][to]);
}

export function transitionOwner(from: PostState, to: PostState): "agency" | "approval" | "publisher" | null {
  return POST_TRANSITIONS[from][to] ?? null;
}

export type PostResult = { post: Post } | { error: string; status: number };

function postsRef(workspaceId: string) {
  if (!adminDb) throw new Error("Firestore is not configured");
  return adminDb.collection("workspaces").doc(workspaceId).collection("posts");
}

function toPost(doc: FirebaseFirestore.DocumentSnapshot): Post {
  const data = doc.data() ?? {};
  return {
    id: doc.id,
    ...data,
    // Firestore stores absent optionals as null; the type says `undefined`.
    scheduledFor: data.scheduledFor ?? undefined,
    timezone: data.timezone ?? undefined,
  } as Post;
}

/* ── Reads ───────────────────────────────────────────────────────── */

export async function listPosts(workspaceId: string, viewerRole: PortalRole): Promise<Post[]> {
  if (!adminDb) return [];
  const snap = await postsRef(workspaceId).orderBy("createdAt", "desc").get();
  const canSeeEverything = roleAtLeast(viewerRole, "agency");
  return snap.docs
    .map(toPost)
    .filter((p) => canSeeEverything || CLIENT_VISIBLE_STATES.includes(p.state));
}

export async function getPost(
  workspaceId: string,
  postId: string,
  viewerRole: PortalRole,
): Promise<Post | null> {
  if (!adminDb) return null;
  const doc = await postsRef(workspaceId).doc(postId).get();
  if (!doc.exists) return null;
  const post = toPost(doc);
  if (!roleAtLeast(viewerRole, "agency") && !CLIENT_VISIBLE_STATES.includes(post.state)) {
    return null; // 404, not 403 — a 403 confirms the draft exists.
  }
  return post;
}

/** One line of a post, for a queue row or a calendar entry. */
export function postSummary(post: Post): string {
  const first = post.caption.trim().split("\n")[0] ?? "";
  if (!first) return "Untitled post";
  return first.length > 70 ? `${first.slice(0, 69)}…` : first;
}

/**
 * Resolves the attachments a post claims into what the validator can actually
 * check. An id that no longer resolves is dropped, so a deleted asset shows up
 * as "no image" rather than silently passing a `requiresMedia` check.
 */
export async function mediaForPost(workspaceId: string, post: Pick<Post, "assetIds">): Promise<MediaInfo[]> {
  if (post.assetIds.length === 0) return [];
  const assets = await listAssetsWithVersions(workspaceId);
  const byId = new Map(assets.map((a) => [a.id, a]));
  return post.assetIds.flatMap((id) => {
    const asset = byId.get(id);
    if (!asset) return [];
    return [{
      assetId: asset.id,
      name: asset.name,
      kind: asset.kind,
      width: asset.version?.width,
      height: asset.version?.height,
    } satisfies MediaInfo];
  });
}

export async function validateStoredPost(workspaceId: string, post: Post): Promise<PostValidation> {
  return validatePost(post, await mediaForPost(workspaceId, post));
}

/* ── Writes ──────────────────────────────────────────────────────── */

export interface CreatePostInput {
  caption?: string;
  hashtags?: string[];
  platforms?: string[];
  assetIds?: string[];
  scheduledFor?: string;
  timezone?: string;
  /** A post starts as an `idea` unless the studio is already drafting one. */
  state?: PostState;
  createdBy: string;
}

function cleanPlatforms(raw: readonly string[] | undefined): Platform[] {
  return [...new Set((raw ?? []).filter(isPlatform))];
}

export async function createPost(workspaceId: string, input: CreatePostInput): Promise<PostResult> {
  const state = input.state ?? "idea";
  if (state !== "idea" && state !== "draft") {
    return { error: "A post starts as an idea or a draft.", status: 400 };
  }

  const now = new Date().toISOString();
  const doc = {
    caption: input.caption?.trim() ?? "",
    hashtags: input.hashtags ?? [],
    platforms: cleanPlatforms(input.platforms),
    assetIds: input.assetIds ?? [],
    scheduledFor: input.scheduledFor ?? null,
    timezone: input.timezone ?? null,
    state,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await postsRef(workspaceId).add(doc);
  return { post: toPost(await ref.get()) };
}

export interface UpdatePostInput {
  caption?: string;
  hashtags?: string[];
  platforms?: string[];
  assetIds?: string[];
  scheduledFor?: string | null;
  timezone?: string;
}

/**
 * Edits the content of a post.
 *
 * Only legal in `idea`, `draft` and `rejected`. Editing something that is
 * already in review would change what the client is deciding on while they
 * are deciding on it, and editing something approved would mean the thing
 * that ships is not the thing that was approved. Both are silent failures of
 * the kind this portal's whole approval story exists to prevent — so the
 * studio has to pull the post back to `draft` first, which re-runs approval.
 */
export async function updatePost(
  workspaceId: string,
  postId: string,
  patch: UpdatePostInput,
): Promise<PostResult> {
  const ref = postsRef(workspaceId).doc(postId);
  const doc = await ref.get();
  if (!doc.exists) return { error: "Not found", status: 404 };

  const post = toPost(doc);
  if (post.state === "published") {
    return { error: "A published post is a record of what went out — it can't be edited.", status: 409 };
  }

  const touchesContent =
    patch.caption !== undefined ||
    patch.hashtags !== undefined ||
    patch.platforms !== undefined ||
    patch.assetIds !== undefined;

  if (touchesContent && !EDITABLE_STATES.includes(post.state)) {
    return {
      error: `A post in ${post.state.replace("_", " ")} can't be edited. Move it back to draft first.`,
      status: 409,
    };
  }

  const touchesSchedule = patch.scheduledFor !== undefined || patch.timezone !== undefined;
  if (touchesSchedule && !SCHEDULABLE_STATES.includes(post.state)) {
    return {
      error: `A post in ${post.state.replace("_", " ")} can't be rescheduled.`,
      status: 409,
    };
  }

  const clean: Record<string, unknown> = {};
  if (patch.caption !== undefined) clean.caption = patch.caption.trim();
  if (patch.hashtags !== undefined) clean.hashtags = patch.hashtags;
  if (patch.platforms !== undefined) clean.platforms = cleanPlatforms(patch.platforms);
  if (patch.assetIds !== undefined) clean.assetIds = patch.assetIds;
  if (patch.scheduledFor !== undefined) clean.scheduledFor = patch.scheduledFor;
  if (patch.timezone !== undefined) clean.timezone = patch.timezone;

  if (Object.keys(clean).length === 0) return { post };

  clean.updatedAt = new Date().toISOString();
  await ref.update(clean);
  return { post: toPost(await ref.get()) };
}

/**
 * The agency-driven edges of the machine.
 *
 * Refuses the approval- and publisher-owned edges by name rather than with a
 * generic "not allowed", so the caller is pointed at the one real flow instead
 * of concluding a second one is needed.
 */
export async function transitionPost(
  workspaceId: string,
  postId: string,
  to: PostState,
): Promise<PostResult> {
  const ref = postsRef(workspaceId).doc(postId);
  const doc = await ref.get();
  if (!doc.exists) return { error: "Not found", status: 404 };

  const post = toPost(doc);
  if (post.state === "published") {
    return { error: "A published post is final.", status: 409 };
  }

  const owner = transitionOwner(post.state, to);
  if (!owner) {
    return { error: `A post can't go from ${post.state.replace("_", " ")} to ${to.replace("_", " ")}.`, status: 409 };
  }
  if (owner === "approval") {
    return { error: "That decision is the client's, through Approvals.", status: 409 };
  }
  if (owner === "publisher") {
    return { error: "Marking a post published goes through publish, so it's validated first.", status: 409 };
  }
  if (to === "in_review") {
    return { error: "Send a post for review through submit, so it's validated first.", status: 409 };
  }

  if (to === "scheduled") {
    if (!post.scheduledFor) {
      return { error: "Set a date and time before scheduling.", status: 400 };
    }
    if (Date.parse(post.scheduledFor) <= Date.now()) {
      return { error: "That time has already passed.", status: 400 };
    }
  }

  await ref.update({ state: to, updatedAt: new Date().toISOString() });
  return { post: toPost(await ref.get()) };
}

export type SubmitResult =
  | { post: Post; approvalId: string }
  | { error: string; status: number; validation?: PostValidation };

/**
 * draft → in_review, and the only way in.
 *
 * Validates for real first: "validate before it reaches the client, so they
 * never approve something that can't actually post" is the page's whole
 * premise, and a client cannot see a post at all until it is in review — so
 * this call is the exact boundary that promise lives on.
 *
 * The approval row is created through `createApproval`, the same primitive the
 * Approvals queue already runs on, with `targetType: "post"`.
 */
export async function submitForReview(
  workspaceId: string,
  postId: string,
  requestedBy: string,
): Promise<SubmitResult> {
  const ref = postsRef(workspaceId).doc(postId);
  const doc = await ref.get();
  if (!doc.exists) return { error: "Not found", status: 404 };

  const post = toPost(doc);
  if (post.state !== "draft") {
    return {
      error:
        post.state === "idea"
          ? "Turn the idea into a draft first."
          : `A post in ${post.state.replace("_", " ")} can't be sent for review.`,
      status: 409,
    };
  }

  const validation = await validateStoredPost(workspaceId, post);
  if (!validation.ok) {
    return { error: "This can't post as written — fix the errors first.", status: 422, validation };
  }

  const approval = await createApproval(workspaceId, {
    targetType: "post",
    targetId: postId,
    requestedBy,
  });
  await ref.update({ state: "in_review", updatedAt: new Date().toISOString() });
  return { post: toPost(await ref.get()), approvalId: approval.id };
}

/**
 * in_review → approved | rejected, applied from a decision the real Approvals
 * primitive has already recorded.
 *
 * Called by the approvals route after `decideApproval` returns, and by nothing
 * else. It deliberately takes the decision as an argument rather than reading
 * or writing the approvals collection itself: the decision, its author, its
 * timestamp and its note live in exactly one place, and this only mirrors the
 * resulting state onto the post.
 */
export async function applyApprovalDecision(
  workspaceId: string,
  postId: string,
  decision: "approved" | "changes_requested",
): Promise<void> {
  if (!adminDb) return;
  const ref = postsRef(workspaceId).doc(postId);
  const doc = await ref.get();
  if (!doc.exists) return;

  const post = toPost(doc);
  if (post.state !== "in_review") return; // already moved on — never rewrite a later state

  await ref.update({
    state: decision === "approved" ? "approved" : "rejected",
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Records that a post went out.
 *
 * Append-only in the literal sense: results merge per platform, and a platform
 * already marked `published` keeps its original record — a second call can add
 * a platform, never rewrite one. "What went out, where, and when" is the
 * question that matters a year later.
 */
export async function markPublished(
  workspaceId: string,
  postId: string,
  results: Partial<Record<Platform, PublishResult>>,
): Promise<PostResult> {
  const ref = postsRef(workspaceId).doc(postId);
  const doc = await ref.get();
  if (!doc.exists) return { error: "Not found", status: 404 };

  const post = toPost(doc);
  const existing = post.publishResults ?? {};
  const merged: Partial<Record<Platform, PublishResult>> = { ...existing };
  for (const [platform, result] of Object.entries(results) as [Platform, PublishResult][]) {
    if (existing[platform]?.status === "published") continue; // never overwrite a real publish
    merged[platform] = result;
  }

  const anyPublished = Object.values(merged).some((r) => r?.status === "published");
  await ref.update({
    publishResults: merged,
    ...(anyPublished ? { state: "published" as PostState } : {}),
    updatedAt: new Date().toISOString(),
  });
  return { post: toPost(await ref.get()) };
}

export async function deletePost(workspaceId: string, postId: string): Promise<{ error: string; status: number } | null> {
  const ref = postsRef(workspaceId).doc(postId);
  const doc = await ref.get();
  if (!doc.exists) return { error: "Not found", status: 404 };
  if (toPost(doc).state === "published") {
    return { error: "A published post is a record of what went out — it stays.", status: 409 };
  }
  await ref.delete();
  return null;
}
