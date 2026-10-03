"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PLATFORM_SPECS, composeText } from "@/lib/portal/platforms";
import type { Platform, Post } from "@/lib/portal/types";

/**
 * "Mark as posted" — the manual half of `ManualPublisher`.
 *
 * It says plainly that a person has to post it, because a person does. The
 * composed text is shown per platform ready to copy, because the alternative
 * is retyping it and posting something subtly different from what was
 * approved. The server revalidates before recording anything, so this can't
 * be used to log a post the platform would have rejected.
 */
export function PublishDialog({
  workspaceSlug,
  post,
  disabled,
}: {
  workspaceSlug: string;
  post: Post;
  disabled?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Platform[]>(post.platforms);
  const [urls, setUrls] = useState<Partial<Record<Platform, string>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyOut = (platform: Platform) => post.publishResults?.[platform]?.status === "published";

  async function confirm() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/portal/${workspaceSlug}/content/${post.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmed: true, platforms: selected, urls }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Couldn't record that.");
      return;
    }
    setOpen(false);
    toast.add({ title: "Recorded as posted" });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" size="lg" disabled={disabled} onClick={() => setOpen(true)}>
        Mark as posted
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as posted</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Nothing is posted from here — Meta and LinkedIn both gate posting behind app review.
            Post it yourself, then record it below so the history is right.
          </p>

          <fieldset>
            <legend className="text-muted-foreground mb-3 text-sm font-medium">Where it went</legend>
            <div className="flex flex-col gap-4">
              {post.platforms.map((platform) => {
                const out = alreadyOut(platform);
                const on = out || selected.includes(platform);
                return (
                  <div key={platform} className="border-border rounded-xl border p-4">
                    <button
                      type="button"
                      aria-pressed={on}
                      disabled={out}
                      onClick={() =>
                        setSelected((current) =>
                          current.includes(platform)
                            ? current.filter((p) => p !== platform)
                            : [...current, platform],
                        )
                      }
                      className="text-foreground flex min-h-11 w-full items-center justify-between gap-3 text-sm font-medium focus-visible:ring-3 focus-visible:ring-primary/50 focus-visible:outline-none"
                    >
                      <span>{PLATFORM_SPECS[platform].label}</span>
                      <span className="text-muted-foreground text-xs">
                        {out ? "already recorded" : on ? "posted" : "not yet"}
                      </span>
                    </button>

                    <p className="text-muted-foreground mt-3 text-xs leading-relaxed whitespace-pre-wrap">
                      {composeText(platform, post.caption, post.hashtags)}
                    </p>

                    {!out && on && (
                      <Field className="mt-3">
                        <FieldLabel>Link</FieldLabel>
                        <Input
                          value={urls[platform] ?? ""}
                          onChange={(e) => setUrls((u) => ({ ...u, [platform]: e.target.value }))}
                          placeholder="Optional — where it lives now"
                        />
                      </Field>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="text-destructive text-sm leading-relaxed">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" size="lg" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" size="lg" disabled={busy || selected.length === 0} onClick={confirm}>
            {busy ? "Recording…" : "Record it"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
