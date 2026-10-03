"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { PlatformPreview, type PreviewMedia } from "@/components/portal/PlatformPreview";
import { PublishDialog } from "@/components/portal/PublishDialog";
import { PLATFORM_LIST, normalizeHashtags, validatePost } from "@/lib/portal/platforms";
import type { MediaInfo } from "@/lib/portal/platforms";
import type { Platform, Post } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

export interface ComposerAsset extends PreviewMedia {
  kind: MediaInfo["kind"];
  width?: number;
  height?: number;
}

/**
 * The studio's composer.
 *
 * Validation runs here on every keystroke through the same `validatePost` the
 * server runs before a post may leave `draft`. That is deliberate and it is
 * the point of the screen: by the time "Send for review" is enabled, the post
 * has already been checked against what each platform actually accepts, so a
 * client is never asked to approve something that can't post. The button being
 * disabled is not a UI convenience — the server refuses the same submission
 * with the same rules.
 */
export function PostComposer({
  workspaceSlug,
  post,
  assets,
}: {
  workspaceSlug: string;
  post: Post;
  assets: ComposerAsset[];
}) {
  const router = useRouter();
  const toast = useToast();

  const [caption, setCaption] = useState(post.caption);
  const [hashtagText, setHashtagText] = useState(post.hashtags.join(" "));
  const [platforms, setPlatforms] = useState<Platform[]>(post.platforms);
  const [assetIds, setAssetIds] = useState<string[]>(post.assetIds);
  // Empty on the server: `datetime-local` renders in the viewer's timezone, and
  // the server's offset is a different one — filling it during SSR is a
  // guaranteed hydration mismatch. Set once the browser has it.
  const [scheduledFor, setScheduledFor] = useState("");
  const [savedSchedule, setSavedSchedule] = useState("");
  useEffect(() => {
    const local = toLocalInput(post.scheduledFor);
    setScheduledFor(local);
    setSavedSchedule(local);
  }, [post.scheduledFor]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hashtags = useMemo(() => normalizeHashtags(hashtagText.split(/[\s,]+/)), [hashtagText]);
  const attached = useMemo(
    () => assetIds.flatMap((id) => assets.filter((a) => a.assetId === id)),
    [assetIds, assets],
  );

  const validation = useMemo(
    () =>
      validatePost(
        { platforms, caption, hashtags },
        attached.map((a) => ({
          assetId: a.assetId,
          name: a.name,
          kind: a.kind,
          width: a.width,
          height: a.height,
        })),
      ),
    [platforms, caption, hashtags, attached],
  );

  const dirty =
    caption !== post.caption ||
    hashtags.join(" ") !== post.hashtags.join(" ") ||
    platforms.join(",") !== post.platforms.join(",") ||
    assetIds.join(",") !== post.assetIds.join(",") ||
    scheduledFor !== savedSchedule;

  const editable = post.state === "idea" || post.state === "draft" || post.state === "rejected";

  async function call(path: string, body: object, method = "PATCH") {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/portal/${workspaceSlug}/content/${post.id}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't save that.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function save() {
    const ok = await call("", {
      caption,
      hashtags,
      platforms,
      assetIds,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
    });
    if (ok) toast.add({ title: "Saved" });
  }

  async function move(state: string, title: string) {
    if (await call("", { state })) toast.add({ title });
  }

  async function submit() {
    if (dirty && !(await call("", {
      caption,
      hashtags,
      platforms,
      assetIds,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
    }))) {
      return;
    }
    if (await call("/submit", {}, "POST")) {
      toast.add({ title: "Sent for review", description: "It's in the client's approvals queue." });
    }
  }

  return (
    <div className="mt-7 flex flex-col gap-8">
      {editable ? (
        <div className="flex max-w-xl flex-col gap-5">
          <Field>
            <FieldLabel>Caption</FieldLabel>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={7}
              placeholder="What this post says."
            />
          </Field>

          <Field>
            <FieldLabel>Hashtags</FieldLabel>
            <Input
              value={hashtagText}
              onChange={(e) => setHashtagText(e.target.value)}
              placeholder="#BrandIdentity #StudioLife"
            />
            <p className="text-muted-foreground mt-2 text-xs">
              Separated by spaces. They count toward every platform’s character limit.
            </p>
          </Field>

          <fieldset>
            <legend className="text-muted-foreground mb-3 text-sm font-medium">Platforms</legend>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_LIST.map((spec) => {
                const on = platforms.includes(spec.id);
                return (
                  <button
                    key={spec.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setPlatforms((current) =>
                        current.includes(spec.id)
                          ? current.filter((p) => p !== spec.id)
                          : [...current, spec.id],
                      )
                    }
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium",
                      "transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.985]",
                      "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
                      on
                        ? "border-primary/40 bg-primary/12 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {on && <Check size={14} aria-hidden="true" />}
                    {spec.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-muted-foreground mb-3 text-sm font-medium">Images</legend>
            {assets.length === 0 ? (
              <p className="text-muted-foreground text-sm leading-relaxed">
                No images in this workspace yet. Upload one in Files, or generate a plate below.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assets.map((asset) => {
                  const on = assetIds.includes(asset.assetId);
                  return (
                    <button
                      key={asset.assetId}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setAssetIds((current) =>
                          current.includes(asset.assetId)
                            ? current.filter((id) => id !== asset.assetId)
                            : [...current, asset.assetId],
                        )
                      }
                      className={cn(
                        "flex min-h-11 max-w-[18rem] items-center gap-2 rounded-xl border px-3 text-sm",
                        "transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.985]",
                        "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
                        on ? "border-primary/40 bg-primary/12 text-primary" : "border-border text-muted-foreground",
                      )}
                    >
                      <Paperclip size={14} className="shrink-0" aria-hidden="true" />
                      <span className="truncate">{asset.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        </div>
      ) : (
        <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed">
          {post.state === "in_review"
            ? "This is with the client. It can't be edited while they're deciding on it — move it back to draft if it needs to change."
            : post.state === "published"
              ? "This is the record of what went out. It doesn't change."
              : "Approved as written. Move it back to draft to change anything, and it will need approval again."}
        </p>
      )}

      {post.state === "approved" || post.state === "scheduled" ? (
        <div className="max-w-xl">
          <Field>
            <FieldLabel>Scheduled for</FieldLabel>
            <Input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </Field>
        </div>
      ) : null}

      {error && (
        <p role="alert" className="text-destructive max-w-xl text-sm leading-relaxed">
          {error}
        </p>
      )}

      <div className="flex max-w-xl flex-wrap gap-2">
        {editable && (
          <Button type="button" size="lg" variant="outline" disabled={busy || !dirty} onClick={save}>
            Save
          </Button>
        )}
        {post.state === "idea" && (
          <Button type="button" size="lg" disabled={busy} onClick={() => move("draft", "Now a draft")}>
            Turn into a draft
          </Button>
        )}
        {post.state === "draft" && (
          <Button
            type="button"
            size="lg"
            disabled={busy || !validation.ok}
            onClick={submit}
            className="active:scale-[0.985]"
          >
            Send for review
          </Button>
        )}
        {post.state === "rejected" && (
          <Button type="button" size="lg" disabled={busy} onClick={() => move("draft", "Back in draft")}>
            Reopen as draft
          </Button>
        )}
        {post.state === "in_review" && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            Waiting on the client’s decision in Approvals.
          </p>
        )}
        {post.state === "approved" && (
          <>
            <Button
              type="button"
              size="lg"
              disabled={busy || !scheduledFor}
              onClick={async () => {
                if (dirty && !(await call("", { scheduledFor: new Date(scheduledFor).toISOString() }))) return;
                await move("scheduled", "Scheduled");
              }}
            >
              Schedule
            </Button>
            <Button type="button" size="lg" variant="ghost" disabled={busy} onClick={() => move("draft", "Back in draft")}>
              Move back to draft
            </Button>
          </>
        )}
        {post.state === "scheduled" && (
          <Button type="button" size="lg" variant="ghost" disabled={busy} onClick={() => move("approved", "Unscheduled")}>
            Unschedule
          </Button>
        )}
        {(post.state === "approved" || post.state === "scheduled") && (
          <PublishDialog workspaceSlug={workspaceSlug} post={post} disabled={!validation.ok} />
        )}
      </div>

      {validation.perPlatform.length > 0 ? (
        <section>
          <h2 className="text-muted-foreground mb-3 text-sm font-medium">How it will look</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {validation.perPlatform.map((v) => (
              <PlatformPreview key={v.platform} validation={v} media={attached} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed">
          Choose a platform to see how the post will read.
        </p>
      )}
    </div>
  );
}

/** ISO → the `datetime-local` shape, in the viewer's own timezone. */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
