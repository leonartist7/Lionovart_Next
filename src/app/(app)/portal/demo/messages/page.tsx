import type { Metadata } from "next";
import { DemoShell } from "@/components/portal/DemoShell";
import { ChatThread } from "@/components/portal/ChatThread";
import { demoMessages, resolveDemoView } from "@/lib/portal/demo-data";

export const metadata: Metadata = {
  title: "Messages · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const view = resolveDemoView((await searchParams).view);

  return (
    <DemoShell view={view} path="/portal/demo/messages">
      <div className="py-2 md:py-4">
        <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
          Messages
        </h1>
        <div className="mt-7">
          <ChatThread
            workspaceSlug="demo"
            initialMessages={demoMessages()}
            currentUid={view === "studio" ? "demo-agency" : "demo-client"}
            canSend
            whatsappConnected
            demo
          />
        </div>
      </div>
    </DemoShell>
  );
}
