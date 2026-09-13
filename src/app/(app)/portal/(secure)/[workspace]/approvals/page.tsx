import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ApprovalCard } from "@/components/portal/ApprovalCard";
import { AgencyOnly } from "@/components/portal/AgencyOnly";
import { RequestApprovalDialog } from "@/components/portal/RequestApprovalDialog";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { listPendingApprovals } from "@/lib/portal/approvals";
import { listAssets } from "@/lib/portal/assets";
import { listProjects } from "@/lib/portal/projects";
import { roleAtLeast } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Approvals" };
export const dynamic = "force-dynamic";

export default async function ApprovalsPage({
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

  const approvals = await listPendingApprovals(access.workspace.id, access.membership.role);
  const canDecide = roleAtLeast(access.membership.role, "approver");
  const canRequest = roleAtLeast(access.membership.role, "agency");

  // Only fetched for the agency's own "request approval" picker — never sent
  // to a client, since the whole block is wrapped in <AgencyOnly>.
  let requestSlot: React.ReactNode = null;
  if (canRequest) {
    const [projects, assets] = await Promise.all([
      listProjects(access.workspace.id, access.membership.role),
      listAssets(access.workspace.id),
    ]);
    requestSlot = (
      <RequestApprovalDialog
        workspaceSlug={slug}
        assets={assets.map((a) => ({ id: a.id, label: a.name }))}
        milestones={projects.flatMap((p) =>
          p.milestones.map((m) => ({ id: m.id, label: `${m.title} — ${p.name}` })),
        )}
      />
    );
  }

  return (
    <div className="py-2 md:py-4">
      <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
        Approvals
      </h1>

      {approvals.length === 0 ? (
        <div className="mt-8 max-w-xl">
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Nothing needs you right now.
          </p>
          <AgencyOnly>{requestSlot}</AgencyOnly>
        </div>
      ) : (
        <div className="mt-7 max-w-xl">
          <ul className="flex flex-col gap-3">
            {approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                workspaceSlug={slug}
                canDecide={canDecide}
              />
            ))}
          </ul>
          <AgencyOnly>{requestSlot}</AgencyOnly>
        </div>
      )}
    </div>
  );
}
