"use client";

import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * The studio's "add a project" affordance in the design preview.
 *
 * Renders the real control so its placement and weight can be judged, but says
 * plainly that nothing is saved rather than opening a form that would fail.
 */
export function DemoAddProject() {
  const toast = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        toast.add({
          title: "Preview only",
          description: "Creating projects needs the live database — coming with setup.",
        })
      }
      className={cn(
        "border-border text-muted-foreground hover:text-foreground hover:border-primary/40 flex min-h-[7rem] w-full items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-sm font-medium",
        "transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.99]",
        "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
      )}
    >
      <Plus size={16} aria-hidden="true" />
      Add a project
    </button>
  );
}
