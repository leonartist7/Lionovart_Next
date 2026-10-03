import type { Metadata } from "next";
import { DemoShell } from "@/components/portal/DemoShell";
import { ContentPipeline } from "@/components/portal/ContentPipeline";
import { demoPosts, resolveDemoView } from "@/lib/portal/demo-data";

export const metadata: Metadata = {
  title: "Content · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoContentPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view = resolveDemoView(viewParam);
  const posts = demoPosts(view);

  return (
    <DemoShell view={view} path="/portal/demo/content">
      <div className="py-2 md:py-4">
        <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
          Content
        </h1>
        <div className="mt-7 max-w-5xl">
          <ContentPipeline
            posts={posts}
            workspaceSlug="demo"
            isAgency={view === "studio"}
            basePath="/portal/demo/content"
          />
        </div>
      </div>
    </DemoShell>
  );
}
