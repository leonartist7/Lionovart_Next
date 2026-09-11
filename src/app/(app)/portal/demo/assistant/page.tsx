import type { Metadata } from "next";
import { DemoShell } from "@/components/portal/DemoShell";
import { AssistantPanel } from "@/components/portal/AssistantPanel";
import { resolveDemoView } from "@/lib/portal/demo-data";

export const metadata: Metadata = {
  title: "Assistant · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoAssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const view = resolveDemoView((await searchParams).view);

  return (
    <DemoShell view={view} path="/portal/demo/assistant">
      <div className="py-2 md:py-4">
        <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
          Assistant
        </h1>
        <div className="mt-7">
          <AssistantPanel workspaceSlug="demo" demo />
        </div>
      </div>
    </DemoShell>
  );
}
