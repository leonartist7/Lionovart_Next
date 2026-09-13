import Link from "next/link";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import type { CalendarItem } from "@/lib/portal/calendar";
import { groupByDay } from "@/lib/portal/calendar";
import { formatDate } from "@/lib/portal/format";

/** Mobile: a day-grouped list scrolling forward from today. */
export function CalendarAgenda({
  items,
  workspaceSlug,
}: {
  items: CalendarItem[];
  workspaceSlug: string;
}) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcoming = items.filter((i) => Date.parse(i.date) >= startOfToday.getTime());
  const groups = groupByDay(upcoming);

  if (groups.length === 0) {
    return <p className="text-muted-foreground text-[15px] leading-relaxed">Nothing scheduled.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.day}>
          <h2 className="text-muted-foreground mb-2 text-sm font-medium">
            {formatDate(group.items[0].date)}
          </h2>
          <ul className="border-border bg-card divide-border divide-y overflow-hidden rounded-2xl border">
            {group.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/portal/${workspaceSlug}/projects/${item.projectId}`}
                  className="hover:bg-muted/60 focus-visible:ring-primary/50 flex items-center gap-3 p-4 transition-colors focus-visible:ring-3 focus-visible:outline-none focus-visible:-outline-offset-2"
                >
                  <span className="text-muted-foreground shrink-0">
                    {item.kind === "milestone" ? (
                      <CheckCircle2 size={15} aria-hidden="true" />
                    ) : (
                      <CalendarClock size={15} aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">{item.title}</p>
                    {item.kind === "milestone" && (
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {item.projectName}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
