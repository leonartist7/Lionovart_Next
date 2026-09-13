"use client";

import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * The studio's "request approval" affordance in the design preview — same
 * convention as `DemoAddProject`: render the real control's placement and
 * weight, but say plainly that nothing is saved rather than opening a form
 * that would fail with no live workspace to request against.
 */
export function DemoRequestApproval() {
  const toast = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        toast.add({
          title: "Preview only",
          description: "Requesting approval needs the live database — coming with setup.",
        })
      }
      className={cn(
        "border-border text-muted-foreground hover:text-foreground hover:border-primary/40 mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-sm font-medium",
        "transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.99]",
        "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
      )}
    >
      <Plus size={15} aria-hidden="true" />
      Request approval
    </button>
  );
}
