import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DemoShell } from "@/components/portal/DemoShell";
import { PlatformPreview } from "@/components/portal/PlatformPreview";
import { demoPost, demoPostMedia, resolveDemoView } from "@/lib/portal/demo-data";
import { POST_STATE_LABELS, PLATFORM_SPECS, validatePost } from "@/lib/portal/platforms";

export const metadata: Metadata = {
  title: "Post · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Read-only on purpose. The composer writes, and the demo never touches
 * Firestore — a composer that silently discarded what you typed would teach
 * the wrong thing about the product. The previews are the part worth showing
 * anyway.
 */
export default async function DemoPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { postId } = await params;
  const { view: viewParam } = await searchParams;
  const view = resolveDemoView(viewParam);

  // A client view 404s on a draft, exactly as the real page does.
  const post = demoPost(view, postId);
  if (!post) notFound();

  const media = demoPostMedia(post);
  const validation = validatePost(post, media);
  const meta = POST_STATE_LABELS[post.state];

  return (
    <DemoShell view={view} path={`/portal/demo/content/${postId}`}>
      <div className="py-2 md:py-4">
        <Link
          href="/portal/demo/content"
          className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-1.5 text-sm focus-visible:ring-3 focus-visible:ring-primary/50 focus-visible:outline-none"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Content
        </Link>

        <h1 className="font-heading text-foreground mt-2 text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
          {post.caption.split("\n")[0]}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={meta.badge}>{view === "studio" ? meta.label : meta.clientLabel}</Badge>
          {post.platforms.map((platform) => (
            <Badge key={platform} variant="outline">
              {PLATFORM_SPECS[platform].label}
            </Badge>
          ))}
        </div>

        <div className="mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
          {validation.perPlatform.map((v) => (
            <PlatformPreview key={v.platform} validation={v} media={media} />
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
