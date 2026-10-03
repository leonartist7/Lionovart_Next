import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AgencyOnly } from "@/components/portal/AgencyOnly";
import { BrandImageGenerator } from "@/components/portal/BrandImageGenerator";
import { ContentPipeline } from "@/components/portal/ContentPipeline";
import { IdeaGenerator } from "@/components/portal/IdeaGenerator";
import { NewPostButton } from "@/components/portal/NewPostButton";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { listPosts } from "@/lib/portal/posts";
import { roleAtLeast } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Content" };
export const dynamic = "force-dynamic";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const cookieStore = await cookies();

  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) notFound();

  const isAgency = roleAtLeast(access.membership.role, "agency");
  // Ideas and drafts are dropped inside `listPosts` for anyone below agency —
  // the client's browser is never sent one to hide.
  const posts = await listPosts(access.workspace.id, access.membership.role);

  return (
    <div className="py-2 md:py-4">
      <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
        Content
      </h1>

      <div className="mt-7 max-w-5xl">
        {posts.length === 0 ? (
          <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed">
            {isAgency
              ? "Nothing in the pipeline yet."
              : "Nothing to look at yet. Posts appear here when the studio sends them for approval."}
          </p>
        ) : (
          <ContentPipeline posts={posts} workspaceSlug={slug} isAgency={isAgency} />
        )}

        <AgencyOnly>
          <div className="mt-8 flex flex-col gap-8">
            <div className="max-w-xl">
              <NewPostButton workspaceSlug={slug} />
            </div>
            <IdeaGenerator workspaceSlug={slug} />
            <BrandImageGenerator workspaceSlug={slug} />
          </div>
        </AgencyOnly>
      </div>
    </div>
  );
}
