import type { Metadata } from "next";
import { DemoShell } from "@/components/portal/DemoShell";
import { CalendarAgenda } from "@/components/portal/CalendarAgenda";
import { CalendarMonthGrid } from "@/components/portal/CalendarMonthGrid";
import { deriveCalendarItems } from "@/lib/portal/calendar";
import { demoProjects, resolveDemoView } from "@/lib/portal/demo-data";

export const metadata: Metadata = {
  title: "Calendar · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; month?: string }>;
}) {
  const { view: viewParam, month } = await searchParams;
  const view = resolveDemoView(viewParam);
  const items = deriveCalendarItems(demoProjects(view));

  return (
    <DemoShell view={view} path="/portal/demo/calendar">
      <div className="py-2 md:py-4">
        <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
          Calendar
        </h1>
        <div className="mt-7">
          <div className="md:hidden">
            <CalendarAgenda items={items} workspaceSlug="demo" />
          </div>
          <div className="hidden md:block">
            <CalendarMonthGrid items={items} workspaceSlug="demo" month={month} />
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
