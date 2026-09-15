import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarHref, type CalendarItem } from "@/lib/portal/calendar";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parses "YYYY-MM", defaulting to the current month on anything else. */
function parseMonth(value: string | undefined): { year: number; month: number } {
  const match = value?.match(/^(\d{4})-(\d{2})$/);
  if (match) return { year: Number(match[1]), month: Number(match[2]) - 1 };
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function monthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/** Desktop: a full month grid. Read-only — dragging a date is a later phase. */
export function CalendarMonthGrid({
  items,
  workspaceSlug,
  month,
}: {
  items: CalendarItem[];
  workspaceSlug: string;
  month?: string;
}) {
  const { year, month: monthIndex } = parseMonth(month);

  const itemsByDay = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const key = dayKey(new Date(item.date));
    const existing = itemsByDay.get(key);
    if (existing) existing.push(item);
    else itemsByDay.set(key, [item]);
  }

  const firstOfMonth = new Date(year, monthIndex, 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());

  const days: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const today = dayKey(new Date());
  const prev = monthIndex === 0 ? { year: year - 1, month: 11 } : { year, month: monthIndex - 1 };
  const next = monthIndex === 11 ? { year: year + 1, month: 0 } : { year, month: monthIndex + 1 };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-foreground text-lg font-semibold">
          {MONTH_NAMES[monthIndex]} {year}
        </h2>
        <div className="flex gap-1">
          <Link
            href={`/portal/${workspaceSlug}/calendar?month=${monthParam(prev.year, prev.month)}`}
            aria-label="Previous month"
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-primary/50 grid size-8 place-items-center rounded-lg transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </Link>
          <Link
            href={`/portal/${workspaceSlug}/calendar?month=${monthParam(next.year, next.month)}`}
            aria-label="Next month"
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-primary/50 grid size-8 place-items-center rounded-lg transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-muted-foreground pb-2 text-center text-xs font-medium">
            {w}
          </div>
        ))}
        {days.map((d) => {
          const key = dayKey(d);
          const dayItems = itemsByDay.get(key) ?? [];
          const inMonth = d.getMonth() === monthIndex;
          const isToday = key === today;
          return (
            <div
              key={key}
              className={cn(
                "border-border min-h-[6.5rem] border p-1.5",
                !inMonth && "bg-muted/30",
              )}
            >
              <span
                className={cn(
                  "tabular-nums text-xs",
                  isToday
                    ? "bg-primary text-primary-foreground inline-flex size-5 items-center justify-center rounded-full font-medium"
                    : inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/50",
                )}
              >
                {d.getDate()}
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayItems.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    href={calendarHref(item, workspaceSlug)}
                    title={item.title}
                    className="bg-primary/10 text-primary hover:bg-primary/20 truncate rounded px-1 py-0.5 text-[11px] transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
                {dayItems.length > 2 && (
                  <span className="text-muted-foreground px-1 text-[11px]">
                    +{dayItems.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
