import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AgencyOnly } from "@/components/portal/AgencyOnly";
import { PlatformPreview } from "@/components/portal/PlatformPreview";
import { PostComposer, type ComposerAsset } from "@/components/portal/PostComposer";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { listDecisionsFor } from "@/lib/portal/approvals";
import { listAssetsWithVersions, signReadUrl } from "@/lib/portal/assets";
import { formatDate, relativeDate } from "@/lib/portal/format";
import { POST_STATE_LABELS, PLATFORM_SPECS } from "@/lib/portal/platforms";
import { getPost, mediaForPost, postSummary, validateStoredPost } from "@/lib/portal/posts";
import { roleAtLeast } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Post" };
export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ workspace: string; postId: string }>;
}) {
  const { workspace: slug, postId } = await params;
  const cookieStore = await cookies();

  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) notFound();

  const isAgency = roleAtLeast(access.membership.role, "agency");

  // `getPost` returns null for a client looking at an idea or a draft, which
  // lands here as a 404 — a 403 would confirm the draft exists.
  const post = await getPost(access.workspace.id, postId, access.membership.role);
  if (!post) notFound();

  const [validation, attachedMedia, decisions] = await Promise.all([
    validateStoredPost(access.workspace.id, post),
    mediaForPost(access.workspace.id, post),
    listDecisionsFor(access.workspace.id, "post", post.id),
  ]);

  const withVersions = await listAssetsWithVersions(access.workspace.id);
  const thumbnails = new Map(
    await Promise.all(
      withVersions.map(
        async (a) =>
          [
            a.id,
            a.kind === "image" && a.version ? await signReadUrl(a.version.storagePath) : null,
          ] as const,
      ),
    ),
  );

  const previewMedia = attachedMedia.map((m) => ({
    assetId: m.assetId,
    name: m.name,
    thumbnailUrl: thumbnails.get(m.assetId) ?? null,
  }));

  // Only the studio picks attachments, so this list is built inside the agency
  // branch and never serialised into a client's response.
  const composerAssets: ComposerAsset[] = isAgency
    ? withVersions
        .filter((a) => a.kind === "image")
        .map((a) => ({
          assetId: a.id,
          name: a.name,
          kind: a.kind,
          width: a.version?.width,
          height: a.version?.height,
          thumbnailUrl: thumbnails.get(a.id) ?? null,
        }))
    : [];

  const meta = POST_STATE_LABELS[post.state];
  const latestDecision = decisions[0];

  return (
    <div className="py-2 md:py-4">
      <Link
        href={`/portal/${slug}/content`}
        className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-1.5 text-sm focus-visible:ring-3 focus-visible:ring-primary/50 focus-visible:outline-none"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Content
      </Link>

      <h1 className="font-heading text-foreground mt-2 text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
        {postSummary(post)}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={meta.badge}>{isAgency ? meta.label : meta.clientLabel}</Badge>
        {post.platforms.map((platform) => (
          <Badge key={platform} variant="outline">
            {PLATFORM_SPECS[platform].label}
          </Badge>
        ))}
        {post.scheduledFor && (
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatDate(post.scheduledFor)} · {relativeDate(post.scheduledFor)}
          </span>
        )}
      </div>

      {latestDecision?.note && (
        <div className="border-border mt-6 max-w-xl rounded-2xl border p-5">
          <h2 className="text-muted-foreground text-sm font-medium">
            {latestDecision.state === "approved" ? "Approved with a note" : "Changes requested"}
          </h2>
          <p className="text-foreground mt-2 text-[15px] leading-relaxed">{latestDecision.note}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            {relativeDate(latestDecision.decidedAt)}
          </p>
        </div>
      )}

      {post.state === "in_review" && !isAgency && (
        <p className="text-muted-foreground mt-6 max-w-xl text-[15px] leading-relaxed">
          This is waiting on you.{" "}
          <Link href={`/portal/${slug}/approvals`} className="text-primary underline underline-offset-4">
            Decide in Approvals
          </Link>
          .
        </p>
      )}

      <div className="max-w-5xl">
        <AgencyOnly>
          <PostComposer workspaceSlug={slug} post={post} assets={composerAssets} />
        </AgencyOnly>

        {!isAgency && (
          <section className="mt-8">
            <h2 className="text-muted-foreground mb-3 text-sm font-medium">How it will look</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {validation.perPlatform.map((v) => (
                <PlatformPreview key={v.platform} validation={v} media={previewMedia} />
              ))}
            </div>
          </section>
        )}

        {post.publishResults && (
          <section className="mt-8 max-w-xl">
            <h2 className="text-muted-foreground mb-3 text-sm font-medium">Where it went</h2>
            <ul className="flex flex-col gap-2">
              {Object.entries(post.publishResults).map(([platform, result]) => (
                <li
                  key={platform}
                  className="border-border flex items-center justify-between gap-3 rounded-xl border p-4"
                >
                  <span className="text-foreground text-sm font-medium">
                    {PLATFORM_SPECS[platform as keyof typeof PLATFORM_SPECS].label}
                  </span>
                  {result?.url ? (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs underline underline-offset-4"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {result?.at ? relativeDate(result.at) : result?.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
