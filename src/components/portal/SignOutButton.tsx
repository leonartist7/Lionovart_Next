"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch("/api/portal/session", { method: "DELETE" });
    router.replace("/portal/login");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className={cn(
        "border-border text-foreground hover:bg-muted rounded-full border px-4 py-2 text-sm font-medium",
        "transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]",
        "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
