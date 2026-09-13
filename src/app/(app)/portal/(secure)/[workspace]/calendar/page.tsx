import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CalendarAgenda } from "@/components/portal/CalendarAgenda";
import { CalendarMonthGrid } from "@/components/portal/CalendarMonthGrid";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { listCalendarItems } from "@/lib/portal/calendar";

export const metadata: Metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { workspace: slug } = await params;
  const { month } = await searchParams;
  const cookieStore = await cookies();

  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) notFound();

  const items = await listCalendarItems(access.workspace.id, access.membership.role);

  return (
    <div className="py-2 md:py-4">
      <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
        Calendar
      </h1>

      <div className="mt-7">
        {/* Two separate components, shown by breakpoint with CSS — not one
            layout trying to degrade between agenda and grid. */}
        <div className="md:hidden">
          <CalendarAgenda items={items} workspaceSlug={slug} />
        </div>
        <div className="hidden md:block">
          <CalendarMonthGrid items={items} workspaceSlug={slug} month={month} />
        </div>
      </div>
    </div>
  );
}
