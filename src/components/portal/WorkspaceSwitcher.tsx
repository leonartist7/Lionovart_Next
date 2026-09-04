"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceOption {
  slug: string;
  name: string;
}

/**
 * Switches between workspaces. Renders as a plain, non-interactive label when
 * there is only one — a dropdown that can only ever pick the thing already
 * selected is noise.
 */
export function WorkspaceSwitcher({
  current,
  workspaces,
  compact = false,
}: {
  current: WorkspaceOption;
  workspaces: WorkspaceOption[];
  compact?: boolean;
}) {
  if (workspaces.length <= 1) {
    return (
      <div className={cn("min-w-0 px-2 py-1.5", compact && "px-0")}>
        <p className="text-foreground truncate text-sm font-medium">{current.name}</p>
      </div>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-left",
          "hover:bg-muted transition-colors duration-150",
          "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
          // The rail trigger fills its column; the mobile one hugs its label so
          // the chevron reads as attached to the name rather than adrift.
          compact ? "max-w-[62vw]" : "w-full gap-2",
        )}
      >
        <span
          className={cn(
            "text-foreground min-w-0 truncate text-sm font-medium",
            !compact && "flex-1",
          )}
        >
          {current.name}
        </span>
        <ChevronsUpDown size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="start" className="z-50">
          <Menu.Popup
            className={cn(
              "border-border bg-popover text-popover-foreground min-w-[220px] rounded-xl border p-1 shadow-lg",
              "origin-[var(--transform-origin)]",
              "data-closed:scale-95 data-closed:opacity-0",
              "data-open:scale-100 data-open:opacity-100",
              "transition-[transform,opacity] duration-150 ease-out",
            )}
          >
            {workspaces.map((ws) => {
              const active = ws.slug === current.slug;
              return (
                <Menu.Item
                  key={ws.slug}
                  className="data-highlighted:bg-muted rounded-lg outline-none"
                  render={
                    <Link
                      href={`/portal/${ws.slug}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate">{ws.name}</span>
                      {active && (
                        <Check size={14} className="text-primary shrink-0" aria-hidden="true" />
                      )}
                    </Link>
                  }
                />
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
