import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  listWorkspacesForSession,
} from "@/lib/portal-auth";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

/**
 * Workspace overview.
 *
 * Phase 1 establishes the frame and the greeting; progress, the awaiting-you
 * queue and the activity feed arrive with the project model in Phase 2, so this
 * currently says plainly that there is nothing yet rather than showing empty
 * chrome that implies data is missing.
 */
export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const cookieStore = await cookies();

  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const current = (await listWorkspacesForSession(session)).find((w) => w.slug === slug);
  if (!current) notFound();

  const firstName = session.name.split(" ")[0];

  return (
    <div className="py-2 md:py-4">
      <header>
        {/* The mobile header already names the workspace — no need to say it twice. */}
        <p className="text-muted-foreground hidden text-[13px] font-medium tracking-[0.16em] uppercase md:block">
          {current.name}
        </p>
        <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em] md:mt-2 md:text-4xl">
          Welcome back, {firstName}.
        </h1>
      </header>

      <section
        aria-labelledby="overview-status"
        className="border-border bg-card mt-8 max-w-xl rounded-2xl border p-6 md:p-8"
      >
        <h2 id="overview-status" className="font-heading text-foreground text-lg font-semibold">
          Nothing to review yet
        </h2>
        <p className="text-muted-foreground mt-2 max-w-prose text-[15px] leading-relaxed">
          Once your first project is underway, this is where you&apos;ll see progress,
          anything waiting on your approval, and the latest activity from the studio.
        </p>
      </section>
    </div>
  );
}
