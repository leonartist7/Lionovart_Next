"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Agency-only. Creates an empty draft and opens it — no dialog for a blank post. */
export function NewPostButton({ workspaceSlug }: { workspaceSlug: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    const res = await fetch(`/api/portal/${workspaceSlug}/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "draft", platforms: ["instagram"] }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.add({ title: "Couldn't start a post" });
      return;
    }
    const { post } = await res.json();
    router.push(`/portal/${workspaceSlug}/content/${post.id}`);
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={create}
      className={cn(
        "border-border text-muted-foreground hover:text-foreground hover:border-primary/40 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-sm font-medium",
        "transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.99]",
        "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
        "disabled:opacity-50",
      )}
    >
      <Plus size={15} aria-hidden="true" />
      New post
    </button>
  );
}
