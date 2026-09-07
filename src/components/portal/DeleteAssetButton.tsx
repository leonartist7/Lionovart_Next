"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/** Agency-only. Deletes the asset and returns to the grid — nothing to view once it's gone. */
export function DeleteAssetButton({
  workspaceSlug,
  assetId,
  name,
  demo = false,
}: {
  workspaceSlug: string;
  assetId: string;
  name: string;
  demo?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (demo) {
      toast.add({ title: "Preview only", description: "Changes aren't saved." });
      return;
    }
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/portal/${workspaceSlug}/assets/${assetId}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return toast.add({ title: "Couldn't delete that file" });
    router.push(`/portal/${workspaceSlug}/assets`);
    router.refresh();
  }

  return (
    <Button type="button" variant="destructive" size="lg" onClick={remove} disabled={busy}>
      <Trash2 size={15} aria-hidden="true" />
      Delete
    </Button>
  );
}
