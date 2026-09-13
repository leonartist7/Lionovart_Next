import type { Metadata } from "next";
import { DemoShell } from "@/components/portal/DemoShell";
import { ApprovalCard } from "@/components/portal/ApprovalCard";
import { DemoRequestApproval } from "@/components/portal/DemoRequestApproval";
import { demoApprovals, resolveDemoView } from "@/lib/portal/demo-data";

export const metadata: Metadata = {
  title: "Approvals · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const view = resolveDemoView((await searchParams).view);
  const approvals = demoApprovals();

  return (
    <DemoShell view={view} path="/portal/demo/approvals">
      <div className="py-2 md:py-4">
        <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
          Approvals
        </h1>

        {approvals.length === 0 ? (
          <div className="mt-8 max-w-xl">
            <p className="text-muted-foreground text-[15px] leading-relaxed">
              Nothing needs you right now.
            </p>
            {view === "studio" && <DemoRequestApproval />}
          </div>
        ) : (
          <div className="mt-7 max-w-xl">
            <ul className="flex flex-col gap-3">
              {approvals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  workspaceSlug="demo"
                  canDecide
                  demo
                />
              ))}
            </ul>
            {view === "studio" && <DemoRequestApproval />}
          </div>
        )}
      </div>
    </DemoShell>
  );
}
